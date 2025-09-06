// ---------------- Theme / Sidebar ----------------
const menuItems = document.querySelectorAll(".menu h2");
const root = document.documentElement;
const toggle = document.getElementById("toggle");
const sunIcon = document.querySelector(".toggle .bxs-sun");
const moonIcon = document.querySelector(".toggle .bx-moon");

if(localStorage.getItem("theme") === "dark") {
    root.classList.add("dark");
    toggle.checked = true;
}

toggle.addEventListener("change", () => {
    root.classList.toggle("dark");
    localStorage.setItem("theme", root.classList.contains("dark") ? "dark" : "light");
    sunIcon.className = sunIcon.className.includes("bxs") ? "bx bx-sun" : "bx bxs-sun";
    moonIcon.className = moonIcon.className.includes("bxs") ? "bx bx-moon" : "bx bxs-moon";
});

menuItems.forEach(item => {
    item.addEventListener("click", () => {
        menuItems.forEach(el => el.classList.remove("active"));
        item.classList.add("active");
    });
});

const sidebarLinks = document.querySelectorAll(".sidebar a");
sidebarLinks.forEach((link, index) => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        sidebarLinks.forEach(el => el.classList.remove("active"));
        link.classList.add("active");

        switch(index) {
            case 0: window.location.href = "/frontend/HTML/home.html"; break;
            case 1: window.location.href = "/frontend/HTML/tags.html"; break;
            case 2: modal.style.display="flex"; textarea.focus(); break;
            case 3: window.location.href = "/frontend/HTML/notify.html"; break;
            case 4: window.location.href = "/frontend/HTML/profile.html"; break; 
        }
    });
});

// ---------------- Hamburger & Menu ----------------
let isLoggedIn = localStorage.getItem("isLoggedIn") === "true"; 
const hamburgerBtn = document.getElementById("hamburgerBtn");
const hamburgerMenu = document.getElementById("hamburgerMenu");
const menuList = document.getElementById("menuList");

function addMenuItem(text, onClick) {
    const li = document.createElement("li");
    li.textContent = text;
    li.addEventListener("click", onClick);
    menuList.appendChild(li);
}

function setLoginState(state) {
    isLoggedIn = state;
    localStorage.setItem("isLoggedIn", state);
    updateMenu();
}

function updateMenu() {
    menuList.innerHTML = "";

    if (!isLoggedIn) {
        addMenuItem("เข้าสู่ระบบ", () => {
            window.location.href = "/frontend/HTML/login.html";
        });
        addMenuItem("สมัครสมาชิก", () => {
            window.location.href = "/frontend/HTML/register.html";
        });
    } else {
        addMenuItem("โปรไฟล์ของฉัน", () => {
            window.location.href = "/frontend/HTML/profile.html";
        });

        addMenuItem("ออกจากระบบ", async () => {
            try {
                await fetch("/Account/Logout", { method: "POST" });
                setLoginState(false);
                alert("ออกจากระบบเรียบร้อย");
            } catch (err) {
                alert("เกิดข้อผิดพลาด: " + err.message);
            }
        });
    }
}

function toggleMenu(open) {
    hamburgerMenu.style.display = open ? "block" : "none";
    hamburgerBtn.querySelector("i").className = open ? "fa-solid fa-xmark" : "fa-solid fa-bars";
}

let menuOpen = false;
hamburgerBtn.addEventListener("click", () => {
    menuOpen = !menuOpen;
    toggleMenu(menuOpen);
});

window.addEventListener("click", (e) => {
    if (menuOpen && !hamburgerBtn.contains(e.target) && !hamburgerMenu.contains(e.target)) {
        toggleMenu(false);
        menuOpen = false;
    }
});

updateMenu();

// ---------------- Login / Signup / Logout ----------------
function showLoginPage() {
    window.location.href = "/frontend/HTML/login.html";
}

function showSignupPage() {
    window.location.href = "/frontend/HTML/register.html";
}

