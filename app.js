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

function filterLoc(el, gridId, loc) {
  el.closest('.filter-chips').querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('#' + gridId + ' .place-card').forEach(card => {
    card.style.display = (loc === 'all' || card.dataset.loc === loc || card.dataset.loc === 'multi') ? '' : 'none';
  });
}

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

// ── Dark Mode ────────────────────────────────────────────────────

function toggleDarkMode() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const next = isDark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  document.getElementById('dark-mode-btn').textContent = next === 'dark' ? '☀️' : '🌙';
}

(function () {
  const saved = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('dark-mode-btn');
    if (btn) btn.textContent = saved === 'dark' ? '☀️' : '🌙';
  });
})();

// ── Business Directory Data ──────────────────────────────────────

const BUSINESSES = {
  'adobo-experience': {
    emoji: '🍖', name: 'Adobo Experience', type: 'Filipino · Casual Dining',
    address: '📍 Memorial Dr NE, Calgary, AB',
    desc: 'Known for their authentic Filipino adobo dishes and homestyle meals. A community favourite for casual dining with familiar flavours from home.',
    tags: ['Restaurant', 'Casual Dining', 'NE Calgary'],
    search: 'Adobo Experience Calgary'
  },
  'barrio-fiesta': {
    emoji: '🥘', name: 'Barrio Fiesta', type: 'Filipino · Family Restaurant',
    address: '📍 Calgary, AB',
    desc: 'Classic Filipino comfort food in a warm, family-friendly setting. Great for group dinners and special occasions with traditional dishes.',
    tags: ['Restaurant', 'Family Style', 'Dine-In'],
    search: 'Barrio Fiesta Calgary'
  },
  'lolas-kitchen': {
    emoji: '🍜', name: "Lola's Filipino Kitchen", type: 'Filipino · Home Style Cooking',
    address: '📍 Calgary, AB',
    desc: 'Homemade meals that taste just like Lola made them. Their pork belly sinigang is a community favourite. Warm, cozy, and delicious.',
    tags: ['Restaurant', 'Home Style', 'Sinigang'],
    search: "Lola's Filipino Kitchen Calgary"
  },
  'maxs-restaurant': {
    emoji: '🍗', name: "Max's Restaurant", type: 'Filipino Chain · Fried Chicken',
    address: '📍 Calgary, AB',
    desc: "The famous Filipino chain known for their crispy fried chicken. Max's has been a household name in the Philippines for decades — now in Calgary!",
    tags: ['Restaurant', 'Chain', 'Fried Chicken'],
    search: "Max's Restaurant Calgary"
  },
  '7-seas': {
    emoji: '🦐', name: '7 Seas Seafood', type: 'Filipino · Seafood Restaurant',
    address: '📍 Calgary, AB',
    desc: 'Fresh seafood cooked Filipino-style. From kinilaw to sinuglaw, this spot is perfect for seafood lovers craving a taste of the Philippines.',
    tags: ['Restaurant', 'Seafood', 'Filipino Style'],
    search: '7 Seas Seafood Calgary Filipino'
  },
  'pacific-hut': {
    emoji: '🍛', name: 'Pacific Hut', type: 'Filipino · Casual Dining',
    address: '📍 Calgary, AB',
    desc: 'A casual neighbourhood spot serving Filipino classics. Great lunch spot with generous portions and affordable prices.',
    tags: ['Restaurant', 'Casual', 'Lunch'],
    search: 'Pacific Hut Filipino Calgary'
  },
  'amihan-grill': {
    emoji: '🍢', name: 'Amihan Grill + Bakeshop', type: 'Filipino · Grill & Street Food',
    address: '📍 Calgary, AB',
    desc: 'One of the most unique Filipino spots in Calgary — grilled plates, street food favourites, and freshly baked Filipino breads all under one roof.',
    tags: ['Restaurant', 'Bakeshop', 'Street Food', 'Grill'],
    search: 'Amihan Grill Bakeshop Calgary'
  },
  'pinoy-village': {
    emoji: '🍽', name: 'Pinoy Village', type: 'Filipino · Traditional Cuisine',
    address: '📍 Calgary, AB',
    desc: 'Traditional Filipino cuisine with a wide menu of regional dishes. A great place to explore different provinces through food.',
    tags: ['Restaurant', 'Traditional', 'Dine-In'],
    search: 'Pinoy Village Calgary Filipino restaurant'
  },
  'seafood-city': {
    emoji: '🏬', name: 'Seafood City', type: 'Full Filipino Supermarket + Food Court',
    address: '📍 3220 Sunridge Way NE, Calgary, AB T1Y 7K5',
    desc: 'The go-to Filipino supermarket chain in Calgary. Massive selection of Filipino and Asian products, fresh seafood, meats, a food court with Filipino meals, and remittance services.',
    tags: ['Grocery', 'Supermarket', 'Food Court', 'NE Calgary'],
    search: 'Seafood City Calgary NE'
  },
  'filipino-market': {
    emoji: '🏪', name: 'Filipino Market', type: 'Grocery, Baked Goods & Remittance',
    address: '📍 3803 26th Ave SW (Killarney), Calgary',
    desc: 'A beloved neighbourhood Filipino store in SW Calgary with freshly baked Filipino treats daily, authentic grocery items, personal care products, and remittance services. Welcoming owners!',
    tags: ['Grocery', 'Bakery', 'Remittance', 'SW Calgary'],
    search: 'Filipino Market 26 Ave SW Calgary'
  },
  'shanas-store': {
    emoji: '🛍', name: "Shana's Filipino Store", type: 'Filipino Products & Specialty Goods',
    address: '📍 5403 Crowchild Trl NW, Calgary',
    desc: 'Known for its authentic vibe and comprehensive selection of classic Filipino ingredients and specialty products. A trusted name in the NW Calgary Filipino community.',
    tags: ['Grocery', 'Specialty', 'NW Calgary'],
    search: "Shana's Filipino Store Calgary Crowchild"
  },
  'tatak-pinoy': {
    emoji: '🥫', name: 'Tatak Pinoy', type: 'Filipino Grocery Store',
    address: '📍 26 Midlake Blvd SE, Calgary',
    desc: 'A well-known Filipino grocery store that has been serving the community for years. Great selection of Filipino pantry staples and imported goods.',
    tags: ['Grocery', 'SE Calgary'],
    search: 'Tatak Pinoy Calgary Midlake'
  },
  'manila-convenience': {
    emoji: '🏪', name: 'Manila Convenience Store', type: 'Dry & Frozen Foods, Shipping',
    address: '📍 10325 Bonaventure Dr SE #120, Calgary',
    desc: 'Specialty store offering dry and frozen Filipino foods, beauty products, phone cards, and shipping services. Convenient one-stop shop for the SE Calgary community.',
    tags: ['Grocery', 'Shipping', 'SE Calgary'],
    search: 'Manila Convenience Store Calgary Bonaventure'
  },
  'messiahs-store': {
    emoji: '🏠', name: "Messiah's Filipino Store", type: 'Grocery, Remittance & Balikbayan Box',
    address: '📍 328 Centre St SE #162, Calgary (Downtown)',
    desc: 'One-stop shop in Downtown Calgary with Filipino goods, remittance services, Balikbayan box services, and home delivery available for orders $50 and up.',
    tags: ['Grocery', 'Remittance', 'Balikbayan Box', 'Downtown'],
    search: "Messiah's Filipino Store Calgary Centre St"
  },
  'bhe-bhe': {
    emoji: '🛒', name: "Bhe-Bhe's", type: 'Filipino Grocery',
    address: '📍 Calgary, AB',
    desc: 'A trusted Filipino grocery store in Calgary carrying a wide selection of Filipino pantry staples, snacks, and imported goods.',
    tags: ['Grocery', 'Filipino Goods'],
    search: "Bhe-Bhe's Filipino grocery Calgary"
  },
  'amihan-bakery': {
    emoji: '🍢', name: 'Amihan Grill + Bakeshop', type: 'Filipino Grill, Bakeshop & Street Food',
    address: '📍 3 Locations — SW, SE & NE Calgary',
    desc: 'One of the most popular Filipino spots in Calgary with three locations! Known for their grilled dishes, street food favourites, and freshly baked Filipino breads and pastries.',
    tags: ['Bakeshop', 'Grill', 'Street Food', 'SW', 'SE', 'NE'],
    search: 'Amihan Grill Bakeshop Calgary'
  },
  'purple-yum': {
    emoji: '🍰', name: 'Purple Yum Cakes & Pastries Ltd.', type: 'Custom Cakes & Filipino Pastries',
    address: '📍 735 Ranchlands Blvd NW, Calgary',
    desc: 'Beautiful custom cakes and authentic Filipino pastries. Known for their ube creations and stunning cake designs for birthdays, weddings, and special occasions.',
    tags: ['Bakery', 'Custom Cakes', 'Ube', 'NW Calgary'],
    search: 'Purple Yum Cakes Pastries Calgary Ranchlands'
  },
  'the-js': {
    emoji: '🍞', name: "The J's Restaurant & Bakery", type: 'Filipino Restaurant & Bakery',
    address: '📍 4909 17 Ave SE Suite 203, Calgary',
    desc: 'A Filipino restaurant and bakery combo in SE Calgary. Enjoy freshly baked Filipino breads alongside homestyle Filipino meals — all under one roof.',
    tags: ['Bakery', 'Restaurant', 'SE Calgary'],
    search: "The J's Restaurant Bakery Calgary 17 Ave SE"
  },
  'red-box-gourmet': {
    emoji: '🎁', name: 'The Red Box Gourmet', type: 'Filipino Gourmet & Baked Goods',
    address: '📍 3220 5 Ave NE, Calgary',
    desc: 'Gourmet Filipino baked goods and specialty treats. A hidden gem in NE Calgary offering unique and flavourful Filipino-inspired pastries and snacks.',
    tags: ['Bakery', 'Gourmet', 'NE Calgary'],
    search: 'Red Box Gourmet Calgary 5 Ave NE'
  },
  'loriz-pilipino': {
    emoji: '🥐', name: 'Loriz Pilipino Bakery & Convenience', type: 'Filipino Bakery & Convenience Store',
    address: '📍 Bridlecrest, SW Calgary',
    desc: 'A Filipino bakery and convenience store serving the SW Calgary community. Carries freshly baked Filipino breads, kakanin, and everyday Filipino grocery items.',
    tags: ['Bakery', 'Convenience', 'Kakanin', 'SW Calgary'],
    search: 'Loriz Pilipino Bakery Calgary Bridlecrest'
  },
  'mang-pedros': {
    emoji: '🎂', name: "Mang Pedro's Bakery", type: 'Filipino Bakery',
    address: '📍 4068 Ogden Rd SE, Calgary',
    desc: 'A well-loved Filipino bakery in SE Calgary. Famous for their classic pandesal, ensaymada, and a wide variety of Filipino baked treats made fresh daily.',
    tags: ['Bakery', 'Pandesal', 'SE Calgary'],
    search: "Mang Pedro's Bakery Calgary Ogden"
  },
  'aling-mellys': {
    emoji: '🍞', name: "Aling Melly's", type: 'Filipino Bakery & Pastries',
    address: '📍 NE Calgary',
    desc: 'A beloved Filipino bakery known for freshly baked pandesal, kakanin, and classic Filipino pastries. Community favourite for merienda and pasalubong.',
    tags: ['Bakery', 'Pandesal', 'Kakanin', 'NE Calgary'],
    search: "Aling Melly's Filipino bakery Calgary"
  },
  'aling-rosing': {
    emoji: '🎂', name: "Aling Rosing", type: 'Filipino Baked Goods',
    address: '📍 NW Calgary',
    desc: 'Homemade Filipino baked goods made with love. Known for their soft pandesal, ensaymada, and traditional Filipino breads and sweets.',
    tags: ['Bakery', 'Ensaymada', 'NW Calgary'],
    search: "Aling Rosing Filipino bakery Calgary"
  },
  'loriz-pilipino': {
    emoji: '🥐', name: "Loriz Pilipino", type: 'Filipino Breads & Kakanin',
    address: '📍 NE Calgary',
    desc: 'Specializes in traditional Filipino breads and kakanin including puto, kutsinta, bibingka, and biko. A go-to for authentic Filipino rice cakes.',
    tags: ['Bakery', 'Kakanin', 'Rice Cakes', 'NE Calgary'],
    search: "Loriz Pilipino Filipino Calgary"
  },
  'markjoels-bbq': {
    emoji: '🍢', name: "Markjoel's BBQ", type: 'Filipino BBQ & Street Food',
    address: '📍 SE Calgary',
    desc: 'Famous for Filipino-style BBQ skewers, isaw, and street food favourites. Perfect for parties and gatherings — order by the batch.',
    tags: ['BBQ', 'Street Food', 'Catering', 'SE Calgary'],
    search: "Markjoel's BBQ Filipino Calgary"
  },
  'nimbly-market': {
    emoji: '📦', name: 'Nimbly Market', type: 'Online Filipino Grocery · Delivery',
    address: '📍 Online · Delivers across Calgary',
    desc: "Canada's first licensed online Filipino grocery store. Shop from home and get authentic Filipino products delivered to your door. Also serves Grande Prairie.",
    tags: ['Online', 'Delivery', 'Grocery'],
    search: 'Nimbly Market Filipino grocery Calgary delivery'
  }
};

