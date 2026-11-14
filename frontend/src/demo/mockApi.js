// Fake API of the demo mode (GitHub Pages preview, where the Express server and MySQL are not available).
// It answers the same requests as the real server, with the same rules for the roles, and keeps its data
// in the browser (sessionStorage): it is shared with nobody and starts again from the seed data in a new tab.
import { API_URL } from "../config.js";
import { createDemoDb } from "./demoData.js";

const DB_KEY = "roomflow-demo-db";
const SESSION_KEY = "roomflow-demo-session";
const DEFAULT_ROLES = ["Receptionist", "Housekeeping", "Restaurant", "Maintenance"];

// Used when the browser refuses to store data
let memoryDb = null;
let memorySession = null;

function readStorage(key) {
  try {
    return sessionStorage.getItem(key);
  } catch (err) {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    if (value === null) {
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, value);
    }
  } catch (err) {
    // the data stays in memory
  }
}

function loadDb() {
  if (memoryDb) return memoryDb;
  const saved = readStorage(DB_KEY);
  if (saved) {
    try {
      memoryDb = JSON.parse(saved);
      return memoryDb;
    } catch (err) {
      // unreadable data: start again from the seed data
    }
  }
  memoryDb = createDemoDb();
  return memoryDb;
}

function saveDb() {
  writeStorage(DB_KEY, JSON.stringify(memoryDb));
}

function getSessionUserId() {
  const saved = readStorage(SESSION_KEY);
  const id = saved !== null ? Number(saved) : memorySession;
  return id || null;
}

function setSessionUserId(id) {
  memorySession = id;
  writeStorage(SESSION_KEY, id === null ? null : String(id));
}

export function resetDemo() {
  memoryDb = null;
  memorySession = null;
  writeStorage(DB_KEY, null);
  writeStorage(SESSION_KEY, null);
}

// ---------- Helpers ----------

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}

function fail(status, message) {
  return json({ message }, status);
}

function publicUser(user) {
  return { id: user.user_id, email: user.email, firstName: user.user_firstname, lastName: user.user_lastname, role: user.role };
}

function userAttributes(user) {
  return { user_id: user.user_id, user_firstname: user.user_firstname, user_lastname: user.user_lastname, role: user.role };
}

function canManageTodos(user) {
  return user.role === "Manager" || user.role === "Receptionist";
}

function cleanRoles(rawRoles) {
  const roles = (Array.isArray(rawRoles) ? rawRoles : [])
    .map((r) => (typeof r === "string" ? r.trim() : r && typeof r.role === "string" ? r.role.trim() : ""))
    .filter(Boolean);
  return [...new Set(roles)];
}

function presentTodo(db, todo) {
  const owner = db.users.find((u) => u.user_id === todo.user_id);
  return {
    ...todo,
    tasks: db.tasks.filter((t) => t.to_do_id === todo.to_do_id).map((t) => ({ ...t })),
    owner: owner ? userAttributes(owner) : null,
    assignedUsers: db.userTodos
      .filter((j) => j.to_do_id === todo.to_do_id)
      .map((j) => db.users.find((u) => u.user_id === j.user_id))
      .filter(Boolean)
      .map(userAttributes),
    assignedRoles: db.todoRoles.filter((r) => r.to_do_id === todo.to_do_id).map((r) => ({ ...r })),
  };
}

function presentPreset(db, preset) {
  const owner = db.users.find((u) => u.user_id === preset.user_id);
  return {
    ...preset,
    tasks: db.presetTasks.filter((t) => t.preset_id === preset.preset_id).map((t) => ({ ...t })),
    owner: owner ? userAttributes(owner) : null,
    assignedRoles: db.presetRoles.filter((r) => r.preset_id === preset.preset_id).map((r) => ({ ...r })),
  };
}

// Same checks as readPreset() in server/app/controllers/preset.controller.js
function readPreset(body) {
  const title = typeof body.preset_title === "string" ? body.preset_title.trim() : "";
  if (!title) return { error: "The title of the preset is required." };
  if (title.length > 255) return { error: "The title of the preset must not exceed 255 characters." };

  const tasks = [];
  for (const task of Array.isArray(body.tasks) ? body.tasks : []) {
    const taskTitle = typeof task.preset_task_title === "string" ? task.preset_task_title.trim() : "";
    if (!taskTitle) continue;
    if (taskTitle.length > 255) return { error: "The title of a task must not exceed 255 characters." };
    tasks.push({
      preset_task_title: taskTitle,
      preset_task_description: typeof task.preset_task_description === "string" ? task.preset_task_description.trim() : "",
    });
  }

  const roles = cleanRoles(body.assignedRoles);
  if (roles.some((role) => role.length > 100)) return { error: "A role must not exceed 100 characters." };

  return {
    preset: {
      preset_title: title,
      preset_description: typeof body.preset_description === "string" ? body.preset_description.trim() : "",
    },
    tasks,
    roles,
  };
}

