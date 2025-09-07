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

// ---------------- Modal Create Event ----------------
const modal = document.getElementById("createEventModal");
const createForm = document.getElementById("createEventForm");
const addBtn = document.querySelector(".sidebar a.add");
const closeBtn = document.querySelector(".close-btn");

addBtn.addEventListener("click", (e) => {
  e.preventDefault();
  modal.style.display = "flex";
});

closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

createForm.addEventListener("submit", (e) => {
  e.preventDefault();
  alert("Event Created!");
  modal.style.display = "none";
  createForm.reset();
});

// ---------------- Tag Suggestions ----------------
const tagInput = document.getElementById("tagInput");
const suggestionBox = document.getElementById("tagSuggestions");

const tags = ["football", "basketball", "volleyball", "baseball", "handball", "softball"];

tagInput.addEventListener("input", () => {
  const input = tagInput.value.toLowerCase();
  suggestionBox.innerHTML = "";

  if (input) {
    const filtered = tags.filter(tag => tag.toLowerCase().includes(input));
    if (filtered.length > 0) {
      suggestionBox.style.display = "block";
      filtered.forEach(tag => {
        const div = document.createElement("div");
        div.textContent = tag;
        div.addEventListener("click", () => {
          tagInput.value = tag;
          suggestionBox.style.display = "none";
        });
        suggestionBox.appendChild(div);
      });
    } else {
      suggestionBox.style.display = "none";
    }
  } else {
    suggestionBox.style.display = "none";
  }
});

window.addEventListener("click", (e) => {
  if (!suggestionBox.contains(e.target) && e.target !== tagInput) {
    suggestionBox.style.display = "none";
  }
});