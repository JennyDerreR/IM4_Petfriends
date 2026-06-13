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

  document.querySelector('.invite-box').style.display = '';
  document.querySelector('.settings-card').style.display = '';
  document.querySelector('.add-form').classList.remove('no-family');

  document.getElementById('invite-code').textContent = data.invite_code;

  const currentUserId = parseInt(localStorage.getItem('user_id'));
  const list = document.getElementById('member-list');
  list.innerHTML = '';

  data.members.forEach((m, i) => {
    const item = document.createElement('div');
    item.classList.add('member-item');

    item.innerHTML = `
      <div class="member-avatar" style="background:${COLORS[i % COLORS.length]}">
        ${m.firstname.charAt(0).toUpperCase()}
      </div>
      <div class="member-info">
        <strong>${m.firstname} ${m.lastname}</strong>
        <span>${m.email}</span>
      </div>
      ${m.id !== currentUserId
        ? `<button class="member-remove" aria-label="Entfernen">✕</button>`
        : '<span class="member-you">Du</span>'}
    `;

    if (m.id !== currentUserId) {
      item.querySelector('.member-remove').addEventListener('click', () => removeMember(m.id));
    }

    list.appendChild(item);
  });

  document.querySelector('.add-form').style.display = 'none';
}

function showNoFamilyUI() {
  document.querySelector('.invite-box').style.display = 'none';
  document.querySelector('.settings-card').style.display = 'none';

  const addForm = document.querySelector('.add-form');
  addForm.classList.add('no-family');
  addForm.innerHTML = '';

  const descP = document.createElement('p');
  descP.style.cssText = 'margin-bottom:4px; font-weight:600';
  descP.textContent = 'Du gehörst noch keiner Familie an';

  const subP = document.createElement('p');
  subP.style.cssText = 'margin-bottom:12px; font-size:13px; color: var(--text-secondary)';
  subP.textContent = 'Um die App vollständig nutzen zu können, erstelle eine neue Familie oder tritt einer bestehenden bei.';

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.id = 'family-name-input';
  nameInput.placeholder = 'Familienname (z.B. Familie Müller)';

  const createBtn = document.createElement('button');
  createBtn.classList.add('btn-add');
  createBtn.textContent = 'Familie erstellen';
  createBtn.addEventListener('click', createFamily);

  const orP = document.createElement('p');
  orP.style.cssText = 'margin: 12px 0 8px; text-align:center; color: var(--text-muted)';
  orP.textContent = '— oder —';

  const codeInput = document.createElement('input');
  codeInput.type = 'text';
  codeInput.id = 'join-code-input';
  codeInput.placeholder = 'Einladungscode (z.B. FAM-AB123)';

  const joinBtn = document.createElement('button');
  joinBtn.classList.add('btn-add');
  joinBtn.textContent = 'Beitreten';
  joinBtn.addEventListener('click', joinFamily);

  addForm.append(descP, subP, nameInput, createBtn, orP, codeInput, joinBtn);
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
    loadFamily();
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
   PROFIL
═══════════════════════════════════════ */
async function loadProfile() {
  try {
    const res  = await fetch('api/profil.php');
    const data = await res.json();

    if (data.status === 'success') {
      document.getElementById('profileName').textContent  = data.lastname || 'Profil';
      document.getElementById('profileEmail').textContent = data.email    || '';
    }
  } catch (error) {
    console.error('Fehler beim Laden des Profils:', error);
  }
}

loadProfile();

/* ═══════════════════════════════════════
   DELETE ACCOUNT MODAL
═══════════════════════════════════════ */
function openDeleteModal() {
  document.getElementById('delete-modal').classList.add('open');
}

function closeDeleteModal(e) {
  if (!e || e.target === document.getElementById('delete-modal')) {
    document.getElementById('delete-modal').classList.remove('open');
  }
}

async function confirmDelete() {
  const res  = await fetch('api/family.php?action=delete_account', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();

  if (data.status === 'ok') {
    localStorage.clear();
    window.location.href = 'index.html';
  } else {
    showToast('Fehler beim Löschen: ' + data.message, true);
    closeDeleteModal();
  }
}

/* ═══════════════════════════════════════
   FAMILIE VERLASSEN
═══════════════════════════════════════ */
async function leaveFamily() {
  if (!confirm('Familie wirklich verlassen? Wenn du das letzte Mitglied bist, wird die Familie gelöscht.')) return;

  const res  = await fetch('api/family.php?action=leave_family', { method: 'POST' });
  const data = await res.json();

  if (data.status === 'ok') {
    showToast('Du hast die Familie verlassen');
    loadFamily();
  } else {
    showToast('Fehler: ' + data.message, true);
  }
}