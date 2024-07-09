function addLike(post_id, likeType) {
    console.log("Post ID:", post_id);
    console.log("Like Type:", likeType);
console.log(`/likepost?postID=${post_id}&type=${likeType}`)
    fetch(`/likepost?postID=${post_id}&type=${likeType}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(response => {
            console.log("Response received:", response);
            if (response.success) {
                const postElement = document.querySelector(`#post-${post_id}`);
                if (postElement) {
                    const likeSpan = postElement.querySelector('.likes-count');
                    const dislikeSpan = postElement.querySelector('.dislikes-count');

                    console.log("Post element found:", postElement);
                    console.log("Like span:", likeSpan);
                    console.log("Dislike span:", dislikeSpan);

                    if (likeSpan && dislikeSpan) {
                        likeSpan.textContent = response.newLikeCount;
                        dislikeSpan.textContent = response.newDislikeCount;

                        const thumbsUp = postElement.querySelector('.fa-thumbs-up');
                        const thumbsDown = postElement.querySelector('.fa-thumbs-down');
                        
                        console.log("Thumbs up icon:", thumbsUp);
                        console.log("Thumbs down icon:", thumbsDown);

                        if (likeType === "like") {
                            if (thumbsUp.classList.contains("liked")) {
                                thumbsUp.classList.remove("liked"); 
                            } else {
                                thumbsUp.classList.add("liked");
                            }
                            thumbsDown.classList.remove("disliked");
                        } else if (likeType === "dislike") {
                            if (thumbsDown.classList.contains("disliked")) {
                                thumbsDown.classList.remove("disliked"); 
                            } else{
                                thumbsDown.classList.add("disliked");
                            }
                                thumbsUp.classList.remove("liked");
                        }
                    } else {
                        console.error("Like/Dislike span not found for post ID:", post_id);
                    }
                } else {
                    console.error("Post element not found for post ID:", post_id);
                }
            } else {
                console.error("Failed response:", response);
            }
        })
        .catch(error => {
            console.error("Fetch error:", error);
        });

    console.log("Fetch request sent");
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