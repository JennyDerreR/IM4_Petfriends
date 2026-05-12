document.addEventListener("DOMContentLoaded", async () => {
    const userData = await loadProfile();
  
    if (userData) {
      //document.querySelector("#familienname").value = userData.familienname || "";
      document.querySelector("#email").value = userData.email || "";
    }
  
  });