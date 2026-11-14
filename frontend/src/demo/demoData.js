// Starting data of the demo mode (GitHub Pages preview): the same accounts, To Do lists and presets
// as DataBase/seed.sql and DataBase/seed_demo_data.sql, so the preview looks like the real application.

const USERS = [
  { user_id: 1, user_firstname: "Jean", user_lastname: "Dupont", email: "manager@hotel.com", role: "Manager", password: "password123" },
  { user_id: 2, user_firstname: "Alice", user_lastname: "Martin", email: "alice@hotel.com", role: "Housekeeping", password: "password456" },
  { user_id: 3, user_firstname: "Claire", user_lastname: "Moreau", email: "claire.moreau@hotel.com", role: "Manager", password: "password123" },
  { user_id: 4, user_firstname: "Lucas", user_lastname: "Bernard", email: "lucas.bernard@hotel.com", role: "Receptionist", password: "password123" },
  { user_id: 5, user_firstname: "Sophie", user_lastname: "Laurent", email: "sophie.laurent@hotel.com", role: "Housekeeping", password: "password123" },
  { user_id: 6, user_firstname: "Marc", user_lastname: "Petit", email: "marc.petit@hotel.com", role: "Maintenance", password: "password123" },
  { user_id: 7, user_firstname: "Emma", user_lastname: "Rousseau", email: "emma.rousseau@hotel.com", role: "Restaurant", password: "password123" },
];

// [location, title, description, owner id, roles, tasks [title, description, done], ids of the members who joined]
const TODOS = [
  ["1228", "Clean UP Room 1228", "Full cleaning after the guest left", 1, ["Housekeeping"], [
    ["Clean windows", "Check for marks on the bay window", true],
    ["Change sheets", "Put clean King size sheets", false],
  ], [2]],
  ["204", "Check-out cleaning - Room 204", "Full cleaning after the guest left", 3, ["Housekeeping"], [
    ["Strip the bed and change the sheets", "King size sheets", true],
    ["Clean the bathroom", "Shower, toilet, sink and mirror", true],
    ["Vacuum and mop the floor", "", true],
    ["Dust the furniture and clean the windows", "", false],
    ["Empty the bins", "", false],
    ["Restock towels and toiletries", "", false],
  ], []],
  ["310", "Stay-over cleaning - Room 310", "Daily cleaning for a guest who stays", 1, ["Housekeeping"], [
    ["Make the bed", "", true],
    ["Replace the used towels", "", true],
    ["Empty the bins", "", true],
    ["Restock the toiletries", "", true],
  ], []],
  ["512", "Pre-arrival inspection - Room 512", "Last check before the guest arrives", 3, ["Receptionist", "Housekeeping"], [
    ["Check the lights, the TV and the air conditioning", "", false],
    ["Test the safe", "", false],
    ["Check the water pressure and the hot water", "", true],
    ["Check the minibar and the welcome items", "", false],
  ], []],
  ["118", "Fix leaking tap - Room 118", "The bathroom tap drips: repair it before the next guest", 1, ["Maintenance"], [
    ["Locate the leak", "", true],
    ["Replace the tap cartridge", "Spare parts are in the maintenance room", false],
    ["Test the tap and clean up", "", false],
  ], []],
  ["407", "Deep cleaning - Room 407", "Periodic deep cleaning of the room", 3, ["Housekeeping"], [
    ["Turn and clean the mattress", "", true],
    ["Wash the curtains", "", true],
    ["Clean behind and under the furniture", "", false],
    ["Descale the shower and the taps", "", false],
    ["Clean the air vents and the filters", "", false],
  ], []],
  ["221", "Maintenance check - Room 221", "Technical check of the room", 1, ["Maintenance"], [
    ["Check the plumbing for leaks", "", false],
    ["Check the electrical outlets and the lights", "", false],
    ["Check the door lock and the keycard reader", "", false],
    ["Check the smoke detector", "", false],
  ], []],
  ["Dining Room", "Breakfast setup - Dining Room", "Opening of the morning breakfast service", 3, ["Restaurant"], [
    ["Set the tables", "", true],
    ["Fill the coffee machines and the juice dispensers", "", true],
    ["Set out the buffet items", "", false],
    ["Check the allergen labels", "", false],
  ], []],
];

