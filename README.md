# Hotel To-Do List

A course project for managing hotel tasks and assigning to-do lists to staff members.

## Technologies

- Frontend: Vue.js, Vue Router, Bootstrap & Vite
- Planned backend: Node.js
- Database: MySQL

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
npm install
npm start
```