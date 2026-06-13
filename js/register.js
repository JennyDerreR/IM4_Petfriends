// register.js
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const lastname  = document.getElementById("lastname").value.trim();
    const firstname = document.getElementById("firstname").value.trim();
    const email     = document.getElementById("email").value.trim();
    const password  = document.getElementById("password").value.trim();

    try {
      const response = await fetch("api/register.php", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ lastname, firstname, email, password }),
      });
      const result = await response.json();

      if (result.status === "success") {
        window.location.href = "login.html";
      } else {
        alert(result.message || "Registrierung fehlgeschlagen.");
      }
    } catch (error) {
      console.error("Fehler:", error);
      alert("Etwas ist schiefgelaufen.");
    }
  });
});