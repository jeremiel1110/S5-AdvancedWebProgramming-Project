const db = require('../models');
const Task = db.tasks;

// Ajouter une tâche à une To-Do List existante
exports.create = (req, res) => {
    if (!req.body.task_title || !req.body.to_do_id) {
        res.status(400).send({ message: 'Le titre et l\'ID de la To-Do sont obligatoires.' });
        return;
    }

    Task.create(req.body)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || 'Erreur lors de la création de la tâche.'
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
            res.send({ message: 'Tâche mise à jour avec succès.' });
        } else {
            res.send({ message: 'Impossible de trouver la tâche spécifiée.' });
        }
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || 'Erreur lors de la mise à jour de la tâche.'
        });
    });
};