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
                // เอารูปออกจาก input
                const dt = new DataTransfer();
                Array.from(imageInput.files).forEach((f, i) => {
                    if (i !== index) dt.items.add(f);
                });
                imageInput.files = dt.files;

                // เอา wrapper ออก
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


// ---------------- Update Post Button ----------------
function updatePostBtn() {
    postBtn.disabled = !textarea.value.trim() && imageInput.files.length === 0;
}

// ---------------- Post Button Click ----------------
postBtn.addEventListener("click", async () => {
    const text = textarea.value.trim();
    if (!text && imageInput.files.length === 0) return;

    const files = Array.from(imageInput.files);
    await createPost(text, files);

    clearPostFields();
    modal.style.display = "none";
});
