// logout.js
document.getElementById("logoutBtn").addEventListener("click", async (e) => {
  e.preventDefault();

  try {
    const response = await fetch("api/logout.php", {
      method:      "GET",
      credentials: "include",
    });
    const result = await response.json();

    if (result.status === "success") {
      window.location.href = "login.html";
    } else {
      console.error("Abmeldung fehlgeschlagen");
      alert("Abmeldung fehlgeschlagen. Bitte versuche es erneut.");
    }
  } catch (error) {
    console.error("Fehler beim Abmelden:", error);
    alert("Etwas ist schiefgelaufen.");
  }
});