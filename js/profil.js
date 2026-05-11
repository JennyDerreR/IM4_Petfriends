// profil.js

async function loadProfile () {
  try {
    const response = await fetch("api/profil.php", {
      credentials: "include",
    });
    const result = await response.json();
    console.log ("Profile data:", result);


  } catch (error) {
    console.error("Error:", error);
    alert("Something went wrong!");
  }
}



loadProfile();


document.getElementById("profilForm")
  addEventListener("submit", async (e) => {
    e.preventDefault();

    const familienname = document.getElementById("familienname").value.trim();


    try {
        const response = await fetch("api/profilUpdate.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ familienname }),
      });
      const result = await response.json();
      console.log("Update response:", result);

     /* if (result.status === "success") {
        alert("Registration successful! You can now log in.");
        window.location.href = "login.html";
      } else {
        alert(result.message || "Registration failed.");
      }*/
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong!");
    }
  });
