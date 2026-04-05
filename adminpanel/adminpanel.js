// ============================================================
//   INPIXEL NETWORK — adminpanel.js
//   With "Manage Clients" — add approved numbers to Sheet
// ============================================================

// ── REPLACE THIS with your new Apps Script URL ──
const CLIENT_SHEET_URL = 'https://script.google.com/macros/s/AKfycbzBjJN_VQMS5QRG6J1d2RwrEC13XhSEeUTCv0tObV9UkrReiAKmgr1DgQaWo3cczhi9MA/exec';

// ── ADMIN GATE ──
const ADMIN_PASS = 'inpixel2026';

document.getElementById('gateInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') checkGate();
});

function checkGate() {
  const val = document.getElementById('gateInput').value;
  if (val === ADMIN_PASS) {
    document.getElementById('adminGate').style.display = 'none';
    loadSubmissions();
    loadClients();
  } else {
    document.getElementById('gateError').style.display = 'block';
    document.getElementById('gateInput').value = '';
    document.getElementById('gateInput').focus();
  }
}

// ── DATA ──
let allSubmissions = [];
let allClients     = [];
let currentFilter  = 'all';
let currentSearch  = '';
let currentOpenId  = null;

const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyVtBf_GzWpbauRxqcsXX7eOS05PS3DcCpOYYyghNCQXpiwjw09rmithNxOC3lmJ5nx/exec';

// ══════════════════════════════════════════════════════════
//   SUBMISSIONS (existing logic, unchanged)
// ══════════════════════════════════════════════════════════

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
  const now        = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart  = new Date(now); weekStart.setDate(now.getDate() - 7);

  document.getElementById('statTotal').textContent = allSubmissions.length;
  document.getElementById('statToday').textContent = allSubmissions.filter(s => new Date(s.submittedAt) >= todayStart).length;
  document.getElementById('statWeek').textContent  = allSubmissions.filter(s => new Date(s.submittedAt) >= weekStart).length;
}

function getFiltered() {
  const now        = new Date();
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
        <div class="detail-field full"><label>Business Description</label>${val(s.description)}</div>
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

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
    closeClientsModal();
  }
});

// ── DELETE ──
function deleteEntry(id) {
  if (!confirm('Delete this submission? This cannot be undone.')) return;
  allSubmissions = allSubmissions.filter(s => s.id !== id);
  closeModal();
  updateStats();
  renderCards();
}

