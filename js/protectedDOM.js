window.addEventListener("load", async () => {
  const res  = await fetch("/api/protected.php", { credentials: "include" });
  const data = await res.json();

  if (data.familienname) {
    document.getElementById("familienname").textContent = data.familienname;
  }
});