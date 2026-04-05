// ── ADMIN GATE ──
const ADMIN_PASS = 'inpixel2026'; // Change this passcode

document.getElementById('gateInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') checkGate();
});

function checkGate() {
  const val = document.getElementById('gateInput').value;
  if (val === ADMIN_PASS) {
    document.getElementById('adminGate').style.display = 'none';
    loadSubmissions();
  } else {
    document.getElementById('gateError').style.display = 'block';
    document.getElementById('gateInput').value = '';
    document.getElementById('gateInput').focus();
  }
}

// ── DATA ──
let allSubmissions = [];
let currentFilter = 'all';
let currentSearch = '';
let currentOpenId = null;

const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyVtBf_GzWpbauRxqcsXX7eOS05PS3DcCpOYYyghNCQXpiwjw09rmithNxOC3lmJ5nx/exec';

function loadSubmissions() {
  document.getElementById('cardsContainer').innerHTML = `
    <div class="empty-state">
      <p style="color:var(--text-muted);font-family:'Space Mono',monospace;font-size:0.8rem;">Loading submissions...</p>
    </div>`;

  window._sheetCallback = function(data) {
    const filtered = data.filter(r => r['Name'] && r['Name'].toString().trim() !== '');

    allSubmissions = filtered.map((r, i) => ({
      id: 'sheet_' + i,
      submittedAt: r['Submitted At'] || new Date().toISOString(),
      user: {
        name:  r['Name']  || '',
        email: r['Email'] || '',
        phone: String(r['Phone'] || '')
      },
      businessName:      r['Business']     || '',
      industry:          r['Industry']     || '',
      location:          r['Location']     || '',
      description:       r['Description']  || '',
      websiteTypes:      (r['Services'] || '').split(',').map(s => s.trim()).filter(Boolean),
      features:          (r['Features'] || '').split(',').map(s => s.trim()).filter(Boolean),
      designStyle:       r['Design Style'] || '',
      colorTheme:        r['Colors']       || '',
      hasLogo:           r['Has Logo']     || '',
      referenceWebsites: r['References']   || '',
      pages:             r['Pages']        || '',
      contentProvided:   r['Content']      || '',
      hasDomain:         r['Domain']       || '',
      domainName:        r['Domain Name']  || '',
      hasHosting:        r['Hosting']      || '',
      extraNotes:        r['Extra']        || '',
      hearAboutUs:       r['Source']       || '',
      budget:            r['Budget']       || '',
      timeline:          r['Timeline']     || ''
    }));

    allSubmissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    updateStats();
    renderCards();
  };

  const s = document.createElement('script');
  s.src = SHEET_URL + '?callback=_sheetCallback&t=' + Date.now();
  s.onerror = () => {
    document.getElementById('cardsContainer').innerHTML = `
      <div class="empty-state">
        <p style="color:#ff4444;font-family:'Space Mono',monospace;font-size:0.8rem;">Failed to load. Check your connection.</p>
      </div>`;
  };
  document.body.appendChild(s);
}

function updateStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart  = new Date(now); weekStart.setDate(now.getDate() - 7);

  document.getElementById('statTotal').textContent = allSubmissions.length;
  document.getElementById('statToday').textContent = allSubmissions.filter(s => new Date(s.submittedAt) >= todayStart).length;
  document.getElementById('statWeek').textContent  = allSubmissions.filter(s => new Date(s.submittedAt) >= weekStart).length;
}

function getFiltered() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart  = new Date(now); weekStart.setDate(now.getDate() - 7);

  let list = allSubmissions;
  if (currentFilter === 'today') list = list.filter(s => new Date(s.submittedAt) >= todayStart);
  if (currentFilter === 'week')  list = list.filter(s => new Date(s.submittedAt) >= weekStart);

  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    list = list.filter(s =>
      (s.user?.name||'').toLowerCase().includes(q) ||
      (s.user?.email||'').toLowerCase().includes(q) ||
      (s.user?.phone||'').toLowerCase().includes(q) ||
      (s.businessName||'').toLowerCase().includes(q) ||
      (s.industry||'').toLowerCase().includes(q)
    );
  }
  return list;
}

