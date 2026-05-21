/* ── Constants ── */
const COLORS = ['#7C6FF7', '#F4A261', '#2DC8A0', '#F06291', '#5BA4CF'];

/* ═══════════════════════════════════════
   THEME
═══════════════════════════════════════ */
const savedTheme  = localStorage.getItem('theme') || 'light';
const systemPref  = localStorage.getItem('followSystem') === 'true';

applyTheme(savedTheme);

if (systemPref) {
  document.getElementById('toggle-system').checked = true;
}

function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('theme', t);
  updateThemeCards(t);
}

function setTheme(t) {
  document.getElementById('toggle-system').checked = false;
  localStorage.setItem('followSystem', 'false');
  applyTheme(t);
}

function toggleSystem(on) {
  localStorage.setItem('followSystem', on);
  if (on) {
    const sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    applyTheme(sys);
  }
}

function updateThemeCards(t) {
  document.getElementById('theme-light').classList.toggle('selected', t === 'light');
  document.getElementById('theme-dark').classList.toggle('selected', t === 'dark');
}

// Keep in sync if the OS theme changes while the page is open
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (localStorage.getItem('followSystem') === 'true') {
    applyTheme(e.matches ? 'dark' : 'light');
  }
});

/* ═══════════════════════════════════════
   PANEL NAVIGATION
═══════════════════════════════════════ */
function openPanel(id) {
  document.getElementById(id).classList.add('active');
}

function closePanel(id) {
  document.getElementById(id).classList.remove('active');
}

/* ═══════════════════════════════════════
   FAMILY MEMBERS
═══════════════════════════════════════ */

async function loadFamily() {
  const res  = await fetch('api/family.php?action=get_family');
  const data = await res.json();

  if (data.status === 'no_family') {
    showNoFamilyUI();
    return;
  }

  // Invite-Box und Mitgliederliste wieder einblenden (falls vorher versteckt)
  document.querySelector('.invite-box').style.display = '';
  document.querySelector('.settings-card').style.display = '';
  document.querySelector('.add-form').classList.remove('no-family');

  // Einladungscode anzeigen
  document.getElementById('invite-code').textContent = data.invite_code;

  // Mitgliederliste aufbauen — mit Entfernen-Button für alle ausser sich selbst
  const currentUserId = parseInt(localStorage.getItem('user_id'));
  const list = document.getElementById('member-list');
  list.innerHTML = data.members.map((m, i) => `
    <div class="member-item">
      <div class="member-avatar" style="background:${COLORS[i % COLORS.length]}">
        ${m.firstname.charAt(0).toUpperCase()}
      </div>
      <div class="member-info">
        <strong>${m.firstname} ${m.lastname}</strong>
        <span>${m.email}</span>
      </div>
      ${m.id !== currentUserId
        ? `<button class="member-remove" onclick="removeMember(${m.id})" aria-label="Entfernen">✕</button>`
        : '<span class="member-you">Du</span>'}
    </div>
  `).join('');

  document.querySelector('.add-form').style.display = 'none';

  // Formular zurücksetzen auf normales "Hinzufügen"-Feld
  /* document.querySelector('.add-form').innerHTML = `
    <input type="text" id="new-member-input" placeholder="Einladungscode eingeben" />
    <button class="btn-add" onclick="joinByCode()">Hinzufügen</button>
  `; */
}

function showNoFamilyUI() {
  document.querySelector('.invite-box').style.display = 'none';
  document.querySelector('.settings-card').style.display = 'none';

   // NEU: Klasse hinzufügen damit alles untereinander ist
  document.querySelector('.add-form').classList.add('no-family');

  document.querySelector('.add-form').innerHTML = `
    <p style="margin-bottom:8px; font-weight:600">Du gehörst noch keiner Familie an</p>

    <input type="text" id="family-name-input" placeholder="Familienname (z.B. Familie Müller)" />
    <button class="btn-add" onclick="createFamily()">Familie erstellen</button>

    <p style="margin: 12px 0 8px; text-align:center; color: var(--text-muted)">— oder —</p>

    <input type="text" id="join-code-input" placeholder="Einladungscode (z.B. FAM-AB123)" />
    <button class="btn-add" onclick="joinFamily()">Beitreten</button>
  `;
}

async function createFamily() {
  const name = document.getElementById('family-name-input').value.trim();
  if (!name) return;

  const res  = await fetch('api/family.php?action=create_family', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ name }),
  });
  const data = await res.json();

  if (data.status === 'ok') {
    localStorage.setItem('family_id', data.family_id);
    showToast('Familie erstellt! Dein Code: ' + data.invite_code);
    loadFamily(); // Ansicht neu laden → zeigt jetzt Code + Mitglieder
  } else {
    showToast('Fehler: ' + data.message, true);
  }
}

async function joinFamily() {
  const code = document.getElementById('join-code-input').value.trim();
  if (!code) return;

  const res  = await fetch('api/family.php?action=join_family', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ invite_code: code }),
  });
  const data = await res.json();

  if (data.status === 'ok') {
    localStorage.setItem('family_id', data.family_id);
    showToast('Erfolgreich beigetreten!');
    loadFamily();
  } else {
    showToast('Ungültiger Code', true);
  }
}

async function removeMember(userId) {
  // Sicherheitsabfrage damit man nicht aus Versehen jemanden entfernt
  if (!confirm('Mitglied wirklich aus der Familie entfernen?')) return;

  const res  = await fetch('api/family.php?action=remove_member', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ remove_user_id: userId }),
  });
  const data = await res.json();

  if (data.status === 'ok') {
    showToast('Mitglied entfernt');
    loadFamily();
  } else {
    showToast('Fehler: ' + data.message, true);
  }
}

// Kleine Erfolgsmeldung unten einblenden statt alert()
// isError = true macht sie rot
function showToast(msg, isError = false) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      background: var(--color-primary, #7C6FF7); color: #fff;
      padding: 12px 24px; border-radius: 24px; font-size: 14px;
      z-index: 9999; transition: opacity 0.3s;
    `;
    document.body.appendChild(toast);
  }
  toast.style.background = isError ? '#e53935' : 'var(--color-primary, #7C6FF7)';
  toast.textContent = msg;
  toast.style.opacity = '1';
  setTimeout(() => toast.style.opacity = '0', 3000);
}

loadFamily();
/* ═══════════════════════════════════════
   INVITE CODE
═══════════════════════════════════════ */
function copyCode() {
  const code    = document.getElementById('invite-code').textContent;
  const confirm = document.getElementById('copy-confirm');

  navigator.clipboard.writeText(code).catch(() => {});

  confirm.classList.add('show');
  setTimeout(() => confirm.classList.remove('show'), 2000);
}

/* ═══════════════════════════════════════
   DELETE ACCOUNT MODAL
═══════════════════════════════════════ */
function openDeleteModal() {
  document.getElementById('delete-modal').classList.add('open');
}

function closeDeleteModal(e) {
  // Close when clicking the backdrop, or when called directly (no event)
  if (!e || e.target === document.getElementById('delete-modal')) {
    document.getElementById('delete-modal').classList.remove('open');
  }
}

function confirmDelete() {
  localStorage.clear();
  // TODO: call your backend API to actually delete the account
  alert('Account deleted. (Demo only — nothing was actually deleted.)');
  closeDeleteModal();
}