module.exports = (connex, Sequelize) => {
    const PresetRole = connex.define('preset_role', {
        preset_id: { type: Sequelize.INTEGER, primaryKey: true },
        role: { type: Sequelize.STRING(100), primaryKey: true }
    },
    {
        freezeTableName: true,
        timestamps: false
    });

    return PresetRole;
};
