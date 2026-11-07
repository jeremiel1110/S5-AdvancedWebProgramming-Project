module.exports = (connex, Sequelize) => {
    const PresetTask = connex.define('preset_task', {
        preset_task_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        preset_task_title: { type: Sequelize.STRING, allowNull: false },
        preset_task_description: { type: Sequelize.TEXT },
        preset_id: { type: Sequelize.INTEGER, allowNull: false }
    },
    {
        freezeTableName: true,
        timestamps: false
    });

    return PresetTask;
};
