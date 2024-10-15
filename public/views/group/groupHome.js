document.addEventListener("DOMContentLoaded", async () => {
    // console.log("Script Loaded"); // Debugging log

    // Fetch user groups and display them
    await loadUserGroups();
});

const createGroupButton = document.getElementById("createGroupButton");
if (createGroupButton) {
    createGroupButton.addEventListener("click", () => {
        console.log("Create Group button clicked");
        alert("You are going to create a new group");
        window.location.href = "./createGroup.html"; // Redirect to create group page
    });
} else {
    console.error("Create Group Button not found in DOM");
}
const logoutButton = document.getElementById("logoutButton");
if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        // console.log("Logout button clicked");
        alert("You are going to logout");
        localStorage.removeItem("token"); // Clear token
        window.location.href = "../login/login.html"; // Redirect to login page
    });
} else {
    console.error("Logout Button not found in DOM");
}


async function loadUserGroups() {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://34.227.178.35:4000/groups/get", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await response.json();
        // console.log(data);
        
        if (data.success) {
            const groupList = document.getElementById("groupList");
            data.groups.forEach(group => {
                const groupItem = document.createElement("div");
                groupItem.classList.add("group-item");
                
                // Create a link that takes the user to the chat page
                const groupLink = document.createElement("a");
                // localStorage.setItem('groupId', group.id);
                groupLink.href = `../chat/chat.html?groupId=${group.id}`; // Set the link to chat.html with groupId as a query parameter
                // groupLink.href = `../chat/chat.html`;
                groupLink.innerHTML = `
                    <h3>${group.name}</h3>
                    <p>${group.description}</p>
                `;

                groupItem.appendChild(groupLink); // Append the link to the group item
                groupList.appendChild(groupItem); // Append the group item to the group list
            });
        } else {
            alert("Failed to load groups.");
        }
    } catch (error) {
        console.error("Error loading groups:", error);
    }
}
