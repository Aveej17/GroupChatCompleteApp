const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./utils/database');
const WebSocket = require('ws');
const s3 = require('./controller/awsS3Controller');

const User = require('./models/userModel');
const Group = require('./models/groupModel');
const userGroup = require('./models/userGroups');


const chatController = require('./controller/chatController');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const groupRoutes = require('./routes/groupsRoutes');


app.use('/users', userRoutes);
app.use('/chats', chatRoutes);
app.use('/groups', groupRoutes);

app.get('/chat/chat.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/chat/chat.html'));
});

app.use((req, res) => {  
    res.sendFile(path.join(__dirname, `public/views/${req.url}`));
});

User.belongsToMany(Group, { through: userGroup, foreignKey: 'userId' });
Group.belongsToMany(User, { through: userGroup, foreignKey: 'groupId' });

// Set up WebSocket server
const server = app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

// Create WebSocket server attached to the HTTP server
const wss = new WebSocket.Server({ server });

// Store group connections and group messages
const groupClients = new Map(); // Key: groupId, Value: Set of clients (WebSocket connections)
const groupMessages = new Map(); // Key: groupId, Value: Array of messages
const activeGroup = new Map(); // Key: WebSocket client, Value: currently active groupId

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('New client connected');

    // Handle incoming messages
    ws.on('message', async (message) => {
        const msg = JSON.parse(message);

        if (msg.type === 'chat') {
            const { groupId, content, userName, type } = msg;
            console.log(msg);
            msg.type = "text";
            
            await chatController.createChat(msg);
            // console.log("messageReceived");
            

            // Ensure the client is only sending messages to the group they have joined
            if (activeGroup.get(ws) === groupId) {
                // Store the message in the group's message history
                if (!groupMessages.has(groupId)) {
                    groupMessages.set(groupId, []);
                }
                groupMessages.get(groupId).push({ userName, content, type });

                // Broadcast the message to all clients in the group
                if (groupClients.has(groupId)) {
                    groupClients.get(groupId).forEach((client) => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({ userName, content, groupId, type }));
                        }
                    });
                }
            }
        } 
        else if (msg.type === 'file') {
            const { groupId, fileName, content, userName } = msg;
            // const { groupId, fileName, userName } = msg;
            // console.log(msg.fileName);
            console.log(msg);
            
            
            // help me to upload the file into s3 and save the file location in chat table (or new table) 
            // doubt if new table how to maintain the order of the message

            // reference one file i uploaded
            // const content = "https://groupchatappimagesbuckets.s3.amazonaws.com/watchWomen.jpg";
            console.log(fileName);
            
            
            // console.log("File message received:", msg);
            const buffer = Buffer.from(content.split(',')[1]);
            console.log(buffer);
            try{
                const fileUrl = await s3.uploadFileToS3(fileName, buffer);

                console.log("File uploaded to S3:", fileUrl);

            //     // Save the file URL in the database (same table as messages or new one)
                const chatData = {
                    userId: msg.userId,
                    groupId: groupId,
                    content: fileUrl, // Save the URL instead of file content
                    type: 'file', // Differentiate between text and file message
                    fileName: fileName // Optional: Save file name for reference
                };

                await chatController.createChat(chatData);
            }
            catch(err){
                console.log(err);
                
            }
            // Store the file in the group's message history (optional)
            if (!groupMessages.has(groupId)) {
                groupMessages.set(groupId, []);
            }
            groupMessages.get(groupId).push({ userName, content, fileName, type: 'file' });

            // Broadcast the file message to all clients in the group
            if (groupClients.has(groupId)) {
                groupClients.get(groupId).forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ userName, content, fileName, groupId, type: 'file' }));
                    }
                });
            }
        } 
        
        else if (msg.type === 'joinGroup') {
            const { groupId } = msg;
            // console.log(groupId ,"Joined to chat");
            

            // Add the client to the new group, but make only one group active at a time
            if (!groupClients.has(groupId)) {
                groupClients.set(groupId, new Set());
            }
            groupClients.get(groupId).add(ws);

            // Set this group as the active group for the client
            activeGroup.set(ws, groupId);

            // Send pending messages from the newly active group
            if (groupMessages.has(groupId)) {
                const pendingMessages = groupMessages.get(groupId);
                pendingMessages.forEach((pendingMessage) => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify(pendingMessage));
                    }
                });
            }
        }
    });

    // Handle client disconnect
    ws.on('close', () => {
        console.log('Client disconnected');

        // Remove the client from all group memberships and active group tracking
        activeGroup.delete(ws);
        groupClients.forEach((clients, groupId) => {
            clients.delete(ws);
            if (clients.size === 0) {
                groupClients.delete(groupId); // Clean up empty groups
            }
        });
    });
});

sequelize
    .sync()
    .then(result => {
        // app.listen(process.env.PORT); // Removed since we are using server variable
    })
    .catch(err => {
        console.log(err);
    });