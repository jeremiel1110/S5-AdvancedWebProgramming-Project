const db = require('../models');
const ToDo = db.todos;
const userAttributes = ['user_id', 'user_firstname', 'user_lastname', 'role'];
const todoIncludes = [
    'tasks',
    { association: 'owner', attributes: userAttributes },
    { association: 'assignedUsers', attributes: userAttributes }
];

// Créer une nouvelle To-Do List (avec éventuellement des tâches et des utilisateurs assignés)
exports.create = async (req, res) => {
    if (!req.body.to_do_title) {
        res.status(400).send({ message: 'The title of the To Do is required.' });
        return;
    }
    
    try {
        req.body.user_id = req.user.id;

        const data = await ToDo.create(req.body, { include: ['tasks'] });
        if (req.body.assignedUserIds && Array.isArray(req.body.assignedUserIds) && req.body.assignedUserIds.length > 0) {
            await data.setAssignedUsers(req.body.assignedUserIds);
        }
        const fullToDo = await ToDo.findByPk(data.to_do_id, {
            include: todoIncludes
        });
        res.send(fullToDo || data);
    } catch (err) {
        res.status(500).send({
            message: err.message || 'An error occurred while creating the To Do.'
        });
    }
};

// Récupérer toutes les To-Do Lists avec leurs tâches et utilisateurs assignés
exports.findAll = (req, res) => {
    ToDo.findAll({ 
        include: todoIncludes
    })
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || 'An error occurred while retrieving the data.'
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
            res.send({ message: 'To Do deleted successfully.' });
        } else {
            res.send({ message: 'Unable to find the specified To Do.' });
        }
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || 'Error while deleting.'
        });
    });
};
