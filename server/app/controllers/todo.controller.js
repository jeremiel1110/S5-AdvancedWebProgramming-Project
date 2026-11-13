const db = require('../models');
const ToDo = db.todos;
const ToDoRole = db.todo_roles;
const UserToDo = db.user_todos;
const userAttributes = ['user_id', 'user_firstname', 'user_lastname', 'role'];
const todoIncludes = [
    'tasks',
    { association: 'owner', attributes: userAttributes },
    { association: 'assignedUsers', attributes: userAttributes, through: { attributes: [] } },
    { association: 'assignedRoles', attributes: ['to_do_id', 'role'] }
];

// Créer une nouvelle To-Do List (avec éventuellement des tâches et des rôles assignés)
exports.create = async (req, res) => {
    if (req.user.role !== 'Manager' && req.user.role !== 'Receptionist') {
        res.status(403).send({ message: 'You do not have permission to create a To Do list.' });
        return;
    }

    if (!req.body.to_do_title) {
        res.status(400).send({ message: 'The title of the To Do is required.' });
        return;
    }

    try {
        req.body.user_id = req.user.id;

        const rawRoles = Array.isArray(req.body.assignedRoles) ? req.body.assignedRoles : [];
        const uniqueRoles = [...new Set(
            rawRoles
                .map(r => (typeof r === 'string' ? r.trim() : (r && typeof r.role === 'string' ? r.role.trim() : '')))
                .filter(Boolean)
        )];

        const data = await ToDo.create(req.body, { include: ['tasks'] });
        if (uniqueRoles.length > 0) {
            await ToDoRole.bulkCreate(
                uniqueRoles.map(role => ({ to_do_id: data.to_do_id, role }))
            );
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

// Récupérer les To-Do Lists avec leurs tâches, les rôles assignés et les membres qui l'ont rejointe
// Le Manager voit tout ; les autres rôles voient uniquement les To-Do assignées à leur rôle.
exports.findAll = async (req, res) => {
    try {
        let whereCondition = {};
        if (req.user.role !== 'Manager') {
            const matchingRows = await ToDoRole.findAll({
                where: { role: req.user.role },
                attributes: ['to_do_id']
            });
            const todoIds = matchingRows.map(r => r.to_do_id);
            whereCondition = { to_do_id: todoIds };
        }

        const data = await ToDo.findAll({
            where: whereCondition,
            include: todoIncludes
        });
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message: err.message || 'An error occurred while retrieving the data.'
        });
    }
};

// Rejoindre une To-Do List
exports.join = async (req, res) => {
    const id = Number(req.params.id);
    try {
        const todo = await ToDo.findByPk(id, { include: todoIncludes });
        if (!todo) {
            return res.status(404).send({ message: 'Unable to find the specified To Do.' });
        }

        const isAssignedToRole = (todo.assignedRoles || []).some(r => r.role === req.user.role);
        if (req.user.role !== 'Manager' && !isAssignedToRole) {
            return res.status(403).send({ message: 'This To Do is not assigned to your role.' });
        }

        await UserToDo.findOrCreate({
            where: {
                user_id: req.user.id,
                to_do_id: id
            }
        });

        const updated = await ToDo.findByPk(id, { include: todoIncludes });
        res.send(updated);
    } catch (err) {
        res.status(500).send({
            message: err.message || 'Error while joining the To Do.'
        });
    }
};

// Quitter une To-Do List
exports.leave = async (req, res) => {
    const id = Number(req.params.id);
    try {
        const todo = await ToDo.findByPk(id);
        if (!todo) {
            return res.status(404).send({ message: 'Unable to find the specified To Do.' });
        }

        await UserToDo.destroy({
            where: {
                user_id: req.user.id,
                to_do_id: id
            }
        });

        const updated = await ToDo.findByPk(id, { include: todoIncludes });
        res.send(updated);
    } catch (err) {
        res.status(500).send({
            message: err.message || 'Error while leaving the To Do.'
        });
    }
};

// Supprimer une To-Do List
exports.delete = (req, res) => {
    if (req.user.role !== 'Manager' && req.user.role !== 'Receptionist') {
        res.status(403).send({ message: 'You do not have permission to delete a To Do list.' });
        return;
    }

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
