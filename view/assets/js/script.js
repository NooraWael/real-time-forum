import { guestNavBar, userNavBar } from './components/navbar.js';
import {renderSignup, renderLogin} from './components/loginAndRegister.js';
import {addPost, renderAddPost} from './components/addpost.js';
import {renderNotFound,navigateToHome} from './components/errors.js';
import {fetchAndRenderUserChat,renderUserChat} from './components/chats.js';
import {fetchAndRenderPostDetails, renderPostDetails, fetchAndRenderPosts, NavigateToPost} from './components/post.js';
import {fetchAndRenderOnlineUsers,renderOnlineUsers} from './components/onlineusers.js';
import {fetchAndRenderAllUsers,renderAllUsers} from './components/allusers.js';

document.addEventListener('DOMContentLoaded', function() {
    // Fetch user session status
    const path = window.location.pathname;

    // Initial rendering based on the current path
  

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
            }
        })

        
        
        .catch(error => {
            console.error('Error fetching session:', error);
            // If session fetch fails, assume no session and render guest navbar
            renderNavbar('navbar', guestNavBar());
            if (path == '/signup' || path == '/signup/' ){
                renderSignup();
            }else{
                renderLogin();
            }
   
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
            fetchAndRenderAllUsers()
            break;
            case '/chats':
            fetchAndRenderOnlineUsers();
            break;
            case '/users':
                fetchAndRenderAllUsers();
                break;
        default:
            if (path.startsWith('/userchat/')) {
                fetchAndRenderAllUsers()
                const recipientUsername = path.substring(10); // Extract recipient username from URL
                fetchAndRenderUserChat(recipientUsername)}

            // Assume it's a post detail page
            else if (path.startsWith('/posts/')) {
                fetchAndRenderAllUsers()
                const postId = path.substring(7); // Extract post ID from URL
                fetchAndRenderPostDetails(postId);
            } else {
                // Handle 404 or other routes
                renderNotFound();
            }
            break;
    }
}


function renderNavbar(elementId, navbarHTML) {
    document.getElementById(elementId).innerHTML = navbarHTML;
}

