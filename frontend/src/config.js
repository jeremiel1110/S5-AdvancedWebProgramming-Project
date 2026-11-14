// Address of the API (the Express server).
// To use another one, set VITE_API_URL in frontend/.env (see frontend/.env.example).
export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080/api").replace(/\/$/, "");