// ---------- Routes ----------

function auth(db, method, action, body) {
  if (method === "POST" && action === "login") {
    const email = body.email;
    const password = body.password;
    if (typeof email !== "string" || !email.trim() || typeof password !== "string" || !password) {
      return fail(400, "Email and password are required.");
    }
    const user = db.users.find((u) => u.email === email.trim());
    if (!user || user.password !== password) return fail(401, "Wrong email or password.");
    setSessionUserId(user.user_id);
    return json({ user: publicUser(user) });
  }

  if (method === "GET" && action === "me") {
    const id = getSessionUserId();
    const user = id && db.users.find((u) => u.user_id === id);
    return user ? json({ user: publicUser(user) }) : fail(401, "Please log in.");
  }

  if (method === "POST" && action === "logout") {
    setSessionUserId(null);
    return json({ message: "Logged out." });
  }

  return null;
}

function users(db, method, id) {
  if (method !== "GET") return null;

  if (!id) {
    const sorted = [...db.users].sort((a, b) => a.user_lastname.localeCompare(b.user_lastname) || a.user_firstname.localeCompare(b.user_firstname));
    return json(sorted.map(userAttributes));
  }

  if (id === "roles") {
    const dbRoles = db.users.map((u) => u.role).filter((r) => r && r !== "Manager" && r !== "Staff");
    return json([...new Set([...DEFAULT_ROLES, ...dbRoles])]);
  }

  const user = db.users.find((u) => u.user_id === Number(id));
  if (!user) return fail(404, `User with id ${id} not found.`);
  return json({ user_id: user.user_id, user_firstname: user.user_firstname, user_lastname: user.user_lastname, email: user.email, role: user.role });
}

function todos(db, me, method, id, action, body) {
  if (method === "GET" && !id) {
    let list = db.todos;
    if (me.role !== "Manager") {
      const visibleIds = db.todoRoles.filter((r) => r.role === me.role).map((r) => r.to_do_id);
      list = list.filter((t) => visibleIds.includes(t.to_do_id));
    }
    return json(list.map((t) => presentTodo(db, t)));
  }

  if (method === "POST" && !id) {
    if (!canManageTodos(me)) return fail(403, "You do not have permission to create a To Do list.");
    if (!body.to_do_title) return fail(400, "The title of the To Do is required.");

    const todo = {
      to_do_id: db.nextIds.todo++,
      to_do_location: body.to_do_location || "",
      to_do_title: body.to_do_title,
      to_do_description: body.to_do_description || "",
      user_id: me.user_id,
      created_at: new Date().toISOString(),
    };
    db.todos.push(todo);
    for (const task of Array.isArray(body.tasks) ? body.tasks : []) {
      db.tasks.push({
        task_id: db.nextIds.task++,
        task_title: task.task_title,
        task_description: task.task_description || "",
        task_done: Boolean(task.task_done),
        to_do_id: todo.to_do_id,
      });
    }
    for (const role of cleanRoles(body.assignedRoles)) db.todoRoles.push({ to_do_id: todo.to_do_id, role });
    saveDb();
    return json(presentTodo(db, todo));
  }

  const todo = db.todos.find((t) => t.to_do_id === Number(id));

  if (method === "POST" && action === "join") {
    if (!todo) return fail(404, "Unable to find the specified To Do.");
    const assignedToMyRole = db.todoRoles.some((r) => r.to_do_id === todo.to_do_id && r.role === me.role);
    if (me.role !== "Manager" && !assignedToMyRole) return fail(403, "This To Do is not assigned to your role.");
    if (!db.userTodos.some((j) => j.user_id === me.user_id && j.to_do_id === todo.to_do_id)) {
      db.userTodos.push({ user_id: me.user_id, to_do_id: todo.to_do_id });
      saveDb();
    }
    return json(presentTodo(db, todo));
  }

  if (method === "POST" && action === "leave") {
    if (!todo) return fail(404, "Unable to find the specified To Do.");
    db.userTodos = db.userTodos.filter((j) => !(j.user_id === me.user_id && j.to_do_id === todo.to_do_id));
    saveDb();
    return json(presentTodo(db, todo));
  }

  if (method === "DELETE" && id) {
    if (!canManageTodos(me)) return fail(403, "You do not have permission to delete a To Do list.");
    if (!todo) return json({ message: "Unable to find the specified To Do." });
    db.todos = db.todos.filter((t) => t.to_do_id !== todo.to_do_id);
    db.tasks = db.tasks.filter((t) => t.to_do_id !== todo.to_do_id);
    db.userTodos = db.userTodos.filter((j) => j.to_do_id !== todo.to_do_id);
    db.todoRoles = db.todoRoles.filter((r) => r.to_do_id !== todo.to_do_id);
    saveDb();
    return json({ message: "To Do deleted successfully." });
  }

  return null;
}

