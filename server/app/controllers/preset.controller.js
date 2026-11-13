const db = require('../models');
const Preset = db.presets;
const PresetTask = db.preset_tasks;
const PresetRole = db.preset_roles;
const userAttributes = ['user_id', 'user_firstname', 'user_lastname', 'role'];
const presetIncludes = [
    'tasks',
    { association: 'owner', attributes: userAttributes },
    { association: 'assignedRoles', attributes: ['preset_id', 'role'] }
];
const presetOrder = [['preset_title', 'ASC'], ['tasks', 'preset_task_id', 'ASC']];

// Check the body and return the clean values, or an error message
function readPreset(body) {
    const title = typeof body.preset_title === 'string' ? body.preset_title.trim() : '';
    if (!title) {
        return { error: 'The title of the preset is required.' };
    }
    if (title.length > 255) {
        return { error: 'The title of the preset must not exceed 255 characters.' };
    }

    const tasks = [];
    for (const task of Array.isArray(body.tasks) ? body.tasks : []) {
        const taskTitle = typeof task.preset_task_title === 'string' ? task.preset_task_title.trim() : '';
        if (!taskTitle) {
            continue;
        }
        if (taskTitle.length > 255) {
            return { error: 'The title of a task must not exceed 255 characters.' };
        }
        tasks.push({
            preset_task_title: taskTitle,
            preset_task_description: typeof task.preset_task_description === 'string' ? task.preset_task_description.trim() : ''
        });
    }

    const rawRoles = Array.isArray(body.assignedRoles) ? body.assignedRoles : [];
    const roles = [...new Set(
        rawRoles
            .map(r => (typeof r === 'string' ? r.trim() : (r && typeof r.role === 'string' ? r.role.trim() : '')))
            .filter(Boolean)
    )];
    for (const role of roles) {
        if (role.length > 100) {
            return { error: 'A role must not exceed 100 characters.' };
        }
    }

    return {
        preset: {
            preset_title: title,
            preset_description: typeof body.preset_description === 'string' ? body.preset_description.trim() : ''
        },
        tasks,
        roles
    };
}

// Get all the presets with their tasks and assigned roles
exports.findAll = (req, res) => {
    Preset.findAll({ include: presetIncludes, order: presetOrder })
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || 'Error while retrieving the presets.'
        });
    });
};

// Create a preset with its tasks and assigned roles (Manager only)
exports.create = async (req, res) => {
    if (req.user.role !== 'Manager') {
        return res.status(403).send({ message: 'Only a Manager can create presets.' });
    }

    const { error, preset, tasks, roles } = readPreset(req.body || {});
    if (error) {
        return res.status(400).send({ message: error });
    }

    try {
        const created = await db.connex.transaction(async (transaction) => {
            const data = await Preset.create({ ...preset, user_id: req.user.id }, { transaction });
            if (tasks.length > 0) {
                await PresetTask.bulkCreate(
                    tasks.map(task => ({ ...task, preset_id: data.preset_id })),
                    { transaction }
                );
            }
            if (roles.length > 0) {
                await PresetRole.bulkCreate(
                    roles.map(role => ({ preset_id: data.preset_id, role })),
                    { transaction }
                );
            }
            return data;
        });

        const fullPreset = await Preset.findByPk(created.preset_id, { include: presetIncludes, order: presetOrder });
        res.send(fullPreset);
    } catch (err) {
        res.status(500).send({
            message: err.message || 'Error while creating the preset.'
        });
    }
};

// Update a preset: its tasks and assigned roles are replaced by the ones received (Manager only)
exports.update = async (req, res) => {
    if (req.user.role !== 'Manager') {
        return res.status(403).send({ message: 'Only a Manager can update presets.' });
    }

    const id = req.params.id;
    const { error, preset, tasks, roles } = readPreset(req.body || {});
    if (error) {
        return res.status(400).send({ message: error });
    }

    try {
        const existing = await Preset.findByPk(id);
        if (!existing) {
            return res.status(404).send({ message: `Preset with id ${id} not found.` });
        }

        await db.connex.transaction(async (transaction) => {
            await existing.update(preset, { transaction });
            await PresetTask.destroy({ where: { preset_id: id }, transaction });
            if (tasks.length > 0) {
                await PresetTask.bulkCreate(
                    tasks.map(task => ({ ...task, preset_id: id })),
                    { transaction }
                );
            }
            await PresetRole.destroy({ where: { preset_id: id }, transaction });
            if (roles.length > 0) {
                await PresetRole.bulkCreate(
                    roles.map(role => ({ preset_id: id, role })),
                    { transaction }
                );
            }
        });

        const fullPreset = await Preset.findByPk(id, { include: presetIncludes, order: presetOrder });
        res.send(fullPreset);
    } catch (err) {
        res.status(500).send({
            message: err.message || 'Error while updating the preset.'
        });
    }
};

// Delete a preset (its tasks and assigned roles are deleted with it) (Manager only)
exports.delete = (req, res) => {
    if (req.user.role !== 'Manager') {
        return res.status(403).send({ message: 'Only a Manager can delete presets.' });
    }

    const id = req.params.id;
    Preset.destroy({ where: { preset_id: id } })
    .then(num => {
        if (num == 1) {
            res.send({ message: 'Preset deleted successfully.' });
        } else {
            res.status(404).send({ message: `Preset with id ${id} not found.` });
        }
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || 'Error while deleting the preset.'
        });
    });
};
