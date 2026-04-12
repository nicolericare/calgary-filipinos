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

function openEditListing(idOrObj) {
  const s = typeof idOrObj === 'string' ? _myListings[idOrObj] : idOrObj;
  if (!s) return;
  const select = document.getElementById('dir-category-select');
  const knownOptions = Array.from(select.options).map(o => o.value);

  if (knownOptions.includes(s.category)) {
    select.value = s.category;
    document.getElementById('dir-other-category-wrap').style.display = 'none';
  } else {
    select.value = 'other';
    document.getElementById('dir-other-category-wrap').style.display = '';
    document.getElementById('dir-other-category-input').value = s.category || '';
  }

  document.getElementById('dir-edit-id').value = s.id;
  document.getElementById('dir-emoji').value = s.emoji || '';
  document.querySelectorAll('#dir-emoji-picker .emoji-opt').forEach(e => {
    e.classList.toggle('selected', e.textContent.trim() === s.emoji);
  });
  document.getElementById('dir-name').value = s.name || '';
  document.getElementById('dir-desc').value = s.description || '';
  document.getElementById('dir-location').value = s.location || '';
  document.getElementById('dir-website').value = s.website || '';
  document.getElementById('dir-instagram').value = s.instagram || '';
  document.getElementById('dir-facebook').value = s.facebook || '';
  document.getElementById('dir-contact').value = s.contact || '';
  document.getElementById('dir-modal-title').textContent = 'Edit Your Listing ✏️';
  document.getElementById('dir-submit-btn').textContent = 'Save Changes';
  openModal('addDirectoryModal');
}

async function handleDirectorySubmit() {
  const categorySelect = document.getElementById('dir-category-select');
  const category = categorySelect.value === 'other'
    ? document.getElementById('dir-other-category-input').value.trim()
    : categorySelect.value;
  const name = document.getElementById('dir-name').value.trim();

  if (!category) { alert('Please select a category.'); return; }
  if (!name) { alert('Please enter a name or business name.'); return; }

  const btn = document.getElementById('dir-submit-btn');
  const isEdit = !!document.getElementById('dir-edit-id').value.trim();
  btn.disabled = true;
  btn.textContent = 'Submitting...';

  try {
    const { data: { session } } = await _supabase.auth.getSession();
    const editId = document.getElementById('dir-edit-id').value.trim();

    const payload = {
      category,
      name,
      description: document.getElementById('dir-desc').value.trim(),
      location:    document.getElementById('dir-location').value.trim(),
      website:     document.getElementById('dir-website').value.trim() || null,
      instagram:   document.getElementById('dir-instagram').value.trim() || null,
      facebook:    document.getElementById('dir-facebook').value.trim() || null,
      contact:     document.getElementById('dir-contact').value.trim() || null,
      emoji:       document.getElementById('dir-emoji').value || null,
    };

    let error;

    if (editId) {
      ({ error } = await _supabase.from('directory_submissions').update(payload).eq('id', editId));
      if (error) { alert('Error saving: ' + error.message); return; }
      const userId = session?.user?.id;
      closeModal('addDirectoryModal');
      showToast('✅ Listing updated!');
      if (userId) { loadMySubmissions(userId); loadDirectorySubmissions(); }
    } else {
      ({ error } = await _supabase.from('directory_submissions').insert({ ...payload, submitted_by: session?.user?.id || null }));
      if (error) { alert('Error submitting: ' + error.message); return; }
      document.getElementById('dir-form-body').style.display = 'none';
      document.getElementById('dir-success-msg').style.display = '';
    }
  } catch (e) {
    alert('Something went wrong: ' + e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = isEdit ? 'Save Changes' : 'Submit Listing';
  }
}

// Reset directory modal when closed
const _origCloseModal = window.closeModal;
document.addEventListener('DOMContentLoaded', () => {
  const origClose = window.closeModal;
  window.closeModal = function(id) {
    origClose(id);
    if (id === 'joinModal') {
      document.getElementById('join-modal-title').style.display = '';
      document.querySelector('#joinModal .tab-nav').style.display = '';
      document.getElementById('auth-signup').style.display = '';
      document.getElementById('signup-welcome-msg').style.display = 'none';
    }
    if (id === 'addEventModal') {
      document.getElementById('evt-form-body').style.display = '';
      document.getElementById('evt-success-msg').style.display = 'none';
      document.getElementById('evt-edit-id').value = '';
      document.querySelector('#addEventModal .modal-header .modal-title').textContent = 'Submit an Event 🎉';
      document.querySelector('#evt-form-body button[type="submit"]').textContent = 'Submit Event 🎉';
    }
    if (id === 'addDirectoryModal') {
      document.getElementById('dir-form-body').style.display = '';
      document.getElementById('dir-success-msg').style.display = 'none';
      document.getElementById('dir-edit-id').value = '';
      document.getElementById('dir-modal-title').textContent = 'Add a Directory Listing 📋';
      document.getElementById('dir-submit-btn').textContent = 'Submit Listing';
      document.getElementById('dir-category-select').value = '';
      document.getElementById('dir-other-category-wrap').style.display = 'none';
      document.getElementById('dir-other-category-input').value = '';
      document.getElementById('dir-name').value = '';
      document.getElementById('dir-desc').value = '';
      document.getElementById('dir-location').value = '';
      document.getElementById('dir-website').value = '';
      document.getElementById('dir-instagram').value = '';
      document.getElementById('dir-facebook').value = '';
      document.getElementById('dir-contact').value = '';
      document.getElementById('dir-emoji').value = '';
      document.querySelectorAll('#dir-emoji-picker .emoji-opt').forEach(e => e.classList.remove('selected'));
    }
  };
});

function pickDirEmoji(el, emoji) {
  document.querySelectorAll('#dir-emoji-picker .emoji-opt').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById('dir-emoji').value = emoji;
}

function toggleOtherCategory(select) {
  const wrap = document.getElementById('dir-other-category-wrap');
  wrap.style.display = select.value === 'other' ? '' : 'none';
  if (select.value !== 'other') document.getElementById('dir-other-category-input').value = '';
}

function showToast(msg) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#1e293b;color:#fff;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:500;z-index:9999;opacity:0;transition:opacity 0.2s;pointer-events:none;white-space:nowrap';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 2500);
}

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
  Concerts:     'linear-gradient(135deg,#6D28D914,#EC489920)',
  Rave:         'linear-gradient(135deg,#7C3AED14,#F43F5E20)',
  Hiking:       'linear-gradient(135deg,#16A34A14,#84CC1620)',
  Running:      'linear-gradient(135deg,#EA580C14,#F97316 20)',
  Networking:   'linear-gradient(135deg,#0EA5E914,#6366F120)',
};

