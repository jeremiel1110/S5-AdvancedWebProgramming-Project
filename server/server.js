const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Autoriser le frontend Vue (qui tourne sur le port 5173 avec Vite) à communiquer avec l'API
const corsOption = {
    origin: 'http://localhost:5173',
    credentials: true,
};
app.use(cors(corsOption));

// Analyser les requêtes en JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialiser et synchroniser la base de données Sequelize
const db = require('./app/models');
db.connex.sync();

// Route de test simple
app.get('/', (req, res) => {
    res.json({ message: 'Bienvenue sur l\'API Hotel To-Do !' });
});

// Importation des routes
require('./app/routes/todo.route')(app);
require('./app/routes/task.route')(app);
// Axel pourra rajouter sa route require('./app/routes/user.route')(app) ici plus tard

// Lancer le serveur
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Le serveur tourne sur le port ${PORT}.`);
});