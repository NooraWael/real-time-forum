export function addPost() {
    fetch('/addPostPageapi', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => {
        if (response.status === 401) {
            window.location.href = '/login'; // Redirect to login if not authorized
        } else if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const categories = data.Categories;
        let categoriesHTML = '';
        categories.forEach(category => {
            categoriesHTML += `<label><input type="checkbox" name="category" value="${category}"> ${category}</label><br>`;
        });

        document.getElementById('content').innerHTML = `
            <style>html, body {
    height: 100%;
    margin: 0;
    padding: 0;
}

.wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}

.container {
    background-color: #2c2f33;
    padding: 40px;
    border-radius: 8px;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
    max-width: 600px;
    width: 100%;
    color: #ffffff;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.container h2 {
    font-size: 28px;
    margin-bottom: 20px;
    text-align: center;
}

.container label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

.container input[type="text"],
.container textarea {
    width: 100%;
    padding: 10px;
    margin-bottom: 15px;
    border: none;
    border-radius: 4px;
    font-size: 16px;
}

.container textarea {
    resize: vertical;
}

.container button {
    width: 100%;
    padding: 12px 0;
    background-color: #7289da;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    margin-top: 10px;
}

.container button:hover {
    background-color: #5b6eae;
}

.container .back-link {
    display: block;
    text-align: center;
    margin-top: 20px;
    color: white;
    text-decoration: none;
}

.container .back-link:hover {
    text-decoration: underline;
}

.container .checkbox-container {
    margin-bottom: 15px;
}

.container .checkbox-container label {
    font-weight: normal;
}

.checkbox-container {
    display: flex;
    justify-content: space-between;
}

.error-message {
    color: red;
    font-size: 0.9rem;
    margin-top: -10px;
    margin-bottom: 15px;
}

            </style>
        <div class="wrapper">

            <div class="container">
                <h2>Add Post</h2>
                <form method="post" id="myForm">
                    <div class="checkbox-container">
                        <label>Category:</label><br>
                        ${categoriesHTML}
                    </div>
                    <label for="title">Title:</label>
                    <input type="text" id="title" name="title" placeholder="Your Post Title" maxlength="45" required>
                    <div id="titleError" class="error-message"></div>
                    <label for="content">Content:</label>
                    <textarea id="content" name="content" placeholder="Lorem Ipsum..." rows="6" maxlength="280" required></textarea>
                    <div id="contentError" class="error-message"></div>
                    <div id="charCount"></div>
                    <button type="submit">Create!</button>
                    <div id="checkboxError" style="color: red;"></div>
                </form>
                <a class="back-link" href="/">Back to Home</a>
            </div>
      </div>
            <script>
                document.getElementById('myForm').addEventListener('submit', function(event) {
                    var checkboxes = document.querySelectorAll('input[name="category"]');
                    var checkedOne = Array.prototype.slice.call(checkboxes).some(function(checkbox) {
                        return checkbox.checked;
                    });

                    var title = document.getElementById('title').value.trim();
                    var content = document.getElementById('content').value.trim();

                    var isValid = true;

                    if (!checkedOne) {
                        document.getElementById('checkboxError').textContent = 'Please select at least one category.';
                        isValid = false;
                    } else {
                        document.getElementById('checkboxError').textContent = '';
                    }

                    if (title === '') {
                        document.getElementById('titleError').textContent = 'Title cannot be empty or just spaces.';
                        isValid = false;
                    } else {
                        document.getElementById('titleError').textContent = '';
                    }

                    if (content === '') {
                        document.getElementById('contentError').textContent = 'Content cannot be empty or just spaces.';
                        isValid = false;
                    } else {
                        document.getElementById('contentError').textContent = '';
                    }

                    if (!isValid) {
                        event.preventDefault();
                    }
                });
            </script>
            <script src="/js/characterCount.js"></script>
        `;
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        document.getElementById('mainContent').innerHTML = '<p>Failed to load categories. Please try again later.</p>';
    });
}

export function renderAddPost(){
    const navbar = document.getElementById('navbar')
    navbar.innerHTML = ' ';
    const container = document.getElementById('content');
    container.innerHTML = addPost();
}
