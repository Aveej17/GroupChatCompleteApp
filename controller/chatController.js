const Chat = require('../models/chatModel');


const User = require('../models/userModel');  // Assuming you have a User model

const { Op } = require('sequelize');

exports.getChat = async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const messages = await Chat.findAll({
            where: {
                groupId, // Match messages for the correct group
            },
            include: [{ model: User, attributes: ['name'] }], // Include user details (optional)
            // order: [['createdAt', 'ASC']] // Order by creation time
        });

        res.status(200).json({ success: true, messages });
    } catch (error) {
        // console.error("Error retrieving new messages:", error);
        res.status(500).json({ success: false, message: "An error occurred while retrieving new messages." });
    }
    
};
// Assuming you have a method in your controller for this

exports.getNewMessages = async (req, res) => {
    const { lastId, groupId } = req.query; // Extract lastId and groupId from the request query

    try {
        const messages = await Chat.findAll({
            where: {
                groupId, // Match messages for the correct group
                id: { [Op.gt]: lastId } // Fetch messages with an ID greater than lastId
            },
            include: [{ model: User, attributes: ['name'] }], // Include user details (optional)
            // order: [['createdAt', 'ASC']] // Order by creation time
        });

        res.status(200).json({ success: true, messages });
    } catch (error) {
        // console.error("Error retrieving new messages:", error);
        res.status(500).json({ success: false, message: "An error occurred while retrieving new messages." });
    }
};


exports.createChat = async (chatDetails) => {
    const { content, groupId, userId, type } = chatDetails;
    const newChat = await Chat.create({
        content: content,
        userId: userId,
        groupId: groupId,
        type: type,
    });
    
    // return newChat;
};