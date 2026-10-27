# Hotel To-Do List

A course project for managing hotel tasks and assigning to-do lists to staff members.

## Technologies

- Frontend: Vue.js, Vue Router, Bootstrap & Vite
- Planned backend: Node.js
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

Creer un serveur sur MySQL et le Run
Executer les 2 fichiers dans DataBase : schema.sql et seed.sql
Modifier le fichier db.config.js :
- Remplacer le : USER: 'root' -> USER: 'Votre Nom Utilisateur'
- Remplacer le : PASSWORD: '1939', -> PASSWORD: 'Votre Mot de Passe' 

Ouvrir un terminal dans le dossier server puis ecrire :

```bash
cd server
npm install
npm start
```