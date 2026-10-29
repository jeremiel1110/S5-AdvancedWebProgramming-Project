const db = require('../models');
const Task = db.tasks;

// Récupérer toutes les tâches (optionnellement filtrées par to_do_id)
exports.findAll = (req, res) => {
    const condition = req.query.to_do_id ? { to_do_id: req.query.to_do_id } : null;
    Task.findAll({ where: condition })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || 'Error while retrieving the tasks.'
            });
        });
};

// Récupérer une tâche par son id
exports.findOne = (req, res) => {
    const id = req.params.id;
    Task.findByPk(id)
        .then(data => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({ message: `Task with id ${id} not found.` });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || `Error while retrieving task ${id}.`
            });
        });
};

// Ajouter une tâche à une To-Do List existante
exports.create = (req, res) => {
    if (!req.body.task_title || !req.body.to_do_id) {
        res.status(400).send({ message: 'The title and the To Do ID are required.' });
        return;
    }

    Task.create(req.body)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || 'Error while creating the task.'
            });
        });
};

// Mettre à jour une tâche (ex: task_done passe de false à true)
exports.update = (req, res) => {
    const id = req.params.id;

    Task.update(req.body, {
        where: { task_id: id }
    })
    .then(num => {
        if (num == 1) {
            res.send({ message: 'Task updated successfully.' });
        } else {
            res.send({ message: 'Unable to find the specified task.' });
        }
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || 'Error while updating the task.'
        });
    });
};