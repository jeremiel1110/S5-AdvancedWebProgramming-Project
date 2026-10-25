const db = require('../models');
const ToDo = db.todos;

// Créer une nouvelle To-Do List
exports.create = (req, res) => {
    if (!req.body.to_do_title || !req.body.user_id) {
        res.status(400).send({ message: 'Le titre et l\'ID de l\'utilisateur sont obligatoires.' });
        return;
    }
    
    ToDo.create(req.body)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || 'Une erreur est survenue lors de la création de la To-Do.'
            });
        });
};

// Récupérer toutes les To-Do Lists avec leurs tâches et utilisateurs assignés
exports.findAll = (req, res) => {
    ToDo.findAll({ 
        include: ['tasks', 'owner', 'assignedUsers'] 
    })
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || 'Une erreur est survenue lors de la récupération des données.'
        });
    });
};

// Supprimer une To-Do List
exports.delete = (req, res) => {
    const id = req.params.id;
    ToDo.destroy({
        where: { to_do_id: id }
    })
    .then(num => {
        if (num == 1) {
            res.send({ message: 'To-Do supprimée avec succès.' });
        } else {
            res.send({ message: 'Impossible de trouver la To-Do spécifiée.' });
        }
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || 'Erreur lors de la suppression.'
        });
    });
};