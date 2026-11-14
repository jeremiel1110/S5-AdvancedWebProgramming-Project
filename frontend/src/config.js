// Address of the API (the Express server).
// To use another one, set VITE_API_URL in frontend/.env (see frontend/.env.example).
export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080/api").replace(/\/$/, "");

// Demo mode (VITE_DEMO_MODE=true): the requests are answered in the browser by a fake API (src/demo),
// so the application works without the server and the database. Used for the GitHub Pages preview.
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";
