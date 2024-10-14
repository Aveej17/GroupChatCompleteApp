let socket; // Declare socket variable

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const groupId = params.get("groupId"); // Get the groupId from the query parameters

    if (groupId) {
        await loadGroupDetails(groupId);
        await loadGroupMessages(groupId);
    } else {
        console.error("No groupId provided");
    }

    const chatInput = document.getElementById("chatInput");
    const sendButton = document.getElementById("sendButton");

    chatInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendMessage();
        }
    });

    sendButton.addEventListener('click', function () {
        sendMessage();
    });

    document.getElementById("backButton").addEventListener("click", () => {
        window.history.back();
    });

    await loadGroupUsers(groupId);

    // Initialize WebSocket connection
    socket = new WebSocket('ws://34.227.178.35:4000'); // Change port if necessary
  

    socket.onopen = () => {
        console.log("WebSocket connection established");
    };

    socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'chat') {
            // Append new message to chat window
            const chatWindow = document.getElementById("chatWindow");
            const chatMessage = document.createElement("div");
            chatMessage.classList.add("chat-message");
            chatMessage.textContent = `${msg.userName}: ${msg.content}`; // Assuming msg has userName and content
            chatWindow.appendChild(chatMessage);
            chatWindow.scrollTop = chatWindow.scrollHeight; // Auto-scroll to the bottom
        }
    };

    socket.onerror = (error) => {
        console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
        console.log("WebSocket connection closed");
    };
});

async function sendMessage() {
    try {
        const params = new URLSearchParams(window.location.search);
        const groupId = params.get("groupId");
        const messageContent = document.getElementById('chatInput').value;
        const userName = localStorage.getItem("name");
        const chatDetails = {
            content: messageContent,
            groupId: groupId,
            userName: userName, // Replace with actual user name
            type: 'chat' // Message type
        };

        // Send the message to the WebSocket server
        socket.send(JSON.stringify(chatDetails));

        document.getElementById('chatInput').value = ''; // Clear input after sending
    } catch (error) {
        console.error("Error sending message:", error);
    }
}


// Function to load group details
async function loadGroupDetails(groupId) {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://34.227.178.35:4000/groups/get/${groupId}`, { // Update this endpoint based on your backend
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await response.json();
        // console.log(data);
        
        if (data.success) {
            const chatHeader = document.querySelector(".chat-header");
            chatHeader.innerText = data.group.name; // Update the chat header with the group name
        } else {
            console.error("Failed to load group details.");
        }
    } catch (error) {
        console.error("Error loading group details:", error);
    }
}

// Function to load messages for the specific group
async function loadGroupMessages(groupId) {
    try {
        const token = localStorage.getItem("token");

        // Retrieve existing chats from local storage and parse
        let existingChats = JSON.parse(localStorage.getItem(groupId)) || [];
        // console.log(existingChats);
        
        // Get the last chat ID from existing chats
        const lastChatId = existingChats.length ? existingChats[existingChats.length - 1].id : null;

        // Make an API call to fetch new messages, if there's a lastChatId
        let response;
        // console.log(lastChatId);
        
        if (lastChatId) {
            // Fetch new messages since lastChatId
            response = await axios.get(`http://34.227.178.35:4000/chats/getNew?lastId=${lastChatId}&groupId=${groupId}`, {
                headers: { Authorization: 'Bearer ' + token }
            });
            // console.log(response);
            
        } else {
            // If no existing chats, get all messages for the group
            response = await axios.get(`http://34.227.178.35:4000/chats/getAll/${groupId}`, {
                headers: { Authorization: 'Bearer ' + token }
            });
            // console.log(response);
            
        }

        if (response.data.success) {
            // Merge new messages with existing chats
            const newChats = response.data.messages; // Assuming response has an array of messages
            const mergedChats = [...existingChats, ...newChats];

            // Keep only the latest 100 messages
            const latestChats = mergedChats.slice(-20);

            // Update local storage
            localStorage.setItem("chats", JSON.stringify(latestChats));

            // Update the chat window
            const chatWindow = document.getElementById("chatWindow");
            chatWindow.innerHTML = ''; // Clear existing messages
            latestChats.forEach(chat => {
                const chatMessage = document.createElement("div");
                chatMessage.classList.add("chat-message");
                chatMessage.textContent = `${chat.User.name} : ${chat.content}`; // Format senderName : content
                chatWindow.appendChild(chatMessage);
            });
        }
    } catch (error) {
        console.log("Error Loading Group Messages: " + error);
    }
}

