// ── Section Navigation ──────────────────────────────────────────

function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setNavActive(el) {
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  el.classList.add('active');
}

function setNavActiveByName(name) {
  const clean = s => s.replace(/[^\w\s&]/g, '').trim().toLowerCase();
  document.querySelectorAll('.nav-link').forEach(l => {
    if (clean(l.textContent) === clean(name)) {
      document.querySelectorAll('.nav-link').forEach(x => x.classList.remove('active'));
      l.classList.add('active');
    }
  });
}

// ── Tab Switching ────────────────────────────────────────────────

function switchSubTab(btn, tabId) {
  const container = btn.closest('.section-container') || btn.closest('.section');
  container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  container.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(tabId).classList.add('active');
}

// ── Filter Chips ─────────────────────────────────────────────────

function filterChip(chip, gridId, category) {
  chip.closest('.filter-chips').querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.querySelectorAll('[data-cat]').forEach(card => {
    card.style.display = (category === 'all' || card.dataset.cat === category) ? '' : 'none';
  });
}

// ── Modals ───────────────────────────────────────────────────────

function openModal(id) {
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// Close modal when clicking outside of it
document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', e => {
    if (e.target === o) o.classList.remove('open');
  });
});

// ── Hometown Match ───────────────────────────────────────────────

function selectProvince(card, province) {
  document.querySelectorAll('.province-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  document.getElementById('province-select').value = province;
  showMatchResults(province);
}

function showMatchResults(province) {
  if (!province) return;
  document.getElementById('match-title').textContent = 'Members from ' + province + ' in Calgary';
  const r = document.getElementById('match-results');
  r.style.display = 'block';
  setTimeout(() => r.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
}