// [title, description, roles, tasks [title, description]]
const PRESETS = [
  ["Check-out room cleaning", "Standard cleaning after a guest checks out", ["Housekeeping"], [
    ["Strip the bed and change the sheets", ""],
    ["Clean the bathroom", "Shower, toilet, sink and mirror"],
    ["Vacuum and mop the floor", ""],
    ["Dust the furniture and clean the windows", ""],
    ["Empty the bins", ""],
    ["Restock towels and toiletries", ""],
    ["Check the minibar", ""],
  ]],
  ["Stay-over cleaning", "Daily cleaning for a guest who stays", ["Housekeeping"], [
    ["Make the bed", ""],
    ["Replace the used towels", ""],
    ["Empty the bins", ""],
    ["Wipe the bathroom surfaces", ""],
    ["Restock the toiletries if needed", ""],
  ]],
  ["Pre-arrival inspection", "Last check before the guest arrives", ["Receptionist", "Housekeeping"], [
    ["Check that the room is clean and the bed is made", ""],
    ["Check the lights, the TV and the air conditioning", ""],
    ["Test the safe", ""],
    ["Check the water pressure and the hot water", ""],
    ["Check the minibar and the welcome items", ""],
  ]],
  ["Deep cleaning", "Periodic deep cleaning of a room", ["Housekeeping"], [
    ["Turn and clean the mattress", ""],
    ["Wash the curtains", ""],
    ["Clean behind and under the furniture", ""],
    ["Descale the shower and the taps", ""],
    ["Clean the air vents and the filters", ""],
  ]],
  ["Maintenance check", "Technical check of a room", ["Maintenance"], [
    ["Check the plumbing for leaks", ""],
    ["Check the electrical outlets and the lights", ""],
    ["Check the door lock and the keycard reader", ""],
    ["Check the smoke detector", ""],
  ]],
  ["Breakfast setup", "Opening of the breakfast service", ["Restaurant"], [
    ["Set the tables", ""],
    ["Fill the coffee machines and the juice dispensers", ""],
    ["Set out the buffet items", ""],
    ["Check the allergen labels", ""],
  ]],
];

export function createDemoDb() {
  const now = new Date().toISOString();
  const db = {
    users: USERS.map((user) => ({ ...user })),
    todos: [],
    tasks: [],
    userTodos: [],
    todoRoles: [],
    presets: [],
    presetTasks: [],
    presetRoles: [],
    nextIds: { todo: 1, task: 1, preset: 1, presetTask: 1 },
  };

  for (const [location, title, description, ownerId, roles, tasks, joined] of TODOS) {
    const todoId = db.nextIds.todo++;
    db.todos.push({ to_do_id: todoId, to_do_location: location, to_do_title: title, to_do_description: description, user_id: ownerId, created_at: now });
    for (const role of roles) db.todoRoles.push({ to_do_id: todoId, role });
    for (const [taskTitle, taskDescription, done] of tasks) {
      db.tasks.push({ task_id: db.nextIds.task++, task_title: taskTitle, task_description: taskDescription, task_done: done, to_do_id: todoId });
    }
    for (const userId of joined) db.userTodos.push({ user_id: userId, to_do_id: todoId });
  }

  for (const [title, description, roles, tasks] of PRESETS) {
    const presetId = db.nextIds.preset++;
    db.presets.push({ preset_id: presetId, preset_title: title, preset_description: description, user_id: 3, created_at: now });
    for (const role of roles) db.presetRoles.push({ preset_id: presetId, role });
    for (const [taskTitle, taskDescription] of tasks) {
      db.presetTasks.push({ preset_task_id: db.nextIds.presetTask++, preset_task_title: taskTitle, preset_task_description: taskDescription, preset_id: presetId });
    }
  }

  return db;
}
