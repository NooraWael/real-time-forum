// Create a new WebSocket connection
const socket = new WebSocket('ws://localhost:3000');

// Get references to the DOM elements
const chatContainer = document.getElementById('chatContainer');
const usernamePrompt = document.getElementById('usernamePrompt');
const usernameInput = document.getElementById('usernameInput');
const usernameButton = document.getElementById('usernameButton');
const userList = document.getElementById('userList');
const chat = document.getElementById('chat');
const recipientInput = document.getElementById('recipient');
const messageInput = document.getElementById('message');
const sendButton = document.getElementById('send');

// Variable to store the current username
let username = '';

// Event listener for the Enter Chat button
usernameButton.onclick = () => {
    username = usernameInput.value.trim();
    if (username) {
        socket.send(JSON.stringify({ type: 'register', username: username }));
        usernamePrompt.style.display = 'none';
        chatContainer.style.display = 'block';
    }
};

// Event listener for successful WebSocket connection
socket.onopen = () => {
    console.log('Connected to the server');
};

// Event listener for incoming messages from the server
socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    switch (data.type) {
        case 'userList':
            updateUserList(data.users);
            break;
        case 'message':
            displayMessage(data.from, data.text);
            break;
    }
};

// Event listener for the Send button
sendButton.onclick = () => {
    const text = messageInput.value.trim();
    const recipient = recipientInput.value.trim();
    if (text && recipient) {
        socket.send(JSON.stringify({
            type: 'message',
            from: username,
            to: recipient,
            text: text,
        }));
        displayMessage(username, text);
        messageInput.value = '';
    }
};

// Event listener for WebSocket disconnection
socket.onclose = () => {
    console.log('Disconnected from the server');
};

// Event listener for WebSocket errors
socket.onerror = (error) => {
    console.error('WebSocket error:', error);
};

// Function to display messages in the chat
function displayMessage(user, text) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    const usernameSpan = document.createElement('span');
    usernameSpan.classList.add('username');
    usernameSpan.textContent = user + ':';
    const textSpan = document.createElement('span');
    textSpan.classList.add('text');
    textSpan.textContent = text;
    messageDiv.appendChild(usernameSpan);
    messageDiv.appendChild(textSpan);
    chat.appendChild(messageDiv);
    chat.scrollTop = chat.scrollHeight;  // Auto scroll to the latest message
}

// Function to update the list of online users
function updateUserList(users) {
    userList.innerHTML = '';
    users.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.textContent = user;
        userList.appendChild(userDiv);
    });
}
