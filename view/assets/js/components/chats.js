let onlineUsers = [];
let userChats = {};
let messageHistory = [];
let currentOffset = 0;
const PAGE_SIZE = 10;

export function fetchAndRenderUserChat(username) {
    fetch(`/api/userchat/${username}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch user chat');
            }
            return response.json();
        })
        .then(data => {
            onlineUsers = data.Online || [];
            userChats = {};
            data.Recentchat.forEach(chat => {
                userChats[chat[0]] = chat[1];
            });
            messageHistory = data.Messages || [];
            currentOffset = Math.max(0, messageHistory.length - PAGE_SIZE);
            renderUserChat(data); // Render user chat using data received
            renderMessages();
        })
        .catch(error => {
            console.error('Error fetching user chat:', error);
            renderNotFound(); // Render a not found message or handle error appropriately
        });
}

export function renderUserChat(data) {
     onlineUsers = data.Online || []; // Ensure online users array is initialized
    const container = document.getElementById('content');
    container.innerHTML = `
    <style>
    ${styling()}
    </style>
    <div class="container">
        <div class="sidebar">
            <h2>Online Users</h2>
            <div id="user-list">
                    ${renderUserList2()}
            </div>
        </div>
        <div class="chat-container">
            <div class="chat-header">
                <h3>Chat with ${data.Recipient}</h3>
            </div>
            <div id="chat">
              
            </div>
            <div class="input-container">
                <input type="text" id="message" placeholder="Type a message">
                <button id="send">Send</button>
            </div>
        </div>
    </div>
    `;

    const username = data.Username;
    const recipient = data.Recipient;

    const socket = new WebSocket('ws://localhost:3000/ws');
    const chat = document.getElementById('chat');
    const messageInput = document.getElementById('message');
    const sendButton = document.getElementById('send');

    socket.onopen = () => {
        console.log('Connected to the server');
        socket.send(JSON.stringify({ type: 'register', username: username, recipient: recipient }));
    };

    socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'message' && msg.from != recipient && msg.from != username) {

        } else if (msg.type === 'history') {
            messageHistory = msg.messages;
            currentOffset = Math.max(0, messageHistory.length - PAGE_SIZE);
            renderMessages();
        } else if (msg.type === 'message' && msg.from === recipient) {
            displayMessage(msg.from, msg.text, false);
        } else if (msg.type === 'userList') {
            onlineUsers = msg.users;
            updateOnlineUsers();
        } else {
            displayMessage(msg.from, msg.text, true);
        } // Display only if from matches recipient
    };

    sendButton.onclick = () => {
        const text = messageInput.value.trim();
        if (text) {
            socket.send(JSON.stringify({
                type: 'message',
                from: username,
                to: recipient,
                text: text,
            }));
            messageInput.value = '';
        }
    };

    socket.onclose = () => {
        console.log('Disconnected from the server');
    };

    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    function displayMessage(user, text, isSent) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        if (isSent) {
            messageDiv.classList.add('sent');
        } else {
            messageDiv.classList.add('received');
        }

        const avatarDiv = document.createElement('div');
        avatarDiv.classList.add('avatar');
        avatarDiv.textContent = user.charAt(0).toUpperCase();

        const textDiv = document.createElement('div');
        textDiv.classList.add('text');
        textDiv.textContent = text;

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(textDiv);
        chat.prepend(messageDiv);
        chat.scrollTop = chat.scrollHeight;
    }

    function updateOnlineUsers() {
        const userListContainer = document.getElementById('user-list');
        userListContainer.innerHTML = renderUserList2();
    }
}

function renderMessages() {
    const chat = document.getElementById('chat');
    chat.innerHTML = ''; // Clear current messages

    const messagesToRender = messageHistory.slice(currentOffset, currentOffset + PAGE_SIZE);
    messagesToRender.forEach(message => {
        displayMessage(message.Sender, message.Content, false);
    });

    // Add a scroll event listener to load more messages when scrolled to the top
    chat.addEventListener('scroll', throttle(function() {
        if (chat.scrollTop === 0 && currentOffset > 0) {
            currentOffset -= PAGE_SIZE;
            renderMoreMessages();
        }
    }, 200));
}

function renderMoreMessages() {
    const chat = document.getElementById('chat');
    const previousScrollHeight = chat.scrollHeight;

    const messagesToRender = messageHistory.slice(currentOffset, currentOffset + PAGE_SIZE);
    messagesToRender.forEach(message => {
        displayMessage(message.Sender, message.Content, false);
    });

    // Restore the scroll position after adding new messages
    chat.scrollTop = chat.scrollHeight - previousScrollHeight;
}

function throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function() {
        const context = this;
        const args = arguments;
        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function() {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    }
}

function renderUserList2() {
    return onlineUsers.map(user => {
        const messageContent = userChats[user] ? userChats[user].slice(0, 20) : '';
        return `
            <a href="/userchat/${user}" class="user-item">
                <div class="user-item-content">
                    <div class="avatar">${user.charAt(0).toUpperCase()}</div>
                    <div class="username">${user}</div>
                </div>
                <div class="message-preview">${messageContent}</div>
            </a>`;
    }).join('');
}

function getCurrentRecipientFromUrl() {
    const url = new URL(window.location.href);
    const pathname = url.pathname;
    const parts = pathname.split('/');
    return parts[parts.length - 1]; // Assuming the recipient's username is the last part of the URL
}

function updateUserList(username, message) {
    userChats[username] = message;

    // Move the user to the top of the list
    const userIndex = onlineUsers.indexOf(username);
    if (userIndex > -1) {
        onlineUsers.splice(userIndex, 1);
        onlineUsers.unshift(username);
    }

    // Re-render the user list with the new order and updated message preview
    const userListContainer = document.getElementById('user-list');
    userListContainer.innerHTML = renderUserList2();
}


function styling(){
    return     `@keyframes slideIn {
        from {
            transform: translateY(100%);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    .container {
        display: flex;
        height: 100vh;
        color: black
    }
    .sidebar {
        width: 30%;
        background-color: #fff;
        border-right: 1px solid #ddd;
        overflow-y: auto;
        padding: 20px;
    }
    .sidebar h2 {
        font-size: 18px;
        margin-bottom: 10px;
        color: #000;
    }
    .user-item {
        display: flex;
        align-items: center;
        padding: 10px;
        color: #000;
        text-decoration: none;
        transition: background-color 0.3s ease;
        border-bottom: 1px solid #f0f0f0;
    }
    .user-item:hover {
        background-color: #f5f5f5;
    }
    .avatar {
        width: 40px;
        height: 40px;
        background-color: #0084ff;
        color: white;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 18px;
        margin-right: 15px;
    }
    .username {
        font-weight: bold;
        font-size: 16px;
        color: #000;
    }
    .chat-container {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        background-color: #efeae2;
    }
    .chat-header {
        padding: 20px;
        background-color: #f5f5f5;
        border-bottom: 1px solid #ddd;
        color: #000;
    }
    .chat-header h3 {
        margin: 0;
        font-size: 20px;
    }
    #chat {
        flex-grow: 1;
        padding: 20px;
        overflow-y: auto;
        display: flex;
        flex-direction: column-reverse;
    }
    .message {
        display: flex;
        align-items: flex-end;
        margin-bottom: 10px;
    }
    .message.sent {
        justify-content: flex-end;
    }
    .message.received {
        justify-content: flex-start;
    }
    .message.sent .text {
        background-color: #dcf8c6;
        border: 1px solid #c1e5b0;
    }
    .message.received .text {
        background-color: #fff;
        border: 1px solid #ddd;
    }
    .text {
        max-width: 60%;
        padding: 10px;
        border-radius: 20px;
        font-size: 14px;
        margin: 0 10px;
        position: relative;
    }
    .text:before {
        content: "";
        position: absolute;
        top: 10px;
        width: 0;
        height: 0;
        border-style: solid;
    }
    .message.sent .text:before {
        right: -10px;
        border-width: 10px 0 10px 10px;
        border-color: transparent transparent transparent #dcf8c6;
    }
    .message.received .text:before {
        left: -10px;
        border-width: 10px 10px 10px 0;
        border-color: transparent #fff transparent transparent;
    }
    .input-container {
        display: flex;
        padding: 10px;
        background-color: #f5f5f5;
        border-top: 1px solid #ddd;
    }
    #message {
        flex-grow: 1;
        padding: 10px;
        margin-right: 10px;
        border: 1px solid #ccc;
        border-radius: 20px;
        font-size: 14px;
        outline: none;
        color: #000;
    }
    #send {
        padding: 10px 20px;
        background-color: #25d366;
        color: #fff;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        font-size: 14px;
    }
    #send:hover {
        background-color: #128c7e;
    }

    .message-preview {
        font-size: 12px;
        color: #888;
        margin-left: 55px;
        max-width: 150px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }`;
}