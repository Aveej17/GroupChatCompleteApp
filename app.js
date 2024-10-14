const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./utils/database');
const WebSocket = require('ws');

const User = require('./models/userModel');
const Group = require('./models/groupModel');
const userGroup = require('./models/userGroups');

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

const wss = new WebSocket.Server({ server });

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
        const msg = JSON.parse(message);
        if (msg.type === 'chat') {
            // Broadcast the message to all connected clients
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(msg));
                }
            });
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
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
