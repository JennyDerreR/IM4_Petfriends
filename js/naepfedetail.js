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

    // Status
    const foodLevel    = animal.food_level  ?? 0;
    const waterLevel   = animal.water_level ?? 0;
    const neededgramms = animal.neededgramms ?? 100;

    document.getElementById("foodLevel").textContent    = `${foodLevel}%`;
    document.getElementById("waterLevel").textContent   = `${waterLevel}%`;
    document.getElementById("snr").textContent          = animal.snr ?? "";
    document.getElementById("neededGramms").textContent = `${neededgramms} g`;

    // Aufgaben — nur Klasse setzen, kein Emoji
    const foodDone  = foodLevel >= neededgramms;
    const waterDone = waterLevel >= 50;

    if (foodDone)  document.getElementById("foodTask").classList.add("done");
    if (waterDone) document.getElementById("waterTask").classList.add("done");

  } catch (error) {
    console.error("Fehler beim Laden:", error);
  }
}

loadAnimal();