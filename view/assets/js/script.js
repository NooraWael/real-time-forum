import { guestNavBar, userNavBar } from './components/navbar.js';
import {renderSignup, renderLogin} from './components/loginAndRegister.js';
import {addPost, renderAddPost} from './components/addpost.js';
import {renderNotFound,navigateToHome} from './components/errors.js';
import {fetchAndRenderUserChat,renderUserChat} from './components/chats.js';
import {fetchAndRenderPostDetails, renderPostDetails, fetchAndRenderPosts} from './components/post.js';
import {fetchAndRenderOnlineUsers,renderOnlineUsers} from './components/onlineusers.js';

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


function renderNavbar(elementId, navbarHTML) {
    document.getElementById(elementId).innerHTML = navbarHTML;
}

function navigateToPost(postId) {
    history.pushState(null, null, `/posts/${postId}`);
    fetchAndRenderPostDetails(postId);
}
