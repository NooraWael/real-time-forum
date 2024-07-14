import { styling } from './chatstyling.js';
import {fetchAndRenderAllUsers} from './allusers.js'

let onlineUsers = [];
let userChats = {};
let messageHistory = [];
let currentOffset = 0;
const PAGE_SIZE = 10;
let handleScroll;
let recipient2 = "";
let times = 0;
let typingTimeout;

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
                <div id="typing-indicator" class="typing-indicator"></div>
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
    recipient2 = recipient
    const socket = new WebSocket('ws://localhost:8080/ws');
    const chat = document.getElementById('chat');
    const messageInput = document.getElementById('message');
    const sendButton = document.getElementById('send');
    const typingIndicator = document.getElementById('typing-indicator');

    socket.onopen = () => {
        console.log('Connected to the server');
        socket.send(JSON.stringify({ type: 'register', username: username, recipient: recipient }));
    };


    socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'message' && msg.from != recipient && msg.from != username) {
            fetchAndRenderAllUsers();
        } else if (msg.type2 === 'history') {
            messageHistory.push(msg)
            renderMessages();
        } else if (msg.type === 'message' && msg.from === recipient) {
            displayMessage(msg.from, msg.text, false);
            fetchAndRenderAllUsers();
        } else if (msg.type === 'typing') {
            showTypingIndicator(msg.from, msg.status);
        } else if (msg.type === 'userList') {
            onlineUsers = msg.users;
            updateOnlineUsers();
        } else {
            displayMessage(msg.from, msg.text, true);
            fetchAndRenderAllUsers();
        } // Display only if from matches recipient
    };

    messageInput.oninput = () => {
        socket.send(JSON.stringify({ type: 'typing', from: username, to: recipient, status: 'typing' }));
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            console.log("send")
            socket.send(JSON.stringify({ type: 'typing', from: username, to: recipient, status: 'stop' }));
        }, 3000); // Stop typing indicator after 3 seconds of inactivity
    };

    function showTypingIndicator(user, status) {
        if (status === 'typing') {
            typingIndicator.innerHTML = `
                <div class="bubble"></div>
                <div class="bubble"></div>
                <div class="bubble"></div>
            `;
        } else {
            typingIndicator.innerHTML = '';
        }
    }

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

    function renderMessages() {
        const chat = document.getElementById('chat');
        chat.innerHTML = ''; // Clear current messages
    
        currentOffset = Math.max(0, messageHistory.length - PAGE_SIZE);
       
        // Load the most recent PAGE_SIZE messages
        const messagesToRender = messageHistory.slice(Math.max(0, messageHistory.length - PAGE_SIZE));
        messagesToRender.forEach(message => {
            if(message.from === recipient2){
                displayMessage(message.from, message.text, false);
            }else {
                displayMessage(message.from, message.text, true);
            }
        });
    
    
        chat.removeEventListener('scroll', handleScroll);
        chat.addEventListener('scroll', handleScroll);
    }

    let handleScroll = throttle(() => {
        const chat = document.getElementById('chat');
        const maxScrollTop = chat.scrollHeight - chat.clientHeight;
    
        console.log(chat.scrollTop, maxScrollTop)
        // Assuming that being "near the top" might correspond to a small negative number close to zero
          // Check if the user is near the top of the chat (considering column-reverse layout)
    if (chat.scrollTop < -maxScrollTop + 50 && currentOffset > 0) {
        renderMoreMessages();
    }
}, 200);
   

    function renderMoreMessages() {
        const chat = document.getElementById('chat');

        const oldScrollHeight = chat.scrollHeight; // Store the old scroll height to calculate the adjustment later
        // Load previous messages
        const nextOffset = Math.max(0, currentOffset - PAGE_SIZE);
        const additionalMessages = messageHistory.slice(nextOffset, currentOffset);
        currentOffset = nextOffset; // Update currentOffset
    
        // Use append directly for each new message
        additionalMessages.forEach(message => {
            const messageElement = createMessageElement(message.from, message.text, message.from === recipient2);
            chat.appendChild(messageElement); // Append at the visual bottom, which is the actual DOM top
        });
    
        // Adjust scroll position so the user does not notice the jump
        // Only adjust if the user is near the visual bottom of the chat
    }
}








function createMessageElement(sender, content, isSent) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', isSent ? 'sent' : 'received');

    const avatarDiv = document.createElement('div');
        avatarDiv.classList.add('avatar');
        avatarDiv.textContent = sender.charAt(0).toUpperCase();

    const textDiv = document.createElement('div');
    textDiv.classList.add('text');
    textDiv.textContent = content;

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(textDiv);
    return messageDiv;
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
