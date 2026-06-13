// protected.js

const ICON_MAP = {
  dog:       'assets/dogicon_v2.png',
  cat:       'assets/caticon_v2.png',
  bunny:     'assets/bunnyicon_v2.png',
  gunneapig: 'assets/gunneapig_v2.png',
  bird:      'assets/birdicon_v2.png',
};

function getAnimalIcon(icon) {
  return ICON_MAP[icon] || 'assets/dogicon_v2.png';
}

// ── Auth Check ──────────────────────────────────────────────────────────────
async function checkAuth() {
  try {
    const response = await fetch("/api/protected.php", { credentials: "include" });
    if (response.status === 401) {
      window.location.href = "/login.html";
      return false;
    }
    return true;
  } catch (error) {
    console.error("Auth check failed:", error);
    window.location.href = "/login.html";
    return false;
  }
}

window.addEventListener("load", checkAuth);

// ── Datum ───────────────────────────────────────────────────────────────────
const weekdays = ["So","Mo","Di","Mi","Do","Fr","Sa"];
const months   = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
const today    = new Date();
document.getElementById("currentDate").textContent =
  ` ${weekdays[today.getDay()]}, ${today.getDate()}. ${months[today.getMonth()]}`;

// ── Aufgaben Widget ─────────────────────────────────────────────────────────
const tasksContainer = document.getElementById("tasksContainer");

async function loadTasksWidget() {
  try {
    const response = await fetch("/api/getanimals.php");
    const result   = await response.json();
    if (result.status !== "success") return;
    renderTasksWidget(result.animals);
  } catch (error) {
    console.error(error);
  }
}

function renderTasksWidget(animals) {
  tasksContainer.innerHTML = "";

  if (animals.length === 0) {
    tasksContainer.innerHTML = `<p class="empty-hint">Noch keine Tiere hinzugefügt.</p>`;
    return;
  }

  animals.forEach((animal) => {
    const foodDone  = (animal.food_level  ?? 0) >= (animal.neededgramms ?? 100);
    const waterDone = (animal.water_level ?? 0) >= 50;

    const card = document.createElement("div");
    card.classList.add("task-card");

    card.innerHTML = `
      <div class="task-card-header">
        <div class="mini-pet-avatar">
          <img src="${getAnimalIcon(animal.icon)}" alt="${animal.animal_name}" />
        </div>
        <h3>${animal.animal_name}</h3>
      </div>
      <div class="task-row ${foodDone ? 'done' : ''}">
        <div class="task-check"></div>
        <span class="task-label"> Futter auffüllen</span>
      </div>
      <div class="task-row ${waterDone ? 'done' : ''}">
        <div class="task-check"></div>
        <span class="task-label"> Wasser auffüllen</span>
      </div>
    `;

    tasksContainer.appendChild(card);
  });
}

// ── Haustiere Widget ────────────────────────────────────────────────────────
const petsContainer = document.getElementById("petsContainer");

async function loadPetsWidget() {
  try {
    const response = await fetch("/api/getanimals.php");
    const result   = await response.json();
    if (result.status !== "success") return;
    renderPetsWidget(result.animals);
  } catch (error) {
    console.error(error);
  }
}

function renderPetsWidget(animals) {
  petsContainer.innerHTML = "";

  if (animals.length === 0) {
    petsContainer.innerHTML = `<p class="empty-hint">Noch keine Tiere hinzugefügt.</p>`;
    return;
  }

  animals.forEach((animal) => {
    const card = document.createElement("a");
    card.classList.add("mini-pet-card");
    card.href = `naepfedetail.html?id=${animal.id}`;

    card.innerHTML = `
      <div class="mini-pet-avatar">
        <img src="${getAnimalIcon(animal.icon)}" alt="${animal.animal_name}" />
      </div>
      <div>
        <h3>${animal.animal_name}</h3>
        <p>${animal.type ?? ""}</p>
      </div>
    `;

    petsContainer.appendChild(card);
  });
}

// ── Kinder Widget ───────────────────────────────────────────────────────────
const kidsWidgetContainer = document.getElementById("kidsWidgetContainer");

async function loadKidsWidget() {
  try {
    const response = await fetch("/api/getchildren.php");
    const result   = await response.json();
    if (result.status !== "success") return;
    renderKidsWidget(result.children);
  } catch (error) {
    console.error(error);
  }
}

function renderKidsWidget(children) {
  kidsWidgetContainer.innerHTML = "";

  if (children.length === 0) {
    kidsWidgetContainer.innerHTML = `<p class="empty-hint">Noch keine Kinder hinzugefügt.</p>`;
    return;
  }

  children.forEach((child) => {
    const token       = Number(child.token) || 0;
    const firstLetter = child.kidsname.charAt(0).toUpperCase();

    const card = document.createElement("div");
    card.classList.add("mini-kid-card");

    card.innerHTML = `
      <div class="mini-avatar">${firstLetter}</div>
      <div>
        <h3>${child.kidsname}</h3>
        <p>🪙 ${token} Token</p>
      </div>
    `;

    card.addEventListener("click", () => { window.location.href = "kids.html"; });
    kidsWidgetContainer.appendChild(card);
  });
}

loadTasksWidget();
loadPetsWidget();
loadKidsWidget();

async function checkFamily() {
  try {
    const res    = await fetch("/api/family.php?action=get_family");
    const data   = await res.json();
    if (data.status === "no_family") {
      document.getElementById("familyBanner").style.display = "block";
    }
  } catch (error) {
    console.error(error);
  }
}

checkFamily();