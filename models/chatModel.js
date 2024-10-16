const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');
const User = require('./userModel');
const Group = require('./groupModel');

const Chat = sequelize.define('Message', {
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Group,
            key: 'id'
        }
    },
    type: {
        type: DataTypes.ENUM('text', 'file'),
        allowNull: false,
    },
});


User.hasMany(Chat, { foreignKey: 'userId' });
Chat.belongsTo(User, { foreignKey: 'userId' });

Group.hasMany(Chat, { foreignKey: 'groupId' });
Chat.belongsTo(Group, { foreignKey: 'groupId' });

module.exports = Chat;