let _allEvents = [];
const _myListings = {};
const _myEvents = {};

function renderEventCard(e, poster) {
  const dateVal = e.date || e.event_date;
  const d = new Date(dateVal + 'T00:00:00');
  const dateStr = d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
  const bg = EVENT_GRADIENTS[e.category] || EVENT_GRADIENTS.Community;
  const desc = e.description ? e.description.substring(0, 80) + (e.description.length > 80 ? '...' : '') : '';
  const rsvpBtn = e.external_url
    ? `<a href="${e.external_url}" target="_blank" class="btn-sm" style="text-decoration:none">RSVP</a>`
    : `<button class="btn-sm" id="rsvp-btn-${e.id}" onclick="handleRSVP('${e.id}')">RSVP</button>`;

  let posterHtml = '';
  if (poster) {
    const name = poster.full_name || 'Community Member';
    const avatar = poster.avatar_url ? `<img src="${poster.avatar_url}" style="width:24px;height:24px;border-radius:50%;object-fit:cover;margin-right:6px">` : `<span style="width:24px;height:24px;border-radius:50%;background:var(--gray-200);display:inline-flex;align-items:center;justify-content:center;font-size:12px;margin-right:6px">👤</span>`;
    const connectBtn = `<button class="btn-sm connect-event-btn" id="connect-btn-${e.id}" data-poster-id="${poster.id}" data-contact="${poster.contact_link || ''}" onclick="sendConnectRequest('${poster.id}','connect-btn-${e.id}')" style="padding:3px 10px;font-size:11px;margin-left:auto">Connect</button>`;
    posterHtml = `<div style="display:flex;align-items:center;gap:6px;padding:8px 16px;border-top:1px solid var(--gray-100);font-size:12px;color:var(--gray-500)">${avatar}<span>${name}</span>${connectBtn}</div>`;
  }

  return `
    <div class="event-card" data-cat="${e.category}">
      <div class="event-img" style="background:${bg}">🎉
        <span class="event-date-chip">${dateStr}</span>
        <span class="event-cat-chip">${e.category}</span>
      </div>
      <div class="event-body">
        <div class="event-title">${e.title}</div>
        ${e.location ? `<div class="event-meta-item">📍 ${e.location}</div>` : ''}
        <div class="event-meta-item">🎟 Free</div>
      </div>
      <div class="event-footer"><span class="event-rsvp" style="font-size:12px;color:var(--gray-400)">${desc}</span>${rsvpBtn}</div>
      ${posterHtml}
    </div>`;
}

