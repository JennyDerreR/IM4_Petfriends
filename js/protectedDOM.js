window.addEventListener("load", async () => {
   
    const userData = await loadProfile();
    console.log("Loaded user data for protected DOMMMMMMM:", userData);
  
    if (userData) {
        document.getElementById("familienname").textContent = userData.familienname || "";
        document.getElementById("userId").textContent = userData.user_id || "";
    }
  
  });