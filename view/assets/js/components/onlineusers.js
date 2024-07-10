
// Function to fetch and render online users
export function fetchAndRenderOnlineUsers() {
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



// Function to render online users
export function renderOnlineUsers(users) {
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
