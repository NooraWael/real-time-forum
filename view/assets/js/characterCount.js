const contentTextarea = document.getElementById('content');
const charCount = document.getElementById('charCount');

contentTextarea.addEventListener('input', function() {
    const maxLength = this.maxLength;
    const currentLength = this.value.length;
    const remaining = maxLength - currentLength;

    charCount.textContent = `${remaining} characters remaining`;

    if (remaining < 0) {
        charCount.style.color = 'red';
    } else {
        charCount.style.color = ''; // Reset to default
    }
});