// const Sequelize = require('sequelize');
// const sequelize = require('../utils/database');

// const UserGroup = sequelize.define('UserGroup', {
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//     },
//     isAdmin: {
//         type: Sequelize.BOOLEAN,
//         defaultValue: false,
//     },
//     userId: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//     },
//     groupId: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//     },
// }, {
//     timestamps: true, // Automatically manage createdAt and updatedAt fields
// });

// // Associations
// UserGroup.associate = function(models) {
//     UserGroup.belongsTo(models.User, { foreignKey: 'userId' });
//     UserGroup.belongsTo(models.Group, { foreignKey: 'groupId' });
// };

// module.exports = UserGroup;

// userGroups.js

const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const UserGroup = sequelize.define('UserGroup', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    isAdmin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    groupId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
}, {
    timestamps: true,
});

// Associations
UserGroup.associate = function(models) {
    UserGroup.belongsTo(models.User, { foreignKey: 'userId', as: 'User' }); // Set alias to 'User'
    UserGroup.belongsTo(models.Group, { foreignKey: 'groupId', as: 'Group' }); // Set alias to 'Group'
};

module.exports = UserGroup;