let _currentBizId = null;
let _selectedStar = 0;

function pickStar(val) {
  _selectedStar = val;
  document.querySelectorAll('#star-picker span').forEach((s, i) => {
    s.classList.toggle('active', i < val);
  });
}

async function openBusiness(id) {
  const b = BUSINESSES[id];
  if (!b) return;

  _currentBizId = id;
  _selectedStar = 0;
  document.querySelectorAll('#star-picker span').forEach(s => s.classList.remove('active'));
  document.getElementById('review-comment').value = '';

  document.getElementById('biz-emoji').textContent = b.emoji;
  document.getElementById('biz-name').textContent = b.name;
  document.getElementById('biz-type').textContent = b.type;
  document.getElementById('biz-address').innerHTML = b.address;
  document.getElementById('biz-desc').textContent = b.desc;
  document.getElementById('biz-tags').innerHTML = b.tags.map(t => `<span class="tag">${t}</span>`).join('');

  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(b.search + ' reviews')}`;
  const mapsUrl   = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.name + ' Calgary')}`;
  document.getElementById('biz-google-link').href = googleUrl;
  document.getElementById('biz-maps-link').href   = mapsUrl;

  // show/hide review form based on login
  const { data: { session } } = await _supabase.auth.getSession();
  document.getElementById('biz-review-form-wrap').style.display = session ? 'block' : 'none';
  document.getElementById('biz-review-login-prompt').style.display = session ? 'none' : 'block';

  openModal('businessModal');
  loadBusinessReviews(id);
}

