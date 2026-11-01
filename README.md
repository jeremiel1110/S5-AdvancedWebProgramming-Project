# Hotel To-Do List

A course project for managing hotel tasks and assigning to-do lists to staff members.

## Technologies

- Frontend: Vue.js, Vue Router, Bootstrap & Vite
- Backend: Node.js, Express & Sequelize
- Database: MySQL

## Live preview

https://jeremiel1110.github.io/S5-AdvancedWebProgramming-Project/

The preview is deployed automatically from `main` with GitHub Actions. GitHub Pages only serves static files: the Node.js server and MySQL database are not hosted. Login now requires the backend, so run the server and frontend locally to use the application (see below).

Demo login: `manager@hotel.com` / `password123`.

## Project milestones

- **Milestone 1:** Project plan, database design, and initial UI mockups.
- **Milestone 2:** Vue frontend, including navigation, task views, list creation and a demonstration login.
- **Milestone 3:** Connect the frontend to the backend and database and implement secure authentication with tokens.

## Run the frontend

```bash
cd frontend
npm install
npm run dev
```

## Run the Server

1. Start a MySQL server.
2. For a new database, run `DataBase/schema.sql` then `DataBase/seed.sql`. If the database already contains the original demo users, run only `DataBase/update_password_hashes.sql` to replace their placeholder hashes; it preserves existing users, tasks and real password hashes.
3. Copy `server/.env.example` to `server/.env`, then fill in your own MySQL username and password (`DB_USER` and `DB_PASSWORD`). Generate a random secret with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and put it in `JWT_SECRET`. The `.env` file is ignored by Git: never commit it.
4. Open a terminal and run:

```bash
cd server
npm install
npm start
```

The server listens on port 8080.

## Authentication

Run Vue at `http://localhost:5173` and Express at `http://localhost:8080`. A successful `POST /api/auth/login` creates a signed JWT that expires after one hour. The browser keeps it in an `HttpOnly`, `SameSite=Strict` cookie, with `Secure` enabled when `NODE_ENV=production` (HTTPS required). `GET /api/auth/me` restores the session after a page reload, and `POST /api/auth/logout` clears the cookie. The user, to-do and task API routes all require a valid token.

Login looks up the user by email in MySQL using Sequelize, then verifies `password_hash` with bcryptjs. The seed accounts are `manager@hotel.com` / `password123` and `alice@hotel.com` / `password456`. The API and JWT contain public user fields only, with no password or hash. Passwords are limited to 72 UTF-8 bytes to avoid bcrypt truncation. For additional users, store a hash generated with `bcrypt.hash(password, 12)` in `password_hash`; no registration form is included. Demo accounts are for local development and must be removed or have their passwords changed before deployment.

All authenticated accounts currently share access to the management API. Logout removes the browser cookie; a copied token remains valid until its one-hour expiration.
