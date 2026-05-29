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
      <div>
        <h3>${animal.animal_name}</h3>
        <p>${animal.type ?? ""}</p>
      </div>
    `;

    card.addEventListener("click", () => {
      window.location.href = `naepfedetail.html?id=${animal.id}`;
    });

    petsContainer.appendChild(card);
  });
}

loadPets();