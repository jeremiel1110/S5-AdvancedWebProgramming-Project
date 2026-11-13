const db = require('../models');
const Task = db.tasks;
const UserToDo = db.user_todos;

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
    if (req.user.role !== 'Manager' && req.user.role !== 'Receptionist') {
        res.status(403).send({ message: 'You do not have permission to add a task.' });
        return;
    }

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
// Il faut avoir rejoint la To-Do pour pouvoir cocher/décocher une tâche.
exports.update = async (req, res) => {
    const id = req.params.id;

    try {
        const task = await Task.findByPk(id);
        if (!task) {
            return res.status(404).send({ message: 'Unable to find the specified task.' });
        }

        const membership = await UserToDo.findOne({
            where: {
                user_id: req.user.id,
                to_do_id: task.to_do_id
            }
        });

        if (!membership) {
            return res.status(403).send({
                message: 'You must join this To Do list before checking or unchecking tasks.'
            });
        }

        await task.update({ task_done: Boolean(req.body.task_done) });
        res.send({ message: 'Task updated successfully.' });
    } catch (err) {
        res.status(500).send({
            message: err.message || 'Error while updating the task.'
        });
    }
};
