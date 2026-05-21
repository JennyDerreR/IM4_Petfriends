async function checkAuth() {
  try {
    const response = await fetch("/api/protected.php", {
      credentials: "include",
    });

    if (response.status === 401) {
      window.location.href = "/login.html";
      return false;
    }

    const result = await response.json();
    console.log("Protected content response:", result);

    // Display user data in the protected content div

    return true;
  } catch (error) {
    console.error("Auth check failed:", error);
    window.location.href = "/login.html";
    return false;
  }
}

// Check auth when page loads
window.addEventListener("load", checkAuth);

const kidsWidgetContainer =
  document.getElementById(
    "kidsWidgetContainer"
  );

async function loadKidsWidget() {

  try {

    const response =
      await fetch("/api/getchildren.php");

    const result =
      await response.json();

    if (
      result.status !== "success"
    ) {
      return;
    }

    renderKidsWidget(
      result.children
    );

  } catch (error) {

    console.error(error);

  }

}

function renderKidsWidget(children) {

  kidsWidgetContainer.innerHTML = "";

  children.forEach((child) => {

    const token =
      Number(child.token) || 0;

    const progress =
      Math.min((token / 50) * 100, 100);

    const firstLetter =
      child.kidsname
        .charAt(0)
        .toUpperCase();

    const card =
      document.createElement("div");

    card.classList.add(
      "mini-kid-card"
    );

    card.innerHTML = `
    
      <div class="mini-avatar">
        ${firstLetter}
      </div>

      <h3>
        ${child.kidsname}
      </h3>

      <p>
        🪙 ${token} Token
      </p>

      <div class="mini-progress-bar">

        <div
          class="mini-progress-fill"
          style="width:${progress}%"
        ></div>

      </div>

    `;

    card.addEventListener(
      "click",
      () => {

        window.location.href =
          "kids.html";

      }
    );

    kidsWidgetContainer
      .appendChild(card);

  });

}

loadKidsWidget();
