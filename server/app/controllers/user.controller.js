const db = require('../models');
const User = db.users;

const DEFAULT_ROLES = ['Receptionist', 'Housekeeping', 'Restaurant', 'Maintenance'];

// Récupérer tous les utilisateurs (sans l'email ni le mot de passe)
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

// Récupérer la liste des rôles assignables à une To-Do ou à un Preset
exports.findAllRoles = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['role'],
            group: ['role']
        });
        const dbRoles = users
            .map(u => u.role)
            .filter(r => r && r !== 'Manager' && r !== 'Staff');
        const roles = [...new Set([...DEFAULT_ROLES, ...dbRoles])];
        res.send(roles);
    } catch (err) {
        res.status(500).send({
            message: err.message || 'Error while retrieving the roles.'
        });
    }
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
