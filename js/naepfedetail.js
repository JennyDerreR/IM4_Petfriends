// Nur für Wasser: unter 25% = rot, 25-75% = orange, über 75% = grün
function getWaterColor(level) {
  if (level < 25) return '#DA5045';
  if (level < 75) return '#F4AB4F';
  return '#7BC47F';
}

const params   = new URLSearchParams(window.location.search);
const animalId = params.get("id") ?? 7;

async function loadAnimal() {
  try {
    const response = await fetch(`api/getanimal.php?action=get_animal&id=${animalId}`);
    const text     = await response.text();
    const result   = JSON.parse(text);

    if (result.status !== "success") {
      console.error(result.message);
      return;
    }

    const animal = result.animal;

    // Hero
    document.getElementById("animalName").textContent = animal.animal_name ?? "Unbekannt";
    document.getElementById("animalType").textContent = animal.type ?? "";
    document.getElementById("animalHeroAvatar").src   = getAnimalIcon(animal.icon);

    // Futter in Gramm, Wasser in %
    const foodGramm    = animal.food_level   ?? 0;
    const waterLevel   = animal.water_level  ?? 0;
    const neededgramms = animal.neededgramms ?? 100;

    document.getElementById("foodLevel").textContent    = `${foodGramm}g`;
    document.getElementById("waterLevel").textContent   = `${waterLevel}%`;
    document.getElementById("snr").textContent          = animal.snr ?? "";
    document.getElementById("neededGramms").textContent = `${neededgramms} g`;

    // Futter-Kreis: immer grün
    const foodCircle = document.querySelector(".status-circle-new.food");
    if (foodCircle) foodCircle.style.borderColor = '#7BC47F';

    // Wasser-Kreis: Ampelfarbe
    const waterCircle = document.querySelector(".status-circle-new.water");
    if (waterCircle) waterCircle.style.borderColor = getWaterColor(waterLevel);

    // Aufgaben
    const foodDone  = foodGramm  >= neededgramms;
    const waterDone = waterLevel >= 50;

    if (foodDone)  document.getElementById("foodTask").classList.add("done");
    if (waterDone) document.getElementById("waterTask").classList.add("done");

    // Device Status
    const foodStatusEl  = document.getElementById("foodStatus");
    const waterStatusEl = document.getElementById("waterStatus");

    if (foodGramm > 0) {
      foodStatusEl.textContent = "✓ Online";
      foodStatusEl.className   = "device-status online";
    } else {
      foodStatusEl.textContent = "✕ Nicht verbunden";
      foodStatusEl.className   = "device-status offline";
    }

    if (waterLevel > 0) {
      waterStatusEl.textContent = "✓ Online";
      waterStatusEl.className   = "device-status online";
    } else {
      waterStatusEl.textContent = "✕ Nicht verbunden";
      waterStatusEl.className   = "device-status offline";
    }

  } catch (error) {
    console.error("Fehler beim Laden:", error);
  }
}

loadAnimal();