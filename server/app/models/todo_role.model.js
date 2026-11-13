module.exports = (connex, Sequelize) => {
    const ToDoRole = connex.define('to_do_role', {
        to_do_id: { type: Sequelize.INTEGER, primaryKey: true },
        role: { type: Sequelize.STRING(100), primaryKey: true }
    },
    {
        freezeTableName: true,
        timestamps: false
    });

    return ToDoRole;
};
