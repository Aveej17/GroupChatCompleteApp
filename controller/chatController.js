const Chat = require('../models/chatModel');
const isStringValid = require('../utils/stringValidation');

const User = require('../models/userModel');  // Assuming you have a User model
const { where } = require('sequelize');
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
        console.error("Error retrieving new messages:", error);
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
        console.error("Error retrieving new messages:", error);
        res.status(500).json({ success: false, message: "An error occurred while retrieving new messages." });
    }
};

exports.createChat = async (req, res) => {
    try {
        console.log("Create chat gets called");
        
        const { authId, chatDetails } = req.body;
        const { content, groupId } = chatDetails; // Extract groupId and content from request body

        // console.log(authId);
        // console.log(content);
        // console.log(groupId);
        
        
        
        // Fetch the user based on the authId (to get the user's name)
        const user = await User.findOne({ where: { id: authId } });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Create a new chat message associated with the user and group
        const newChat = await Chat.create({
            content: content,
            userId: authId,
            groupId: groupId // Associate the chat message with the specific group
        });

        // Send a success response with the created chat message
        res.status(201).json({ success: true, message: "Chat created", chat: newChat });
    } catch (err) {
        console.error("Error creating chat:", err);
        res.status(500).json({ success: false, message: "An error occurred while creating the chat", error: err });
    }
};
