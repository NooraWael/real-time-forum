document.addEventListener('DOMContentLoaded', function() {
    // Fetch user session status
    const path = window.location.pathname;

    // Initial rendering based on the current path
    handleRoute(path);

    // Fetch user session status
    fetch('/api/session')
        .then(response => {
            if (!response.ok) {
                throw new Error('Session not found');
            }
            return response.json();
        })
        .then(session => {
            // Determine which navbar template to use
            let navbarHTML = session.UserName ? userNavBar() : guestNavBar();

            // Render the navbar
            renderNavbar('navbar', navbarHTML);
        })
        .catch(error => {
            console.error('Error fetching session:', error);
            // If session fetch fails, assume no session and render guest navbar
            renderNavbar('navbar', guestNavBar());
        });

    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', function(event) {
        handleRoute(window.location.pathname);
    });

});

function handleRoute(path) {
    console.log(path)
    switch (path) {
        case '/':
            fetchAndRenderPosts();
            break;
        case '/login':
            renderLogin();
            break;
        case '/signup':
            renderSignup();
            break;
        case '/addpost':
            renderAddPost();
            break;
            case '/chats':
            fetchAndRenderOnlineUsers();
            break;
        default:
            if (path.startsWith('/userchat/')) {
                const recipientUsername = path.substring(10); // Extract recipient username from URL
                fetchAndRenderUserChat(recipientUsername)}
            // Assume it's a post detail page
            else if (path.startsWith('/posts/')) {
                const postId = path.substring(7); // Extract post ID from URL
                fetchAndRenderPostDetails(postId);
            } else {
                // Handle 404 or other routes
                renderNotFound();
            }
            break;
    }
}


// Function to fetch and render online users
function fetchAndRenderOnlineUsers() {
    fetch('/api/onlineusers')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch online users');
            }
            return response.json();
        })
        .then(users => {
            renderOnlineUsers(users); // Render online users using data received
        })
        .catch(error => {
            console.error('Error fetching online users:', error);
            // Handle error appropriately, e.g., render error message or retry
        });
}

let onlineUsers = [];
let userChats = {};
let messageHistory = [];
let currentOffset = 0;
const PAGE_SIZE = 10;

