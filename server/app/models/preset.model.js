module.exports = (connex, Sequelize) => {
    const Preset = connex.define('preset', {
        preset_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        preset_title: { type: Sequelize.STRING, allowNull: false },
        preset_description: { type: Sequelize.TEXT },
        user_id: { type: Sequelize.INTEGER, allowNull: false },
        created_at: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    },
    {
        freezeTableName: true,
        timestamps: false
    });

    return Preset;
};
