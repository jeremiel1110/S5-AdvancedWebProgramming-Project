const db = require('../models');
const ToDo = db.todos;

// Créer une nouvelle To-Do List (avec éventuellement des tâches et des utilisateurs assignés)
exports.create = async (req, res) => {
    if (!req.body.to_do_title) {
        res.status(400).send({ message: 'The title of the To Do is required.' });
        return;
    }
    
    try {
        let userId = req.body.user_id;
        if (!userId) {
            userId = 1;
        } else {
            const userExists = await db.users.findByPk(userId);
            if (!userExists) {
                userId = 1;
            }
        }
        req.body.user_id = userId;

        const data = await ToDo.create(req.body, { include: ['tasks'] });
        if (req.body.assignedUserIds && Array.isArray(req.body.assignedUserIds) && req.body.assignedUserIds.length > 0) {
            await data.setAssignedUsers(req.body.assignedUserIds);
        }
        const fullToDo = await ToDo.findByPk(data.to_do_id, {
            include: ['tasks', 'owner', 'assignedUsers']
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
        include: ['tasks', 'owner', 'assignedUsers'] 
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