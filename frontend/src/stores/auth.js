import { reactive } from "vue";

const users = [
  {
    id: 1,
    email: "manager@hotel.com",
    password: "password123",
    firstName: "John",
    lastName: "Doe",
    role: "manager",
  },
  {
    id: 2,
    email: "staff@hotel.com",
    password: "password456",
    firstName: "Jane",
    lastName: "Smith",
    role: "staff",
  },
  // Temporary demo account, displayed on the login page
  {
    id: 3,
    email: "demo",
    password: "password",
    firstName: "Demo",
    lastName: "User",
    role: "manager",
  },
];

export const auth = reactive({
  user: JSON.parse(localStorage.getItem("user")),
  token: localStorage.getItem("token"),
});

export function login(email, password) {
  for (const user of users) {
    if (user.email === email && user.password === password) {
      auth.user = user;
      localStorage.setItem("user", JSON.stringify(user));
      auth.token = "fake-token" + user.id;
      localStorage.setItem("token", auth.token);
      return true;
    }
  }
  return false;
}

export function logout() {
  auth.user = null;
  auth.token = null;
  localStorage.removeItem("user");
  localStorage.removeItem("token");
}