async function logoutUser() {
    try {
        await fetch("/Account/Logout", { method: "POST" });
        isLoggedIn = false;
        localStorage.setItem("isLoggedIn", "false");
        updateMenu();
        alert("ออกจากระบบเรียบร้อย");
    } catch (err) {
        alert("เกิดข้อผิดพลาด: " + err.message);
    }
}

// ---------------- Feed / Posts ----------------
const feedContainer = document.getElementById("feed");

async function loadPosts() {
    if (!isLoggedIn) return;
    try {
        const resp = await fetch("/Post/GetPosts");
        if (!resp.ok) throw new Error("โหลดโพสต์ล้มเหลว");
        const posts = await resp.json();
        feedContainer.innerHTML = "";
        posts.forEach(post => addPostToFeed(post));
    } catch (err) {
        alert(err.message);
    }
}

async function createPost(text, images = []) {
    try {
        const formData = new FormData();
        formData.append("text", text);
        images.forEach((file, i) => formData.append("images", file));

        const resp = await fetch("/Post/AddPost", { method: "POST", body: formData });
        if (!resp.ok) throw new Error("เพิ่มโพสต์ล้มเหลว");
        const newPost = await resp.json();
        addPostToFeed(newPost, true);
    } catch (err) {
        alert(err.message);
    }
}

async function deletePost(postId, card) {
    if (!confirm("คุณแน่ใจว่าต้องการลบโพสต์นี้?")) return;
    try {
        const resp = await fetch(`/Post/DeletePost/${postId}`, { method: "DELETE" });
        if (!resp.ok) throw new Error("ลบโพสต์ล้มเหลว");
        const data = await resp.json();
        if (data.success) card.remove();
    } catch (err) {
        alert(err.message);
    }
}

// ---------------- Add Post Modal ----------------
const addBtn = document.querySelector(".sidebar .add");
const modal = document.getElementById("addPostModal");
const closeBtn = modal.querySelector(".close");
const postBtn = modal.querySelector(".post-btn");
const textarea = modal.querySelector("textarea");
const imageInput = document.getElementById("imageInput");
const previewContainer = document.querySelector(".image-preview");

addBtn.addEventListener("click", () => { modal.style.display = "flex"; textarea.focus(); });
closeBtn.addEventListener("click", () => { modal.style.display = "none"; clearPostFields(); });
window.addEventListener("click", (e) => { if (e.target === modal) { modal.style.display = "none"; clearPostFields(); } });

function clearPostFields() {
    textarea.value = "";
    imageInput.value = "";
    previewContainer.innerHTML = "";
    previewContainer.style.display = "none";
    postBtn.disabled = true;
}

imageInput.addEventListener("change", updatePostBtn);
textarea.addEventListener("input", updatePostBtn);

function updatePostBtn() {
    postBtn.disabled = !textarea.value.trim() && imageInput.files.length === 0;
}

postBtn.addEventListener("click", async () => {
    const text = textarea.value.trim();
    if (!text && imageInput.files.length === 0) return;
    await createPost(text, Array.from(imageInput.files));
    clearPostFields();
    modal.style.display = "none";
});

// ---------------- Image Preview ----------------
imageInput.addEventListener("change", () => {
    previewContainer.innerHTML = ""; 
    Array.from(imageInput.files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const wrapper = document.createElement("div");
            wrapper.classList.add("preview-wrapper");

            const img = document.createElement("img");
            img.src = e.target.result;

            const delBtn = document.createElement("div");
            delBtn.classList.add("remove-img");
            delBtn.innerText = "×";
            delBtn.addEventListener("click", () => {
                const dt = new DataTransfer();
                Array.from(imageInput.files).forEach((f, i) => {
                    if (i !== index) dt.items.add(f);
                });
                imageInput.files = dt.files;

                wrapper.remove();
                updatePostBtn();
            });

            wrapper.appendChild(img);
            wrapper.appendChild(delBtn);
            previewContainer.appendChild(wrapper);
            previewContainer.style.display = "flex";
        };
        reader.readAsDataURL(file);
    });
    updatePostBtn();
});

