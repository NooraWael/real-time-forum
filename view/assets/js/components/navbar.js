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
                <a class="button" href="/login"><i class="fas fa-sign-in-alt" style="background-color=#2c2f33"></i><span style="background-color=#2c2f33">Log In</span></a>
                <a class="button" href="/signup"><i class="fas fa-user-plus" style="background-color=#2c2f33"></i><span style="background-color=#2c2f33">Register</span></a>
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
                <a class="button" href="/"><i class="fas fa-home" style="background-color=#2c2f33"></i><span style="background-color=#2c2f33">Home</span></a>
                <a class="button" href="/userchat"><i class="fas fa-comments" style="background-color=#2c2f33"></i><span style="background-color=#2c2f33">Chats</span></a>
                <a class="button" href="/addpost"><i class="fas fa-plus" style="background-color=#2c2f33"></i><span style="background-color=#2c2f33">Add Post</span></a>
                <a class="button" href="/logout"><i class="fas fa-sign-out-alt" style="background-color=#2c2f33"></i><span style="background-color=#2c2f33">Log Out</span></a>
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
