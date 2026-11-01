module.exports = app => {
    const auth = require('../controllers/auth.controller.js');
    const router = require('express').Router();
    const verifyToken = require('../middleware/auth');

    router.post('/login', auth.login);
    router.get('/me', verifyToken, auth.me);
    router.post('/logout', auth.logout);

    app.use('/api/auth', router);
};
