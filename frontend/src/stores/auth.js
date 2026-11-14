import { reactive } from "vue";
import { API_URL } from "../config.js";

const apiUrl = API_URL + "/auth";

localStorage.removeItem("user");
localStorage.removeItem("token");

export const auth = reactive({
  user: null,
  loaded: false,
});

// Every request of the application goes through here. In demo mode (GitHub Pages preview), it is answered
// in the browser by a fake API (src/demo): the test below is replaced at build time, so a normal build
// does not contain the demo code.
async function request(url, options) {
  if (import.meta.env.VITE_DEMO_MODE === "true") {
    const { mockFetch } = await import("../demo/mockApi.js");
    return mockFetch(url, options);
  }
  return fetch(url, options);
}

export async function login(email, password) {
  const response = await request(apiUrl + "/login", {
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
  const response = await request(apiUrl + "/me", { credentials: "include" });
  if (response.ok) {
    const data = await response.json();
    auth.user = data.user;
  } else {
    auth.user = null;
  }
  auth.loaded = true;
}

export async function logout() {
  const response = await request(apiUrl + "/logout", {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Unable to log out. Please try again.");
  }
  auth.user = null;
}

// url is a path of the API (for example "/todo"); a full address (http...) is also accepted
export async function apiFetch(url, options = {}) {
  const target = url.startsWith("http") ? url : API_URL + url;
  const response = await request(target, { ...options, credentials: "include" });
  if (response.status === 401) {
    auth.user = null;
    throw new Error("Session expired. Please log in again.");
  }
  return response;
}
