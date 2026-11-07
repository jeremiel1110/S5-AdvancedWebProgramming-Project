const db = require('../models');
const Preset = db.presets;
const PresetTask = db.preset_tasks;
const userAttributes = ['user_id', 'user_firstname', 'user_lastname', 'role'];
const presetIncludes = [
    'tasks',
    { association: 'owner', attributes: userAttributes }
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

    return {
        preset: {
            preset_title: title,
            preset_description: typeof body.preset_description === 'string' ? body.preset_description.trim() : ''
        },
        tasks
    };
}

// Get all the presets with their tasks
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

// Create a preset with its tasks
exports.create = async (req, res) => {
    const { error, preset, tasks } = readPreset(req.body || {});
    if (error) {
        return res.status(400).send({ message: error });
    }

    try {
        const created = await db.connex.transaction(async (transaction) => {
            const data = await Preset.create({ ...preset, user_id: req.user.id }, { transaction });
            await PresetTask.bulkCreate(
                tasks.map(task => ({ ...task, preset_id: data.preset_id })),
                { transaction }
            );
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

// Update a preset: its tasks are replaced by the ones received
exports.update = async (req, res) => {
    const id = req.params.id;
    const { error, preset, tasks } = readPreset(req.body || {});
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
            await PresetTask.bulkCreate(
                tasks.map(task => ({ ...task, preset_id: id })),
                { transaction }
            );
        });

        const fullPreset = await Preset.findByPk(id, { include: presetIncludes, order: presetOrder });
        res.send(fullPreset);
    } catch (err) {
        res.status(500).send({
            message: err.message || 'Error while updating the preset.'
        });
    }
};

// Delete a preset (its tasks are deleted with it)
exports.delete = (req, res) => {
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