async function loadBusinessReviews(bizId) {
  const list = document.getElementById('biz-reviews-list');
  list.innerHTML = '<div style="font-size:13px;color:var(--gray-400);text-align:center;padding:16px 0">Loading reviews...</div>';

  const { data, error } = await _supabase
    .from('reviews')
    .select('*')
    .eq('business_id', bizId)
    .eq('approved', true)
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) {
    list.innerHTML = '<div style="font-size:13px;color:var(--gray-400);text-align:center;padding:16px 0">No reviews yet — be the first! 🌟</div>';
    return;
  }

  list.innerHTML = data.map(r => {
    const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
    const date  = new Date(r.created_at).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
    return `
      <div class="review-card">
        <div class="review-card-header">
          <span class="review-card-name">${r.reviewer_name || 'Community Member'}</span>
          <span class="review-card-stars">${stars}</span>
        </div>
        <div class="review-card-date">${date}</div>
        <div class="review-card-comment">${r.comment}</div>
      </div>`;
  }).join('');
}

async function submitReview(event) {
  event.preventDefault();
  if (!_selectedStar) { alert('Please pick a star rating!'); return; }

  const { data: { session } } = await _supabase.auth.getSession();
  if (!session) return;

  const { data: profile } = await _supabase.from('profiles').select('full_name').eq('id', session.user.id).single();
  const name = profile?.full_name || session.user.email;
  const comment = document.getElementById('review-comment').value.trim();

  const { error } = await _supabase.from('reviews').insert({
    business_id:   _currentBizId,
    user_id:       session.user.id,
    reviewer_name: name,
    rating:        _selectedStar,
    comment
  });

  if (error) { alert('Error posting review: ' + error.message); return; }

  document.getElementById('review-comment').value = '';
  pickStar(0);
  loadBusinessReviews(_currentBizId);
}

