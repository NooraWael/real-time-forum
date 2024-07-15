
export function renderPostDetails(data) {
    const container = document.getElementById('content');
    container.innerHTML = ``;
    container.innerHTML = `
        <link href="/css/style3.css" rel="stylesheet">
        <button id="clearbtn" onclick="location.href='/'">Back</button>
        <div class="post-details">
            <h6 class="time-elapsed" data-time="${data.Post.Created_At}">${new Date(data.Post.Created_At).toLocaleString()}</h6>
            <h3 style="text-transform: uppercase;">${data.Post.Title}</h3>
            <h4 style="float: right;">Shared by: ${data.Post.Author}</h4>
            <h4 style="float: left;">Category: </h4>
            ${data.Post.Categories.map(category => `
                <h4 style="float: left; margin-right: 10px;">${category}</h4>
            `).join('')}
            <br>
        </div>
        <div class="post-details likes-dislikes">
            <div>
                <i class="fa-solid fa-thumbs-up ${data.Post.UserLikeStatus === 1 ? 'liked' : ''}" onclick='addLikes("${data.Post.ID}", "like")'></i>
                <span class="likes-count-post">${data.Post.Likes}</span>
                <i class="fa-solid fa-thumbs-down ${data.Post.UserLikeStatus === 0 ? 'disliked' : ''}" onclick="addLikes('${data.Post.ID}', 'dislike')"></i>
                <span class="dislikes-count-post">${data.Post.DisLikes}</span>
            </div>
        </div>
        <div class="post-details">
            <p>${data.Post.Content}</p>
            <form id="commentForm" action="/addcomment" method="post">
                <input type="hidden" name="postID" value="${data.Post.ID}">
                <textarea id="content2" name="content2" rows="4" cols="100" placeholder="Write a comment..." maxlength="280"></textarea><br>
                <div class="char-counter" id="charCounter">280 characters remaining</div>
                <span id="contentError" class="error"></span>
                <button id="submitBtn" type="submit" disabled>Comment</button>
            </form>
        </div>
        <div class="comments">
            ${data.Comments.map(comment => `
                <div class="comment" id="comment-${comment.ID}">
                    <p class="comment-info">Comment by: ${comment.Author} - ${new Date(comment.Created_At).toLocaleString()}</p>
                    <p class="comment-content">${comment.Content}</p>
                    <div class="comment-actions likes-dislikes">
                        <span class="likes-count">${comment.Likes}</span>
                        <i class="fa fa-thumbs-up" onclick='addLikeComment("${comment.PostID}", "${comment.ID}", "like")'></i>
                        <span class="dislikes-count">${comment.DisLikes}</span>
                        <i class="fa fa-thumbs-down" onclick='addLikeComment("${comment.PostID}", "${comment.ID}", "dislike")'></i>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    const contentTextarea = document.getElementById('content2');
    const charCount = document.getElementById('charCounter');

    contentTextarea.addEventListener('input', function() {
        const maxLength = this.maxLength;
        const currentLength = this.value.length;
        const remaining = maxLength - currentLength;

        charCount.textContent = `${remaining} characters remaining`;

        if (remaining < 0) {
            charCount.style.color = 'red';
            submitBtn.disabled = true;
        } else {
            charCount.style.color = '';
            submitBtn.disabled = false;
        }
    });

    const submitBtn = document.getElementById('submitBtn');

    contentTextarea.addEventListener('input', function() {
        submitBtn.disabled = this.value.trim() === '';
    });

    const commentForm = document.getElementById('commentForm');
    commentForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(commentForm);
        const commentContent = formData.get('content2');

        if (commentContent.trim() === '') {
            document.getElementById('contentError').textContent = 'Comment content cannot be empty.';
            return;
        }

        const postID = formData.get('postID');

        fetch('/addcomment', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to add comment');
            }
            window.location.reload();
        })
       
        .catch(error => {
            console.error('Error adding comment:', error);
        });
    });
}

export function fetchAndRenderPostDetails(postId) {
    fetch(`/api/posts/${postId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Post not found');
            }
            return response.json();
        })
        .then(data => {
            renderPostDetails(data); // Render post details using data received
        })
        .catch(error => {
            console.error('Error fetching post details:', error);
            renderNotFound(); // Render a not found message or handle error appropriately
        });
}



export function fetchAndRenderPosts() {
    fetch('/api/posts')
        .then(response => response.json())
        .then(data => {
            const postsContainer = document.getElementById('content');
            postsContainer.innerHTML = ``;
            data.forEach(post => {
                let categoriesString = '';
                post.Categories.forEach(category => {
                    categoriesString += `${category} `;
                });

                // Create post element dynamically with integrated styles
                const postElement = `
                    <div class="post-container" id="post-${post.ID}">
                        <div class="postbox">
                            <div class="header-container">
                                <h4>${post.Author} - <span class="time-elapsed" data-time="${post.Created_At}">${new Date(post.Created_At).toLocaleString()}</span></h4>
                            </div>
                            <div class="header-container">
                                <h4 style="float: left;" onclick="NavigateToPost(${post.ID})">Category:</h4>
                                <h4 style="float: left; margin-right: 10px;">${categoriesString}</h4>
                            </div>
                            <div style="text-align: center; padding-top: 10px;">
                                <h2>${post.Title}</h2>
                            </div>
                            <div class="content-container">
                                <p style="max-width: 12.5rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${post.Content}</p>
                            </div>
                            <div class="button-container">
                            <div onclick="window.location.href = '/posts/${post.ID}'">
                                    <i class="fa-solid fa-comment" style="margin-right: 5px;"></i>
                                    <span class="num"></span>
                                </div>
                                <div>
                                    <i class="fa-solid fa-thumbs-up ${post.UserLikeStatus === 1 ? 'liked' : ''}" onclick='event.preventDefault(); addLike("${post.ID}", "like")' style="margin-right: 5px;"></i>
                                    <span class="likes-count">${post.Likes}</span>
                                </div>
                                <div>
                                    <i class="fa-solid fa-thumbs-down ${post.UserLikeStatus === 0 ? 'disliked' : ''}" onclick='event.preventDefault(); addLike("${post.ID}", "dislike")' style="margin-right: 5px;"></i>
                                    <span class="dislikes-count">${post.DisLikes}</span>
                                </div>
                            </div>
                        </div>
                    </div>`;
                postsContainer.innerHTML += postElement;
            });

            

        })

        
        .catch(error => console.error('Error fetching posts:', error));

        
}

export function NavigateToPost(postId) {
    history.pushState(null, null, `/posts/${postId}`);
    fetchAndRenderPostDetails(postId);
}
