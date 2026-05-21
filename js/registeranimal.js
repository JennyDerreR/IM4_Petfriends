const openBtn = document.getElementById("openAnimalModal");
const closeBtn = document.getElementById("closeAnimalModal");

const modal = document.getElementById("animalModal");

const form = document.getElementById("animalForm");

const childSelect = document.getElementById("child_id");


// MODAL ÖFFNEN
openBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
});


// MODAL SCHLIESSEN
closeBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});


const childSelect = document.getElementById("child_id");

function loadChildren() {
  const children = JSON.parse(localStorage.getItem("children")) || [];

  children.forEach((child) => {
    const option = document.createElement("option");

    option.value = child.id;
    option.textContent = child.name;

    childSelect.appendChild(option);
  });
}

loadChildren();


// FORMULAR SPEICHERN
form.addEventListener("submit", async (event) => {

  event.preventDefault();

  const animalData = {

    animal_name:
      document.getElementById("animal_name").value,

    snr:
      Number(document.getElementById("snr").value),

    neededgramms:
      Number(document.getElementById("neededgramms").value),

    child_id:
      Number(document.getElementById("child_id").value)

  };

  console.log(animalData);


  // IN DATENBANK SPEICHERN
  const { error } = await supabase
    .from("animals")
    .insert([animalData]);


  if (error) {
    console.error(error);
    alert("Fehler beim Speichern");
    return;
  }


  alert("Tier erfolgreich gespeichert");


  // Formular leeren
  form.reset();


  // Modal schliessen
  modal.classList.add("hidden");

});


// KINDER LADEN
loadChildren();