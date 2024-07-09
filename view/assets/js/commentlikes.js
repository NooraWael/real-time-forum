function addLikeComment(postID, commentID, likeType) {
    console.log(`Sending request for PostID: ${postID}, CommentID: ${commentID}, LikeType: ${likeType}`);
    fetch(`/likecomment?postID=${postID}&commentID=${commentID}&type=${likeType}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                const commentElement = document.querySelector(`#comment-${commentID}`);
                const likeSpan = commentElement.querySelector('.likes-count');
                const dislikeSpan = commentElement.querySelector('.dislikes-count');
                console.log(data.newLikeCount)
                likeSpan.textContent = data.newLikeCount;
                dislikeSpan.textContent = data.newDislikeCount;

                const thumbsUp = commentElement.querySelector('.fa-thumbs-up');
                const thumbsDown = commentElement.querySelector('.fa-thumbs-down');

                if (likeType === "like") {
                    thumbsUp.classList.toggle("liked", data.userLikeStatus === 1);
                    thumbsDown.classList.remove("disliked");
                } else if (likeType === "dislike") {
                    thumbsDown.classList.toggle("disliked", data.userLikeStatus === 0);
                    thumbsUp.classList.remove("liked");
                }
            }
        })
        .catch(error => {
            console.error("Error:", error);
        });
}


    function addLikes(post_id, likeType) {
        console.log("Post ID:", post_id);
        console.log("Like Type:", likeType);

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
                    const likeSpan = document.querySelector(`.likes-count-post`);
                    const dislikeSpan = document.querySelector(`.dislikes-count-post`);

                    console.log("Like span:", likeSpan);
                    console.log("Dislike span:", dislikeSpan);

                    if (likeSpan && dislikeSpan) {
                        likeSpan.textContent = response.newLikeCount;
                        dislikeSpan.textContent = response.newDislikeCount;

                        const thumbsUp = likeSpan.previousElementSibling;
                        const thumbsDown = dislikeSpan.previousElementSibling;

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
                            } else {
                                thumbsDown.classList.add("disliked");
                            }
                            thumbsUp.classList.remove("liked");
                        }
                    } else {
                        console.error("Like/Dislike span not found for post ID:", post_id);
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
