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
let isLoggedIn = false;
const hamburgerBtn = document.getElementById("hamburgerBtn");
const hamburgerMenu = document.getElementById("hamburgerMenu");
const menuList = document.getElementById("menuList");

function addMenuItem(text, onClick) {
  const li = document.createElement("li");
  li.textContent = text;
  li.addEventListener("click", onClick);
  menuList.appendChild(li);
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

        addMenuItem("ออกจากระบบ", () => {
            fetch("/Account/Logout", { method: "POST" }).then(() => {
                isLoggedIn = false;
                updateMenu();
                alert("ออกจากระบบเรียบร้อย");
            });
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
async function showLoginModal() {
    const username = prompt("Username:");
    const password = prompt("Password:");
    if(!username || !password) return;

    const resp = await fetch("/Account/Login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username, password})
    });

    const data = await resp.json();
    if(data.success) {
        isLoggedIn = true;
        updateMenu();
        alert("Login สำเร็จ");
        loadPosts();
    } else {
        alert("Login ล้มเหลว: " + data.message);
    }
}

async function showSignupModal() {
    const username = prompt("Username:");
    const password = prompt("Password:");
    if(!username || !password) return;

    const resp = await fetch("/Account/Register", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username, password})
    });

    const data = await resp.json();
    if(data.success) {
        alert("สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ");
    } else {
        alert("สมัครสมาชิกล้มเหลว: " + data.message);
    }
}

async function logoutUser() {
    await fetch("/Account/Logout", { method: "POST" });
    isLoggedIn = false;
    updateMenu();
    alert("ออกจากระบบเรียบร้อย");
}

// ---------------- Feed / Posts ----------------
const feedContainer = document.getElementById("feed");

async function loadPosts() {
    if(!isLoggedIn) return;
    const resp = await fetch("/Post/GetPosts");
    const posts = await resp.json();
    feedContainer.innerHTML = "";
    posts.forEach(post => addPostToFeed(post));
}

async function createPost(text, images=[]) {
    const formData = new FormData();
    formData.append("text", text);
    images.forEach((file, i) => formData.append("images", file));

    const resp = await fetch("/Post/AddPost", {method:"POST", body:formData});
    const newPost = await resp.json();
    addPostToFeed(newPost, true);
}

async function deletePost(postId, card) {
    if(!confirm("คุณแน่ใจว่าต้องการลบโพสต์นี้?")) return;
    const resp = await fetch(`/Post/DeletePost/${postId}`, {method:"DELETE"});
    const data = await resp.json();
    if(data.success) card.remove();
}

// ---------------- Add Post Modal ----------------
const addBtn = document.querySelector(".sidebar .add");
const modal = document.getElementById("addPostModal");
const closeBtn = modal.querySelector(".close");
const postBtn = modal.querySelector(".post-btn");
const textarea = modal.querySelector("textarea");
const imageInput = document.getElementById("imageInput");
const previewContainer = document.querySelector(".image-preview");

addBtn.addEventListener("click", () => { modal.style.display="flex"; textarea.focus(); });
closeBtn.addEventListener("click", () => { modal.style.display="none"; clearPostFields(); });
window.addEventListener("click", (e) => { if(e.target===modal){ modal.style.display="none"; clearPostFields(); } });

function clearPostFields() { textarea.value=""; imageInput.value=""; previewContainer.innerHTML=""; previewContainer.style.display="none"; postBtn.disabled=true; }

imageInput.addEventListener("change", updatePostBtn);
textarea.addEventListener("input", updatePostBtn);

function updatePostBtn() {
    postBtn.disabled = !textarea.value.trim() && imageInput.files.length===0;
}

postBtn.addEventListener("click", async () => {
    const text = textarea.value.trim();
    if(!text && imageInput.files.length===0) return;
    await createPost(text, Array.from(imageInput.files));
    clearPostFields();
    modal.style.display="none";
});

// ---------------- Add Post Card ----------------
function addPostToFeed(post, prepend=false) {
    const card = document.createElement("div");
    card.classList.add("post-card");
    let imagesHTML = "";
    if(post.images?.length) {
        imagesHTML = `<div class="post-images">${post.images.map(img=>`<img src="${img}" class="post-img">`).join("")}</div>`;
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

    const deleteBtn = card.querySelector(".delete-post");
    deleteBtn.addEventListener("click", () => deletePost(post.id, card));

    if(prepend) feedContainer.prepend(card);
    else feedContainer.appendChild(card);
}