async function loadProfile () {
    try {
      const response = await fetch("api/profil.php", {
        credentials: "include",
      });
      const result = await response.json();
      console.log ("Profile data:", result);
  
      if (result.status === "error") {
        window.location.href = "login.html";
        return;
      }
  
      return result;
      //document.querySelector("#familienname").value = result.familienname || "";
      //document.querySelector("#email").value = result.email || "";
  
      } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong!");
      }
  }
  