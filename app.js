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

// ── Auth & Profile ───────────────────────────────────────────────

async function initAuth() {
  const { data: { session } } = await _supabase.auth.getSession();
  if (session) {
    await loadProfile(session.user);
    showNavProfile(session.user);
  }

  _supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session) {
      await loadProfile(session.user);
      showNavProfile(session.user);
    } else {
      showNavJoin();
    }
  });
}

function showNavProfile(user) {
  document.getElementById('join-community-btn').style.display = 'none';
  document.getElementById('nav-profile-link').style.display = '';

  const initial = (user.email || 'U')[0].toUpperCase();
  document.getElementById('nav-profile-link').innerHTML = `<span class="nav-profile-avatar" id="nav-avatar-wrap">${initial}</span> My Profile`;
}

function showNavJoin() {
  document.getElementById('join-community-btn').style.display = '';
  document.getElementById('nav-profile-link').style.display = 'none';
}

async function loadProfile(user) {
  const { data } = await _supabase.from('profiles').select('*').eq('id', user.id).single();
  const p = data || {};

  document.getElementById('profile-display-name').textContent = p.full_name || user.email;
  document.getElementById('profile-display-email').textContent = user.email;

  const loc = [];
  if (p.hometown) loc.push('🇵🇭 ' + p.hometown);
  if (p.neighbourhood) loc.push('📍 ' + p.neighbourhood);
  document.getElementById('profile-display-hometown').textContent = loc.join('   ');

  document.getElementById('profile-display-bio').textContent = p.bio || 'No bio yet. Click Edit Profile to add one.';

  const tagsEl = document.getElementById('profile-tags');
  tagsEl.innerHTML = '';
  if (p.occupation) tagsEl.innerHTML += `<span class="tag">${p.occupation}</span>`;
  if (p.hometown) tagsEl.innerHTML += `<span class="tag tag-gold">From ${p.hometown}</span>`;
  if (p.neighbourhood) tagsEl.innerHTML += `<span class="tag">${p.neighbourhood}</span>`;

  if (p.avatar_url) {
    const img = document.getElementById('profile-avatar-img');
    img.src = p.avatar_url;
    img.classList.add('loaded');
    document.getElementById('profile-avatar-placeholder').style.display = 'none';
    const navWrap = document.getElementById('nav-avatar-wrap');
    if (navWrap) navWrap.innerHTML = `<img src="${p.avatar_url}" alt="">`;
  }

  document.getElementById('edit-name').value = p.full_name || '';
  document.getElementById('edit-nickname').value = p.nickname || '';
  document.getElementById('edit-hometown').value = p.hometown || '';
  document.getElementById('edit-neighbourhood').value = p.neighbourhood || '';
  document.getElementById('edit-bio').value = p.bio || '';
  document.getElementById('edit-occupation').value = p.occupation || '';
}

function toggleProfileEdit() {
  const form = document.getElementById('profile-edit-form');
  const display = document.getElementById('profile-info-display');
  const editing = form.style.display !== 'none';
  form.style.display = editing ? 'none' : 'block';
  display.style.display = editing ? 'block' : 'none';
  document.getElementById('edit-profile-btn').textContent = editing ? 'Edit Profile' : 'Cancel';
}

async function handleProfileSave(event) {
  event.preventDefault();
  const { data: { session } } = await _supabase.auth.getSession();
  if (!session) return;

  const updates = {
    id: session.user.id,
    full_name: document.getElementById('edit-name').value.trim(),
    nickname: document.getElementById('edit-nickname').value.trim(),
    hometown: document.getElementById('edit-hometown').value.trim(),
    neighbourhood: document.getElementById('edit-neighbourhood').value.trim(),
    bio: document.getElementById('edit-bio').value.trim(),
    occupation: document.getElementById('edit-occupation').value.trim(),
    updated_at: new Date().toISOString()
  };

  const { error } = await _supabase.from('profiles').upsert(updates);
  if (error) { alert('Error saving: ' + error.message); return; }

  await loadProfile(session.user);
  toggleProfileEdit();
}

async function handleAvatarUpload(input) {
  const file = input.files[0];
  if (!file) return;
  const { data: { session } } = await _supabase.auth.getSession();
  if (!session) return;

  const ext = file.name.split('.').pop();
  const path = `${session.user.id}/avatar.${ext}`;

  const { error: upErr } = await _supabase.storage.from('avatars').upload(path, file, { upsert: true });
  if (upErr) { alert('Upload error: ' + upErr.message); return; }

  const { data: { publicUrl } } = _supabase.storage.from('avatars').getPublicUrl(path);
  const bust = publicUrl + '?t=' + Date.now();

  await _supabase.from('profiles').upsert({ id: session.user.id, avatar_url: publicUrl });

  const img = document.getElementById('profile-avatar-img');
  img.src = bust;
  img.classList.add('loaded');
  document.getElementById('profile-avatar-placeholder').style.display = 'none';
  const navWrap = document.getElementById('nav-avatar-wrap');
  if (navWrap) navWrap.innerHTML = `<img src="${bust}" alt="">`;
}

async function handleSignOut() {
  await _supabase.auth.signOut();
  showSection('home');
  setNavActiveByName('Home');
}

document.addEventListener('DOMContentLoaded', initAuth);

// ── Sign Up ──────────────────────────────────────────────────────

async function handleSignUp(event) {
  event.preventDefault();
  const name          = document.getElementById('signup-name').value.trim();
  const email         = document.getElementById('signup-email').value.trim();
  const password      = document.getElementById('signup-password').value;
  const hometown      = document.getElementById('signup-hometown').value.trim();
  const neighbourhood = document.getElementById('signup-neighbourhood').value.trim();

  const { data, error } = await _supabase.auth.signUp({ email, password });
  if (error) { alert(error.message); return; }

  await _supabase.from('profiles').insert({
    id: data.user.id,
    full_name: name,
    hometown: hometown + (neighbourhood ? ' · ' + neighbourhood : '')
  });

  alert('Welcome! Check your email to confirm your account 🎉');
  closeModal('joinModal');
}