// ── Events ───────────────────────────────────────────────────────

const EVENT_GRADIENTS = {
  Cultural:     'linear-gradient(135deg,#1B3A6B14,#F7B73120)',
  Sports:       'linear-gradient(135deg,#CE112614,#F7B73120)',
  Food:         'linear-gradient(135deg,#2D5BA814,#F7B73120)',
  Community:    'linear-gradient(135deg,#F7B73114,#1B3A6B14)',
  Professional: 'linear-gradient(135deg,#1B3A6B14,#2D5BA814)',
  Religious:    'linear-gradient(135deg,#F7B73114,#FFF8F0)',
};

let _allEvents = [];

function renderEventCard(e) {
  const d = new Date(e.event_date + 'T00:00:00');
  const dateStr = d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
  const bg = EVENT_GRADIENTS[e.category] || EVENT_GRADIENTS.Community;
  const timeStr = e.time_start ? `🕐 ${e.time_start}${e.time_end ? ' – ' + e.time_end : ''}` : '';
  const desc = e.description ? e.description.substring(0, 80) + (e.description.length > 80 ? '...' : '') : '';
  return `
    <div class="event-card" data-cat="${e.category}">
      <div class="event-img" style="background:${bg}">${e.emoji || '🎉'}
        <span class="event-date-chip">${dateStr}</span>
        <span class="event-cat-chip">${e.category}</span>
      </div>
      <div class="event-body">
        <div class="event-title">${e.title}</div>
        ${e.location ? `<div class="event-meta-item">📍 ${e.location}</div>` : ''}
        ${timeStr ? `<div class="event-meta-item">${timeStr}</div>` : ''}
        <div class="event-meta-item">🎟 ${e.price || 'Free'}</div>
      </div>
      <div class="event-footer"><span class="event-rsvp" style="font-size:12px;color:var(--gray-400)">${desc}</span><button class="btn-sm">RSVP</button></div>
    </div>`;
}