function updatePostBtn() {
    postBtn.disabled = !textarea.value.trim() && imageInput.files.length === 0;
}

postBtn.addEventListener("click", async () => {
    const text = textarea.value.trim();
    if (!text && imageInput.files.length === 0) return;

    const files = Array.from(imageInput.files);
    await createPost(text, files);

    clearPostFields();
    modal.style.display = "none";
});

// ---------------- Add Post Card ----------------
function addPostToFeed(post, prepend = false) {
    const card = document.createElement("div");
    card.classList.add("post-card");
    let imagesHTML = "";
    if (post.images?.length) {
        imagesHTML = `<div class="post-images">${post.images.map(img => `<img src="${img}" class="post-img">`).join("")}</div>`;
    }

    card.innerHTML = `
        <div class="post-header">
            <div class="post-user">
                <div class="avatar"></div>
                <div class="user-info">
                    <span class="username">${post.username}</span>
                    <span class="time">· ${post.time}</span>
                </div>
            </div>
            <div class="more-options">
                <i class="fa-solid fa-ellipsis-h"></i>
                <div class="options-menu">
                    <button>แก้ไข</button>
                    <button class="delete-post">ลบ</button>
                </div>
            </div>
        </div>
        <div class="post-text">${post.text}</div>
        ${imagesHTML}
        <div class="post-actions">
            <i class="fa-regular fa-heart like-icon"></i>
            <span class="like-count">${post.likes}</span>
            <i class="fa-regular fa-comment"></i>
            <span class="comment-count">${post.comments}</span>
        </div>
    `;

    const moreBtn = card.querySelector(".more-options i");
    const optionsMenu = card.querySelector(".options-menu");
    moreBtn.addEventListener("click", () => {
        optionsMenu.classList.toggle("show");
    });

    const deleteBtn = card.querySelector(".delete-post");
    deleteBtn.addEventListener("click", () => deletePost(post.id, card));

    const likeIcon = card.querySelector(".like-icon");
    const likeCount = card.querySelector(".like-count");
    likeIcon.addEventListener("click", async () => {
        try {
            const resp = await fetch(`/Post/Like/${post.id}`, { method: "POST" });
            if (!resp.ok) throw new Error("กดถูกใจล้มเหลว");
            const data = await resp.json();
            if (data.success) {
                likeIcon.classList.toggle("fa-solid");
                likeIcon.classList.toggle("fa-regular");
                likeCount.textContent = data.newLikeCount;
            }
        } catch (err) {
            alert(err.message);
        }
    });

    if (prepend) feedContainer.prepend(card);
    else feedContainer.appendChild(card);
}

const commentModal = document.getElementById("commentModal");
const commentClose = commentModal.querySelector(".close");
const commentTextarea = commentModal.querySelector("textarea");
const commentBtn = commentModal.querySelector(".comment-btn");
let currentPostId = null;

function openCommentModal(postId) {
    currentPostId = postId;
    commentTextarea.value = "";
    commentModal.style.display = "flex";
    commentTextarea.focus();
}

commentClose.addEventListener("click", () => {
    commentModal.style.display = "none";
});
window.addEventListener("click", (e) => {
    if (e.target === commentModal) {
        commentModal.style.display = "none";
    }
});

commentBtn.addEventListener("click", async () => {
    const text = commentTextarea.value.trim();
    if (!text) return;
    try {
        const resp = await fetch(`/Post/Comment/${currentPostId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        });
        if (!resp.ok) throw new Error("ส่งคอมเมนต์ล้มเหลว");
        const data = await resp.json();
        if (data.success) {
            const card = document.querySelector(`.post-card[data-id="${currentPostId}"]`);
            if (card) {
                const countEl = card.querySelector(".comment-count");
                countEl.textContent = data.newCommentCount;
            }
            commentModal.style.display = "none";
        }
    } catch (err) {
        alert(err.message);
    }
});