async function handleRSVP(eventId) {
  const { data: { session } } = await _supabase.auth.getSession();
  if (!session) {
    openModal('joinModal');
    return;
  }

  const btn = document.getElementById(`rsvp-btn-${eventId}`);
  btn.disabled = true;

  // Check if already RSVP'd
  const { data: existing } = await _supabase.from('rsvps').select('id').eq('event_id', eventId).eq('user_id', session.user.id).single();

  if (existing) {
    // Un-RSVP
    await _supabase.from('rsvps').delete().eq('event_id', eventId).eq('user_id', session.user.id);
    btn.textContent = 'RSVP';
    btn.style.background = '';
    btn.style.color = '';
    btn.disabled = false;
    showToast('RSVP removed.');
    return;
  }

  const { error } = await _supabase.from('rsvps').insert({ event_id: eventId, user_id: session.user.id });
  if (error) { alert('Error: ' + error.message); btn.disabled = false; return; }

  btn.textContent = "✓ Going!";
  btn.style.background = 'var(--green, #22c55e)';
  btn.style.color = '#fff';
  btn.disabled = false;
  showToast("🎉 You're going!");
}

async function sendConnectRequest(toUserId, btnId) {
  const { data: { session } } = await _supabase.auth.getSession();
  if (!session) { openModal('joinModal'); return; }

  const btn = document.getElementById(btnId);
  if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }

  // Check existing request
  const { data: existing } = await _supabase
    .from('connection_requests')
    .select('id, status')
    .eq('from_user_id', session.user.id)
    .eq('to_user_id', toUserId)
    .maybeSingle();

  if (existing) {
    if (existing.status === 'pending') {
      showToast('Request already sent — waiting for approval.');
      if (btn) { btn.textContent = 'Requested'; btn.style.opacity = '0.6'; }
      return;
    }
    if (existing.status === 'accepted') {
      const contact = btn?.dataset.contact;
      showToast('You are already connected!');
      if (btn) {
        btn.textContent = '✓ Connected';
        btn.style.background = 'var(--green, #22c55e)';
        btn.style.color = '#fff';
        btn.disabled = false;
        if (contact) btn.onclick = () => window.open(contact.startsWith('http') ? contact : 'https://' + contact, '_blank');
      }
      return;
    }
  }

  const { error } = await _supabase.from('connection_requests').insert({
    from_user_id: session.user.id,
    to_user_id: toUserId
  });

  if (error) {
    alert('Error sending request: ' + error.message);
    if (btn) { btn.disabled = false; btn.textContent = 'Connect'; }
    return;
  }

  showToast('👋 Connection request sent!');
  if (btn) { btn.textContent = 'Requested'; btn.disabled = true; btn.style.opacity = '0.6'; }
}

async function loadMyConnections(userId) {
  const card = document.getElementById('my-connections-card');
  const list = document.getElementById('my-connections-list');
  if (!card || !list) return;

  // Fetch accepted connections in both directions
  const [sentRes, receivedRes] = await Promise.all([
    _supabase.from('connection_requests').select('to_user_id').eq('from_user_id', userId).eq('status', 'accepted'),
    _supabase.from('connection_requests').select('from_user_id').eq('to_user_id', userId).eq('status', 'accepted')
  ]);

  const connectedIds = [
    ...(sentRes.data || []).map(r => r.to_user_id),
    ...(receivedRes.data || []).map(r => r.from_user_id)
  ];

  if (connectedIds.length === 0) {
    card.style.display = 'none';
    return;
  }

  card.style.display = '';

  const { data: profiles } = await _supabase.from('profiles').select('id, full_name, avatar_url, contact_link, occupation').in('id', connectedIds);
  if (!profiles || profiles.length === 0) { card.style.display = 'none'; return; }

  list.innerHTML = profiles.map(p => {
    const name = p.full_name || 'Community Member';
    const avatar = p.avatar_url
      ? `<img src="${p.avatar_url}" style="width:40px;height:40px;border-radius:50%;object-fit:cover">`
      : `<span style="width:40px;height:40px;border-radius:50%;background:var(--gray-200);display:inline-flex;align-items:center;justify-content:center;font-size:20px">👤</span>`;
    const contactBtn = p.contact_link
      ? `<a href="${p.contact_link.startsWith('http') ? p.contact_link : 'https://' + p.contact_link}" target="_blank" class="btn-sm" style="text-decoration:none;flex-shrink:0">View Contact</a>`
      : `<span class="btn-sm" style="opacity:0.4;cursor:default;flex-shrink:0">No contact set</span>`;
    return `
      <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--gray-100)">
        ${avatar}
        <div style="flex:1">
          <div style="font-size:14px;font-weight:600">${name}</div>
          ${p.occupation ? `<div style="font-size:12px;color:var(--gray-400)">${p.occupation}</div>` : ''}
        </div>
        ${contactBtn}
      </div>`;
  }).join('');
}