async function loadEvents() {
  const { data, error } = await _supabase
    .from('events')
    .select('*')
    .eq('approved', true)
    .order('event_date', { ascending: true });

  const grid = document.getElementById('events-grid');
  if (error || !data || data.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--gray-400)">No events found.</div>';
    return;
  }
  _allEvents = data;
  grid.innerHTML = data.map(renderEventCard).join('');

  // also update home page upcoming events (next 3)
  const homeGrid = document.getElementById('home-events-grid');
  if (homeGrid) {
    const upcoming = data.slice(0, 3);
    homeGrid.innerHTML = upcoming.map(renderEventCard).join('');
  }
}

async function handleSubmitEvent(event) {
  event.preventDefault();
  const { data: { session } } = await _supabase.auth.getSession();
  if (!session) { alert('Please log in to submit an event.'); return; }

  const timeStart = document.getElementById('evt-time-start').value;
  const timeEnd   = document.getElementById('evt-time-end').value;

  function fmtTime(t) {
    if (!t) return null;
    const [h, m] = t.split(':');
    const hr = parseInt(h);
    return `${hr % 12 || 12}:${m} ${hr < 12 ? 'AM' : 'PM'}`;
  }

  const { error } = await _supabase.from('events').insert({
    title:        document.getElementById('evt-title').value.trim(),
    category:     document.getElementById('evt-category').value,
    event_date:   document.getElementById('evt-date').value,
    time_start:   fmtTime(timeStart),
    time_end:     fmtTime(timeEnd),
    location:     document.getElementById('evt-location').value.trim(),
    price:        document.getElementById('evt-price').value.trim() || 'Free',
    description:  document.getElementById('evt-desc').value.trim(),
    emoji:        '🎉',
    submitted_by: session.user.id
  });

  if (error) { alert('Error submitting event: ' + error.message); return; }

  closeModal('addEventModal');
  alert('Event submitted! 🎉');
  loadEvents();
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

  document.getElementById('nav-profile-link').textContent = 'My Profile';
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
  const path = `${session.user.id}/avatar_${Date.now()}.${ext}`;

  const { error: upErr } = await _supabase.storage.from('avatars').upload(path, file);
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

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  loadEvents();
});

// ── Sign Up / Log In ─────────────────────────────────────────────

function switchAuthTab(tab) {
  document.getElementById('auth-signup').style.display = tab === 'signup' ? 'block' : 'none';
  document.getElementById('auth-login').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('tab-btn-signup').classList.toggle('active', tab === 'signup');
  document.getElementById('tab-btn-login').classList.toggle('active', tab === 'login');
}

async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  const { data, error } = await _supabase.auth.signInWithPassword({ email, password });
  if (error) { alert(error.message); return; }

  closeModal('joinModal');
  showSection('profile');
  setNavActiveByName('My Profile');
}

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
