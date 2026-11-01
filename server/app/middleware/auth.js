const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).send({ message: 'Please log in.' });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    } catch (err) {
        return res.status(401).send({ message: 'Invalid or expired session. Please log in again.' });
    }

    next();
};
