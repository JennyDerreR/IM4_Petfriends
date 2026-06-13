// auth.js

async function checkAuth() {
  try {
    const response = await fetch("/api/protected.php", {
      credentials: "include",
    });

    if (response.status === 401) {
      window.location.href = "/login.html";
      return false;
    }

    return true;
  } catch (error) {
    console.error("Auth check failed:", error);
    window.location.href = "/login.html";
    return false;
  }
}

// Seite verstecken bis Auth-Check fertig
document.body.style.visibility = "hidden";

checkAuth().then(isAuth => {
  if (isAuth) {
    document.body.style.visibility = "visible";
  }
});