const form = document.getElementById("kidsForm");

form.addEventListener("submit", (event) => {
  const kidsname = document.getElementById("kidsname").value.trim();

  if (kidsname === "") {
    event.preventDefault();
    alert("Bitte gib einen Namen ein.");
  }
});