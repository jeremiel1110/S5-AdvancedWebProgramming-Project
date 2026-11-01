const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('Set JWT_SECRET in server/.env to a random secret of at least 32 characters.');
}

const app = express();

const corsOption = {
    origin: 'http://localhost:5173',
    credentials: true,
};
app.use(cors(corsOption));
app.use(cookieParser());

// Analyser les requêtes en JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialiser et synchroniser la base de données Sequelize
const db = require('./app/models');
db.connex.sync().catch(err => {
    console.error('Unable to connect to the database:', err.message);
});

// Route de test simple
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Hotel To-Do API!' });
});

// Importation des routes
require('./app/routes/todo.route')(app);
require('./app/routes/task.route')(app);
require('./app/routes/user.route')(app);
require('./app/routes/auth.route')(app);

// Lancer le serveur
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
