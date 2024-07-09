const togglePassword = document.querySelector('#togglePassword');
const password = document.querySelector('#password');
const signupForm = document.getElementById('signupForm');
const username = document.getElementById('username');
const usernameError = document.getElementById('usernameError');
const passwordError = document.getElementById('passwordError');

togglePassword.addEventListener('click', function () {
    // Toggle the type attribute
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
    // Toggle the eye slash icon
    this.classList.toggle('fa-eye-slash');
});

signupForm.addEventListener('submit', function(event) {
    let isValid = true;

    // Trim username and password values
    const trimmedUsername = username.value.trim();
    const trimmedPassword = password.value.trim();

    // Username validation
    if (trimmedUsername === '') {
        usernameError.textContent = 'Username cannot be empty or just spaces.';
        isValid = false;
    } else if (trimmedUsername.length > 12) {
        usernameError.textContent = 'Username cannot exceed 12 characters.';
        isValid = false;
    } else {
        usernameError.textContent = '';
    }

    // Password validation
    if (trimmedPassword === '') {
        passwordError.textContent = 'Password cannot be empty or just spaces.';
        isValid = false;
    } else {
        passwordError.textContent = '';
    }

    if (!isValid) {
        event.preventDefault();
    }
});