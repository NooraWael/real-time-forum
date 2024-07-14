export function renderNotFound() {
    document.getElementById('content').innerHTML = `
        <div>
            <h2>Page Not Found</h2>
            <p>The page you are looking for does not exist.</p>
        </div>
    `;
}

export function navigateToHome() {
    history.pushState(null, null, '/');
    fetchAndRenderPosts();
}