async function loadPendingRequests(userId) {
  const card = document.getElementById('pending-requests-card');
  const list = document.getElementById('pending-requests-list');
  if (!card || !list) return;

  const { data, error } = await _supabase
    .from('connection_requests')
    .select('id, from_user_id, created_at')
    .eq('to_user_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) {
    card.style.display = 'none';
    return;
  }

  card.style.display = '';

  // Fetch senders' profiles
  const fromIds = data.map(r => r.from_user_id);
  const { data: profiles } = await _supabase.from('profiles').select('id, full_name, avatar_url').in('id', fromIds);
  const profileMap = {};
  if (profiles) profiles.forEach(p => { profileMap[p.id] = p; });

  const countEl = document.getElementById('pending-requests-count');
  if (countEl) countEl.textContent = data.length;

  list.innerHTML = data.map(r => {
    const p = profileMap[r.from_user_id] || {};
    const name = p.full_name || 'Community Member';
    const avatar = p.avatar_url
      ? `<img src="${p.avatar_url}" style="width:32px;height:32px;border-radius:50%;object-fit:cover">`
      : `<span style="width:32px;height:32px;border-radius:50%;background:var(--gray-200);display:inline-flex;align-items:center;justify-content:center;font-size:16px">👤</span>`;
    return `
      <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--gray-100)">
        ${avatar}
        <span style="flex:1;font-size:14px;font-weight:500">${name}</span>
        <button class="btn-sm" style="background:#22c55e;color:#fff;border:none" onclick="acceptRequest('${r.id}','${userId}')">Accept</button>
        <button class="btn-sm" style="background:#fee2e2;color:#dc2626;border:none" onclick="declineRequest('${r.id}','${userId}')">Decline</button>
      </div>`;
  }).join('');
}

async function acceptRequest(id, userId) {
  const { error } = await _supabase.from('connection_requests').update({ status: 'accepted' }).eq('id', id);
  if (error) { alert('Error: ' + error.message); return; }
  showToast('✅ Connection accepted!');
  loadPendingRequests(userId);
}

async function declineRequest(id, userId) {
  const { error } = await _supabase.from('connection_requests').update({ status: 'declined' }).eq('id', id);
  if (error) { alert('Error: ' + error.message); return; }
  showToast('Request declined.');
  loadPendingRequests(userId);
}

async function loadEvents() {
  const { data, error } = await _supabase
    .from('events')
    .select('*')
    .eq('approved', true)
    .order('date', { ascending: true });

  const grid = document.getElementById('events-grid');
  if (error || !data || data.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--gray-400)">No events found.</div>';
    return;
  }
  _allEvents = data;

  // Fetch poster profiles for events that have submitted_by
  const posterIds = [...new Set(data.filter(e => e.submitted_by).map(e => e.submitted_by))];
  const posterMap = {};
  if (posterIds.length > 0) {
    const { data: profiles } = await _supabase.from('profiles').select('id, full_name, avatar_url, contact_link').in('id', posterIds);
    if (profiles) profiles.forEach(p => { posterMap[p.id] = p; });
  }

  grid.innerHTML = data.map(e => renderEventCard(e, posterMap[e.submitted_by])).join('');

  // also update home page upcoming events (next 3)
  const homeGrid = document.getElementById('home-events-grid');
  if (homeGrid) {
    const upcoming = data.slice(0, 3);
    homeGrid.innerHTML = upcoming.map(e => renderEventCard(e, posterMap[e.submitted_by])).join('');
  }

  // Mark already RSVP'd events + check connection statuses
  const { data: { session } } = await _supabase.auth.getSession();
  if (session) {
    const { data: rsvps } = await _supabase.from('rsvps').select('event_id').eq('user_id', session.user.id);
    if (rsvps) {
      rsvps.forEach(r => {
        const btn = document.getElementById(`rsvp-btn-${r.event_id}`);
        if (btn) {
          btn.textContent = '✓ Going!';
          btn.style.background = 'var(--green, #22c55e)';
          btn.style.color = '#fff';
        }
      });
    }

    // Update Connect button states — check both directions
    const allPosterIds = [...new Set(data.filter(e => e.submitted_by).map(e => e.submitted_by))];
    if (allPosterIds.length > 0) {
      const [sentRes, receivedRes] = await Promise.all([
        _supabase.from('connection_requests').select('to_user_id, status').eq('from_user_id', session.user.id).in('to_user_id', allPosterIds),
        _supabase.from('connection_requests').select('from_user_id, status').eq('to_user_id', session.user.id).in('from_user_id', allPosterIds)
      ]);

      // Build a map: posterId -> { status, direction }
      const connMap = {};
      if (sentRes.data) sentRes.data.forEach(c => { connMap[c.to_user_id] = { status: c.status, direction: 'sent' }; });
      if (receivedRes.data) receivedRes.data.forEach(c => {
        // Only override if not already accepted from sent side
        if (!connMap[c.from_user_id] || connMap[c.from_user_id].status !== 'accepted') {
          connMap[c.from_user_id] = { status: c.status, direction: 'received' };
        }
      });

      Object.entries(connMap).forEach(([posterId, conn]) => {
        document.querySelectorAll(`.connect-event-btn[data-poster-id="${posterId}"]`).forEach(btn => {
          if (conn.status === 'pending' && conn.direction === 'sent') {
            btn.textContent = 'Requested';
            btn.disabled = true;
            btn.style.opacity = '0.6';
          } else if (conn.status === 'pending' && conn.direction === 'received') {
            btn.textContent = 'Respond';
            btn.disabled = false;
            btn.onclick = () => { showSection('profile'); setNavActiveByName('My Profile'); };
          } else if (conn.status === 'accepted') {
            const contact = btn.dataset.contact;
            btn.textContent = '✓ Connected';
            btn.style.background = 'var(--green, #22c55e)';
            btn.style.color = '#fff';
            btn.disabled = false;
            if (contact) {
              btn.onclick = () => window.open(contact.startsWith('http') ? contact : 'https://' + contact, '_blank');
            } else {
              btn.onclick = null;
            }
          }
        });
      });
    }

    // Hide own Connect buttons (don't show Connect on your own events)
    document.querySelectorAll(`.connect-event-btn[data-poster-id="${session.user.id}"]`).forEach(btn => btn.remove());
  }
}

