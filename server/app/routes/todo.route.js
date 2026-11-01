module.exports = app => {
    const todo = require('../controllers/todo.controller.js');
    const router = require('express').Router();
    const verifyToken = require('../middleware/auth');

    router.use(verifyToken);

    router.get('/', todo.findAll);
    router.post('/', todo.create);
    router.delete('/:id', todo.delete);

    app.use('/api/todo', router);
};
