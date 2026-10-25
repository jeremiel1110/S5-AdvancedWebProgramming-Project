module.exports = (connex, Sequelize) => {
    const Task = connex.define('task', {
        task_id: { 
            type: Sequelize.INTEGER, 
            primaryKey: true, 
            autoIncrement: true 
        },
        task_title: { type: Sequelize.STRING, allowNull: false },
        task_description: { type: Sequelize.TEXT },
        task_done: { type: Sequelize.BOOLEAN, defaultValue: false },
        to_do_id: { type: Sequelize.INTEGER, allowNull: false }
    }, { 
        freezeTableName: true, 
        timestamps: false 
    });
    
    return Task;
};