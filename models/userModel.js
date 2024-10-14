const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const User = sequelize.define("User", {
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
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    phone: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    role: { // Add role property
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'user' // Set a default role
    },
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
});

module.exports = User;