function openEditEvent(id) {
  const e = _myEvents[id];
  if (!e) return;
  document.getElementById('evt-edit-id').value = e.id;
  document.getElementById('evt-title').value = e.title || '';
  document.getElementById('evt-date').value = e.date || '';
  document.getElementById('evt-category').value = e.category || 'Cultural';
  document.getElementById('evt-location').value = e.location || '';
  document.getElementById('evt-desc').value = e.description || '';
  document.querySelector('#addEventModal .modal-header .modal-title').textContent = 'Edit Event ✏️';
  document.querySelector('#evt-form-body button[type="submit"]').textContent = 'Save Changes';
  openModal('addEventModal');
}

async function handleSubmitEvent(event) {
  event.preventDefault();
  const { data: { session } } = await _supabase.auth.getSession();
  if (!session) { alert('Please log in to submit an event.'); return; }

  const editId = document.getElementById('evt-edit-id').value.trim();
  const payload = {
    title:       document.getElementById('evt-title').value.trim(),
    category:    document.getElementById('evt-category').value,
    date:        document.getElementById('evt-date').value,
    location:    document.getElementById('evt-location').value.trim(),
    description: document.getElementById('evt-desc').value.trim(),
  };

  let error;
  if (editId) {
    ({ error } = await _supabase.from('events').update(payload).eq('id', editId).eq('submitted_by', session.user.id));
    if (error) { alert('Error saving: ' + error.message); return; }
    closeModal('addEventModal');
    showToast('✅ Event updated!');
    loadEvents();
    loadMySubmissions(session.user.id);
  } else {
    ({ error } = await _supabase.from('events').insert({ ...payload, submitted_by: session.user.id }));
    if (error) { alert('Error submitting event: ' + error.message); return; }
    document.getElementById('evt-form-body').style.display = 'none';
    document.getElementById('evt-success-msg').style.display = '';
    loadEvents();
  }
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

  const img = document.getElementById('profile-avatar-img');
  const placeholder = document.getElementById('profile-avatar-placeholder');
  const navWrap = document.getElementById('nav-avatar-wrap');
  if (p.avatar_url) {
    img.src = p.avatar_url;
    img.classList.add('loaded');
    placeholder.style.display = 'none';
    if (navWrap) navWrap.innerHTML = `<img src="${p.avatar_url}" alt="">`;
  } else {
    img.src = '';
    img.classList.remove('loaded');
    placeholder.style.display = '';
    if (navWrap) navWrap.innerHTML = '';
  }

  document.getElementById('edit-name').value = p.full_name || '';
  document.getElementById('edit-nickname').value = p.nickname || '';
  document.getElementById('edit-hometown').value = p.hometown || '';
  document.getElementById('edit-neighbourhood').value = p.neighbourhood || '';
  document.getElementById('edit-bio').value = p.bio || '';
  document.getElementById('edit-occupation').value = p.occupation || '';
  document.getElementById('edit-contact-link').value = p.contact_link || '';

  loadMySubmissions(user.id);
  loadPendingRequests(user.id);
  loadMyConnections(user.id);
}

