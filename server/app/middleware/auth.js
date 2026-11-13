const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.users;

module.exports = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).send({ message: 'Please log in.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
        const dbUser = await User.findByPk(decoded.id, {
            attributes: ['user_id', 'email', 'user_firstname', 'user_lastname', 'role']
        });

        if (!dbUser) {
            return res.status(401).send({ message: 'User not found. Please log in again.' });
        }

        req.user = {
            id: dbUser.user_id,
            email: dbUser.email,
            firstName: dbUser.user_firstname,
            lastName: dbUser.user_lastname,
            role: dbUser.role
        };
    } catch (err) {
        return res.status(401).send({ message: 'Invalid or expired session. Please log in again.' });
    }

    next();
};
