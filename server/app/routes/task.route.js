module.exports = app => {
    const task = require('../controllers/task.controller.js');
    const router = require('express').Router();

    router.post('/', task.create);
    router.put('/:id', task.update);

    app.use('/api/task', router);
};