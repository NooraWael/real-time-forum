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
    console.log("hello")
    const container = document.getElementById('user-list-container');
    container.innerHTML = `
        <style>
            #user-list-container {
                padding: 20px;
                background-color: #2c2f33;
                color: #ffffff;
                overflow-y: auto;
                height: 100vh; /* Ensure it fits within the viewport */
            }
            #start-chatting1 {
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
            #start-chatting1:hover {
                background-color: #5b6eae;
            }
            .user-item1 {
                display: flex;
                align-items: center;
                padding: 10px;
                margin-bottom: 10px;
                background-color: #23272a;
                border-radius: 5px;
                cursor: pointer;
            }
            .user-item1:hover {
                background-color: #3a3e43;
            }
            .avatar1 {
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
            .username1 {
                font-weight: bold;
                font-size: 16px;
                flex-grow: 1; /* Ensure it takes available space */
            }
            .message-preview1 {
                font-size: 12px;
                color: #888;
                margin-left: 5px;
                max-width: 150px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        </style>
        <div class="container1">
            <button id="start-chatting1">Start Chatting</button>
            <div id="user-list1">
                ${users.map(user => `
                    <div class="user-item1" data-username="${user[0]}">
                        <div class="avatar1">${user[0].charAt(0).toUpperCase()}</div>
                        <div class="username1">${user[0]}</div>
                        <div class="message-preview1">${user[1]}</div>
                    </div>`).join('')}
            </div>
        </div>
    `;

    // Add event listeners for the user items
    document.querySelectorAll('.user-item1').forEach(item => {
        item.addEventListener('click', () => {
            const username = item.getAttribute('data-username');
            window.location.href = `/userchat/${username}`;
        });
    });

    // Add event listener for the Start Chatting button
    document.getElementById('start-chatting1').addEventListener('click', () => {
        window.location.href = '/userchat';
    });
}