async function loadMySubmissions(userId) {
  const el = document.getElementById('my-submissions-list');
  if (!el) return;

  const [eventsRes, reviewsRes, listingsRes] = await Promise.all([
    _supabase.from('events').select('*').eq('submitted_by', userId).order('created_at', { ascending: false }),
    _supabase.from('reviews').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    _supabase.from('directory_submissions').select('*').eq('submitted_by', userId).order('created_at', { ascending: false })
  ]);

  const events = eventsRes.data || [];
  const reviews = reviewsRes.data || [];
  const listings = listingsRes.data || [];

  if (events.length === 0 && reviews.length === 0 && listings.length === 0) {
    el.innerHTML = '<div style="font-size:14px;color:var(--gray-400)">You have no submissions yet.</div>';
    return;
  }

  let html = '';

  if (listings.length > 0) {
    html += '<div style="font-weight:600;font-size:13px;color:var(--gray-500);text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px">Directory Listings</div>';
    listings.forEach(s => {
      _myListings[s.id] = s;
      html += `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:var(--gray-50);border-radius:var(--radius-sm);margin-bottom:8px;gap:12px">
          <div>
            <div style="font-weight:600;font-size:14px">${s.name || ''}</div>
            <div style="font-size:12px;color:var(--gray-400);margin-top:2px">${s.category || ''} · ${s.location || ''}</div>
            <div style="font-size:11px;margin-top:4px;color:${s.approved ? 'var(--green,#22c55e)' : 'var(--gold)'}">${s.approved ? '✓ Approved' : '⏳ Pending approval'}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0">
            <button class="btn-sm" onclick="openEditListing('${s.id}')">Edit</button>
            <button class="btn-sm" style="background:#fee2e2;color:#dc2626;border:none" onclick="deleteMyListing('${s.id}','${userId}')">Delete</button>
          </div>
        </div>`;
    });
  }

  if (events.length > 0) {
    html += '<div style="font-weight:600;font-size:13px;color:var(--gray-500);text-transform:uppercase;letter-spacing:.05em;margin:14px 0 10px">Events</div>';
    events.forEach(e => {
      _myEvents[e.id] = e;
      html += `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:var(--gray-50);border-radius:var(--radius-sm);margin-bottom:8px;gap:12px">
          <div>
            <div style="font-weight:600;font-size:14px">🎉 ${e.title}</div>
            <div style="font-size:12px;color:var(--gray-400);margin-top:2px">${e.date || ''} · ${e.location || ''}</div>
            <div style="font-size:11px;margin-top:4px;color:${e.approved ? 'var(--green,#22c55e)' : 'var(--gold)'}">${e.approved ? '✓ Approved' : '⏳ Pending approval'}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0">
            <button class="btn-sm" onclick="openEditEvent('${e.id}')">Edit</button>
            <button class="btn-sm" style="background:#fee2e2;color:#dc2626;border:none" onclick="deleteMyEvent('${e.id}','${userId}')">Delete</button>
          </div>
        </div>`;
    });
  }

  if (reviews.length > 0) {
    html += '<div style="font-weight:600;font-size:13px;color:var(--gray-500);text-transform:uppercase;letter-spacing:.05em;margin:14px 0 10px">Reviews</div>';
    reviews.forEach(r => {
      const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
      html += `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:var(--gray-50);border-radius:var(--radius-sm);margin-bottom:8px;gap:12px">
          <div>
            <div style="font-weight:600;font-size:14px">${r.business_id}</div>
            <div style="font-size:13px;color:var(--gold)">${stars}</div>
            <div style="font-size:13px;color:var(--gray-600);margin-top:2px">${r.comment || ''}</div>
          </div>
          <button class="btn-sm" style="background:#fee2e2;color:#dc2626;border:none;flex-shrink:0" onclick="deleteMyReview('${r.id}','${userId}')">Delete</button>
        </div>`;
    });
  }

  el.innerHTML = html;
}

async function deleteMyEvent(id, userId) {
  if (!confirm('Delete this event submission?')) return;
  const { error } = await _supabase.from('events').delete().eq('id', id).eq('submitted_by', userId);
  if (error) { alert('Error deleting: ' + error.message); return; }
  loadMySubmissions(userId);
}

async function deleteMyListing(id, userId) {
  if (!confirm('Delete this listing?')) return;
  const { error } = await _supabase.from('directory_submissions').delete().eq('id', id).eq('submitted_by', userId);
  if (error) { alert('Error deleting: ' + error.message); return; }
  showToast('🗑️ Listing deleted.');
  loadMySubmissions(userId);
  loadDirectorySubmissions();
}

