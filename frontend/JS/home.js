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

const modal = document.getElementById("createEventModal");
const createForm = document.getElementById("createEventForm");
const textarea = createForm.querySelector("textarea");
const closeBtn = modal.querySelector(".close-btn");

closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
    createForm.reset();
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
            window.location.href = "/frontend/HTML/signup.html";
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
    window.location.href = "/frontend/HTML/signup.html";
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
createForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newEvent = {
    id: Date.now(),
    host: "User1234",
    eventName: createForm.querySelector("input[placeholder='event name']").value,
    eventTime: createForm.querySelector("input[type='datetime-local']").value,
    location: createForm.querySelector("input[placeholder='location']").value,
    maxParticipants: createForm.querySelector("input[name='participants']").value,
    description: createForm.querySelector("textarea").value,
    tags: [tagInput.value],
    participants: [],
    status: "open",
    timeAgo: "0 นาที" // รอ backend 
  };

  try {
    await fetch("http://localhost:3000/events", { // รอ backend 
      method: "POST", // รอ backend 
      headers: { "Content-Type": "application/json" }, // รอ backend 
      body: JSON.stringify(newEvent) // รอ backend 
    });
    loadEvents();
  } catch {
    // fallback localStorage
    const events = JSON.parse(localStorage.getItem("events")) || [];
    events.push(newEvent);
    localStorage.setItem("events", JSON.stringify(events));
    renderEvents(events);
  }

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

// ---------------- Event Feed ----------------
const feed = document.getElementById("event-feed");

async function loadEvents() {
  try {
    const res = await fetch("http://localhost:3000/events"); // รอ backend
    const events = await res.json();
    renderEvents(events);
  } catch {
    const localEvents = JSON.parse(localStorage.getItem("events")) || [];
    renderEvents(localEvents);
  }
}

function renderEvents(events) {
  feed.innerHTML = "";
  events.forEach(event => {
    const card = document.createElement("div");
    card.className = "event-card";

    card.innerHTML = `
      <div class="event-header">
        <span class="host">${event.host}</span>
        <span class="status ${event.status}">${event.status}</span>
      </div>
      <h3>${event.eventName}</h3>
      <p>${event.description}</p>
      <small>${event.location || "ไม่ระบุ"}</small><br>
      <small>รับ ${event.participants?.length || 0}/${event.maxParticipants || 0} คน</small>
      <button class="join-btn" ${event.status === "close" ? "disabled" : ""}>
        ${event.status === "close" ? "CLOSED" : "JOIN"}
      </button>
    `;

    card.querySelector(".join-btn").addEventListener("click", () => joinEvent(event, events));

    feed.appendChild(card);
  });
}

async function joinEvent(event, events) {
  try {
    await fetch(`http://localhost:3000/events/${event.id}/join`, { // รอ backend 
      method: "PUT", // รอ backend 
      headers: { "Content-Type": "application/json" }, // รอ backend 
      body: JSON.stringify({ userId: "currentUser" }) // รอ backend
    });
    loadEvents();
  } catch {
    event.participants.push("mockUser");
    localStorage.setItem("events", JSON.stringify(events));
    renderEvents(events);
  }
}

// ---------------- Initial Load ----------------
loadEvents();