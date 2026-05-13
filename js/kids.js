const childrenContainer = document.getElementById("childrenContainer");

const children = [
  {
    name: "Emma",
    tokens: 45,
    levelTarget: 50
  }
];

function renderChildren() {
  childrenContainer.innerHTML = "";

  children.forEach((child, index) => {
    const progress = Math.min((child.tokens / child.levelTarget) * 100, 100);
    const firstLetter = child.name.charAt(0).toUpperCase();

    const card = document.createElement("article");
    card.classList.add("child-card");

    card.innerHTML = `
      <div class="child-top">
        <div class="child-info">
          <div class="avatar">${firstLetter}</div>

          <div>
            <h2 class="child-name">${child.name}</h2>
            <p class="tokens">🪙 ${child.tokens} Token</p>
          </div>
        </div>

        <div class="star-box">⭐ 28</div>
      </div>

      <div class="progress-info">
        <span>Fortschritt zum nächsten Level</span>
        <span>${child.tokens}/${child.levelTarget}</span>
      </div>

      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>

      <div class="actions">
        <button class="add-token" data-index="${index}">＋ Token</button>
        <button class="redeem" data-index="${index}">🎁 Einlösen</button>
        <button class="delete" data-index="${index}">🗑</button>
      </div>
    `;

    childrenContainer.appendChild(card);
  });
}

childrenContainer.addEventListener("click", (event) => {
  const button = event.target.closest("button");

  if (!button) return;

  const index = Number(button.dataset.index);

  if (button.classList.contains("add-token")) {
    children[index].tokens += 1;
  }

  if (button.classList.contains("redeem")) {
    if (children[index].tokens > 0) {
      children[index].tokens -= 5;
    }
  }

  if (button.classList.contains("delete")) {
    children.splice(index, 1);
  }

  renderChildren();
});

renderChildren();