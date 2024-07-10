export function guestNavBar() {
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
                <a class="button" href="/"><i class="fas fa-home"></i><span>Home</span></a>
                <a class="button" href="/userchat"><i class="fas fa-comments"></i><span>Chats</span></a>
                <a class="button" href="/"><i class="fa-solid fa-user"></i><span>Users</span></a>
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
