const childrenContainer = document.getElementById("childrenContainer");

let children = [];

async function loadChildren() {
  try {
    const response = await fetch("/api/getchildren.php");
    const result = await response.json();

    if (result.status === "success") {
      children = result.children;
      renderChildren();
    } else {
      alert(result.message || "Kinder konnten nicht geladen werden");
    }
  } catch (error) {
    console.error("Fehler beim Laden:", error);
    alert("Fehler beim Laden der Kinder");
  }
}

function renderChildren() {
  childrenContainer.innerHTML = "";

  children.forEach((child) => {
    const token = Number(child.token) || 0;
    const levelTarget = 50;
    const progress = Math.min((token / levelTarget) * 100, 100);
    const firstLetter = child.kidsname.charAt(0).toUpperCase();

    const card = document.createElement("article");
    card.classList.add("child-card");

    card.innerHTML = `
      <div class="child-top">
        <div class="child-info">
          <div class="avatar">${firstLetter}</div>

          <div>
            <h2 class="child-name">${child.kidsname}</h2>
            <p class="tokens">🪙 ${token} Token</p>
          </div>
        </div>


      <div class="progress-info">
        <span>Fortschritt zum nächsten Level</span>
        <span>${token}/${levelTarget}</span>
      </div>

      <div class="progress-bar">
        <div
          class="progress-fill"
          style="width: ${progress}%"
        ></div>
      </div>

      <div class="actions">
        <button class="add-token" data-id="${child.id}">
          ＋ Token
        </button>

        <button class="redeem" data-id="${child.id}">
          🎁 Einlösen
        </button>

        <button class="delete" data-id="${child.id}">
          🗑
        </button>
      </div>
    `;

    childrenContainer.appendChild(card);
  });
}

childrenContainer.addEventListener("click", async (event) => {
  const button = event.target.closest("button");

  if (!button) return;

  const kidId = Number(button.dataset.id);

  if (!kidId) return;

  if (button.classList.contains("add-token")) {
    await updateToken(kidId, 1);
  }

  if (button.classList.contains("redeem")) {
    await updateToken(kidId, -5);
  }

  if (button.classList.contains("delete")) {
    const confirmDelete = confirm("Kind wirklich löschen?");

    if (!confirmDelete) return;

    await deleteChild(kidId);
  }

  await loadChildren();
});

async function updateToken(kidId, amount) {
  try {
    const response = await fetch("/api/updatetoken.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        kid_id: kidId,
        amount: amount
      })
    });

    const result = await response.json();

    if (result.status !== "success") {
      alert(result.message || "Token konnten nicht aktualisiert werden");
    }
  } catch (error) {
    console.error("Fehler beim Aktualisieren:", error);
    alert("Fehler beim Aktualisieren der Token");
  }
}

async function deleteChild(kidId) {
  try {
    const response = await fetch("/api/deletechild.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        kid_id: kidId
      })
    });

    const result = await response.json();

    if (result.status !== "success") {
      alert(result.message || "Kind konnte nicht gelöscht werden");
    }
  } catch (error) {
    console.error("Fehler beim Löschen:", error);
    alert("Fehler beim Löschen des Kindes");
  }
}

loadChildren();