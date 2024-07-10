export function renderSignup() {
    document.getElementById('content').innerHTML = `
        <div>
            <h2>Signup</h2>
            <form id="signupForm">
                <label for="nickname">Nickname:</label>
                <input type="text" id="nickname" name="nickname" required>
                <label for="age">Age:</label>
                <input type="number" id="age" name="age" required>
                <label for="gender">Gender:</label>
                <input type="text" id="gender" name="gender" required>
                <label for="firstName">First Name:</label>
                <input type="text" id="firstName" name="firstName" required>
                <label for="lastName">Last Name:</label>
                <input type="text" id="lastName" name="lastName" required>
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required>
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
                <button type="submit">Signup</button>
            </form>
        </div>
    `;
}


export function renderLogin() {
    document.getElementById('content').innerHTML = `
        <div>
            <h2>Login</h2>
            <form id="loginForm">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required>
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
                <button type="submit">Login</button>
            </form>
        </div>
    `;
}