function renderCards() {
  const container = document.getElementById('cardsContainer');
  const list = getFiltered();

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        <h3>No Submissions Yet</h3>
        <p>Once clients fill the requirement form, their entries will appear here.</p>
        <a href="userlogin.html" target="_blank">Open Client Form →</a>
      </div>`;
    return;
  }

  container.innerHTML = `<div class="cards-grid">${list.map((s, i) => cardHTML(s, i)).join('')}</div>`;
}

function initials(name) {
  if (!name) return '?';
  return name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
}

function cardHTML(s, idx) {
  const chips = [];
  if (s.websiteTypes?.length) chips.push(...s.websiteTypes.slice(0,2).map(t => `<span class="chip">${t}</span>`));
  if (s.budget) chips.push(`<span class="chip grey">${s.budget}</span>`);

  return `
    <div class="sub-card" onclick="openModal('${s.id}')" style="animation-delay:${idx * 0.05}s">
      <div class="card-top">
        <div class="card-avatar">${initials(s.user?.name)}</div>
        <div class="card-date">${formatDate(s.submittedAt)}</div>
      </div>
      <div class="card-name">${s.user?.name || '—'}</div>
      <div class="card-contact">
        <span>${s.user?.email || '—'}</span>
        <span>${s.user?.phone || '—'}</span>
      </div>
      <div class="card-chips">${chips.join('') || '<span class="chip grey">No type selected</span>'}</div>
      <div class="card-footer">
        <div class="card-business"><strong>${s.businessName || 'No business name'}</strong> · ${s.industry || '—'}</div>
        <div class="view-btn">View <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></div>
      </div>
    </div>`;
}

// ── MODAL ──
function openModal(id) {
  const s = allSubmissions.find(x => x.id === id);
  if (!s) return;
  currentOpenId = id;

  document.getElementById('mAvatar').textContent = initials(s.user?.name);
  document.getElementById('mName').textContent   = s.user?.name || '—';
  document.getElementById('mSub').textContent    = (s.user?.email || '') + ' · ' + (s.user?.phone || '');
  document.getElementById('mTimestamp').textContent = 'Submitted: ' + new Date(s.submittedAt).toLocaleString('en-IN');

  const tagList = arr => arr?.length
    ? `<div class="tag-list">${arr.map(t => `<span class="tag">${t}</span>`).join('')}</div>`
    : `<p class="empty">None selected</p>`;

  const val = v => v ? `<p>${v}</p>` : `<p class="empty">Not provided</p>`;

  document.getElementById('mBody').innerHTML = `
    <div class="detail-section">
      <div class="detail-section-title">Contact Information</div>
      <div class="detail-grid">
        <div class="detail-field"><label>Name</label>${val(s.user?.name)}</div>
        <div class="detail-field"><label>Phone</label>${val(s.user?.phone)}</div>
        <div class="detail-field full"><label>Email</label>${val(s.user?.email)}</div>
      </div>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">Business Information</div>
      <div class="detail-grid">
        <div class="detail-field"><label>Business Name</label>${val(s.businessName)}</div>
        <div class="detail-field"><label>Industry</label>${val(s.industry)}</div>
        <div class="detail-field"><label>Location</label>${val(s.location)}</div>
        <div class="detail-field"><label>How Heard About Us</label>${val(s.hearAboutUs)}</div>
        <div class="detail-field full"><label>Business Description</label>${val(s.businessDesc)}</div>
      </div>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">Website Requirements</div>
      <div class="detail-grid">
        <div class="detail-field full"><label>Website Types</label>${tagList(s.websiteTypes)}</div>
        <div class="detail-field full"><label>Required Features</label>${tagList(s.features)}</div>
        <div class="detail-field full"><label>Pages Requested</label>${val(s.pages)}</div>
      </div>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">Design Preferences</div>
      <div class="detail-grid">
        <div class="detail-field"><label>Design Style</label>${val(s.designStyle)}</div>
        <div class="detail-field"><label>Color Theme</label>${val(s.colorTheme)}</div>
        <div class="detail-field"><label>Has Logo?</label>${val(s.hasLogo)}</div>
        <div class="detail-field"><label>Content Provided?</label>${val(s.contentProvided)}</div>
        <div class="detail-field full"><label>Reference Websites</label>${val(s.referenceWebsites)}</div>
      </div>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">Technical & Budget</div>
      <div class="detail-grid">
        <div class="detail-field"><label>Has Domain?</label>${val(s.hasDomain)}</div>
        <div class="detail-field"><label>Domain Name</label>${val(s.domainName)}</div>
        <div class="detail-field"><label>Has Hosting?</label>${val(s.hasHosting)}</div>
        <div class="detail-field"><label>Budget Range</label>${val(s.budget)}</div>
        <div class="detail-field"><label>Timeline</label>${val(s.timeline)}</div>
      </div>
    </div>

    ${s.extraNotes ? `
    <div class="detail-section">
      <div class="detail-section-title">Additional Notes</div>
      <div class="detail-field"><p>${s.extraNotes}</p></div>
    </div>` : ''}
  `;

  document.getElementById('mDeleteBtn').onclick = () => deleteEntry(id);
  document.getElementById('overlay').classList.add('show');
  document.getElementById('detailModal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('overlay').classList.remove('show');
  document.getElementById('detailModal').classList.remove('show');
  document.body.style.overflow = '';
  currentOpenId = null;
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ── DELETE ──
function deleteEntry(id) {
  if (!confirm('Delete this submission? This cannot be undone.')) return;
  allSubmissions = allSubmissions.filter(s => s.id !== id);
  localStorage.setItem('inpixel_submissions', JSON.stringify(allSubmissions));
  closeModal();
  updateStats();
  renderCards();
}

function confirmClearAll() {
  if (!confirm('Delete ALL submissions? This cannot be undone.')) return;
  localStorage.removeItem('inpixel_submissions');
  allSubmissions = [];
  updateStats();
  renderCards();
}

// ── FILTER / SEARCH ──
function setFilter(f, btn) {
  currentFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderCards();
}

function filterCards() {
  currentSearch = document.getElementById('searchInput').value;
  renderCards();
}

// ── DEMO DATA (remove in production) ──
function seedDemoData() {
  const existing = JSON.parse(localStorage.getItem('inpixel_submissions') || '[]');
  if (existing.length > 0) return; // Don't overwrite real data

  const demos = [
    {
      id: Date.now().toString() + '1',
      submittedAt: new Date(Date.now() - 1000*60*60*2).toISOString(),
      user: { name: 'Priya Sharma', email: 'priya@example.com', phone: '+91 98765 11111' },
      businessName: 'Priya Boutique', industry: 'Fashion', location: 'Mumbai',
      businessDesc: 'Online women\'s clothing boutique specializing in ethnic wear.',
      websiteTypes: ['E-Commerce Store', 'Shopify Store'],
      features: ['WhatsApp Chat Button', 'Online Payment Gateway', 'Product Catalogue', 'SEO Optimisation'],
      colorTheme: 'Rose Gold and White', designStyle: 'Luxury / Premium',
      referenceWebsites: 'www.fabindia.com', hasLogo: 'Yes, I have a logo',
      pages: 'Home, Shop, About, Collections, Contact', contentProvided: 'Partial content provided',
      hasDomain: 'Yes', domainName: 'priyaboutique.in', hasHosting: 'No',
      budget: '₹25,000 – ₹50,000', timeline: '2–4 Weeks',
      extraNotes: 'Need Instagram shop integration too.', hearAboutUs: 'Instagram',
    },
    {
      id: Date.now().toString() + '2',
      submittedAt: new Date(Date.now() - 1000*60*60*26).toISOString(),
      user: { name: 'Rahul Mehta', email: 'rahul@techsol.in', phone: '+91 91234 56789' },
      businessName: 'TechSol India', industry: 'IT / Technology', location: 'Pune',
      businessDesc: 'B2B software solutions provider for small businesses.',
      websiteTypes: ['Business / Portfolio Website'],
      features: ['Contact Form', 'Blog / News Section', 'SEO Optimisation', 'Client / Testimonial Section'],
      colorTheme: 'Dark Blue and White', designStyle: 'Corporate / Professional',
      referenceWebsites: '', hasLogo: 'Have but need redesign',
      pages: 'Home, Services, Case Studies, Blog, About, Contact',
      contentProvided: 'Yes, I will provide all content',
      hasDomain: 'Yes', domainName: 'techsolindia.com', hasHosting: 'Yes',
      budget: '₹10,000 – ₹25,000', timeline: '1–2 Months',
      extraNotes: '', hearAboutUs: 'Google Search',
    },
    {
      id: Date.now().toString() + '3',
      submittedAt: new Date().toISOString(),
      user: { name: 'Anita Joshi', email: 'anita@wellnessby.in', phone: '+91 88888 99999' },
      businessName: 'Wellness By Anita', industry: 'Health & Wellness', location: 'Bangalore',
      businessDesc: 'Yoga and wellness coaching studio with online and offline sessions.',
      websiteTypes: ['Booking / Appointment Website', 'Landing Page'],
      features: ['Contact Form', 'WhatsApp Chat Button', 'Photo / Video Gallery', 'Google Maps / Location'],
      colorTheme: 'Earthy greens and cream', designStyle: 'Minimal & Clean',
      referenceWebsites: 'www.gaia.com', hasLogo: 'No, need logo design',
      pages: 'Home, About, Classes, Booking, Gallery, Contact',
      contentProvided: 'No, need content writing too',
      hasDomain: 'No', domainName: '', hasHosting: 'No',
      budget: '₹10,000 – ₹25,000', timeline: '2–4 Weeks',
      extraNotes: 'Would love a calming, nature-inspired design.', hearAboutUs: 'Referral from a friend',
    }
  ];

  localStorage.setItem('inpixel_submissions', JSON.stringify(demos));
}

// Seed demo data only if localStorage is empty (remove this call in production)
seedDemoData();
