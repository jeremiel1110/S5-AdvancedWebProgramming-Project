module.exports = (connex, Sequelize) => {
    const ToDo = connex.define('to_do', {
        to_do_id: { 
            type: Sequelize.INTEGER, 
            primaryKey: true, 
            autoIncrement: true 
        },
        to_do_location: { type: Sequelize.STRING },
        to_do_title: { type: Sequelize.STRING, allowNull: false },
        to_do_description: { type: Sequelize.TEXT },
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
    
    return ToDo;
};