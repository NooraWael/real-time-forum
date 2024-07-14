export function renderSignup() {
    document.getElementById('content').innerHTML = `
        <link href="/css/login.css" rel="stylesheet">
    <div class="wrapper">
        <div class="container">
            <h2>Create Your Account</h2>
            <form id="signupForm" method="post">
                <input type="text" id="username" name="user_name" placeholder="Username" maxlength="12" required>
                <div id="usernameError" class="error-message"></div>
                
                <input type="email" id="email" name="email" placeholder="Email" required>
                <div id="emailError" class="error-message"></div>
                
                <div class="password-container">
                    <input type="password" id="password" name="password" placeholder="Password" required>
                    <i class="fas fa-eye" id="togglePassword"></i>
                </div>
                <div id="passwordError" class="error-message"></div>
                
                <input type="text" id="firstname" name="firstname" placeholder="Please enter your first name" maxlength="20" required>
                <div id="firstNameError" class="error-message"></div>
                
                <input type="text" id="lastname" name="lastname" placeholder="Please enter your last name" maxlength="20" required>
                <div id="lastNameError" class="error-message"></div>
                
                <div class="gender-container">
                    <input type="radio" id="male" name="gender" value="male" required checked>
                    <label for="male">Male</label>
                    
                    <input type="radio" id="female" name="gender" value="female" required>
                    <label for="female">Female</label>
                </div>
                <div id="genderError" class="error-message"></div>
                
                <input type="number" id="age" name="age" placeholder="Age" min="18" max="100" required>
                <div id="ageError" class="error-message"></div>
                
                <button type="submit" id="submitBtn">Register</button>
            </form>
            <div class="signup-link">
                Have an account? <a href="/login">Sign in</a>
            </div>
        </div>
    </div>
    `;

    const togglePassword = document.querySelector('#togglePassword');
    const password = document.querySelector('#password');
    const signupForm = document.getElementById('signupForm');
    const username = document.getElementById('username');
    const email = document.getElementById('email');
    const firstName = document.getElementById('firstname');
    const lastName = document.getElementById('lastname');
    const maleGender = document.getElementById('male');
    const femaleGender = document.getElementById('female');
    const age = document.getElementById('age');
    const submitBtn = document.getElementById('submitBtn');
    const usernameError = document.getElementById('usernameError');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const firstNameError = document.getElementById('firstNameError');
    const lastNameError = document.getElementById('lastNameError');
    const genderError = document.getElementById('genderError');
    const ageError = document.getElementById('ageError');

    togglePassword.addEventListener('click', function () {
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type', type);
        this.classList.toggle('fa-eye-slash');
    });

    function validateForm() {
        const trimmedUsername = username.value.trim();
        const trimmedEmail = email.value.trim();
        const trimmedPassword = password.value.trim();
        const ageValue = age.value.trim();

        let isValid = true;

        if (trimmedUsername === '') {
            usernameError.textContent = 'Username cannot be empty or just spaces.';
            isValid = false;
        } else if (trimmedUsername.length > 12) {
            usernameError.textContent = 'Username cannot exceed 12 characters.';
            isValid = false;
        } else {
            usernameError.textContent = '';
        }

        if (trimmedEmail === '') {
            emailError.textContent = 'Email cannot be empty or just spaces.';
            isValid = false;
        } else {
            emailError.textContent = '';
        }

        if (trimmedPassword === '') {
            passwordError.textContent = 'Password cannot be empty or just spaces.';
            isValid = false;
        } else {
            passwordError.textContent = '';
        }

        if (isNaN(ageValue) || ageValue === '') {
            ageError.textContent = 'Age must be a number.';
            isValid = false;
        } else {
            ageError.textContent = '';
        }

        return isValid;
    }

    signupForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        const gender = maleGender.checked ? 'male' : 'female'; // Determine selected gender
        const formData = new FormData(signupForm);
        formData.set('gender', gender); // Set the gender field in form data

        const ageValue = parseInt(formData.get('age'), 10);
        formData.set('age', ageValue);
        
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });

        try {
            const response = await fetch('/signup/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                console.log(result.error);
                if (result.error.includes('Username')) {
                    usernameError.textContent = result.error;
                } else if (result.error.includes('Email')) {
                    emailError.textContent = result.error;
                } else if (result.error.includes('Password')) {
                    passwordError.textContent = result.error;
                } else if (result.error.includes('Age')) {
                    ageError.textContent = result.error;
                } else {
                    alert(result.error);
                }
            } else {
                window.location.href = '/';
            }
        } catch (error) {
            alert('An error occurred. Please try again.', error);
        }
    });
}



export function renderLogin() {
    document.getElementById('content').innerHTML = `
    <link href="/css/login.css" rel="stylesheet">
            <div class="wrapper">

<div class="container">
    <h2>Welcome to the Forum</h2>
    <form action="/login/process" method="post">
        <input type="text" name="user_name" placeholder="Username" required>
        <div class="password-container">
            <input type="password" id="password" name="password" placeholder="Password"  required>
            <i class="fas fa-eye" id="togglePassword"></i>
        </div>
        <button type="submit">Login</button>
    </form>
    <div class="signup-link">
        don't have an account? <a href="/signup">Sign up</a>

    </div>
</div>
</div>

<script>
    const togglePassword = document.querySelector('#togglePassword');
    const password = document.querySelector('#password');

    togglePassword.addEventListener('click', function () {
        // Toggle the type attribute
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type', type);
        // Toggle the eye slash icon
        this.classList.toggle('fa-eye-slash');
    });
</script>
    `;

    const togglePassword = document.querySelector('#togglePassword');
    const password = document.querySelector('#password');

    togglePassword.addEventListener('click', function () {
        // Toggle the type attribute
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type', type);
        // Toggle the eye slash icon
        this.classList.toggle('fa-eye-slash');
    });
}