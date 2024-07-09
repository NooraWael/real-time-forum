// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const contentInput = document.getElementById('content');
    const submitBtn = document.getElementById('submitBtn');
    const contentError = document.getElementById('contentError');

    // Function to validate content
    function validateContent() {
        const contentValue = contentInput.value.trim();
        if (contentValue === '') {
            contentError.textContent = 'Comment cannot be empty';
            return false;
        } else {
            contentError.textContent = ''; // Clear error message if valid
            return true;
        }
    }

    // Enable or disable submit button based on validation
    function toggleSubmitButton() {
        submitBtn.disabled = !validateContent();
    }

    // Add event listeners for input and submit button state
    contentInput.addEventListener('input', toggleSubmitButton);
    document.getElementById('commentForm').addEventListener('submit', function(event) {
        if (!validateContent()) {
            event.preventDefault(); // Prevent form submission if validation fails
        }
    });

});
