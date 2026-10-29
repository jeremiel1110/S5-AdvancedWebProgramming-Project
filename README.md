# Hotel To-Do List

A course project for managing hotel tasks and assigning to-do lists to staff members.

## Technologies

- Frontend: Vue.js, Vue Router, Bootstrap & Vite
- Backend: Node.js, Express & Sequelize
- Database: MySQL

## Live preview

https://jeremiel1110.github.io/S5-AdvancedWebProgramming-Project/

The preview is deployed automatically from `main` with GitHub Actions. GitHub Pages only serves static files, so only the Vue frontend is online: the Node.js server and the MySQL database are not hosted. As a result, the pages that load or save data (**Tasks** and **New To Do List**) show an error in the preview, while the login, the navigation and the **Information** page work. To try the full application, run the server and the frontend locally (see below).

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
2. Run the two files of the `DataBase` folder, in this order: `schema.sql` then `seed.sql`.
3. Copy `server/.env.example` to `server/.env`, then fill in your own MySQL username and password (`DB_USER` and `DB_PASSWORD`). The `.env` file is ignored by Git: never commit it.
4. Open a terminal and run:

```bash
cd server
npm install
npm start
```

The server listens on port 8080.
