// Function to fetch and render all users
export function fetchAndRenderAllUsers() {
    fetch('/api/allusers')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            return response.json();
        })
        .then(users => {
            renderAllUsers(users); // Render all users using data received
        })
        .catch(error => {
            console.error('Error fetching users:', error);
            // Handle error appropriately, e.g., render error message or retry
        });
}

// Function to render all users
export function renderAllUsers(users) {
    const container = document.getElementById('content');
    container.innerHTML = `<style>
        .container {
            width: 300px;
            margin: 0 auto;
            padding: 20px;
            background-color: #2c2f33;
            color: #ffffff;
            border-radius: 10px;
        }
        #start-chatting {
            display: block;
            width: 100%;
            padding: 10px;
            margin-bottom: 20px;
            background-color: #7289da;
            color: #fff;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            text-align: center;
        }
        #start-chatting:hover {
            background-color: #5b6eae;
        }
        .user-item {
            display: flex;
            align-items: center;
            padding: 10px;
            margin-bottom: 10px;
            background-color: #23272a;
            border-radius: 5px;
            cursor: pointer;
        }
        .user-item:hover {
            background-color: #3a3e43;
        }
        .avatar {
            width: 40px;
            height: 40px;
            background-color: #7289da;
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
        .message-preview {
            font-size: 12px;
            color: #888;
            margin-left: 5px;
            max-width: 150px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    </style>
    <div class="container">
        <button id="start-chatting">Start Chatting</button>
        <div id="user-list">
            ${users.map(user => `
                <div class="user-item" data-username="${user[0]}">
                    <div class="avatar">${user[0].charAt(0).toUpperCase()}</div>
                    <div class="username">${user[0]}</div>
                    <div class="message-preview">${user[1]}</div>
                </div>`).join('')}
        </div>
    </div>`;

 
    // Add event listener for the Start Chatting button
    document.getElementById('start-chatting').addEventListener('click', () => {
        window.location.href = '/userchat';
    });
}
