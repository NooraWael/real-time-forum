
export function guestNavBar() {
    return `
        <link rel="stylesheet" href="/css/navbar.css">
        <script src="https://kit.fontawesome.com/4ff99e7c8c.js" crossorigin="anonymous"></script>
        <div class="header">
            <div class="forum-container">
                <div class="forum-text" onclick="startAnimation()" style="background-color=#2c2f33">
                    <span>F</span>
                    <span>O</span>
                    <span>R</span>
                    <span>U</span>
                    <span>M</span>
                </div>
            </div>
            <div class="header-right">
                <a class="button" href="/login" onclick="navigate(event, '/login')"><i class="fas fa-sign-in-alt" style="background-color=#2c2f33"></i><span style="background-color=#2c2f33">Log In</span></a>
                <a class="button" href="/signup" onclick="navigate(event, '/signup')"><i class="fas fa-user-plus" style="background-color=#2c2f33"></i><span style="background-color=#2c2f33">Register</span></a>
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

            function navigate(event, path) {
                event.preventDefault();
                history.pushState({}, '', path);
                handleRoute(path); // This function should be defined in your main JS file and handle the routing logic
            }
        </script>
    `;
}
export function userNavBar() {
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
                <a class="button" href="/" onclick="navigate(event, '/')"><i class="fas fa-home" style="background-color=#2c2f33"></i><span style="background-color=#2c2f33">Home</span></a>
                <a class="button" href="/userchat/" onclick="navigate(event, '/userchat/')"><i class="fas fa-comments" style="background-color=#2c2f33"></i><span style="background-color=#2c2f33">Chats</span></a>
                <a class="button" href="/addpost" onclick="navigate(event, '/addpost')"><i class="fas fa-plus" style="background-color=#2c2f33"></i><span style="background-color=#2c2f33">Add Post</span></a>
                <a class="button" href="/logout" onclick="navigate(event, '/logout')"><i class="fas fa-sign-out-alt" style="background-color=#2c2f33"></i><span style="background-color=#2c2f33">Log Out</span></a>
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

            function navigate(event, path) {
                console.log("hello");
                event.preventDefault();
                history.pushState({}, '', path);
                handleRoute(path); // This function should be defined in your main JS file and handle the routing logic
            }
        </script>
    `;
}


export function handleRoute(path) {
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
                console.log(path)
                const recipientUsername = path.substring(10); // Extract recipient username from URL
                if (path == '/userchat/'){
                    fetchAndRenderUserChat(recipientUsername);
                    return
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
                }

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
