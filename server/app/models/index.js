const dbConfig = require('../config/db.config.js');
const Sequelize = require('sequelize');

const connex = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    port: 3306,
    operatorAliases: false
});

const db = {};
db.Sequelize = Sequelize;
db.connex = connex;

// Import des modèles
db.users = require('./user.model.js')(connex, Sequelize);
db.todos = require('./todo.model.js')(connex, Sequelize);
db.tasks = require('./task.model.js')(connex, Sequelize);
db.user_todos = require('./user_todo.model.js')(connex, Sequelize);

// Définition des relations (Jointures)

// 1. Un utilisateur est propriétaire de plusieurs To-Do (1:N)
db.users.hasMany(db.todos, { foreignKey: 'user_id', as: 'ownedTodos' });
db.todos.belongsTo(db.users, { foreignKey: 'user_id', as: 'owner' });

// 2. Une To-Do contient plusieurs tâches (1:N)
db.todos.hasMany(db.tasks, { foreignKey: 'to_do_id', as: 'tasks' });
db.tasks.belongsTo(db.todos, { foreignKey: 'to_do_id', as: 'todo' });

// 3. Plusieurs utilisateurs peuvent être assignés à plusieurs To-Do (N:N)
db.users.belongsToMany(db.todos, { 
    through: db.user_todos, 
    foreignKey: 'user_id', 
    otherKey: 'to_do_id', 
    as: 'assignedTodos' 
});
db.todos.belongsToMany(db.users, { 
    through: db.user_todos, 
    foreignKey: 'to_do_id', 
    otherKey: 'user_id', 
    as: 'assignedUsers' 
});

module.exports = db;