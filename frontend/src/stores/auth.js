import { reactive } from "vue";

const apiUrl = "http://localhost:8080/api/auth";

localStorage.removeItem("user");
localStorage.removeItem("token");

export const auth = reactive({
  user: null,
  loaded: false,
});

export async function login(email, password) {
  const response = await fetch(apiUrl + "/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (response.status === 400 || response.status === 401) {
    return false;
  }
  if (!response.ok) {
    throw new Error("Unable to log in. Please try again.");
  }

  const data = await response.json();
  auth.user = data.user;
  auth.loaded = true;
  return true;
}

export async function restoreSession() {
  const response = await fetch(apiUrl + "/me", { credentials: "include" });
  if (response.ok) {
    const data = await response.json();
    auth.user = data.user;
  } else {
    auth.user = null;
  }
  auth.loaded = true;
}

export async function logout() {
  const response = await fetch(apiUrl + "/logout", {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Unable to log out. Please try again.");
  }
  auth.user = null;
}

export async function apiFetch(url, options = {}) {
  const response = await fetch(url, { ...options, credentials: "include" });
  if (response.status === 401) {
    auth.user = null;
    throw new Error("Session expired. Please log in again.");
  }
  return response;
}
