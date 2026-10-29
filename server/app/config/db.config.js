const fs = require('fs');
const path = require('path');

// The credentials are read from server/.env (not committed, see server/.env.example)
const envPath = path.join(__dirname, '../../.env');

if (!fs.existsSync(envPath)) {
    console.warn('server/.env not found: copy server/.env.example to server/.env and fill in your MySQL credentials.');
}

require('dotenv').config({ path: envPath, quiet: true });

// Database configuration
module.exports = {
    HOST: process.env.DB_HOST || 'localhost',
    USER: process.env.DB_USER || 'root',
    PASSWORD: process.env.DB_PASSWORD || '',
    DB: process.env.DB_NAME || 'hotel_todo_db',
    dialect: 'mysql'
}