function confirmClearAll() {
  if (!confirm('Delete ALL submissions? This cannot be undone.')) return;
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

// ══════════════════════════════════════════════════════════
//   MANAGE CLIENTS — new feature
// ══════════════════════════════════════════════════════════

function openClientsModal() {
  document.getElementById('clientsOverlay').classList.add('show');
  document.getElementById('clientsModal').classList.add('show');
  document.body.style.overflow = 'hidden';
  renderClientsList();
}

function closeClientsModal() {
  document.getElementById('clientsOverlay').classList.remove('show');
  document.getElementById('clientsModal').classList.remove('show');
  document.body.style.overflow = '';
  // Reset form
  document.getElementById('newClientName').value  = '';
  document.getElementById('newClientPhone').value = '';
  document.getElementById('clientAddError').style.display = 'none';
  document.getElementById('clientAddSuccess').style.display = 'none';
}

// Load clients from Google Sheet via JSONP
function loadClients() {
  window._clientsCallback = function(data) {
    allClients = Array.isArray(data) ? data : [];
  };

  const s = document.createElement('script');
  s.src = CLIENT_SHEET_URL + '?action=listClients&callback=_clientsCallback&t=' + Date.now();
  s.onerror = () => { allClients = []; };
  document.body.appendChild(s);
}

function renderClientsList() {
  const container = document.getElementById('clientsList');

  if (allClients.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:32px 20px;color:var(--text-muted);font-family:'Space Mono',monospace;font-size:0.75rem;">
        No activated clients yet. Add one above.
      </div>`;
    return;
  }

  container.innerHTML = allClients.map((c, i) => `
    <div class="client-row" style="animation-delay:${i * 0.04}s">
      <div class="client-avatar">${initials(c.name)}</div>
      <div class="client-info">
        <div class="client-name">${c.name}</div>
        <div class="client-phone">${c.phone}</div>
      </div>
      <div class="client-added">${c.addedAt ? formatDate(c.addedAt) : 'Recently'}</div>
      <div class="client-status-dot"></div>
    </div>
  `).join('');
}

// Activate a new client — write to Google Sheet via JSONP
function activateClient() {
  const nameEl  = document.getElementById('newClientName');
  const phoneEl = document.getElementById('newClientPhone');
  const errEl   = document.getElementById('clientAddError');
  const sucEl   = document.getElementById('clientAddSuccess');
  const btn     = document.getElementById('activateBtn');

  const name  = nameEl.value.trim();
  const phone = phoneEl.value.trim().replace(/[\s\-\(\)]/g, '');

  errEl.style.display = 'none';
  sucEl.style.display = 'none';

  if (!name || !phone) {
    errEl.textContent = 'Please enter both name and phone number.';
    errEl.style.display = 'block';
    return;
  }

  if (phone.length < 7) {
    errEl.textContent = 'Please enter a valid phone number.';
    errEl.style.display = 'block';
    return;
  }

  // Check duplicate locally
  const exists = allClients.some(c => String(c.phone).replace(/[\s\-\(\)]/g, '') === phone);
  if (exists) {
    errEl.textContent = 'This number is already activated.';
    errEl.style.display = 'block';
    return;
  }

  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:14px;animation:spin 0.8s linear infinite"><path d="M12 2a10 10 0 1 0 10 10" stroke-linecap="round"/></svg> Activating...';
  btn.disabled = true;

  // Use JSONP — the only method that works with Google Apps Script from the browser
  const callbackName = '_activateCallback_' + Date.now();
  const script = document.createElement('script');

  const timeout = setTimeout(() => {
    delete window[callbackName];
    script.remove();
    errEl.textContent = 'Request timed out. Please try again.';
    errEl.style.display = 'block';
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:14px"><polyline points="20 6 9 17 4 12"/></svg> Activate Account';
    btn.disabled = false;
  }, 10000);

  window[callbackName] = function(response) {
    clearTimeout(timeout);
    delete window[callbackName];
    script.remove();

    if (response && response.success) {
      // Add to local list and re-render
      allClients.unshift({ name, phone, addedAt: new Date().toISOString() });
      nameEl.value  = '';
      phoneEl.value = '';
      sucEl.textContent = `✓ ${name} (${phone}) has been activated!`;
      sucEl.style.display = 'block';
      renderClientsList();
      setTimeout(() => { sucEl.style.display = 'none'; }, 3000);
    } else {
      errEl.textContent = (response && response.error) ? response.error : 'Failed to save. Please try again.';
      errEl.style.display = 'block';
    }

    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:14px"><polyline points="20 6 9 17 4 12"/></svg> Activate Account';
    btn.disabled = false;
  };

  script.onerror = function() {
    clearTimeout(timeout);
    delete window[callbackName];
    errEl.textContent = 'Network error. Please check your connection.';
    errEl.style.display = 'block';
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:14px"><polyline points="20 6 9 17 4 12"/></svg> Activate Account';
    btn.disabled = false;
  };

  script.src = `${CLIENT_SHEET_URL}?action=addClient&name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}&callback=${callbackName}&t=${Date.now()}`;
  document.body.appendChild(script);
}

// Allow Enter key in phone field to submit
document.addEventListener('DOMContentLoaded', () => {
  const phoneInput = document.getElementById('newClientPhone');
  if (phoneInput) {
    phoneInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') activateClient();
    });
  }
});
