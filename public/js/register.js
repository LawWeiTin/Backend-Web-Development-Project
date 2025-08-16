document.addEventListener("DOMContentLoaded", function () {
    const register = document.getElementById("registration");
    const passwordMismatchMessage = document.getElementById('passwordMismatchMessage');
    const usernameField = document.getElementById("username");
    const emailField = document.getElementById("email");
    const passwordField = document.getElementById("password");
    const confirmPasswordField = document.getElementById("confirmPassword");

    // Check password strength function
    function checkPasswordStrength(password) {
        const strengthBar = document.getElementById('passwordStrengthBar');
        const strengthText = document.getElementById('passwordStrengthText');
        const strengthMessage = document.getElementById('passwordStrengthMessage');
        const submitButton = document.getElementById('registerButton');
        let strength = 0;
        let strengthLabel, strengthClass;

        const lengthCriteria = password.length >= 6;
        const hasLetters = /[a-zA-Z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const hasUpperAndLower = /[a-z]/.test(password) && /[A-Z]/.test(password);

        if (hasLetters && hasNumbers && hasSpecialChars && hasUpperAndLower && lengthCriteria) {
            strength = 100; // Extra Strong
            strengthLabel = 'Extra Strong';
            strengthClass = 'bg-primary';
        } else if (hasLetters && hasNumbers && (hasSpecialChars || hasUpperAndLower) && lengthCriteria) {
            strength = 75; // Strong
            strengthLabel = 'Strong';
            strengthClass = 'bg-success';
        } else if (hasLetters && hasNumbers && !(hasSpecialChars || hasUpperAndLower) && lengthCriteria) {
            strength = 50; // Moderate
            strengthLabel = 'Moderate';
            strengthClass = 'bg-warning';
        } else if (password.length > 0) {
            strength = 25; // Weak
            strengthLabel = 'Weak';
            strengthClass = 'bg-danger';
        }

        strengthBar.style.width = `${strength}%`;
        strengthBar.className = `progress-bar ${strengthClass}`;
        strengthText.textContent = strengthLabel;

        if (strength < 50) {
            strengthMessage.textContent = 'Password is too weak!'
            strengthMessage.classList.remove('d-none');
            passwordField.classList.add('is-invalid');
            passwordField.classList.remove('is-valid');
        } else {
            strengthMessage.classList.add('d-none');
            passwordField.classList.remove('is-invalid');
            passwordField.classList.add('is-valid');
        }

        if (strength >= 50) {
            submitButton.removeAttribute('disabled');
        } else {
            submitButton.setAttribute('disabled', 'true');
        }

        return strength >= 50;
    }


    // Password strength on input
    passwordField.addEventListener('input', function () {
        const password = this.value;
        checkPasswordStrength(password);
        confirmPasswordField.classList.remove('is-invalid', 'is-valid')
    });

    // Password confirmation check
    confirmPasswordField.addEventListener('input', function () {
        const password = passwordField.value;
        const confirmPassword = this.value;

        // Check if passwords match
        if (password !== confirmPassword && confirmPassword !== '') {
            passwordMismatchMessage.classList.remove('d-none');
            confirmPasswordField.classList.add('is-invalid');
            confirmPasswordField.classList.remove('is-valid');
        } else {
            passwordMismatchMessage.classList.add('d-none');
            confirmPasswordField.classList.add('is-valid');
            confirmPasswordField.classList.remove('is-invalid');
        }
    });

    // Submit handler
    register.addEventListener("submit", function (event) {
        event.preventDefault();

        // Clear previous error messages
        passwordMismatchMessage.classList.add('d-none');
        const errors = [];

        // Validate fields and collect errors
        if (usernameField.value.trim() === "") {
            usernameField.classList.add('is-invalid');
            usernameField.classList.remove('is-valid');
            document.getElementById('usernameError').textContent = 'Username is required!';
            errors.push('username');
        } else {
            usernameField.classList.add('is-valid');
            usernameField.classList.remove('is-invalid');
        }

        const email = emailField.value;
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!email.match(emailPattern)) {
            emailField.classList.add('is-invalid');
            emailField.classList.remove('is-valid');
            document.getElementById('emailError').textContent = 'Please enter a valid email address!';
            errors.push('email');
        } else {
            emailField.classList.remove('is-invalid');
            emailField.classList.add('is-valid');
        }

        const password = passwordField.value;
        if (password.trim() === "") {
            passwordField.classList.add('is-invalid');
            passwordField.classList.remove('is-valid');
            document.getElementById('passwordStrengthMessage').textContent = 'Password is required!';
            errors.push('password');
        } else {
            passwordField.classList.remove('is-invalid');
            passwordField.classList.add('is-valid');
        }

        // Check password strength
        if (!checkPasswordStrength(password)) {
            errors.push('weak-password');
        }

        const confirmPassword = confirmPasswordField.value;
        if (password !== confirmPassword) {
            passwordMismatchMessage.classList.remove('d-none');
            confirmPasswordField.classList.add('is-invalid');
            confirmPasswordField.classList.remove('is-valid');
            errors.push('password-mismatch');
        } else {
            confirmPasswordField.classList.add('is-valid');
            confirmPasswordField.classList.remove('is-invalid');
        }

        // If there are errors, don't submit the form
        if (errors.length > 0) {
            return; // Prevent submission
        }

        const callback = (responseStatus, responseData) => {
            if (responseStatus == 200) {
                if (responseData.token) {
                    localStorage.setItem("token", responseData.token)
                    window.location.href = 'classes.html'
                } else {
                    console.log("Token missing?")
                }
            } else {

                let usernameError = document.getElementById('usernameError');
                let emailError = document.getElementById('emailError');

                if (responseData.error == 'both') {
                    usernameField.classList.add('is-invalid');
                    emailField.classList.add('is-invalid');

                    usernameField.classList.remove('is-valid');
                    emailField.classList.remove('is-valid');
                    usernameError.textContent = responseData.message[0]
                    emailError.textContent = responseData.message[1]
                } else if (responseData.error == 'username') {
                    usernameField.classList.add('is-invalid');
                    usernameField.classList.remove('is-valid');

                    emailField.classList.add('is-valid');
                    emailField.classList.remove('is-invalid');
                    usernameError.textContent = responseData.message
                } else if (responseData.error == 'email') {
                    emailField.classList.add('is-invalid');
                    emailField.classList.remove('is-valid');

                    usernameField.classList.add('is-valid');
                    usernameField.classList.remove('is-invalid');
                    emailError.textContent = responseData.message
                } else {
                    usernameField.classList.add('is-valid');
                    usernameField.classList.remove('is-invalid');
                    emailField.classList.add('is-valid');
                    emailField.classList.remove('is-invalid');
                }

            }
        }

        const data = {
            username: usernameField.value,
            password: passwordField.value, 
            email: emailField.value
        }

        fetchMethod(currentUrl + '/api/users', callback, 'POST', data)
    });
});