// naepfe.js

// Nur für Wasser: unter 25% = rot, 25-75% = orange, über 75% = grün
function getWaterColor(level) {
  if (level < 25) return '#DA5045';
  if (level < 75) return '#F4AB4F';
  return '#7BC47F';
}

const petsContainer = document.getElementById("petsContainer");
let activeAnimalId  = null;

const deleteAnimalModal   = document.getElementById("deleteAnimalModal");
const deleteAnimalCancel  = document.getElementById("deleteAnimalCancel");
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
    const waterLevel  = animal.water_level ?? 0;
    const foodGramm   = animal.food_level  ?? 0;
    const waterColor  = getWaterColor(waterLevel);

    const card = document.createElement("div");
    card.classList.add("mini-pet-card");

    card.innerHTML = `
      <div class="mini-pet-avatar">
        <img src="${getAnimalIcon(animal.icon)}" alt="${animal.animal_name}" />
      </div>
      <div style="flex:1">
        <h3>${animal.animal_name}</h3>
        <p>${animal.type ?? ""}</p>
        <div class="pet-status-row">
          <span class="pet-status-water" style="color:${waterColor}">Wasser: ${waterLevel}%</span>
          <span class="pet-status-sep">·</span>
          <span class="pet-status-food">Futter: ${foodGramm}g</span>
        </div>
      </div>
      <button class="delete" data-id="${animal.id}" style="flex-shrink:0">🗑</button>
    `;

    card.addEventListener("click", (e) => {
      if (e.target.closest(".delete")) return;
      window.location.href = `naepfedetail.html?id=${animal.id}`;
    });

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

(async () => {
  const isAuth = await checkAuth();
  if (!isAuth) return;
  await loadPets();
})();