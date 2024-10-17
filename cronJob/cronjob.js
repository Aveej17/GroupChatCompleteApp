const cron = require('node-cron');
const { Op } = require('sequelize');
const Chat = require('../models/chatModel'); // Adjust the path as needed
const ArchivedMessage = require('../models/archievedMessages'); // Adjust the path as needed

const scheduleArchiving = () => {
    // Schedule a task to run at midnight every day
    cron.schedule('0 0 * * *', async () => {
        try {
            // Move messages from the previous day to the ArchivedMessages table
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            const messagesToArchive = await Chat.findAll({
                where: {
                    createdAt: {
                        [Op.lt]: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0)
                    }
                }
            });

            if (messagesToArchive.length > 0) {
                // Insert messages into ArchivedMessages
                await ArchivedMessage.bulkCreate(messagesToArchive.map(msg => ({
                    content: msg.content,
                    userId: msg.userId,
                    groupId: msg.groupId,
                    type: msg.type,
                    archivedAt: new Date()
                })));

                // Optionally, delete archived messages from Chat
                await Chat.destroy({
                    where: {
                        id: messagesToArchive.map(msg => msg.id)
                    }
                });

                console.log(`${messagesToArchive.length} messages archived successfully.`);
            } else {
                console.log('No messages to archive.');
            }
        } catch (error) {
            console.error('Error archiving messages:', error);
        }
    });
};

module.exports = { scheduleArchiving };