const menuItems = document.querySelectorAll(".menu h2");

const root = document.documentElement;
const toggle = document.getElementById("toggle");
const sunIcon = document.querySelector(".toggle .bxs-sun");
const moonIcon = document.querySelector(".toggle .bx-moon");

menuItems.forEach(item => {
    item.addEventListener("click", () => {
        menuItems.forEach(el => el.classList.remove("active"));
        item.classList.add("active");
    });
});

// change theme
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

// set active
const sidebarLinks = document.querySelectorAll(".sidebar a");

sidebarLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();

        sidebarLinks.forEach(el => {
            el.classList.remove("active");
            const icon = el.querySelector("i");
            if (icon.classList.contains("fas")) {
                icon.classList.replace("fas", "far");
            }
        });

        link.classList.add("active");
        const activeIcon = link.querySelector("i");
        if (activeIcon.classList.contains("far")) {
            activeIcon.classList.replace("far", "fas");
        }
    });
});

// เปิด popup เพื่อเพิมโพสต์
const addBtn = document.querySelector(".sidebar .add");
const modal = document.getElementById("addPostModal");
const closeBtn = modal.querySelector(".close");
const postBtn = document.getElementById("postBtn");
const textarea = modal.querySelector("textarea");

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

postBtn.addEventListener("click", () => {
    alert("ข้อความ: " + textarea.value);
    textarea.value = "";
    modal.style.display = "none";
});