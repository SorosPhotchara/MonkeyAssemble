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

// ---------- Hamburger Bar ----------
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
      alert("แสดงฟอร์มเข้าสู่ระบบ (Modal Login ได้)");
      isLoggedIn = true;
      updateMenu();
      toggleMenu(false);
    });

    addMenuItem("สมัครสมาชิก", () => {
      alert("แสดงฟอร์มสมัครสมาชิก");
      toggleMenu(false);
    });
  } else {
    addMenuItem("โปรไฟล์ของฉัน", () => {
      alert("ไปหน้าโปรไฟล์ผู้ใช้");
      toggleMenu(false);
    });

    addMenuItem("ออกจากระบบ", () => {
      alert("ออกจากระบบแล้ว");
      isLoggedIn = false;
      updateMenu();
      toggleMenu(false);
    });
  }
}

function toggleMenu(open) {
  if (open) {
    hamburgerMenu.style.display = "block";
    hamburgerBtn.querySelector("i").className = "fa-solid fa-xmark";
  } else {
    hamburgerMenu.style.display = "none";
    hamburgerBtn.querySelector("i").className = "fa-solid fa-bars";
  }
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


// ---------- Add Post Modal ----------
const addBtn = document.querySelector(".sidebar .add");
const modal = document.getElementById("addPostModal");
const closeBtn = modal.querySelector(".close");
const postBtn = modal.querySelector(".post-btn");
const textarea = modal.querySelector("textarea");
const threadTitle = modal.querySelector(".thread-title");
const imageInput = document.getElementById("imageInput");
const previewContainer = document.querySelector(".image-preview");
const previewImg = document.getElementById("previewImg");
const removeImgBtn = previewContainer.querySelector(".remove-img");
const emojiBtn = document.getElementById("emojiBtn");

window.addEventListener("DOMContentLoaded", () => {
    modal.style.display = "none";
});

addBtn.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("Clicked + button");
    modal.style.display = "flex";
    textarea.focus();
});

closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
    clearPostFields();
});

window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
        clearPostFields();
    }
});

postBtn.addEventListener("click", () => {
    const title = threadTitle.innerText.trim();
    const text = textarea.value.trim();

    if (!title && !text) {
        alert("กรุณาใส่หัวข้อหรือข้อความก่อนโพสต์!");
        return;
    }

    alert(`หัวข้อ: ${title || "(ไม่มีหัวข้อ)"}\nข้อความ: ${text || "(ไม่มีข้อความ)"}`);

    clearPostFields();
    modal.style.display = "none";
});

function clearPostFields() {
    threadTitle.innerText = "";
    textarea.value = "";
}

imageInput.addEventListener("change", (e) => {
    previewContainer.innerHTML = "";
    const files = Array.from(e.target.files);

    files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (function(f, i) {
            return function(e2) {
                const wrapper = document.createElement("div");
                wrapper.style.position = "relative";
                wrapper.style.display = "inline-block";
                wrapper.style.margin = "5px";

                const img = document.createElement("img");
                img.src = e2.target.result;
                img.style.maxWidth = "100px";
                img.style.maxHeight = "100px";
                img.style.borderRadius = "10px";

                const removeBtn = document.createElement("span");
                removeBtn.innerHTML = "&times;";
                removeBtn.style.position = "absolute";
                removeBtn.style.top = "0";
                removeBtn.style.right = "0";
                removeBtn.style.background = "rgba(0,0,0,0.5)";
                removeBtn.style.color = "white";
                removeBtn.style.cursor = "pointer";
                removeBtn.style.borderRadius = "50%";
                removeBtn.style.padding = "2px 6px";
                removeBtn.style.fontSize = "16px";

                removeBtn.addEventListener("click", () => {
                    wrapper.remove();
                    const dt = new DataTransfer();
                    Array.from(imageInput.files)
                        .forEach((file, idx) => { if (idx !== i) dt.items.add(file); });
                    imageInput.files = dt.files;

                    if (imageInput.files.length === 0) {
                        previewContainer.style.display = "none";
                    }
                });

                wrapper.appendChild(img);
                wrapper.appendChild(removeBtn);
                previewContainer.appendChild(wrapper);
                previewContainer.style.display = "flex";
            };
        })(file, index);
        reader.readAsDataURL(file);
    });
});

function checkPostBtn() {
    const title = threadTitle.innerText.trim();
    const text = textarea.value.trim();
    const hasImage = imageInput.files.length > 0;

    postBtn.disabled = !title && !text && !hasImage;
}

textarea.addEventListener("input", checkPostBtn);
threadTitle.addEventListener("input", checkPostBtn);
imageInput.addEventListener("change", checkPostBtn);