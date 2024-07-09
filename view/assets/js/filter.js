function clearFilters() {
    const checkboxes = document.querySelectorAll('.filters input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = false);
    window.location.href("/");
}


function filterPosts() { //unused function
    const selectedCategories = [];
    const checkboxes = document.querySelectorAll('.filters input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => selectedCategories.push(checkbox.value));
    if (selectedCategories.length == 0) {
        clearFilters()
        return
    }

    fetch(`/filterposts?categories=${selectedCategories.join(',')}`)
        .then(response => response.json())
        .then(data => {
            const postsContainer = document.querySelector('.post');
            postsContainer.innerHTML = '<h2 style="margin-bottom: 20px;">Posts</h2>';  // Clear existing posts
            
            data.posts.forEach(post => {                
                categoriesString = ""
                post.Categories.forEach(category => {
                    categoriesString += `${category} `;
                });
                // Create post element here similar to how it's done in Go template
                const postElement = `
                    <div class="flip-card" id="post-${post.ID}">
                        <a href="/posts/${post.ID}">
                            <div class="flip-card-inner">
                                <div class="flip-card-front postbox">
                                    <div class="header-container">
                                        <h4>${post.Author} - <span class="time-elapsed" data-time="${post.Created_At}">${new Date(post.Created_At)}</span></h4>
                                    </div>
                                    <div class="header-container">
                                        <h4 style="float: left;">Category:</h4>
                                        <h4 style="float: left; margin-right: 10px;"> ${categoriesString} </h4>
                                    </div>
                                    <div style="text-align: center; padding-top: 10px;">
                                        <h2>${post.Title}</h2>
                                    </div>
                                </div>
                                <div class="flip-card-back postboxback">
                                    <div style="flex: 1; overflow-y: auto;">
                                        <h4 style="text-align: center; padding-bottom: 30px;">${post.Content}</h4>
                                    </div>
                                    <div class="button-container">
                                        <div style="display: flex; align-items: center;">
                                            <i class="fa-solid fa-comment" style="margin-right: 5px;"></i>
                                            <span class="num"></span>
                                        </div>
                                        <div style="display: flex; align-items: center;">
                                            <i class="fa-solid fa-thumbs-up ${post.UserLikeStatus === 1 ? 'liked' : ''}" onclick='event.preventDefault(); addLike("${post.ID}", "like")' style="margin-right: 5px;"></i>
                                            <span class="likes-count">${post.Likes}</span>
                                        </div>
                                        <div style="display: flex; align-items: center;">
                                            <i class="fa-solid fa-thumbs-down ${post.UserLikeStatus === 0 ? 'disliked' : ''}" onclick='event.preventDefault(); addLike("${post.ID}", "dislike")' style="margin-right: 5px;"></i>
                                            <span class="dislikes-count">${post.DisLikes}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </a>
                    </div>`;
                postsContainer.innerHTML += postElement;
            });
        })
        .catch(error => console.error('Error fetching filtered posts:', error));
}

document.querySelectorAll('.filters input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', filterPosts);
});