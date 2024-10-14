const { User, Group, UserGroup } = require('../models');

exports.getGroups = async (req, res) => {
    const userId = req.body.authId;

    try {
        const groups = await Group.findAll({
            attributes: ['id', 'name', 'description'],
            include: {
                model: User,
                where: { id: userId },
                required: true
            }
        });

        return res.status(200).json({ groups, success: true });
    } catch (error) {
        console.error("Error retrieving user groups:", error);
        return res.status(500).json({ success: false, message: "An error occurred while retrieving groups." });
    }
};

exports.getGroup = async (req, res) => {
    console.log("Called");
    
    const userId = req.body.authId;

    try {
        const group = await Group.findOne({
            attributes: ['id', 'name', 'description'],
            where: { id: req.params.groupId },
            include: {
                model: User,
                where: { id: userId },
                required: true
            }
        });

        if (!group) {
            return res.status(404).json({ success: false, message: "Group not found." });
        }

        return res.status(200).json({ group, success: true });
    } catch (error) {
        console.error("Error retrieving group:", error);
        return res.status(500).json({ success: false, message: "An error occurred while retrieving the group." });
    }
};

exports.createGroup = async (req, res) => {
    try {
        const { name, description, authId } = req.body;

        if (!name || !description || !authId) {
            return res.status(400).json({ success: false, message: "Name, description, and authId are required." });
        }

        const user = await User.findOne({ where: { id: authId } });
        if (!user) {
            console.error("User not found:", authId);
            return res.status(404).json({ success: false, message: "User not found." });
        }

        const newGroup = await Group.create({ name, description });
        await user.addGroup(newGroup, { through: { isAdmin: true } });

        return res.status(201).json({ data: newGroup, success: true });
    } catch (error) {
        console.error("Error creating group:", error);
        return res.status(500).json({ success: false, message: "An error occurred while creating the group." });
    }
};

exports.addUser = async (req, res) => {
    console.log("add User Gets called");

    const { email } = req.body;
    const groupId = req.params.groupId;

    try {
        if (!email || !groupId) {
            return res.status(400).json({ success: false, message: "User ID and Group ID are required" });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const group = await Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ success: false, message: "Group not found" });
        }

        const existingMembership = await UserGroup.findOne({
            where: {
                userId: user.id,
                groupId: groupId
            }
        });

        if (existingMembership) {
            return res.status(400).json({ message: "User is already a member of this group." });
        }

        await group.addUser(user);

        return res.status(200).json({ success: true, message: "User added to group", user });
    } catch (error) {
        console.error("Error adding user:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.getUsers = async (req, res) => {
    console.log("get users called");

    const groupId = req.params.groupId;

    try {
        const userGroups = await UserGroup.findAll({
            where: { groupId },
            include: [{
                model: User,
                as: 'User', // Ensure this matches the alias in your association
                attributes: ['id', 'name'],
            }]
        });

        // Map through userGroups to get only user details
        // const users = userGroups.map(userGroup => userGroup.User);
        // Map through userGroups to get user details along with their isAdmin status
        const users = userGroups.map(userGroup => ({
            id: userGroup.User.id,
            name: userGroup.User.name,
            isAdmin: userGroup.isAdmin // Include isAdmin status from UserGroup model
        }));

        // console.log(users); // This will log only user details
        return res.status(200).json({ users });
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

exports.removeUser = async (req, res) => {
    const groupId = req.params.groupId;
    const userId = req.params.userId;

    if(req.body.authId == userId){
        console.log("Admin should not leave his group as of now");
        return res.status(404).json({success:false, message:"Admin Should not leave"});
        
    }

    // console.log(groupId, "gid");
    // console.log(userId, "userId");
    // console.log("remove user");

    try {
        // Check if the user exists in the group
        const userGroup = await UserGroup.findOne({
            where: {
                userId: userId,
                groupId: groupId
            }
        });

        if (!userGroup) {
            return res.status(404).json({ success: false, message: 'User not found in the group' });
        }

        // Remove user from the group
        await userGroup.destroy();

        return res.status(200).json({ success: true, message: 'User removed from the group successfully' });
    } catch (error) {
        console.error("Error removing user from group:", error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


exports.updateUserRole = async (req, res) => {
    const groupId = req.params.groupId;
    const userId = req.params.userId;
    const { isAdmin } = req.body; // Boolean value to promote (true) or demote (false)

    try {
        // Ensure that the user making the request is an admin (middleware should handle this)

        // Check if the user exists in the group
        const userGroup = await UserGroup.findOne({
            where: {
                userId: userId,
                groupId: groupId
            }
        });

        if (!userGroup) {
            return res.status(404).json({ success: false, message: 'User not found in the group' });
        }

        // Update the user's admin status
        userGroup.isAdmin = isAdmin;
        await userGroup.save();

        return res.status(200).json({
            success: true,
            message: `User ${isAdmin ? 'promoted to admin' : 'demoted to normal user'} successfully`
        });
    } catch (error) {
        console.error("Error updating user role:", error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

