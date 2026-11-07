module.exports = app => {
    const preset = require('../controllers/preset.controller.js');
    const router = require('express').Router();
    const verifyToken = require('../middleware/auth');

    router.use(verifyToken);

    router.get('/', preset.findAll);
    router.post('/', preset.create);
    router.put('/:id', preset.update);
    router.delete('/:id', preset.delete);

    app.use('/api/preset', router);
};
