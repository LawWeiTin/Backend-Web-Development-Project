document.addEventListener("DOMContentLoaded", function () {
    const usernameField = document.getElementById("username");
    const passwordField = document.getElementById("password");
    const usernameError = document.getElementById("usernameError");
    const passwordError = document.getElementById("passwordError");
    

    const callback = (responseStatus, responseData) => {
        passwordField.classList.remove('is-invalid');
        usernameField.classList.remove('is-invalid');
        
        if (responseStatus == 200) {
            // Check if login was successful
            if (responseData.token) {
                // Reset the form fields
                loginForm.reset();
                // Store the token in local storage
                localStorage.setItem("token", responseData.token);
                // Redirect or perform further actions for logged-in user
                window.location.href = "profile.html";
            } else {
                console.log("Token is missing!")
            }
        } else if (responseStatus == 404) {
            usernameField.classList.add('is-invalid')
            usernameError.textContent = responseData.message
        } else if (responseStatus == 401) {
            passwordField.classList.add('is-invalid')
            passwordError.textContent = responseData.message
        } else {
            if (passwordField.value == "" && usernameField.value == "") {
                console.log('hi')
                passwordField.classList.add('is-invalid');
                usernameField.classList.add('is-invalid');
                usernameError.textContent = 'Username is missing!'
                passwordError.textContent = 'Password is missing!'
            } else if (passwordField.value == "") {
                passwordField.classList.add('is-invalid');
                passwordError.textContent = 'Password is missing!'
            } else {
                usernameField.classList.add('is-invalid');
                usernameError.textContent = 'Username is missing!'
            }
        }

    };

    const loginForm = document.getElementById("login");

    loginForm.addEventListener("submit", function (event) {
        console.log("Logging in...");
        event.preventDefault();

        const username = usernameField.value;
        const password = passwordField.value;

        const data = {
            username: username,
            password: password,
        };
        // Perform login request
        fetchMethod(currentUrl + "/api/users/login", callback, "POST", data);
    });
});