async function handleFormSubmit(event){
    try{
        event.preventDefault();
        // console.log("clicked"); 
        userDetails = {
            userName: event.target.username.value,
            emailId : event.target.email.value,
            password: event.target.password.value,
            phone:event.target.phone.value

        }
        let response = await axios.post("http://34.227.178.35:4000/users/signup", userDetails);
        console.log(response);
        alert("User Signed In Successfully");
    }
    catch(err){
        console.log("Error: ", err);

        // Handle specific error scenarios, such as a 409 conflict for an existing user
        if (err.response) {
            if (err.response.status === 409) {
                // User already exists
                alert("User already exists. Please login instead.");
                window.location.href = '../login/login.html';  // Redirect to the login page
            } else {
                // General error message from server
                alert(`Error: ${err.response.data.message || "An error occurred during signup"}`);
            }
        } else {
            // Network or other error
            alert("Network error or server not reachable");
        }  
    }
}