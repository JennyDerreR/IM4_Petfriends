// profil.js


/*
document.addEventListener("DOMContentLoaded", async () => {
  const userData = await loadProfile();

  if (userData) {
    document.querySelector("#lastname").value = userData.lastname || "";
    document.querySelector("#email").value = userData.email || "";
  }

});

document.getElementById("profilForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const lastname = document.getElementById("lastname").value.trim();

    try {
        const response = await fetch("api/profilUpdate.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lastname }),
      });
      const result = await response.json();
      console.log("Update response:", result);

    loadProfile(); // Refresh profile data after update

     /* if (result.status === "success") {
        alert("Registration successful! You can now log in.");
        window.location.href = "login.html";
      } else {
        alert(result.message || "Registration failed.");
      }*/

/*
    } catch (error) {
  console.error("Error:", error);

  alert(error.message);
}
  });

document
  .getElementById("passwortAendern")
  .addEventListener("click", async () => {

    try {

      const response = await fetch(
        "api/passwortReset.php",
        {
          method: "POST",
          credentials: "include",
        }
      );

      const result = await response.json();

      if (result.status === "success") {

        alert(
          "Dies ist ein Protoyp. Sie erhalten dehalb keine E-Mail. Normalerweise würde nun eine E-Mail zum Zurücksetzen gesendet werden."
        );

      } else {

        alert(
          result.message || "Fehler."
        );

      }

    } catch (error) {

      console.error(error);

      alert(error.message);

    } */

document.addEventListener("DOMContentLoaded", async () => {

  // Profil laden — direkt von der PHP die wir schon haben
  const res  = await fetch('api/profil.php');
  const data = await res.json();

  if (data.status === 'success') {
    document.getElementById('lastname').value = data.lastname || '';
    document.getElementById('email').value    = data.email    || '';
  }
});

document.getElementById("profilForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const lastname = document.getElementById('lastname').value.trim();

  try {
    const res    = await fetch('api/profilUpdate.php', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ lastname }),
    });
    const result = await res.json();

    if (result.status === 'success') {
      alert('Profil gespeichert!');
    } else {
      alert('Fehler: ' + result.message);
    }

  } catch (error) {
    console.error(error);
    alert('Etwas ist schiefgelaufen.');
  }
});

document.getElementById("passwortAendern").addEventListener("click", async () => {
  try {
    const res    = await fetch('api/passwortReset.php', { method: 'POST', credentials: 'include' });
    const result = await res.json();

    if (result.status === 'success') {
      alert('Dies ist ein Prototyp. Normalerweise würde nun eine E-Mail zum Zurücksetzen gesendet werden.');
    } else {
      alert(result.message || 'Fehler.');
    }
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
});

