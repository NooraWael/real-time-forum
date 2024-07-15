import { guestNavBar, userNavBar } from './components/navbar.js';
import { renderSignup, renderLogin } from './components/loginAndRegister.js';
import { addPost, renderAddPost } from './components/addpost.js';
import { renderNotFound, navigateToHome } from './components/errors.js';
import { fetchAndRenderUserChat, renderUserChat } from './components/chats.js';
import { fetchAndRenderPostDetails, renderPostDetails, fetchAndRenderPosts, NavigateToPost } from './components/post.js';
import { fetchAndRenderOnlineUsers, renderOnlineUsers } from './components/onlineusers.js';
import { fetchAndRenderAllUsers, renderAllUsers } from './components/allusers.js';

document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;

    fetch('/api/session')
        .then(response => {
            if (!response.ok) {
                throw new Error('Session not found');
            }
            return response.json();
        })
        .then(session => {
            let navbarHTML = session.UserName ? userNavBar() : guestNavBar();

            renderNavbar('navbar', navbarHTML);

            handleRoute(path);
            if (session.UserName) {
                const socket = new WebSocket('ws://localhost:8080/ws');

                socket.onopen = () => {
                    console.log('Connected to the server');
                    socket.send(JSON.stringify({ type: 'register', username: session.UserName }));
                };

                window.onbeforeunload = () => {
                    socket.send(JSON.stringify({ type: 'disconnect', username: session.UserName }));
                    socket.close();
                };

                socket.onclose = () => {
                    console.log('Disconnected from the server');
                };

                socket.onerror = (error) => {
                    console.error('WebSocket error:', error);
                };

                socket.onmessage = (event) => {
                    const msg = JSON.parse(event.data);
                    if (msg.type === 'message') {
                        fetchAndRenderAllUsers();
                    }

                    if(msg.type == 'message' && msg.from != session.UserName && !path.startsWith('/userchat')){
                        showNotification(`New message from ${msg.from}: ${msg.text.length > 5 ? msg.text.substring(0, 5) + '...' : msg.text}`);
                    }
                };
            }
        })
        .catch(error => {
            console.error('Error fetching session:', error);
            renderNavbar('navbar', guestNavBar());
            if (path === '/signup' || path === '/signup/') {
                renderSignup();
            } else {
                renderLogin();
            }
        });

    window.addEventListener('popstate', function(event) {
        handleRoute(window.location.pathname);
    });
});

window.handleRoute = function(path) {
    console.log(path);
    switch (path) {
        case '/':
            fetchAndRenderPosts();
            fetchAndRenderAllUsers();
            break;
        case '/login':
            renderLogin();
            break;
        case '/signup':
            renderSignup();
            break;
        case '/addpost':
            renderAddPost();
            fetchAndRenderAllUsers();
            break;
        case '/chats':
            fetchAndRenderOnlineUsers();
            break;
        case '/users':
            fetchAndRenderAllUsers();
            break;
        default:
            if (path.startsWith('/userchat/')) {
                fetchAndRenderAllUsers();
                console.log(path);
                const recipientUsername = path.substring(10);
                if (path === '/userchat/') {
                    fetchAndRenderUserChat(recipientUsername);
                    return;
                }
                isUserValid(recipientUsername).then(isValid => {
                    if (isValid) {
                        fetchAndRenderUserChat(recipientUsername);
                    } else {
                        alert('Wrong page');
                        window.location.href = "/";
                    }
                }).catch(error => {
                    console.error('Error checking user validity:', error);
                    alert('An error occurred');
                    window.location.href = "/";
                });
            } else if (path.startsWith('/posts/')) {
                fetchAndRenderAllUsers();
                const postId = path.substring(7);
                fetchAndRenderPostDetails(postId);
            } else {
                renderNotFound();
            }
            break;
    }
};

function renderNavbar(elementId, navbarHTML) {
    document.getElementById(elementId).innerHTML = navbarHTML;
    const script = document.createElement('script');
    script.innerHTML = `
        function navigate(event, path) {
            if (path === "/logout") {
                return;
            }
            event.preventDefault();
            history.pushState({}, '', path);
            handleRoute(path);
        }

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
    `;
    document.body.appendChild(script);
}

function isUserValid(username) {
    return fetch('/api/allusers')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            return response.json();
        })
        .then(users => {
            return users.some(user => user[0] === username);
        })
        .catch(error => {
            console.error('Error fetching users:', error);
            return false;
        });
}


function showNotification(message) {
    const notification = document.createElement('div');
    notification.classList.add('notification-container');
    notification.innerHTML = `
        ${message}
        <span class="close-btn">&times;</span>
    `;
    document.body.appendChild(notification);

    // Show the notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Hide the notification after 5 seconds
    setTimeout(() => {
        hideNotification(notification);
    }, 3000);

    // Add event listener for the close button
    notification.querySelector('.close-btn').addEventListener('click', () => {
        hideNotification(notification);
    });

    // Add swipe up event listener
    notification.addEventListener('touchstart', handleTouchStart, false);
    notification.addEventListener('touchmove', handleTouchMove, false);

    let xDown = null;                                                        
    let yDown = null;

    function handleTouchStart(evt) {
        const firstTouch = evt.touches[0];                                      
        xDown = firstTouch.clientX;                                      
        yDown = firstTouch.clientY;                                      
    };

    function handleTouchMove(evt) {
        if (!xDown || !yDown) {
            return;
        }

        const xUp = evt.touches[0].clientX;                                    
        const yUp = evt.touches[0].clientY;

        const xDiff = xDown - xUp;
        const yDiff = yDown - yUp;

        if (Math.abs(yDiff) > Math.abs(xDiff)) { /* most significant */
            if (yDiff > 0) {
                /* swipe up */
                hideNotification(notification);
            }
        }
        /* reset values */
        xDown = null;
        yDown = null;
    };
}

function hideNotification(notification) {
    notification.classList.add('hide');
    setTimeout(() => {
        notification.remove();
    }, 300);
}