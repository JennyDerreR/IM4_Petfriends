/*
const currentDate = document.getElementById("currentDate");
const daysContainer = document.getElementById("daysContainer");

const animalId = 7;

const today = new Date();

const weekdays = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

const months = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember"
];

currentDate.textContent =
  `📅 ${weekdays[today.getDay()]}, ${today.getDate()}. ${months[today.getMonth()]}`;

for (let i = 0; i < 5; i++) {
  const date = new Date();
  date.setDate(today.getDate() + i);

  const dayBox = document.createElement("div");
  dayBox.classList.add("day");

  if (i === 0) {
    dayBox.classList.add("active");
  }

  dayBox.innerHTML = `
    <span>${weekdays[date.getDay()]}</span>
    <strong>${date.getDate()}</strong>
  `;

  daysContainer.appendChild(dayBox);
}

async function loadAnimal() {
  try {
    const response = await fetch(
  `api/getanimal.php?action=get_animal&id=${animalId}`
);

    const text = await response.text();
    console.log("PHP Antwort:", text);

    const result = JSON.parse(text);

    if (result.status !== "success") {
      console.error(result.message);
      return;
    }

    const animal = result.animal;

    document.getElementById("animalName").textContent =
      animal.animal_name ?? "Unbekannt";

    document.getElementById("animalType").textContent =
      animal.type ?? "";

    document.getElementById("snr").textContent =
      animal.snr ?? "";

    document.getElementById("familyId").textContent =
      animal.family_id ?? "";

    document.getElementById("neededGramms").textContent =
      animal.neededgramms ?? "";

    document.getElementById("foodLevel").textContent =
      `${animal.food_level ?? 0}%`;

    document.getElementById("waterLevel").textContent =
      `${animal.water_level ?? 0}%`;

  } catch (error) {
    console.error("Fehler beim Laden:", error);
  }
}

loadAnimal(); */

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
      <div class="mini-pet-avatar">🐾</div>
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