async function loadGroupUsers(groupId) {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://34.227.178.35:4000/groups/${groupId}/users`, {
            headers: { Authorization: 'Bearer ' + token }
        });
    
        const userList = document.getElementById("userList");
        userList.innerHTML = ''; // Clear existing users
    
        response.data.users.forEach(user => {
            // console.log(user);
            
            const userItem = document.createElement("div");
            userItem.classList.add("user-item");
            
            // Display user name and admin status
            const userText = document.createElement("span");
            userText.textContent = user.name + (user.isAdmin ? " (Admin)" : " (Normal User)");
            userItem.appendChild(userText);
    
            // Button to remove user from the group
            const removeButton = document.createElement("button");
            removeButton.textContent = "Remove";
            removeButton.classList.add("remove-user-button");
            removeButton.onclick = () => removeUserFromGroup(user.id, groupId);
            userItem.appendChild(removeButton);
    
            // Button to promote/demote user
            const adminToggleButton = document.createElement("button");
            adminToggleButton.textContent = user.isAdmin ? "Demote to User" : "Promote to Admin";
            adminToggleButton.classList.add("admin-toggle-button");
            adminToggleButton.onclick = () => toggleAdminStatus(user.id, groupId, !user.isAdmin);
            userItem.appendChild(adminToggleButton);
    
            // Add user item to the list
            userList.appendChild(userItem);
        });
    } catch (error) {
        console.error("Error loading group users:", error);
    }    
}

async function toggleAdminStatus(userId, groupId, newIsAdminStatus) {
    try {
        const token = localStorage.getItem("token");

        // API call to promote/demote user
        const response = await axios.patch(`http://34.227.178.35:4000/groups/${groupId}/users/${userId}/role`, 
        {
            isAdmin: newIsAdminStatus // Send new role status
        }, 
        {
            headers: { Authorization: 'Bearer ' + token }
        });

        // Notify user of success
        alert(response.data.message);

        // Reload the user list after the change
        loadGroupUsers(groupId);
    } catch (error) {
        console.error("Error changing admin status:", error);
        alert("Failed to change admin status.");
    }
}



async function removeUserFromGroup(userId, groupId) {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.delete(`http://34.227.178.35:4000/groups/${groupId}/users/${userId}`, {
            headers: { Authorization: 'Bearer ' + token }
        });

        if (response.data.success) {
            console.log("User removed:", userId);
            loadGroupUsers(groupId); // Reload users after removal
        }
    } catch (error) {
        console.error("Error removing user:", error);
    }
}

document.getElementById("addUserButton").addEventListener("click", async () => {
    const email = document.getElementById("newUserEmail").value;
    const params = new URLSearchParams(window.location.search);
    const groupId = params.get("groupId");
    try {
        const token = localStorage.getItem("token");
        const response = await axios.post(`http://34.227.178.35:4000/groups/${groupId}/users`, {
            email: email
        }, {
            headers: { Authorization: 'Bearer ' + token }
        });

        if (response.data.success) {
            console.log("User added:", email);
            loadGroupUsers(groupId); // Reload users after adding
            document.getElementById("newUserEmail").value = ""; // Clear input field
        }
    } catch (error) {
        document.getElementById("newUserEmail").value = ""; 
        alert("unable to add user")
        console.error("Error adding user:", error);
    }
});