function fetchAndRenderUserChat(username) {
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
function renderUserChat(data) {
    const onlineUsers = data.Online || []; // Ensure online users array is initialized
    const container = document.getElementById('content');
    container.innerHTML = `
    <style>
    @keyframes slideIn {
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
    }
</style>
</head>
<body>
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

    const recipient2 = window.location.pathname.split('/').pop();

    socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'message' && msg.from != recipient2 && msg.from != username){

        }else if (data.type === 'history') {
            messageHistory = data.messages;
            currentOffset = Math.max(0, messageHistory.length - PAGE_SIZE);
            renderMessages();} else if (msg.type === 'message' && msg.from === recipient2){
                displayMessage(msg.from, msg.text, false)
                updateUserList(msg.from,msg.text)
            }
            else{
            displayMessage(msg.from, msg.text, true);} // Display only if from matches recipient
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

// Function to render online users
function renderOnlineUsers(users) {
    const container = document.getElementById('content');
    container.innerHTML = `<style>/* CSS styles for online users */
    .online-users {
        width: 30%; /* Take up 40% of the screen width */
        float: left; /* Align to the right */
        padding: 20px;
        background-color: #f5f5f5; /* Light grey background */
        height: calc(100vh - 60px); /* Take full height minus header and footer */
        overflow-y: auto; /* Enable scrolling if content exceeds height */
        border-left: 1px solid #ddd; /* Add a subtle border */
        box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1); /* Shadow effect */
    }
    
    .online-users h2 {
        font-size: 18px;
        margin-bottom: 10px;
        color: #333; /* Dark text color */
    }
    
    .user-item {
        display: flex;
        align-items: center;
        padding: 10px;
        color: #333; /* Dark text color */
        text-decoration: none; /* Remove default link underline */
        transition: background-color 0.3s ease; /* Smooth background transition */
    }
    
    .user-item:hover {
        background-color: #e0e0e0; /* Light grey background on hover */
    }
    
    .avatar {
        width: 40px;
        height: 40px;
        background-color: #0084ff; /* Blue avatar background */
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
    }
    
    .user-item:hover .avatar {
        background-color: #0056b3; /* Darker blue on hover */
    }
    
    
    </style>
    <div class="online-users">
    <h2>Online Users</h2>
    ${users.map(user => `
        <a href="/userchat/${user}">
            <div class="user-item">
                <div class="avatar">${user.charAt(0).toUpperCase()}</div>
                <div class="username">${user}</div>
            </div>
        </a>`).join('')}
</div>
`;
}


function renderNavbar(elementId, navbarHTML) {
    document.getElementById(elementId).innerHTML = navbarHTML;
}

function fetchAndRenderPosts() {
    fetch('/api/posts')
        .then(response => response.json())
        .then(data => {
            const postsContainer = document.getElementById('content');

            data.forEach(post => {
                let categoriesString = '';
                post.Categories.forEach(category => {
                    categoriesString += `${category} `;
                });

                // Create post element dynamically with integrated styles
                const postElement = `
                    <div class="post-container" id="post-${post.ID}">
                        <div class="postbox">
                            <div class="header-container">
                                <h4>${post.Author} - <span class="time-elapsed" data-time="${post.Created_At}">${new Date(post.Created_At).toLocaleString()}</span></h4>
                            </div>
                            <div class="header-container">
                                <h4 style="float: left;" onclick="navigateToPost(${post.ID})">Category:</h4>
                                <h4 style="float: left; margin-right: 10px;">${categoriesString}</h4>
                            </div>
                            <div style="text-align: center; padding-top: 10px;">
                                <h2>${post.Title}</h2>
                            </div>
                            <div class="content-container">
                                <p>${post.Content}</p>
                            </div>
                            <div class="button-container">
                                <div onclick="navigateToPost(${post.ID})">
                                    <i class="fa-solid fa-comment" style="margin-right: 5px;"></i>
                                    <span class="num">0</span>
                                </div>
                                <div>
                                    <i class="fa-solid fa-thumbs-up ${post.UserLikeStatus === 1 ? 'liked' : ''}" onclick='event.preventDefault(); addLike("${post.ID}", "like")' style="margin-right: 5px;"></i>
                                    <span class="likes-count">${post.Likes}</span>
                                </div>
                                <div>
                                    <i class="fa-solid fa-thumbs-down ${post.UserLikeStatus === 0 ? 'disliked' : ''}" onclick='event.preventDefault(); addLike("${post.ID}", "dislike")' style="margin-right: 5px;"></i>
                                    <span class="dislikes-count">${post.DisLikes}</span>
                                </div>
                            </div>
                        </div>
                    </div>`;
                postsContainer.innerHTML += postElement;
            });

        })
        .catch(error => console.error('Error fetching posts:', error));
}

function navigateToPost(postId) {
    history.pushState(null, null, `/posts/${postId}`);
    fetchAndRenderPostDetails(postId);
}

function fetchAndRenderPostDetails(postId) {
    fetch(`/api/posts/${postId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Post not found');
            }
            return response.json();
        })
        .then(data => {
            renderPostDetails(data); // Render post details using data received
        })
        .catch(error => {
            console.error('Error fetching post details:', error);
            renderNotFound(); // Render a not found message or handle error appropriately
        });
}

function renderAddPost(){
    const navbar = document.getElementById('navbar')
    navbar.innerHTML = ' ';
    const container = document.getElementById('content');
    container.innerHTML = addPost();
}


