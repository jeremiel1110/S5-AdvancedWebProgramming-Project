const db = require('../models');
const User = db.users;

// Récupérer tous les utilisateurs (sans l'email ni le mot de passe) pour pouvoir les assigner à une To-Do
exports.findAll = (req, res) => {
    User.findAll({
        attributes: ['user_id', 'user_firstname', 'user_lastname', 'role'],
        order: [['user_lastname', 'ASC'], ['user_firstname', 'ASC']]
    })
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || 'Error while retrieving the users.'
        });
    });
};

// Récupérer un utilisateur par son id (pour la page Profile)
exports.findOne = (req, res) => {
    const id = req.params.id;
    User.findByPk(id, {
        attributes: ['user_id', 'user_firstname', 'user_lastname', 'email', 'role']
    })
    .then(data => {
        if (data) {
            res.send(data);
        } else {
            res.status(404).send({ message: `User with id ${id} not found.` });
        }
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || `Error while retrieving user ${id}.`
        });
    });
};