function tasks(db, me, method, id, body) {
  if (method === "POST" && !id) {
    if (!canManageTodos(me)) return fail(403, "You do not have permission to add a task.");
    if (!body.task_title || !body.to_do_id) return fail(400, "The title and the To Do ID are required.");
    if (!db.todos.some((t) => t.to_do_id === Number(body.to_do_id))) return fail(404, "Unable to find the specified To Do.");

    const task = {
      task_id: db.nextIds.task++,
      task_title: body.task_title,
      task_description: body.task_description || "",
      task_done: Boolean(body.task_done),
      to_do_id: Number(body.to_do_id),
    };
    db.tasks.push(task);
    saveDb();
    return json(task);
  }

  if (method === "PUT" && id) {
    const task = db.tasks.find((t) => t.task_id === Number(id));
    if (!task) return fail(404, "Unable to find the specified task.");
    if (!db.userTodos.some((j) => j.user_id === me.user_id && j.to_do_id === task.to_do_id)) {
      return fail(403, "You must join this To Do list before checking or unchecking tasks.");
    }
    task.task_done = Boolean(body.task_done);
    saveDb();
    return json({ message: "Task updated successfully." });
  }

  return null;
}

function presets(db, me, method, id, body) {
  if (method === "GET" && !id) {
    const sorted = [...db.presets].sort((a, b) => a.preset_title.localeCompare(b.preset_title, undefined, { sensitivity: "base" }));
    return json(sorted.map((p) => presentPreset(db, p)));
  }

  if (method === "POST" && !id) {
    if (me.role !== "Manager") return fail(403, "Only a Manager can create presets.");
    const { error, preset, tasks: presetTasks, roles } = readPreset(body);
    if (error) return fail(400, error);

    const created = { ...preset, preset_id: db.nextIds.preset++, user_id: me.user_id, created_at: new Date().toISOString() };
    db.presets.push(created);
    for (const task of presetTasks) db.presetTasks.push({ ...task, preset_task_id: db.nextIds.presetTask++, preset_id: created.preset_id });
    for (const role of roles) db.presetRoles.push({ preset_id: created.preset_id, role });
    saveDb();
    return json(presentPreset(db, created));
  }

  if (method === "PUT" && id) {
    if (me.role !== "Manager") return fail(403, "Only a Manager can update presets.");
    const { error, preset, tasks: presetTasks, roles } = readPreset(body);
    if (error) return fail(400, error);
    const existing = db.presets.find((p) => p.preset_id === Number(id));
    if (!existing) return fail(404, `Preset with id ${id} not found.`);

    Object.assign(existing, preset);
    db.presetTasks = db.presetTasks.filter((t) => t.preset_id !== existing.preset_id);
    for (const task of presetTasks) db.presetTasks.push({ ...task, preset_task_id: db.nextIds.presetTask++, preset_id: existing.preset_id });
    db.presetRoles = db.presetRoles.filter((r) => r.preset_id !== existing.preset_id);
    for (const role of roles) db.presetRoles.push({ preset_id: existing.preset_id, role });
    saveDb();
    return json(presentPreset(db, existing));
  }

  if (method === "DELETE" && id) {
    if (me.role !== "Manager") return fail(403, "Only a Manager can delete presets.");
    const existing = db.presets.find((p) => p.preset_id === Number(id));
    if (!existing) return fail(404, `Preset with id ${id} not found.`);
    db.presets = db.presets.filter((p) => p.preset_id !== existing.preset_id);
    db.presetTasks = db.presetTasks.filter((t) => t.preset_id !== existing.preset_id);
    db.presetRoles = db.presetRoles.filter((r) => r.preset_id !== existing.preset_id);
    saveDb();
    return json({ message: "Preset deleted successfully." });
  }

  return null;
}

// Answers a request like fetch() would, so the rest of the application does not know the difference
export async function mockFetch(url, options = {}) {
  await new Promise((resolve) => setTimeout(resolve, 60));

  const method = (options.method || "GET").toUpperCase();
  const path = (url.startsWith(API_URL) ? url.slice(API_URL.length) : url).split("?")[0];
  const [resource, id, action] = path.split("/").filter(Boolean);

  let body = {};
  try {
    body = options.body ? JSON.parse(options.body) : {};
  } catch (err) {
    return fail(400, "Invalid request body.");
  }

  const db = loadDb();

  if (resource === "auth") {
    return auth(db, method, id, body) || fail(404, "Not found.");
  }

  const userId = getSessionUserId();
  if (!userId) return fail(401, "Please log in.");
  const me = db.users.find((u) => u.user_id === userId);
  if (!me) return fail(401, "User not found. Please log in again.");

  let response = null;
  if (resource === "user") response = users(db, method, id);
  else if (resource === "todo") response = todos(db, me, method, id, action, body);
  else if (resource === "task") response = tasks(db, me, method, id, body);
  else if (resource === "preset") response = presets(db, me, method, id, body);

  return response || fail(404, "Not found.");
}
