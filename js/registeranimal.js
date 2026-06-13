// registeranimal.js

const ICON_MAP = {
  dog:       'assets/dogicon_v2.png',
  cat:       'assets/caticon_v2.png',
  bunny:     'assets/bunnyicon_v2.png',
  gunneapig: 'assets/gunneapig_v2.png',
  bird:      'assets/birdicon_v2.png',
};

document.addEventListener("DOMContentLoaded", async () => {
  const isAuth = await checkAuth();
  if (!isAuth) return;
  const form        = document.getElementById("animalForm");
  const childSelect = document.getElementById("child_id");
  const iconInput   = document.getElementById("icon");

  // ── Icon Picker ──────────────────────────────────────────────────────────
  document.querySelectorAll(".icon-option").forEach(option => {
    option.addEventListener("click", () => {
      document.querySelectorAll(".icon-option").forEach(o => o.classList.remove("selected"));
      option.classList.add("selected");
      iconInput.value = option.dataset.icon;
    });
  });

  // ── Kinder laden ─────────────────────────────────────────────────────────
  loadChildren();

  async function loadChildren() {
    try {
      const response = await fetch("/api/getchildren.php");
      const result   = await response.json();

      if (result.status !== "success") {
        alert(result.message || "Kinder konnten nicht geladen werden");
        return;
      }

      childSelect.innerHTML = `<option value="">Bitte Kind auswählen</option>`;

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

  // ── Formular absenden ────────────────────────────────────────────────────
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const animal_name  = document.getElementById("animal_name").value.trim();
    const type         = document.getElementById("type").value.trim();
    const snr          = document.getElementById("snr").value.trim();
    const neededgramms = document.getElementById("neededgramms").value.trim();
    const child_id     = document.getElementById("child_id").value;
    const icon         = iconInput.value || "dog";

    if (!animal_name || !type || !snr || !neededgramms || !child_id) {
      alert("Bitte alle Felder ausfüllen.");
      return;
    }

    try {
      const response = await fetch("/api/registeranimal.php", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ animal_name, type, snr, neededgramms, child_id, icon })
      });

      const text   = await response.text();
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