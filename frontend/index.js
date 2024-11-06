import { backend } from "declarations/backend";

let quill;
const modal = document.getElementById('modal');
const postForm = document.getElementById('postForm');
const newPostBtn = document.getElementById('newPostBtn');
const cancelBtn = document.getElementById('cancelBtn');
const loader = document.getElementById('loader');
const postsContainer = document.getElementById('posts');

// Initialize Quill editor
document.addEventListener('DOMContentLoaded', () => {
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                ['link', 'image'],
                ['clean']
            ]
        }
    });
    
    loadPosts();
});

// Show/hide modal
newPostBtn.addEventListener('click', () => {
    modal.style.display = 'block';
    quill.setText('');
});

cancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Handle form submission
postForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const content = quill.root.innerHTML;

    showLoader();

    try {
        await backend.createPost(title, content, author);
        modal.style.display = 'none';
        postForm.reset();
        quill.setText('');
        await loadPosts();
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Failed to create post. Please try again.');
    } finally {
        hideLoader();
    }
});

// Load posts
async function loadPosts() {
    showLoader();
    try {
        const posts = await backend.getPosts();
        displayPosts(posts);
    } catch (error) {
        console.error('Error loading posts:', error);
        postsContainer.innerHTML = '<p>Failed to load posts. Please try again later.</p>';
    } finally {
        hideLoader();
    }
}

// Display posts
function displayPosts(posts) {
    postsContainer.innerHTML = posts.map(post => `
        <article class="post">
            <h2 class="post-title">${post.title}</h2>
            <div class="post-meta">
                By ${post.author} • ${formatDate(post.timestamp)}
            </div>
            <div class="post-content">
                ${post.body}
            </div>
        </article>
    `).join('');
}

// Format timestamp
function formatDate(timestamp) {
    const date = new Date(Number(timestamp) / 1000000); // Convert nanoseconds to milliseconds
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Loader functions
function showLoader() {
    loader.style.display = 'block';
}

function hideLoader() {
    loader.style.display = 'none';
}
