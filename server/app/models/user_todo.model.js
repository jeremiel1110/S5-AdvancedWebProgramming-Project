module.exports = (connex, Sequelize) => {
    const UserToDo = connex.define('user_to_do', {
        user_id: { type: Sequelize.INTEGER, primaryKey: true },
        to_do_id: { type: Sequelize.INTEGER, primaryKey: true }
    }, 
    { 
        freezeTableName: true, 
        timestamps: false 
    });
    
    return UserToDo;
};