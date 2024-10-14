const User = require('./userModel');
const Group = require('./groupModel');
const UserGroup = require('./userGroups');

const models = { User, Group, UserGroup };

// Call associate methods if defined
Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

// Define additional associations
User.belongsToMany(Group, { through: UserGroup, foreignKey: 'userId' });
Group.belongsToMany(User, { through: UserGroup, foreignKey: 'groupId' });

// Export models for usage
module.exports = models;
