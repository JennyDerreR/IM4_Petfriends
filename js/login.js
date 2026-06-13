// login.js
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email    = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const response = await fetch("api/login.php", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, password }),
    });
    const result = await response.json();

    if (result.status === "success") {
      // Werte aus der PHP-Antwort im Browser speichern
      // so kann jede andere Seite darauf zugreifen
      localStorage.setItem("user_id",   result.user_id);
      localStorage.setItem("firstname", result.firstname);
      localStorage.setItem("lastname",  result.lastname);
      localStorage.setItem("family_id", result.family_id ?? "");

      window.location.href = "protected.html";
    } else {
      alert(result.message || "Anmeldung fehlgeschlagen.");
    }

  } catch (error) {
    console.error("Fehler:", error);
    alert("Etwas ist schiefgelaufen.");
  }
});