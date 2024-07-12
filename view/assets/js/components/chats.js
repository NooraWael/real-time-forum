import { styling } from './chatstyling.js';

let onlineUsers = [];
let userChats = {};
let messageHistory = [];
let currentOffset = 0;
const PAGE_SIZE = 10;
let handleScroll;

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
            if(data.Recentchat != null){
                data.Recentchat.forEach(chat => {
                    userChats[chat[0]] = chat[1];
                });
            }
            messageHistory = data.Messages || [];
            currentOffset = Math.max(0, messageHistory.length - PAGE_SIZE);
            renderUserChat(data); // Render user chat using data received
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
    setupEventListeners();
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
            updateUserList(recipient,msg.text)
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

    // Add the scroll event listener if not already added
    chat.removeEventListener('scroll', handleScroll); // Remove the listener first to avoid duplicates
    chat.addEventListener('scroll', handleScroll);
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


export function setupEventListeners() {
    // Initialize handleScroll with the throttled function if it's not already set
    if (!handleScroll) {
        handleScroll = throttle(function() {
            const chat = document.getElementById('chat');
            if (chat.scrollTop === 0 && currentOffset > 0) {
                currentOffset -= PAGE_SIZE;
                renderMoreMessages();
            }
        }, 200);
    }
}
