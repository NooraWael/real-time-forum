function toggleEdit(postID) {
    console.log('Toggle edit called with postID:', postID);

    const postElement = document.getElementById(`post-${postID}`);
    if (!postElement) {
        console.error('Post element not found for postID:', postID);
        return;
    }

    const titleElement = postElement.querySelector('h2');
    const contentElement = postElement.querySelector('p');

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.value = titleElement.textContent;
    titleElement.replaceWith(titleInput);

    const contentTextarea = document.createElement('textarea');
    contentTextarea.value = contentElement.textContent;
    contentElement.replaceWith(contentTextarea);

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.onclick = function() {
        saveChanges(postID, titleInput.value, contentTextarea.value, postElement);
    };

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.onclick = function() {
        // Restore original content
        restoreOriginalContent(postElement, titleElement.textContent, contentElement.textContent);
    };


    // Replace Edit button with Save and Cancel buttons
    const editButton = postElement.querySelector('button');
    editButton.replaceWith(saveButton, cancelButton);
}

function saveChanges(postID, newTitle, newContent, postElement) {
    // Send AJAX request to server to update post
    fetch(`/updatepost`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            postID: postID,
            title: newTitle,
            content: newContent
        })
    })
    .then(response => {
        if (response.ok) {
            // Handle successful update
            console.log('Post updated successfully');
            // Optionally reload the page to show updated content
            window.location.reload(); // Reload the page
        } else {
            // Handle error responses
            console.error('Failed to update post:', response.statusText);
            // Restore original content on error
            restoreOriginalContent(postElement);
        }
    })
    .catch(error => {
        console.error('Error updating post:', error);
        // Restore original content on error
        restoreOriginalContent(postElement);
    });
}

function restoreOriginalContent(postElement) {
    const titleInput = postElement.querySelector('input[type="text"]');
    const contentTextarea = postElement.querySelector('textarea');

    if (titleInput && contentTextarea) {
        const titleElement = document.createElement('h2');
        titleElement.textContent = titleInput.value;
        titleInput.replaceWith(titleElement);

        const contentElement = document.createElement('p');
        contentElement.textContent = contentTextarea.value;
        contentTextarea.replaceWith(contentElement);

        // Restore the Edit button
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = function() {
            toggleEdit(postElement.dataset.postId); // Use dataset or other attribute as needed
        };
        const saveButton = postElement.querySelector('button');
        const cancelButton = saveButton.nextElementSibling;
        saveButton.replaceWith(editButton);
        cancelButton.remove(); // Remove Cancel button
    }
}
