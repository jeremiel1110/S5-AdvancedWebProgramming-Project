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
