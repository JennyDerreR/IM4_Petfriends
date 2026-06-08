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

const petsContainer = document.getElementById("petsContainer");
let activeAnimalId  = null;

const deleteAnimalModal  = document.getElementById("deleteAnimalModal");
const deleteAnimalCancel = document.getElementById("deleteAnimalCancel");
const deleteAnimalConfirm = document.getElementById("deleteAnimalConfirm");

deleteAnimalCancel.addEventListener("click", () => deleteAnimalModal.classList.remove("open"));
deleteAnimalModal.addEventListener("click", (e) => {
  if (e.target === deleteAnimalModal) deleteAnimalModal.classList.remove("open");
});

deleteAnimalConfirm.addEventListener("click", async () => {
  deleteAnimalModal.classList.remove("open");
  await deleteAnimal(activeAnimalId);
  await loadPets();
});

async function loadPets() {
  try {
    const response = await fetch("/api/getanimals.php");
    const result   = await response.json();

    if (result.status !== "success") {
      petsContainer.innerHTML = `<p class="empty-hint">Keine Tiere gefunden.</p>`;
      return;
    }

    renderPets(result.animals);
  } catch (error) {
    console.error("Fehler beim Laden:", error);
    petsContainer.innerHTML = `<p class="empty-hint">Fehler beim Laden der Tiere.</p>`;
  }
}

function renderPets(animals) {
  petsContainer.innerHTML = "";

  if (animals.length === 0) {
    petsContainer.innerHTML = `<p class="empty-hint">Noch keine Tiere hinzugefügt.</p>`;
    return;
  }

  animals.forEach((animal) => {
    const card = document.createElement("div");
    card.classList.add("mini-pet-card");

    card.innerHTML = `
      <div class="mini-pet-avatar">
        <img src="${getAnimalIcon(animal.icon)}" alt="${animal.animal_name}" />
      </div>
      <div style="flex:1">
        <h3>${animal.animal_name}</h3>
        <p>${animal.type ?? ""}</p>
      </div>
      <button class="delete" data-id="${animal.id}" style="flex-shrink:0">🗑</button>
    `;

    // Klick auf Karte → Detailseite (nicht wenn Löschen-Button)
    card.addEventListener("click", (e) => {
      if (e.target.closest(".delete")) return;
      window.location.href = `naepfedetail.html?id=${animal.id}`;
    });

    // Klick auf Löschen-Button → Modal
    card.querySelector(".delete").addEventListener("click", (e) => {
      e.stopPropagation();
      activeAnimalId = animal.id;
      deleteAnimalModal.classList.add("open");
    });

    petsContainer.appendChild(card);
  });
}

async function deleteAnimal(animalId) {
  try {
    const response = await fetch("/api/deleteanimal.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ animal_id: animalId })
    });
    const result = await response.json();
    if (result.status !== "success") {
      alert(result.message || "Tier konnte nicht gelöscht werden");
    }
  } catch (error) {
    console.error("Fehler beim Löschen:", error);
    alert("Fehler beim Löschen");
  }
}

// ── Init ────────────────────────────────────────────────────────────────────
(async () => {
  const isAuth = await checkAuth();
  if (!isAuth) return;
  await loadPets();
})();