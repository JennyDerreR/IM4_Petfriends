// login.js
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const response = await fetch("api/login.php", {
      method: "POST",
      // credentials: 'include', // uncomment if front-end & back-end are on different domains
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const result = await response.json();
    console.log("Raw response:", result);

    /*if (result.status === "success") {
      alert("Login successful!");
      window.location.href = "protected.html";
    } else {
      alert(result.message || "Login failed.");
    } */

    if (result.status === "success") {
      alert("Login successful!");
  // Werte aus der PHP-Antwort im Browser speichern
  // so kann jede andere Seite darauf zugreifen
  localStorage.setItem("user_id",   result.user_id);
  localStorage.setItem("firstname", result.firstname);
  localStorage.setItem("lastname",  result.lastname);
  localStorage.setItem("family_id", result.family_id ?? ""); // leer wenn noch keine Familie

  window.location.href = "protected.html";
}

  } catch (error) {
    console.error("Error:", error);
    alert("Something went wrong!");
  }
});
