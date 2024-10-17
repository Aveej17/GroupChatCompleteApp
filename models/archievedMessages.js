const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');
const User = require('./userModel');
const Group = require('./groupModel');

const ArchivedMessage = sequelize.define('ArchivedMessage', {
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
    archivedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    }
});

module.exports = ArchivedMessage;