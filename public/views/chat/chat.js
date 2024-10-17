let socket; // Declare socket variable

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const groupId = params.get("groupId"); // Get the groupId from the query parameters

    if (groupId) {
        await loadGroupDetails(groupId);
        await loadGroupMessages(groupId);
    } else {
        // console.error("No groupId provided");
        alert("No groupId provided");
    }

    const chatInput = document.getElementById("chatInput");
    const sendButton = document.getElementById("sendButton");
    const uploadButton = document.getElementById("uploadButton");
    const fileInput = document.getElementById("fileInput"); // Get file input element

    chatInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendMessage();
        }
    });

    sendButton.addEventListener('click', function () {
        sendMessage();
    });

    uploadButton.addEventListener('click', function () {
        fileInput.click(); // Open file input dialog on button click
    });

    fileInput.addEventListener('change', function () {
        uploadFile(); // Call uploadFile when file is selected
    });

    document.getElementById("backButton").addEventListener("click", () => {
        // localStorage.removeItem("chats");
        window.history.back();
    });

    await loadGroupUsers(groupId);

    // Initialize WebSocket connection
    socket = new WebSocket('ws://34.227.178.35:4000'); // Change port if necessary

    socket.onopen = () => {
        console.log("WebSocket connection established");
        const joinDetails = {
            type: 'joinGroup',
            groupId: groupId
        };
        socket.send(JSON.stringify(joinDetails));
        console.log("Join Group : groupId =>", groupId);
    };

    socket.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        // console.log(msg);
        const groupId = params.get("groupId");
        await loadGroupMessages(groupId);
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
        const groupId = params.get("groupId"); // Ensure groupId is present in the URL
        const messageContent = document.getElementById('chatInput').value;
        const userName = localStorage.getItem("name"); // Use userName instead of name
        const userId = localStorage.getItem('userId');
        if(messageContent == ''){
            console.log("typesomething");
            return;
        }
        const chatDetails = {
            userId: userId,
            content: messageContent,
            groupId: groupId, // Specify group ID
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

function uploadFile() {
    const fileInput = document.getElementById("fileInput");
    const userId = localStorage.getItem('userId');
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();

        reader.onload = function (event) {
            const message = {
                type: 'file',
                content: event.target.result, // Base64 encoded file content
                fileName: file.name,
                userName: localStorage.getItem("name"), // Retrieve username from localStorage
                groupId: new URLSearchParams(window.location.search).get("groupId"),
                userId:userId
            };

            socket.send(JSON.stringify(message)); // Send file data over WebSocket
            fileInput.value = ''; // Clear file input after sending
        };

        reader.readAsDataURL(file); // Read file as data URL (Base64)
    } else {
        alert('Please select a file to upload.');
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
        console.log(groupId+"gID");
        
        // Retrieve existing chats from local storage and parse
        let existingChats = JSON.parse(localStorage.getItem(`${groupId}chats`)) || [];
        console.log(existingChats);
        
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
            let latestChats = mergedChats.slice(-20);

            // console.log(typeof(latestChats) ,"type of loading messages");
            

            // Update local storage
            localStorage.setItem(`${groupId}chats`, JSON.stringify(latestChats));

            // Update the chat window
            const chatWindow = document.getElementById("chatWindow");
            // alert("clearing window");
            
            chatWindow.innerHTML = ''; // Clear existing messages


            latestChats.forEach((message) => {
                displayMessage(message); // Implement this function to render each message
            });
            // latestChats.forEach(chat => {
            //     const chatMessage = document.createElement("div");
            //     chatMessage.classList.add("chat-message");
            //     chatMessage.textContent = `${chat.User.name} : ${chat.content}`; // Format senderName : content
            //     chatWindow.appendChild(chatMessage);
            // });
        }
    } catch (error) {
        console.log("Error Loading Group Messages: " + error);
    }
}

function displayMessage(message) {
    const chatWindow = document.getElementById("chatWindow");
    console.log(message);

    if (message.type === 'text') {
        // Render text message
        // console.log(message);
        const chatMessage = document.createElement("div");
        chatMessage.textContent = `${message.User.name}: ${message.content}`;
        chatWindow.appendChild(chatMessage);
    } else if (message.type === 'file') {
        // Render file (image or file link)
        const chatMessage = document.createElement("div");
        // console.log(message.fileName);
        

        if (message.content.endsWith('.jpg') || message.content.endsWith('.png')) {
            // console.log("endingWith");
            console.log("endingWith", message.content); 
            
            chatMessage.innerHTML = `${message.User.name}: <img src="${message.content}" alt="${message.type}" style="max-width: 200px; max-height: 200px;" />`;
        } else {
            chatMessage.innerHTML = `${message.User.name}: <a href="${message.content}" target="_blank">${message.type}</a>`;
        }

        chatWindow.appendChild(chatMessage);
    }

    // Optionally scroll to the bottom of the chat window after rendering
    chatWindow.scrollTop = chatWindow.scrollHeight;
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
        alert("unable to add user");
        console.error("Error adding user:", error);
    }
});