async function deleteMyReview(id, userId) {
  if (!confirm('Delete this review?')) return;
  const { error } = await _supabase.from('reviews').delete().eq('id', id).eq('user_id', userId);
  if (error) { alert('Error deleting: ' + error.message); return; }
  loadMySubmissions(userId);
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
    occupation:    document.getElementById('edit-occupation').value.trim(),
    contact_link:  document.getElementById('edit-contact-link').value.trim() || null,
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

async function handleDeleteAccount() {
  if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
  if (!confirm('Last chance — all your listings, events, and profile data will be permanently deleted.')) return;

  const { data: { session } } = await _supabase.auth.getSession();
  if (!session) return;

  const userId = session.user.id;

  // Delete user data first
  await Promise.all([
    _supabase.from('directory_submissions').delete().eq('submitted_by', userId),
    _supabase.from('events').delete().eq('submitted_by', userId),
    _supabase.from('reviews').delete().eq('user_id', userId),
    _supabase.from('rsvps').delete().eq('user_id', userId),
    _supabase.from('connection_requests').delete().or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`),
    _supabase.from('profiles').delete().eq('id', userId),
  ]);

  // Delete auth user via database function
  const { error } = await _supabase.rpc('delete_own_account');
  if (error) { alert('Error deleting account: ' + error.message); return; }

  await _supabase.auth.signOut();
  showSection('home');
  setNavActiveByName('Home');
  showToast('Your account has been deleted.');
}

async function handleSignOut() {
  await _supabase.auth.signOut();
  showSection('home');
  setNavActiveByName('Home');
}

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  loadEvents();
  loadDirectorySubmissions();
});

const DIR_CAT_MAP = {
  // Long names from form dropdown
  'Legal, Finance & Professional Services': { cat: 'Legal',      emoji: '⚖️',  bg: '#EBF0FB' },
  'Healthcare & Medical':                   { cat: 'Healthcare', emoji: '🏥',  bg: '#ECFDF5' },
  'Real Estate':                            { cat: 'Realty',     emoji: '🏠',  bg: '#FFFBEB' },
  'Local Business, Retail & Services':      { cat: 'Business',   emoji: '🏢',  bg: '#F0F9FF' },
  'Beauty & Wellness':                      { cat: 'Beauty',     emoji: '✂️',  bg: '#FDF4FF' },
  'Education & Tutoring':                   { cat: 'Tutors',     emoji: '🎓',  bg: '#FFFBEB' },
  'Community, Culture & Church':            { cat: 'Community',  emoji: '🤝',  bg: '#F0FDF4' },
  'Sports & Recreation':                    { cat: 'Sports',     emoji: '⚽',  bg: '#EFF6FF' },
  'Content Creator / Influencer':           { cat: 'Influencer', emoji: '⭐',  bg: '#FFFBEB' },
  'Cash Jobs & Gigs':                       { cat: 'Jobs',       emoji: '💵',  bg: '#F0FDF4' },
  // Short keys for migrated entries
  'Legal':      { cat: 'Legal',      emoji: '⚖️',  bg: '#EBF0FB' },
  'Healthcare': { cat: 'Healthcare', emoji: '🏥',  bg: '#ECFDF5' },
  'Realty':     { cat: 'Realty',     emoji: '🏠',  bg: '#FFFBEB' },
  'Business':   { cat: 'Business',   emoji: '🏢',  bg: '#F0F9FF' },
  'Beauty':     { cat: 'Beauty',     emoji: '✂️',  bg: '#FDF4FF' },
  'Tutors':     { cat: 'Tutors',     emoji: '🎓',  bg: '#FFFBEB' },
  'Community':  { cat: 'Community',  emoji: '🤝',  bg: '#F0FDF4' },
  'Cultural':   { cat: 'Cultural',   emoji: '🌺',  bg: '#FEF9EC' },
  'Seniors':    { cat: 'Seniors',    emoji: '👴',  bg: '#F0FFF4' },
  'Students':   { cat: 'Students',   emoji: '🎓',  bg: '#EBF0FB' },
  'Sports':     { cat: 'Sports',     emoji: '⚽',  bg: '#FEF2F2' },
  'Influencer': { cat: 'Influencer', emoji: '⭐',  bg: '#FFFBEB' },
  'Jobs':       { cat: 'Jobs',       emoji: '💵',  bg: '#F0FDF4' },
  'Church':     { cat: 'Church',     emoji: '⛪',  bg: '#FFFBEB' },
  'Finance':    { cat: 'Finance',    emoji: '💰',  bg: '#FFFBEB' },
  'Services':   { cat: 'Services',   emoji: '🚗',  bg: '#F0FFF4' },
  'Travel Agents':      { cat: 'Travel',   emoji: '✈️', bg: '#EFF6FF' },
  'Newcomer Services':  { cat: 'Newcomer', emoji: '🆕', bg: '#F0FDF4' },
  'Travel':    { cat: 'Travel',   emoji: '✈️', bg: '#EFF6FF' },
  'Newcomer':  { cat: 'Newcomer', emoji: '🆕', bg: '#F0FDF4' },
};

function buildContactButtons(s) {
  const btns = [];

  if (s.website) {
    btns.push(`<a href="${s.website.startsWith('http') ? s.website : 'https://' + s.website}" target="_blank" class="btn-sm" style="text-decoration:none">🌐 Visit Site</a>`);
  }
  if (s.instagram) {
    const url = s.instagram.startsWith('http') ? s.instagram : s.instagram.startsWith('@') ? `https://instagram.com/${s.instagram.slice(1)}` : `https://instagram.com/${s.instagram}`;
    btns.push(`<a href="${url}" target="_blank" class="btn-sm" style="text-decoration:none">📸 Instagram</a>`);
  }
  if (s.facebook) {
    const url = s.facebook.startsWith('http') ? s.facebook : `https://facebook.com/${s.facebook}`;
    btns.push(`<a href="${url}" target="_blank" class="btn-sm" style="text-decoration:none">📘 Facebook</a>`);
  }
  if (s.contact) {
    const c = s.contact.trim();
    if (/\b\d{3}[\s\-\.]\d{3}[\s\-\.]\d{4}\b/.test(c) || /^[\d\s\(\)\-\+\.]{7,}$/.test(c)) {
      btns.push(`<a href="tel:${c.replace(/[^\d\+]/g,'')}" class="btn-sm" style="text-decoration:none">📞 Call</a>`);
    } else if (c.includes('@')) {
      btns.push(`<a href="mailto:${c}" class="btn-sm" style="text-decoration:none">✉️ Email</a>`);
    } else {
      btns.push(`<span class="btn-sm" style="cursor:default">📬 ${c}</span>`);
    }
  }

  return btns.length ? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">${btns.join('')}</div>` : '';
}

async function loadDirectorySubmissions() {
  const { data, error } = await _supabase
    .from('directory_submissions')
    .select('*')
    .eq('approved', true)
    .order('name', { ascending: true });

  const grid = document.getElementById('dir-grid');
  if (!grid) return;
  const loading = document.getElementById('dir-loading');
  if (loading) loading.remove();
  grid.querySelectorAll('.dir-card').forEach(c => c.remove());
  if (error || !data || data.length === 0) return;

  data.forEach(s => {
    const map = DIR_CAT_MAP[s.category] || { cat: 'Other', emoji: '📋', bg: '#F9FAFB' };
    const card = document.createElement('div');
    card.className = 'dir-card';
    card.dataset.cat = map.cat;
    card.innerHTML = `
      <div class="dir-avatar" style="background:${map.bg}">${s.emoji || map.emoji}</div>
      <div style="flex:1">
        <div class="dir-name">${s.name || ''}</div>
        <div class="dir-role">${s.category || ''} · ${s.location || ''}</div>
        ${s.description ? `<div class="dir-desc">${s.description}</div>` : ''}
        ${buildContactButtons(s)}
      </div>
    `;
    grid.appendChild(card);
  });

  // Sort all cards (hardcoded + dynamic) alphabetically by name
  const allCards = Array.from(grid.querySelectorAll('.dir-card'));
  allCards.sort((a, b) => {
    const nameA = (a.querySelector('.dir-name')?.textContent || '').toLowerCase();
    const nameB = (b.querySelector('.dir-name')?.textContent || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });
  allCards.forEach(card => grid.appendChild(card));
}

// ── Sign Up / Log In ─────────────────────────────────────────────

function dismissWelcome() {
  document.getElementById('signup-welcome-msg').style.display = 'none';
  document.getElementById('join-modal-title').style.display = '';
  document.querySelector('#joinModal .tab-nav').style.display = '';
  switchAuthTab('login');
}

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

  const { data: profile } = await _supabase.from('profiles').select('full_name').eq('id', data.user.id).single();
  const firstName = (profile?.full_name || '').split(' ')[0] || 'Kababayan';
  showToast(`Mabuhay, ${firstName}! 🇵🇭`);
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

  // Show welcome screen inside the modal
  document.getElementById('join-modal-title').style.display = 'none';
  document.querySelector('#joinModal .tab-nav').style.display = 'none';
  document.getElementById('auth-signup').style.display = 'none';
  document.getElementById('welcome-name').textContent = name || 'Friend';
  document.getElementById('signup-welcome-msg').style.display = '';
}