function renderPostDetails(data) {
    const container = document.getElementById('content');
    container.innerHTML = `
        <link href="/css/style3.css" rel="stylesheet">
        <button id="clearbtn" onclick="location.href='/'">Back</button>
        <div class="post-details">
            <h6 class="time-elapsed" data-time="${data.Post.Created_At}">${new Date(data.Post.Created_At).toLocaleString()}</h6>
            <h3 style="text-transform: uppercase;">${data.Post.Title}</h3>
            <h4 style="float: right;">Shared by: ${data.Post.Author}</h4>
            <h4 style="float: left;">Category: </h4>
            ${data.Post.Categories.map(category => `
                <h4 style="float: left; margin-right: 10px;">${category}</h4>
            `).join('')}
            <br>
        </div>
        <div class="post-details likes-dislikes">
            <div>
                <i class="fa-solid fa-thumbs-up ${data.Post.UserLikeStatus === 1 ? 'liked' : ''}" onclick='addLikes("${data.Post.ID}", "like")'></i>
                <span class="likes-count-post">${data.Post.Likes}</span>
                <i class="fa-solid fa-thumbs-down ${data.Post.UserLikeStatus === 0 ? 'disliked' : ''}" onclick="addLikes('${data.Post.ID}', 'dislike')"></i>
                <span class="dislikes-count-post">${data.Post.DisLikes}</span>
            </div>
        </div>
        <div class="post-details">
            <p>${data.Post.Content}</p>
            <form id="commentForm" action="/addcomment" method="post">
                <input type="hidden" name="postID" value="${data.Post.ID}">
                <textarea id="content2" name="content2" rows="4" cols="100" placeholder="Write a comment..." maxlength="280"></textarea><br>
                <div class="char-counter" id="charCounter">280 characters remaining</div>
                <span id="contentError" class="error"></span>
                <button id="submitBtn" type="submit" disabled>Comment</button>
            </form>
        </div>
        <div class="comments">
            ${data.Comments.map(comment => `
                <div class="comment" id="comment-${comment.ID}">
                    <p class="comment-info">Comment by: ${comment.Author} - ${new Date(comment.Created_At).toLocaleString()}</p>
                    <p class="comment-content">${comment.Content}</p>
                    <div class="comment-actions likes-dislikes">
                        <span class="likes-count">${comment.Likes}</span>
                        <i class="fa fa-thumbs-up" onclick='addLikeComment("${comment.PostID}", "${comment.ID}", "like")'></i>
                        <span class="dislikes-count">${comment.DisLikes}</span>
                        <i class="fa fa-thumbs-down" onclick='addLikeComment("${comment.PostID}", "${comment.ID}", "dislike")'></i>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    const contentTextarea = document.getElementById('content2');
    const charCount = document.getElementById('charCounter');

    contentTextarea.addEventListener('input', function() {
        const maxLength = this.maxLength;
        const currentLength = this.value.length;
        const remaining = maxLength - currentLength;

        charCount.textContent = `${remaining} characters remaining`;

        if (remaining < 0) {
            charCount.style.color = 'red';
            submitBtn.disabled = true;
        } else {
            charCount.style.color = '';
            submitBtn.disabled = false;
        }
    });

    const submitBtn = document.getElementById('submitBtn');

    contentTextarea.addEventListener('input', function() {
        submitBtn.disabled = this.value.trim() === '';
    });

    const commentForm = document.getElementById('commentForm');
    commentForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(commentForm);
        const commentContent = formData.get('content2');

        if (commentContent.trim() === '') {
            document.getElementById('contentError').textContent = 'Comment content cannot be empty.';
            return;
        }

        const postID = formData.get('postID');

        fetch('/addcomment', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to add comment');
            }
            window.location.reload();
        })
       
        .catch(error => {
            console.error('Error adding comment:', error);
        });
    });
}

