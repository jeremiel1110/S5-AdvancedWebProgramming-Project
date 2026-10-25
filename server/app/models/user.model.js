module.exports = (connex, Sequelize) => {
    const User = connex.define('user_', {
        user_id: { 
            type: Sequelize.INTEGER, 
            primaryKey: true, 
            autoIncrement: true 
        },
        user_lastname: { type: Sequelize.STRING, allowNull: false },
        user_firstname: { type: Sequelize.STRING, allowNull: false },
        email: { type: Sequelize.STRING, allowNull: false, unique: true },
        password_hash: { type: Sequelize.STRING, allowNull: false },
        role: { type: Sequelize.STRING(100), allowNull: false }
    }, 
    { 
        freezeTableName: true, 
        timestamps: false 
    });
    
    return User;
};