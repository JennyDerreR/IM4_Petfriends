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
let members = JSON.parse(localStorage.getItem('members') || '[]');

if (!members.length) {
  members = [
    { name: 'Familie test', role: 'Admin',   color: COLORS[0] },
    { name: 'Kind 1',       role: 'Kind',    color: COLORS[2] },
  ];
  saveMembers();
}

renderMembers();

function saveMembers() {
  localStorage.setItem('members', JSON.stringify(members));
}

function renderMembers() {
  const list = document.getElementById('member-list');
  list.innerHTML = members.map((m, i) => `
    <div class="member-item">
      <div class="member-avatar" style="background:${m.color}">
        ${m.name.charAt(0).toUpperCase()}
      </div>
      <div class="member-info">
        <strong>${m.name}</strong>
        <span>${m.role}</span>
      </div>
      ${i > 0
        ? `<button class="member-remove" onclick="removeMember(${i})" aria-label="Remove ${m.name}">✕</button>`
        : ''}
    </div>
  `).join('');
}

function addMember() {
  const input = document.getElementById('new-member-input');
  const val   = input.value.trim();
  if (!val) return;

  members.push({
    name:  val,
    role:  'Mitglied',
    color: COLORS[members.length % COLORS.length],
  });

  saveMembers();
  renderMembers();
  input.value = '';
}

function removeMember(i) {
  members.splice(i, 1);
  saveMembers();
  renderMembers();
}

// Allow pressing Enter to add a member
document.getElementById('new-member-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') addMember();
});

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