// js/registeranimal.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("animalForm");
  const childSelect = document.getElementById("child_id");

  loadChildren();

  async function loadChildren() {
    try {
      const response = await fetch("/api/getchildren.php");
      const result = await response.json();

      if (result.status !== "success") {
        alert(result.message || "Kinder konnten nicht geladen werden");
        return;
      }

      childSelect.innerHTML = `
        <option value="">Bitte Kind auswählen</option>
      `;

      result.children.forEach((child) => {
        const option = document.createElement("option");

        option.value = child.id;
        option.textContent = child.kidsname;

        childSelect.appendChild(option);
      });

    } catch (error) {
      console.error("Fehler beim Laden der Kinder:", error);
      alert("Fehler beim Laden der Kinder");
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const animal_name = document
      .getElementById("animal_name")
      .value
      .trim();

    const snr = document
      .getElementById("snr")
      .value
      .trim();

    const neededgramms = document
      .getElementById("neededgramms")
      .value
      .trim();

    const child_id = document
      .getElementById("child_id")
      .value;

    if (!animal_name || !snr || !neededgramms || !child_id) {
      alert("Bitte alle Felder ausfüllen.");
      return;
    }

    try {
      const response = await fetch("/api/registeranimal.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          animal_name: animal_name,
          snr: snr,
          neededgramms: neededgramms,
          child_id: child_id
        })
      });

      const text = await response.text();

      console.log("HTTP Status:", response.status);
      console.log("Antwort vom Server:", text);

      const result = JSON.parse(text);

      if (result.status === "success") {
        alert("Tier erfolgreich gespeichert");
        window.location.href = "/protected.html";
      } else {
        alert(result.message || "Speichern fehlgeschlagen");
      }

    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      alert("Serverfehler. Siehe Console.");
    }
  });
});