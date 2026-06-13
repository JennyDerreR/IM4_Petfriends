document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("kidsForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const kidsname = document.getElementById("kidsname").value.trim();

    if (kidsname === "") {
      alert("Bitte gib einen Namen ein.");
      return;
    }

    try {
      const response = await fetch("/api/registerchild.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ kidsname })
      });

      const text   = await response.text();
      const result = JSON.parse(text);

      if (result.status === "success") {
        alert("Kind erfolgreich gespeichert");
        window.location.href = "/protected.html";
      } else {
        alert(result.message || "Speichern fehlgeschlagen");
      }

    } catch (error) {
      console.error("Fehler:", error);
      alert("Serverfehler. Siehe Console.");
    }
  });
});