function renderLogin() {
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

function renderSignup() {
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

function renderNotFound() {
    document.getElementById('content').innerHTML = `
        <div>
            <h2>Page Not Found</h2>
            <p>The page you are looking for does not exist.</p>
            <button onclick="navigateToHome()">Go Home</button>
        </div>
    `;
}

function navigateToHome() {
    history.pushState(null, null, '/');
    fetchAndRenderPosts();
}

function guestNavBar() {
    return `
        <link rel="stylesheet" href="/css/navbar.css">
        <script src="https://kit.fontawesome.com/4ff99e7c8c.js" crossorigin="anonymous"></script>
        <div class="header">
            <div class="forum-container">
                <div class="forum-text" onclick="startAnimation()">
                    <span>F</span>
                    <span>O</span>
                    <span>R</span>
                    <span>U</span>
                    <span>M</span>
                </div>
            </div>
            <div class="header-right">
                <a class="button" href="/login"><i class="fas fa-sign-in-alt"></i><span>Log In</span></a>
                <a class="button" href="/signup"><i class="fas fa-user-plus"></i><span>Register</span></a>
            </div>
        </div>

        <script>
            function startAnimation() {
                const spans = document.querySelectorAll('.forum-text span');
                spans.forEach(span => {
                    span.classList.add('animate');
                    span.addEventListener('animationend', () => {
                        span.classList.remove('animate');
                        span.classList.add('active');
                    });
                });
            }
        </script>
    `;
}


function userNavBar() {
    return `
        <link rel="stylesheet" href="/css/navbar.css">
        <script src="https://kit.fontawesome.com/4ff99e7c8c.js" crossorigin="anonymous"></script>
        <div class="header">
            <div class="forum-container">
                <div class="forum-text" onclick="startAnimation()">
                    <span>F</span>
                    <span>O</span>
                    <span>R</span>
                    <span>U</span>
                    <span>M</span>
                </div>
            </div>
            <div class="header-right">
                <a class="button" href="/"><i class="fas fa-home"></i><span>Home</span></a>
                <a class="button" href="/chats"><i class="fas fa-comments"></i><span>Chats</span></a>
                <a class="button" href="/addpost"><i class="fas fa-plus"></i><span>Add Post</span></a>
                <a class="button" href="/logout"><i class="fas fa-sign-out-alt"></i><span>Log Out</span></a>
            </div>
        </div>

        <script>
            function startAnimation() {
                const spans = document.querySelectorAll('.forum-text span');
                spans.forEach(span => {
                    span.classList.add('animate');
                    span.addEventListener('animationend', () => {
                        span.classList.remove('animate');
                        span.classList.add('active');
                    });
                });
            }
        </script>
    `;
}

function addPost() {
    fetch('/addPostPageapi', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => {
        if (response.status === 401) {
            window.location.href = '/login'; // Redirect to login if not authorized
        } else if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const categories = data.Categories;
        let categoriesHTML = '';
        categories.forEach(category => {
            categoriesHTML += `<label><input type="checkbox" name="category" value="${category}"> ${category}</label><br>`;
        });

        document.getElementById('content').innerHTML = `
            <style>html, body {
    height: 100%;
    margin: 0;
    padding: 0;
}

.wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}

.container {
    background-color: #2c2f33;
    padding: 40px;
    border-radius: 8px;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
    max-width: 600px;
    width: 100%;
    color: #ffffff;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.container h2 {
    font-size: 28px;
    margin-bottom: 20px;
    text-align: center;
}

.container label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

.container input[type="text"],
.container textarea {
    width: 100%;
    padding: 10px;
    margin-bottom: 15px;
    border: none;
    border-radius: 4px;
    font-size: 16px;
}

.container textarea {
    resize: vertical;
}

.container button {
    width: 100%;
    padding: 12px 0;
    background-color: #7289da;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    margin-top: 10px;
}

.container button:hover {
    background-color: #5b6eae;
}

.container .back-link {
    display: block;
    text-align: center;
    margin-top: 20px;
    color: white;
    text-decoration: none;
}

.container .back-link:hover {
    text-decoration: underline;
}

.container .checkbox-container {
    margin-bottom: 15px;
}

.container .checkbox-container label {
    font-weight: normal;
}

.checkbox-container {
    display: flex;
    justify-content: space-between;
}

.error-message {
    color: red;
    font-size: 0.9rem;
    margin-top: -10px;
    margin-bottom: 15px;
}

            </style>
        <div class="wrapper">

            <div class="container">
                <h2>Add Post</h2>
                <form method="post" id="myForm">
                    <div class="checkbox-container">
                        <label>Category:</label><br>
                        ${categoriesHTML}
                    </div>
                    <label for="title">Title:</label>
                    <input type="text" id="title" name="title" placeholder="Your Post Title" maxlength="45" required>
                    <div id="titleError" class="error-message"></div>
                    <label for="content">Content:</label>
                    <textarea id="content" name="content" placeholder="Lorem Ipsum..." rows="6" maxlength="280" required></textarea>
                    <div id="contentError" class="error-message"></div>
                    <div id="charCount"></div>
                    <button type="submit">Create!</button>
                    <div id="checkboxError" style="color: red;"></div>
                </form>
                <a class="back-link" href="/">Back to Home</a>
            </div>
      </div>
            <script>
                document.getElementById('myForm').addEventListener('submit', function(event) {
                    var checkboxes = document.querySelectorAll('input[name="category"]');
                    var checkedOne = Array.prototype.slice.call(checkboxes).some(function(checkbox) {
                        return checkbox.checked;
                    });

                    var title = document.getElementById('title').value.trim();
                    var content = document.getElementById('content').value.trim();

                    var isValid = true;

                    if (!checkedOne) {
                        document.getElementById('checkboxError').textContent = 'Please select at least one category.';
                        isValid = false;
                    } else {
                        document.getElementById('checkboxError').textContent = '';
                    }

                    if (title === '') {
                        document.getElementById('titleError').textContent = 'Title cannot be empty or just spaces.';
                        isValid = false;
                    } else {
                        document.getElementById('titleError').textContent = '';
                    }

                    if (content === '') {
                        document.getElementById('contentError').textContent = 'Content cannot be empty or just spaces.';
                        isValid = false;
                    } else {
                        document.getElementById('contentError').textContent = '';
                    }

                    if (!isValid) {
                        event.preventDefault();
                    }
                });
            </script>
            <script src="/js/characterCount.js"></script>
        `;
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        document.getElementById('mainContent').innerHTML = '<p>Failed to load categories. Please try again later.</p>';
    });
}