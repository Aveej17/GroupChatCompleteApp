const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Group = sequelize.define("Group", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false,
    },
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
});

module.exports = Group;
