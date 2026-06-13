// kids.js

const childrenContainer = document.getElementById("childrenContainer");

let children = [];
let activeKidId = null;

// ── Modal Elemente ──────────────────────────────────────────────────────────
const addModal      = document.getElementById("addModal");
const addAmount     = document.getElementById("addAmount");
const addConfirm    = document.getElementById("addConfirm");
const addCancel     = document.getElementById("addCancel");

const redeemModal   = document.getElementById("redeemModal");
const redeemAmount  = document.getElementById("redeemAmount");
const redeemConfirm = document.getElementById("redeemConfirm");
const redeemCancel  = document.getElementById("redeemCancel");

const deleteModal   = document.getElementById("deleteModal");
const deleteConfirm = document.getElementById("deleteConfirm");
const deleteCancel  = document.getElementById("deleteCancel");

const reassignModal  = document.getElementById("reassignModal");
const reassignCancel = document.getElementById("reassignCancel");

// ── Modal Helfer ────────────────────────────────────────────────────────────
function openModal(overlay)  { overlay.classList.add("open"); }
function closeModal(overlay) { overlay.classList.remove("open"); }

[addModal, redeemModal, deleteModal, reassignModal].forEach(modal => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal(modal);
  });
});

// ── Add Token Modal Events ──────────────────────────────────────────────────
addCancel.addEventListener("click", () => closeModal(addModal));

addConfirm.addEventListener("click", async () => {
  const amount = parseInt(addAmount.value, 10);
  if (!amount || amount < 1) { addAmount.focus(); return; }
  closeModal(addModal);
  await updateToken(activeKidId, amount);
  await loadChildren();
});

// ── Redeem Modal Events ─────────────────────────────────────────────────────
redeemCancel.addEventListener("click", () => closeModal(redeemModal));

redeemConfirm.addEventListener("click", async () => {
  const amount = parseInt(redeemAmount.value, 10);
  if (!amount || amount < 1) { redeemAmount.focus(); return; }
  closeModal(redeemModal);
  await updateToken(activeKidId, -amount);
  await loadChildren();
});

// ── Delete Modal Events ─────────────────────────────────────────────────────
deleteCancel.addEventListener("click", () => closeModal(deleteModal));

deleteConfirm.addEventListener("click", async () => {
  closeModal(deleteModal);
  await deleteChild(activeKidId);
});

// ── Reassign Modal Events ───────────────────────────────────────────────────
reassignCancel.addEventListener("click", () => closeModal(reassignModal));

// ── Daten laden ─────────────────────────────────────────────────────────────
async function loadChildren() {
  try {
    const response = await fetch("/api/getchildren.php");
    const result = await response.json();

    if (result.status === "success") {
      children = result.children;
      renderChildren();
    } else if (result.message === "Keine Familie angemeldet") {
      console.error(result.message);
      renderChildren();
    } else {
      alert(result.message || "Kinder konnten nicht geladen werden");
    }
  } catch (error) {
    console.error("Fehler beim Laden:", error);
    alert("Fehler beim Laden der Kinder");
  }
}

// ── Render ──────────────────────────────────────────────────────────────────
function renderChildren() {
  childrenContainer.innerHTML = "";

  if (children.length === 0) {
    childrenContainer.innerHTML = `<p class="empty-hint">Keine Kinder gefunden.</p>`;
    return;
  }

  children.forEach((child) => {
    const token = Number(child.token) || 0;
    const firstLetter = child.kidsname.charAt(0).toUpperCase();

    const card = document.createElement("article");
    card.classList.add("child-card");

    card.innerHTML = `
      <div class="child-top">
        <div class="child-info">
          <div class="avatar">${firstLetter}</div>
          <div>
            <h2 class="child-name">${child.kidsname}</h2>
            <p class="tokens">🪙 ${token} Token</p>
          </div>
        </div>
      </div>
      <div class="actions">
        <button class="add-token" data-id="${child.id}">+ Token</button>
        <button class="redeem" data-id="${child.id}">Einlösen</button>
        <button class="delete" data-id="${child.id}">🗑</button>
      </div>
    `;

    childrenContainer.appendChild(card);
  });
}

// ── Event Delegation ────────────────────────────────────────────────────────
childrenContainer.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const kidId = Number(button.dataset.id);
  if (!kidId) return;

  activeKidId = kidId;

  if (button.classList.contains("add-token")) {
    addAmount.value = "";
    openModal(addModal);
    setTimeout(() => addAmount.focus(), 300);
  }

  if (button.classList.contains("redeem")) {
    redeemAmount.value = "";
    openModal(redeemModal);
    setTimeout(() => redeemAmount.focus(), 300);
  }

  if (button.classList.contains("delete")) {
    openModal(deleteModal);
  }
});

// ── API Calls ───────────────────────────────────────────────────────────────
async function updateToken(kidId, amount) {
  try {
    const response = await fetch("/api/updatetoken.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kid_id: kidId, amount: amount })
    });
    const result = await response.json();
    if (result.status !== "success") {
      alert(result.message || "Token konnten nicht aktualisiert werden");
    }
  } catch (error) {
    console.error("Fehler beim Aktualisieren:", error);
    alert("Fehler beim Aktualisieren der Token");
  }
}

async function deleteChild(kidId) {
  try {
    const response = await fetch("/api/deletechild.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kid_id: kidId })
    });
    const result = await response.json();

    if (result.status === "success") {
      await loadChildren();
    } else if (result.status === "has_animals") {
      showReassignModal(result.animals, kidId);
    } else {
      alert(result.message || "Kind konnte nicht gelöscht werden");
    }
  } catch (error) {
    console.error("Fehler beim Löschen:", error);
    alert("Fehler beim Löschen des Kindes");
  }
}

function showReassignModal(animals, kidId) {
  const otherChildren = children.filter(c => c.id !== kidId);

  const animalRows = animals.map(animal => {
    const options = otherChildren.map(c =>
      `<option value="${c.id}">${c.kidsname}</option>`
    ).join("");

    return `
      <div class="reassign-row">
        <span class="reassign-animal-name"> ${animal.animal_name}</span>
        <select class="reassign-select" data-animal-id="${animal.id}">
          <option value="">Kind wählen...</option>
          ${options}
        </select>
      </div>
    `;
  }).join("");

  document.getElementById("reassignList").innerHTML = animalRows;

  document.getElementById("reassignConfirm").onclick = async () => {
    const selects = document.querySelectorAll(".reassign-select");
    let allSelected = true;

    for (const select of selects) {
      if (!select.value) {
        allSelected = false;
        break;
      }
    }

    if (!allSelected) {
      alert("Bitte für jedes Tier ein neues Kind auswählen.");
      return;
    }

    for (const select of selects) {
      await reassignAnimal(parseInt(select.dataset.animalId), parseInt(select.value));
    }

    closeModal(reassignModal);
    await deleteChild(kidId);
  };

  openModal(reassignModal);
}

async function reassignAnimal(animalId, newChildId) {
  try {
    const response = await fetch("/api/reassignanimal.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ animal_id: animalId, new_child_id: newChildId })
    });
    const result = await response.json();
    if (result.status !== "success") {
      alert(result.message || "Tier konnte nicht umgeschrieben werden");
    }
  } catch (error) {
    console.error("Fehler beim Umschreiben:", error);
  }
}

// ── Init ────────────────────────────────────────────────────────────────────
(async () => {
  const isAuth = await checkAuth();
  if (!isAuth) return;
  await loadChildren();
})();