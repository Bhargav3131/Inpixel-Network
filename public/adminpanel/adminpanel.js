// ============================================================
//   INPIXEL NETWORK — adminpanel.js (v5 — Card-Based Dashboard)
// ============================================================

document.getElementById('gateInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') checkGate();
});
document.getElementById('gateEmail').addEventListener('keydown', e => {
  if (e.key === 'Enter') checkGate();
});

function esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

async function checkGate() {
  const email = document.getElementById('gateEmail').value;
  const password = document.getElementById('gateInput').value;
  
  if (!email || !password) {
    document.getElementById('gateError').textContent = 'Please enter both email and password.';
    document.getElementById('gateError').style.display = 'block';
    return;
  }

  const btn = document.querySelector('.gate-btn');
  const prevText = btn.textContent;
  btn.textContent = 'Checking...';
  btn.disabled = true;

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    
    if (res.ok) {
      sessionStorage.setItem('admin_token', data.token);
      document.getElementById('adminGate').style.display = 'none';
      document.querySelector('nav').style.display  = 'flex';
      document.querySelector('main').style.display = 'block';
      document.getElementById('dashboardView').style.display = 'block';
      
      // Load all data
      loadSubmissions();
      loadAiAdsSubmissions();
      loadMetaAdsSubmissions();
      loadClients();
      loadPayments();
      loadBlogs();
      loadPricing();
      loadEmailSettings();
    } else {
      document.getElementById('gateError').textContent = data.error || 'Incorrect credentials.';
      document.getElementById('gateError').style.display = 'block';
      document.getElementById('gateInput').value = '';
      document.getElementById('gateInput').focus();
    }
  } catch (err) {
    document.getElementById('gateError').textContent = 'Network error. Please try again.';
    document.getElementById('gateError').style.display = 'block';
  } finally {
    btn.textContent = prevText;
    btn.disabled = false;
  }
}

// Helper to get headers
function authHeaders() {
  return {
    'Authorization': 'Bearer ' + sessionStorage.getItem('admin_token'),
    'Content-Type': 'application/json'
  };
}

let allSubmissions = [], allAiAds = [], allMetaAds = [], allClients = [], allPayments = [], allBlogs = [];
let currentFilter = 'all', currentSearch = '', currentOpenId = null, currentBlogFilter = 'all';
let currentSection = null;

// ── NAVIGATION & VIEWS ───────────────────────────────────────
function openSection(section) {
  document.getElementById('dashboardView').style.display = 'none';
  document.getElementById('backToDashBtn').style.display = 'inline-flex';
  document.querySelectorAll('.section-view').forEach(v => v.style.display = 'none');
  
  const targetView = document.getElementById('view-' + section);
  if (targetView) targetView.style.display = 'block';
  currentSection = section;

  if (section === 'payments') {
    startPaymentsLive();
  } else if (payRefreshInterval) {
    clearInterval(payRefreshInterval);
    payRefreshInterval = null;
  }

  if (section === 'blog') loadBlogs();
  if (section === 'clients') renderClientsList();
  if (section === 'pricing') loadPricing();
  if (section === 'email') loadEmailSettings();
}

function backToDashboard() {
  document.querySelectorAll('.section-view').forEach(v => v.style.display = 'none');
  document.getElementById('dashboardView').style.display = 'block';
  document.getElementById('backToDashBtn').style.display = 'none';
  currentSection = null;

  if (payRefreshInterval) {
    clearInterval(payRefreshInterval);
    payRefreshInterval = null;
  }

  updateDashboardBadges();
}

function updateDashboardBadges() {
  const bWeb = document.getElementById('badgeWebsite');
  if (bWeb) bWeb.textContent = allSubmissions.length;

  const bAi = document.getElementById('badgeAiAds');
  if (bAi) bAi.textContent = allAiAds.length;

  const bMeta = document.getElementById('badgeMetaAds');
  if (bMeta) bMeta.textContent = allMetaAds.length;

  const bClients = document.getElementById('badgeClients');
  if (bClients) bClients.textContent = allClients.length;

  const bBlog = document.getElementById('badgeBlog');
  if (bBlog) bBlog.textContent = allBlogs.length;

  const bPay = document.getElementById('badgePayments');
  if (bPay) {
    const paidCount = allPayments.filter(p => p.status === 'paid').length;
    bPay.innerHTML = '<span class="pay-live-dot"></span> ' + paidCount + ' Paid (' + allPayments.length + ' Total)';
  }
}

// ── WEBSITE SUBMISSIONS ──────────────────────────────────────
async function loadSubmissions() {
  const container = document.getElementById('cardsContainer');
  if (container) container.innerHTML = '<div class="empty-state"><p style="color:var(--text-muted);font-family:\'Space Mono\',monospace;font-size:0.8rem;">Loading...</p></div>';
  try {
    const res = await fetch('/api/admin/submissions?type=website', { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error();
    
    const list = data.data || data.submissions || [];
    allSubmissions = list.map(r => ({
      id: r.id,
      submittedAt: r.submitted_at || new Date().toISOString(),
      user: { name: r.client_name || r.name || '', email: r.client_email || r.email || '', phone: String(r.client_phone || r.phone || '') },
      businessName: r.business_name || '', industry: r.industry || '', location: r.location || '',
      description: r.description || '',
      websiteTypes: (r.services || '').split(',').map(s => s.trim()).filter(Boolean),
      features: (r.features || '').split(',').map(s => s.trim()).filter(Boolean),
      designStyle: r.design_style || '', colorTheme: r.colors || '', hasLogo: r.has_logo || '',
      referenceWebsites: r.references_urls || '', pages: r.pages || '', contentProvided: r.content_provided || '',
      hasDomain: r.has_domain || '', domainName: r.domain_name || '', hasHosting: r.has_hosting || '',
      extraNotes: r.extra_notes || '', hearAboutUs: r.source || '', budget: r.budget || '', timeline: r.timeline || ''
    }));
    updateStats();
    renderCards();
    updateDashboardBadges();
  } catch (err) {
    if (container) container.innerHTML = '<div class="empty-state"><p style="color:#ff4444;font-family:\'Space Mono\',monospace;font-size:0.8rem;">Failed to load.</p></div>';
  }
}

function updateStats() {
  const elTotal = document.getElementById('statTotal');
  const elToday = document.getElementById('statToday');
  const elWeek  = document.getElementById('statWeek');
  if (elTotal) elTotal.textContent = allSubmissions.length;
  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  if (elToday) elToday.textContent = allSubmissions.filter(s => new Date(s.submittedAt) >= todayStart).length;
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7);
  if (elWeek) elWeek.textContent = allSubmissions.filter(s => new Date(s.submittedAt) >= weekStart).length;
}

function renderCards() {
  const container = document.getElementById('cardsContainer');
  if (!container) return;
  let list = allSubmissions;
  if (currentFilter !== 'all') list = list.filter(s => s.websiteTypes.includes(currentFilter));
  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    list = list.filter(s => (s.user?.name||'').toLowerCase().includes(q) || (s.user?.phone||'').toLowerCase().includes(q) || (s.businessName||'').toLowerCase().includes(q));
  }
  if (!list.length) {
    container.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><h3>No Submissions Yet</h3><p>Once clients fill the form, their entries appear here.</p></div>';
    return;
  }
  container.innerHTML = '<div class="cards-grid">' + list.map((s, i) => cardHTML(s, i)).join('') + '</div>';
}

function initials(name) { if (!name) return '?'; return name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2); }
function formatDate(iso) { const d = new Date(iso); return d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }); }

function cardHTML(s, idx) {
  const tags = s.websiteTypes.map(t => '<span class="chip">'+esc(t)+'</span>').join('');
  const sid = String(s.id).replace(/'/g, "\\'");
  return '<div class="sub-card" onclick="openModal(\''+sid+'\')" style="animation-delay:'+idx*0.05+'s"><div class="card-top"><div class="card-avatar">'+initials(s.user?.name)+'</div><div class="card-date">'+formatDate(s.submittedAt)+'</div></div><div class="card-name">'+(esc(s.user?.name)||'—')+'</div><div class="card-contact"><span>'+(esc(s.user?.phone)||'—')+'</span></div><div class="card-chips">'+tags+'</div><div class="card-footer"><div class="card-business">'+(esc(s.businessName)||'No business name')+'</div><div class="view-btn">View <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></div></div></div>';
}

function openModal(id) {
  const s = allSubmissions.find(x => String(x.id) === String(id)); if (!s) return;
  currentOpenId = id;
  document.getElementById('mAvatar').textContent = initials(s.user?.name);
  document.getElementById('mAvatar').style.background = '';
  document.getElementById('mName').textContent = s.user?.name || '—';
  document.getElementById('mSub').textContent = (s.user?.email||'') + ' · ' + (s.user?.phone||'');
  document.getElementById('mTimestamp').textContent = 'Submitted: ' + new Date(s.submittedAt).toLocaleString('en-IN');
  const tagList = arr => arr?.length ? '<div class="tag-list">'+arr.map(t=>'<span class="tag">'+esc(t)+'</span>').join('')+'</div>' : '<p class="empty">None selected</p>';
  const val = v => v ? '<p>'+esc(v)+'</p>' : '<p class="empty">Not provided</p>';
  document.getElementById('mBody').innerHTML = '<div class="detail-section"><div class="detail-section-title">Contact</div><div class="detail-grid"><div class="detail-field"><label>Name</label>'+val(s.user?.name)+'</div><div class="detail-field"><label>Phone</label>'+val(s.user?.phone)+'</div><div class="detail-field full"><label>Email</label>'+val(s.user?.email)+'</div></div></div><div class="detail-section"><div class="detail-section-title">Business</div><div class="detail-grid"><div class="detail-field"><label>Business Name</label>'+val(s.businessName)+'</div><div class="detail-field"><label>Industry</label>'+val(s.industry)+'</div><div class="detail-field"><label>Location</label>'+val(s.location)+'</div><div class="detail-field"><label>Source</label>'+val(s.hearAboutUs)+'</div><div class="detail-field full"><label>Description</label>'+val(s.description)+'</div></div></div><div class="detail-section"><div class="detail-section-title">Website Requirements</div><div class="detail-grid"><div class="detail-field full"><label>Types</label>'+tagList(s.websiteTypes)+'</div><div class="detail-field full"><label>Features</label>'+tagList(s.features)+'</div><div class="detail-field full"><label>Pages</label>'+val(s.pages)+'</div></div></div><div class="detail-section"><div class="detail-section-title">Design</div><div class="detail-grid"><div class="detail-field"><label>Style</label>'+val(s.designStyle)+'</div><div class="detail-field"><label>Colors</label>'+val(s.colorTheme)+'</div><div class="detail-field"><label>Has Logo</label>'+val(s.hasLogo)+'</div><div class="detail-field"><label>Content</label>'+val(s.contentProvided)+'</div><div class="detail-field full"><label>References</label>'+val(s.referenceWebsites)+'</div></div></div><div class="detail-section"><div class="detail-section-title">Technical & Budget</div><div class="detail-grid"><div class="detail-field"><label>Domain?</label>'+val(s.hasDomain)+'</div><div class="detail-field"><label>Domain Name</label>'+val(s.domainName)+'</div><div class="detail-field"><label>Hosting?</label>'+val(s.hasHosting)+'</div><div class="detail-field"><label>Budget</label>'+val(s.budget)+'</div><div class="detail-field"><label>Timeline</label>'+val(s.timeline)+'</div></div></div>'+(s.extraNotes?'<div class="detail-section"><div class="detail-section-title">Notes</div><div class="detail-field"><p>'+esc(s.extraNotes)+'</p></div></div>':'');
  document.getElementById('mDeleteBtn').style.display = 'flex';
  document.getElementById('mDeleteBtn').onclick = () => deleteEntry(id);
  document.getElementById('overlay').classList.add('show');
  document.getElementById('detailModal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('overlay').classList.remove('show');
  document.getElementById('detailModal').classList.remove('show');
  document.body.style.overflow = '';
  document.getElementById('mDeleteBtn').style.display = 'flex';
  currentOpenId = null;
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

async function deleteEntry(id) {
  if (!confirm('Delete this submission?')) return;
  try {
    const res = await fetch('/api/admin/submissions', {
      method: 'DELETE',
      headers: authHeaders(),
      body: JSON.stringify({ type: 'website', id })
    });
    if (!res.ok) throw new Error();
    allSubmissions = allSubmissions.filter(s => s.id !== id);
    closeModal();
    updateStats();
    renderCards();
    updateDashboardBadges();
  } catch (err) {
    alert('Failed to delete. Please try again.');
  }
}

function confirmClearAll() {
  alert('Clear all is disabled to prevent accidental data loss.');
}

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

// ── AI ADS SUBMISSIONS ───────────────────────────────────────
async function loadAiAdsSubmissions() {
  const container = document.getElementById('aiAdsContainer');
  if (container) container.innerHTML = '<div class="empty-state"><p style="color:var(--text-muted);font-family:\'Space Mono\',monospace;font-size:0.8rem;">Loading AI Ads submissions...</p></div>';
  try {
    const res = await fetch('/api/admin/submissions?type=aiads', { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error();
    
    const list = data.data || data.submissions || [];
    allAiAds = list.map(r => ({
      id: r.id,
      'Name': r.name || '',
      'Phone': r.phone || '',
      'Model No': r.model_no || '',
      'Script': r.script || '',
      'Submitted At': r.submitted_at || ''
    }));
    renderAiAdsCards();
    updateAiAdsStats();
    updateDashboardBadges();
  } catch (err) {
    allAiAds = [];
    renderAiAdsCards();
  }
}

function updateAiAdsStats() {
  const elTotal = document.getElementById('aiStatTotal');
  const elToday = document.getElementById('aiStatToday');
  if (elTotal) elTotal.textContent = allAiAds.length;
  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  if (elToday) elToday.textContent = allAiAds.filter(s => new Date(s['Submitted At']) >= todayStart).length;
}

function renderAiAdsCards() {
  const container = document.getElementById('aiAdsContainer');
  if (!container) return;
  const search = (document.getElementById('aiSearchInput')?.value || '').toLowerCase();
  let list = allAiAds;
  if (search) list = list.filter(s => (s['Name']||'').toLowerCase().includes(search) || (s['Phone']||'').toLowerCase().includes(search));
  if (!list.length) {
    container.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg><h3>No AI Ads Submissions Yet</h3><p>Activated AI Ads clients will appear here.</p></div>';
    return;
  }
  container.innerHTML = '<div class="cards-grid">' + list.map((s, i) => aiCardHTML(s, i)).join('') + '</div>';
}

function aiCardHTML(s, idx) {
  const preview = (s['Script']||'').slice(0, 80) + ((s['Script']||'').length > 80 ? '…' : '');
  const sid = String(s.id).replace(/'/g, "\\'");
  return '<div class="sub-card" onclick="openAiModal(\''+sid+'\')" style="animation-delay:'+idx*0.05+'s"><div class="card-top"><div class="card-avatar" style="background:linear-gradient(135deg,#7c3aed,#a855f7)">'+initials(s['Name'])+'</div><div class="card-date">'+formatDate(s['Submitted At'])+'</div></div><div class="card-name">'+(esc(s['Name'])||'—')+'</div><div class="card-contact"><span>'+(esc(s['Phone'])||'—')+'</span></div><div class="card-chips"><span class="chip" style="background:rgba(168,85,247,0.12);border-color:rgba(168,85,247,0.3);color:#a855f7;">Model '+(esc(s['Model No'])||'—')+'</span></div><div class="card-footer"><div class="card-business" style="font-size:0.8rem;color:var(--text-muted)">'+(esc(preview)||'No script')+'</div><div class="view-btn">View <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></div></div></div>';
}

function openAiModal(id) {
  const s = allAiAds.find(x => String(x.id) === String(id)); if (!s) return;
  document.getElementById('mAvatar').textContent = initials(s['Name']);
  document.getElementById('mAvatar').style.background = 'linear-gradient(135deg,#7c3aed,#a855f7)';
  document.getElementById('mName').textContent = s['Name'] || '—';
  document.getElementById('mSub').textContent = s['Phone'] || '—';
  document.getElementById('mTimestamp').textContent = 'Submitted: ' + new Date(s['Submitted At']).toLocaleString('en-IN');
  document.getElementById('mBody').innerHTML = '<div class="detail-section"><div class="detail-section-title">Client Info</div><div class="detail-grid"><div class="detail-field"><label>Name</label><p>'+(esc(s['Name'])||'—')+'</p></div><div class="detail-field"><label>Phone</label><p>'+(esc(s['Phone'])||'—')+'</p></div></div></div><div class="detail-section"><div class="detail-section-title">AI Ad Details</div><div class="detail-grid"><div class="detail-field"><label>Selected Model</label><p style="color:#a855f7;font-family:\'Syne\',sans-serif;font-weight:700;font-size:1.1rem;">Model '+(esc(s['Model No'])||'—')+'</p></div><div class="detail-field full"><label>Ad Script</label><p style="white-space:pre-wrap;line-height:1.7">'+(esc(s['Script'])||'—')+'</p></div></div></div>';
  document.getElementById('mDeleteBtn').style.display = 'flex';
  document.getElementById('mDeleteBtn').onclick = async () => {
    if (!confirm('Delete this entry?')) return;
    try {
      const res = await fetch('/api/admin/submissions', {
        method: 'DELETE',
        headers: authHeaders(),
        body: JSON.stringify({ type: 'aiads', id })
      });
      if (!res.ok) throw new Error();
      allAiAds = allAiAds.filter(x => String(x.id) !== String(id));
      closeModal();
      renderAiAdsCards();
      updateAiAdsStats();
      updateDashboardBadges();
    } catch (err) {
      alert('Failed to delete.');
    }
  };
  document.getElementById('overlay').classList.add('show');
  document.getElementById('detailModal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

// ── META ADS SUBMISSIONS ─────────────────────────────────────
async function loadMetaAdsSubmissions() {
  const container = document.getElementById('metaAdsContainer');
  if (container) container.innerHTML = '<div class="empty-state"><p style="color:var(--text-muted);font-family:\'Space Mono\',monospace;font-size:0.8rem;">Loading Meta Ads submissions...</p></div>';
  try {
    const res = await fetch('/api/admin/submissions?type=metaads', { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error();
    
    const list = data.data || data.submissions || [];
    allMetaAds = list.map(r => ({
      id: r.id,
      'Name': r.name || '',
      'Phone': r.phone || '',
      'Business Name': r.business_name || '',
      'What Advertising': r.what_advertising || '',
      'Target Audience': r.target_audience || '',
      'Campaign Objective': r.campaign_objective || '',
      'Daily Budget': r.daily_budget || '',
      'Lead Destination': r.lead_destination || '',
      'Website Link': r.website_link || '',
      'Extra Notes': r.extra_notes || '',
      'Submitted At': r.submitted_at || ''
    }));
    renderMetaAdsCards();
    updateMetaAdsStats();
    updateDashboardBadges();
  } catch (err) {
    allMetaAds = [];
    renderMetaAdsCards();
  }
}

function updateMetaAdsStats() {
  const elTotal = document.getElementById('metaStatTotal');
  const elToday = document.getElementById('metaStatToday');
  if (elTotal) elTotal.textContent = allMetaAds.length;
  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  if (elToday) elToday.textContent = allMetaAds.filter(s => new Date(s['Submitted At']) >= todayStart).length;
}

function renderMetaAdsCards() {
  const container = document.getElementById('metaAdsContainer');
  if (!container) return;
  const search = (document.getElementById('metaSearchInput')?.value || '').toLowerCase();
  let list = allMetaAds;
  if (search) list = list.filter(s => (s['Name']||'').toLowerCase().includes(search) || (s['Phone']||'').toLowerCase().includes(search) || (s['Business Name']||'').toLowerCase().includes(search));
  if (!list.length) {
    container.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg><h3>No Meta Ads Submissions Yet</h3><p>Activated Meta Ads clients will appear here.</p></div>';
    return;
  }
  container.innerHTML = '<div class="cards-grid">' + list.map((s, i) => metaCardHTML(s, i)).join('') + '</div>';
}

function metaCardHTML(s, idx) {
  const preview = (s['What Advertising']||'').slice(0, 80) + ((s['What Advertising']||'').length > 80 ? '…' : '');
  const sid = String(s.id).replace(/'/g, "\\'");
  return '<div class="sub-card" onclick="openMetaModal(\'' + sid + '\')" style="animation-delay:' + idx*0.05 + 's">'
    + '<div class="card-top"><div class="card-avatar" style="background:linear-gradient(135deg,#1565d8,#1877f2)">' + initials(s['Name']) + '</div><div class="card-date">' + formatDate(s['Submitted At']) + '</div></div>'
    + '<div class="card-name">' + (esc(s['Name'])||'—') + '</div>'
    + '<div class="card-contact"><span>' + (esc(s['Phone'])||'—') + '</span></div>'
    + '<div class="card-chips">'
      + '<span class="chip" style="background:rgba(240,165,0,0.1);border-color:rgba(24,119,242,0.3);color:#6aabff;">' + (esc(s['Campaign Objective'])||'—') + '</span>'
      + (s['Daily Budget'] ? '<span class="chip grey">₹' + esc(s['Daily Budget']) + '/day</span>' : '')
    + '</div>'
    + '<div class="card-footer"><div class="card-business" style="font-size:0.8rem;color:var(--text-muted)">' + (esc(s['Business Name'])||'—') + ' · ' + (esc(preview)||'No details') + '</div><div class="view-btn">View <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></div></div>'
    + '</div>';
}

function openMetaModal(id) {
  const s = allMetaAds.find(x => String(x.id) === String(id)); if (!s) return;
  document.getElementById('mAvatar').textContent = initials(s['Name'] || '?');
  document.getElementById('mAvatar').style.background = 'linear-gradient(135deg,#1565d8,#1877f2)';
  document.getElementById('mName').textContent = s['Name'] || '—';
  document.getElementById('mSub').textContent = s['Phone'] || '—';
  const ts = s['Submitted At'] ? new Date(s['Submitted At']) : null;
  document.getElementById('mTimestamp').textContent = 'Submitted: ' + (ts && !isNaN(ts) ? ts.toLocaleString('en-IN') : '—');
  const val = v => (v && String(v).trim()) ? '<p>' + esc(String(v)) + '</p>' : '<p class="empty">Not provided</p>';
  document.getElementById('mBody').innerHTML =
    '<div class="detail-section"><div class="detail-section-title">Client Info</div><div class="detail-grid">'
    + '<div class="detail-field"><label>Name</label>' + val(s['Name']) + '</div>'
    + '<div class="detail-field"><label>Phone</label>' + val(s['Phone']) + '</div>'
    + '</div></div>'
    + '<div class="detail-section"><div class="detail-section-title">Campaign Details</div><div class="detail-grid">'
    + '<div class="detail-field"><label>Business Name</label>' + val(s['Business Name']) + '</div>'
    + '<div class="detail-field"><label>Campaign Objective</label>'
      + (s['Campaign Objective'] && String(s['Campaign Objective']).trim()
        ? '<p style="color:#6aabff;font-family:\'Syne\',sans-serif;font-weight:700;">' + esc(s['Campaign Objective']) + '</p>'
        : '<p class="empty">Not provided</p>') + '</div>'
    + '<div class="detail-field"><label>Daily Budget</label>'
      + (s['Daily Budget'] && String(s['Daily Budget']).trim()
        ? '<p>₹' + esc(s['Daily Budget']) + ' / day</p>'
        : '<p class="empty">Not provided</p>') + '</div>'
    + '<div class="detail-field"><label>Lead Destination</label>' + val(s['Lead Destination']) + '</div>'
    + '<div class="detail-field full"><label>Website / Link</label>' + val(s['Website Link']) + '</div>'
    + '<div class="detail-field full"><label>What They\'re Advertising</label>' + val(s['What Advertising']) + '</div>'
    + '<div class="detail-field full"><label>Target Audience</label>' + val(s['Target Audience']) + '</div>'
    + (s['Extra Notes'] && String(s['Extra Notes']).trim()
      ? '<div class="detail-field full"><label>Extra Notes</label>' + val(s['Extra Notes']) + '</div>'
      : '')
    + '</div></div>';
  document.getElementById('mDeleteBtn').style.display = 'flex';
  document.getElementById('mDeleteBtn').onclick = async () => {
    if (!confirm('Delete this entry?')) return;
    try {
      const res = await fetch('/api/admin/submissions', {
        method: 'DELETE',
        headers: authHeaders(),
        body: JSON.stringify({ type: 'metaads', id })
      });
      if (!res.ok) throw new Error();
      allMetaAds = allMetaAds.filter(x => x.id !== id);
      closeModal();
      renderMetaAdsCards();
      updateMetaAdsStats();
      updateDashboardBadges();
    } catch (err) {
      alert('Failed to delete.');
    }
  };
  document.getElementById('overlay').classList.add('show');
  document.getElementById('detailModal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

// ── MANAGE CLIENTS ───────────────────────────────────────────
async function loadClients() {
  try {
    const res = await fetch('/api/admin/clients', { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error();
    allClients = (data.data || []).map(r => ({
      name: r.name,
      phone: r.phone,
      services: r.services || 'website',
      addedAt: r.added_at
    }));
    updateDashboardBadges();
  } catch (err) {
    allClients = [];
  }
}

function renderClientsList() {
  const container = document.getElementById('clientsList');
  if (!container) return;
  const search = (document.getElementById('clientSearch')?.value || '').toLowerCase();
  let list = allClients;
  if (search) list = list.filter(c => c.name.toLowerCase().includes(search) || String(c.phone).includes(search));
  if (!list.length) {
    container.innerHTML = '<div style="text-align:center;padding:32px 20px;color:var(--text-muted);font-family:\'Space Mono\',monospace;font-size:0.75rem;">' + (search ? 'No clients match your search.' : 'No activated clients yet.') + '</div>';
    return;
  }
  container.innerHTML = list.map((c, i) => {
    const svcs = String(c.services || 'website');
    const hasWeb  = svcs.includes('website') || svcs === 'both';
    const hasAi   = svcs.includes('aiads')   || svcs === 'both';
    const hasMeta = svcs.includes('metaads');
    const phone   = String(c.phone);
    return '<div class="client-row" style="animation-delay:'+i*0.04+'s">'
      + '<div class="client-avatar">'+initials(c.name)+'</div>'
      + '<div class="client-info"><div class="client-name">'+esc(c.name)+'</div><div class="client-phone">'+esc(phone)+'</div></div>'
      + '<div style="display:flex;gap:6px;flex-shrink:0;flex-wrap:wrap;">'
        + (hasWeb  ? '<span style="font-family:\'Space Mono\',monospace;font-size:0.6rem;padding:3px 8px;background:rgba(240,165,0,0.1);border:1px solid rgba(240,165,0,0.3);color:var(--gold);">WEBSITE</span>' : '')
        + (hasAi   ? '<span style="font-family:\'Space Mono\',monospace;font-size:0.6rem;padding:3px 8px;background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.3);color:#a855f7;">AI ADS</span>' : '')
        + (hasMeta ? '<span style="font-family:\'Space Mono\',monospace;font-size:0.6rem;padding:3px 8px;background:rgba(24,119,242,0.1);border:1px solid rgba(24,119,242,0.3);color:#6aabff;">META ADS</span>' : '')
      + '</div>'
      + '<div class="client-added">'+(c.addedAt ? formatDate(c.addedAt) : 'Recently')+'</div>'
      + '<div class="client-status-dot"></div>'
      + '<button onclick="deactivateClient(\''+esc(phone)+'\')" style="background:transparent;border:1px solid rgba(255,68,68,0.3);color:#ff6666;font-family:\'Space Mono\',monospace;font-size:0.6rem;padding:4px 8px;cursor:pointer;flex-shrink:0;transition:all 0.2s;" onmouseover="this.style.borderColor=\'#ff4444\';this.style.background=\'rgba(255,68,68,0.08)\'" onmouseout="this.style.borderColor=\'rgba(255,68,68,0.3)\';this.style.background=\'transparent\'">Remove</button>'
      + '</div>';
  }).join('');
}

async function deactivateClient(phone) {
  if (!confirm('Remove this client? They will no longer be able to log in.')) return;
  const normalized = String(phone).replace(/[\s\-\(\)]/g, '');
  try {
    const res = await fetch('/api/admin/clients', {
      method: 'DELETE',
      headers: authHeaders(),
      body: JSON.stringify({ phone: normalized })
    });
    if (!res.ok) throw new Error();
    allClients = allClients.filter(c => String(c.phone).replace(/[\s\-\(\)]/g, '') !== normalized);
    renderClientsList();
    updateDashboardBadges();
  } catch (err) {
    alert('Failed to remove client.');
  }
}

async function activateClient() {
  const nameEl  = document.getElementById('newClientName');
  const phoneEl = document.getElementById('newClientPhone');
  const errEl   = document.getElementById('clientAddError');
  const sucEl   = document.getElementById('clientAddSuccess');
  const btn     = document.getElementById('activateBtn');
  const name    = nameEl.value.trim();
  const phone   = phoneEl.value.trim().replace(/[\s\-\(\)]/g, '');
  const hasWeb  = document.getElementById('svcWebsite').checked;
  const hasAi   = document.getElementById('svcAiAds').checked;
  const hasMeta = document.getElementById('svcMetaAds').checked;

  errEl.style.display = 'none'; sucEl.style.display = 'none';

  if (!name || !phone) { errEl.textContent = 'Please enter both name and phone number.'; errEl.style.display = 'block'; return; }
  if (phone.length < 7) { errEl.textContent = 'Please enter a valid phone number.'; errEl.style.display = 'block'; return; }
  if (!hasWeb && !hasAi && !hasMeta) { errEl.textContent = 'Please select at least one service.'; errEl.style.display = 'block'; return; }

  const svcList = [hasWeb ? 'website' : null, hasAi ? 'aiads' : null, hasMeta ? 'metaads' : null].filter(Boolean);
  const services = svcList.join(',');
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:14px;animation:spin 0.8s linear infinite"><path d="M12 2a10 10 0 1 0 10 10" stroke-linecap="round"/></svg> Activating...';
  btn.disabled = true;

  const reset = () => { btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:14px"><polyline points="20 6 9 17 4 12"/></svg> Activate Account'; btn.disabled = false; };

  try {
    const res = await fetch('/api/admin/clients', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ name, phone, services })
    });
    
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to save');
    }

    const norm = p => String(p).replace(/[\s\-\(\)]/g, '');
    const idx  = allClients.findIndex(c => norm(c.phone) === norm(phone));
    if (idx >= 0) allClients[idx].services = services;
    else allClients.unshift({ name, phone, addedAt: new Date().toISOString(), services });
    
    nameEl.value = ''; phoneEl.value = '';
    document.getElementById('svcWebsite').checked = true;
    document.getElementById('svcAiAds').checked = false;
    document.getElementById('svcMetaAds').checked = false;
    const label = svcList.map(s => s === 'website' ? 'Website' : s === 'aiads' ? 'AI Ads' : 'Meta Ads').join(' + ');
    sucEl.textContent = '✓ ' + name + ' activated for ' + label + '!';
    sucEl.style.display = 'block';
    renderClientsList();
    updateDashboardBadges();
    setTimeout(() => { sucEl.style.display = 'none'; }, 3000);
  } catch (err) {
    errEl.textContent = err.message || 'Failed to save.'; errEl.style.display = 'block';
  }
  reset();
}

// ── PAYMENTS DASHBOARD ───────────────────────────────────────
let payRefreshInterval = null;

async function loadPayments() {
  const token = sessionStorage.getItem('admin_token');
  if (!token) return;
  try {
    const res = await fetch('/api/admin/payments', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) return;
    const json = await res.json();
    allPayments = json.data || [];
    updatePayStats();
    renderPayments();
    updateDashboardBadges();
    const upEl = document.getElementById('payLastUpdated');
    if (upEl) upEl.textContent = 'Updated ' + new Date().toLocaleTimeString('en-IN');
  } catch(e) { console.error('Failed to load payments', e); }
}

function updatePayStats() {
  const elTot = document.getElementById('payStatTotal');
  const elPaid = document.getElementById('payStatPaid');
  const elPend = document.getElementById('payStatPending');
  const elFail = document.getElementById('payStatFailed');
  if (elTot) elTot.textContent = allPayments.length;
  if (elPaid) elPaid.textContent = allPayments.filter(p => p.status === 'paid').length;
  if (elPend) elPend.textContent = allPayments.filter(p => p.status === 'pending').length;
  if (elFail) elFail.textContent = allPayments.filter(p => p.status === 'failed').length;
}

function renderPayments() {
  const container = document.getElementById('paymentsContainer');
  if (!container) return;
  if (!allPayments.length) {
    container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);font-family:\'Space Mono\',monospace;font-size:0.8rem;">No payments recorded yet.</div>';
    return;
  }
  container.innerHTML = allPayments.map((p, i) => {
    const status = (p.status || 'pending').toLowerCase();
    const statusClass = status === 'paid' ? 's-paid' : status === 'failed' ? 's-failed' : 's-pending';
    const cardClass = 'status-' + (status === 'paid' ? 'paid' : status === 'failed' ? 'failed' : 'pending');
    const amount = p.amount ? '₹' + (p.amount / 100).toLocaleString('en-IN') : '—';
    const service = (p.service || '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const date = p.created_at ? new Date(p.created_at).toLocaleString('en-IN') : '—';
    const name = p.client_name || 'Unknown';
    const phone = p.client_phone || '—';
    const failureReason = p.failure_reason ? `<div class="pay-meta" style="color:#ef4444;margin-top:4px;">Reason: ${esc(p.failure_reason)}</div>` : '';

    const payIdStr = String(p.id).replace(/'/g, "\\'");
    return '<div class="pay-card ' + cardClass + '" onclick="openPaymentModalDetail(\'' + payIdStr + '\')" style="cursor:pointer;animation-delay:' + (i * 0.04) + 's">'
      + '<div class="pay-info">'
      + '<div class="pay-name">' + esc(name) + ' <span style="font-size:0.75rem;font-weight:400;color:var(--text-muted);">(' + esc(p.client_email || 'No email') + ')</span></div>'
      + '<div class="pay-meta">' + esc(phone) + ' · <strong style="color:var(--white);">' + esc(p.plan_name || service) + '</strong></div>'
      + failureReason
      + '<div class="pay-meta" style="margin-top:2px;">' + date + '</div>'
      + '</div>'
      + '<div style="text-align:right;">'
      + '<div class="pay-amount">' + amount + '<small style="margin-top:4px;color:var(--text-muted);">Click to view details</small></div>'
      + '<div style="margin-top:8px;"><span class="pay-status ' + statusClass + '">' + status.toUpperCase() + '</span></div>'
      + '</div>'
      + '</div>';
  }).join('');
}

function openPaymentModalDetail(id) {
  const p = allPayments.find(x => String(x.id) === String(id));
  if (!p) return;

  const status = (p.status || 'pending').toLowerCase();
  const statusColor = status === 'paid' ? '#22c55e' : status === 'failed' ? '#ef4444' : '#f0a500';
  const amount = p.amount ? '₹' + (p.amount / 100).toLocaleString('en-IN') : '—';
  const service = (p.service || '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const date = p.created_at ? new Date(p.created_at).toLocaleString('en-IN') : '—';

  document.getElementById('mAvatar').textContent = initials(p.client_name || '?');
  document.getElementById('mAvatar').style.background = 'linear-gradient(135deg,#f0a500,#ff8c00)';
  document.getElementById('mName').textContent = p.client_name || 'Unknown Client';
  document.getElementById('mSub').textContent = p.client_phone || '—';
  document.getElementById('mTimestamp').textContent = 'Created: ' + date;

  document.getElementById('mBody').innerHTML = `
    <div class="detail-section">
      <div class="detail-section-title">Client Details</div>
      <div class="detail-grid">
        <div class="detail-field"><label>Full Name</label><p>${esc(p.client_name) || 'Not provided'}</p></div>
        <div class="detail-field"><label>Phone Number</label><p style="color:var(--gold);">${esc(p.client_phone) || 'Not provided'}</p></div>
        <div class="detail-field full"><label>Email Address</label><p>${esc(p.client_email) || 'Not provided'}</p></div>
      </div>
    </div>
    
    <div class="detail-section">
      <div class="detail-section-title">Payment & Subscription Info</div>
      <div class="detail-grid">
        <div class="detail-field"><label>Status</label><p style="color:${statusColor};font-weight:700;text-transform:uppercase;">${status}</p></div>
        <div class="detail-field"><label>Amount</label><p style="color:var(--white);font-weight:700;font-size:1.1rem;">${amount}</p></div>
        <div class="detail-field"><label>Plan Enrolled</label><p style="color:var(--white);">${esc(p.plan_name) || esc(service)}</p></div>
        <div class="detail-field"><label>Service Code</label><p>${esc(p.service) || '—'}</p></div>
        <div class="detail-field full"><label>Razorpay Order ID</label><p style="font-family:'Space Mono',monospace;">${esc(p.razorpay_order_id) || '—'}</p></div>
        <div class="detail-field full"><label>Razorpay Payment ID</label><p style="font-family:'Space Mono',monospace;">${esc(p.razorpay_payment_id) || '—'}</p></div>
        ${p.failure_reason ? `<div class="detail-field full"><label>Failure Reason</label><p style="color:#ef4444;background:rgba(239,68,68,0.1);padding:8px 12px;border:1px solid rgba(239,68,68,0.3);border-radius:4px;">${esc(p.failure_reason)}</p></div>` : ''}
      </div>
    </div>
  `;

  document.getElementById('mDeleteBtn').style.display = 'none';
  document.getElementById('overlay').classList.add('show');
  document.getElementById('detailModal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function startPaymentsLive() {
  if (payRefreshInterval) clearInterval(payRefreshInterval);
  loadPayments();
  payRefreshInterval = setInterval(loadPayments, 15000);
}

// ── BLOG MANAGEMENT ──────────────────────────────────────────
async function loadBlogs() {
  const container = document.getElementById('blogsContainer');
  if (container) container.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-muted);font-family:\'Space Mono\',monospace;font-size:0.8rem;">Loading blogs...</div>';

  try {
    const res = await fetch('/api/blog/manage', { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch');
    allBlogs = data.blogs || [];
    renderBlogs();
    updateDashboardBadges();
  } catch (err) {
    if (container) container.innerHTML = '<div style="text-align:center;padding:30px;color:#ef4444;font-family:\'Space Mono\',monospace;font-size:0.8rem;">Failed to load blogs.</div>';
  }
}

function setBlogFilter(filter, btn) {
  currentBlogFilter = filter;
  document.getElementById('blogFilterAll').classList.toggle('active', filter === 'all');
  document.getElementById('blogFilterPub').classList.toggle('active', filter === 'published');
  document.getElementById('blogFilterDraft').classList.toggle('active', filter === 'draft');
  renderBlogs();
}

function renderBlogs() {
  const container = document.getElementById('blogsContainer');
  if (!container) return;

  const filtered = allBlogs.filter(b => {
    if (currentBlogFilter === 'all') return true;
    return b.status === currentBlogFilter;
  });

  if (!filtered.length) {
    container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);font-family:\'Space Mono\',monospace;font-size:0.8rem;">No blogs found. Click "Generate AI Blog" to create one.</div>';
    return;
  }

  container.innerHTML = filtered.map(b => {
    const isPub = b.status === 'published';
    const statusBadge = isPub 
      ? '<span style="background:rgba(34,197,94,0.12); color:#22c55e; border:1px solid rgba(34,197,94,0.3); font-size:0.65rem; padding:3px 8px; border-radius:3px; font-family:\'Space Mono\',monospace; text-transform:uppercase;">Published</span>'
      : '<span style="background:rgba(240,165,0,0.12); color:#f0a500; border:1px solid rgba(240,165,0,0.3); font-size:0.65rem; padding:3px 8px; border-radius:3px; font-family:\'Space Mono\',monospace; text-transform:uppercase;">Draft</span>';
    const dateStr = b.created_at ? new Date(b.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
    const publicUrl = '/blog/' + encodeURIComponent(b.slug);

    return `
      <div class="blog-item-card">
        <div style="display:flex; align-items:center; gap:16px; min-width:0; flex:1;">
          ${b.thumbnail_url ? `<img src="${esc(b.thumbnail_url)}" alt="thumbnail" style="width:58px; height:38px; object-fit:cover; border-radius:4px; border:1px solid var(--border); flex-shrink:0;">` : ''}
          <div style="min-width:0; flex:1;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px; flex-wrap:wrap;">
              ${statusBadge}
              <span style="font-family:'Space Mono',monospace; font-size:0.7rem; color:var(--text-muted);">${esc(b.category || 'General')} · ${dateStr}</span>
            </div>
            <div style="font-family:'Syne',sans-serif; font-weight:700; color:var(--white); font-size:0.95rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${esc(b.title)}
            </div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
          <a href="${publicUrl}" target="_blank" class="blog-action-btn" style="text-decoration:none;">View</a>
          <button class="blog-action-btn" onclick="toggleBlogStatus('${b.id}', '${isPub ? 'draft' : 'published'}')">${isPub ? 'Make Draft' : 'Publish'}</button>
          <button class="blog-action-btn del" onclick="deleteBlog('${b.id}')">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

async function toggleBlogStatus(id, newStatus) {
  try {
    const res = await fetch('/api/blog/manage', {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ id, status: newStatus })
    });
    if (!res.ok) throw new Error();
    loadBlogs();
  } catch (err) {
    alert('Failed to update blog status');
  }
}

async function deleteBlog(id) {
  if (!confirm('Are you sure you want to delete this blog post?')) return;
  try {
    const res = await fetch('/api/blog/manage', {
      method: 'DELETE',
      headers: authHeaders(),
      body: JSON.stringify({ id })
    });
    if (!res.ok) throw new Error();
    loadBlogs();
  } catch (err) {
    alert('Failed to delete blog post');
  }
}

async function triggerGenerateBlog() {
  const topicInput = document.getElementById('customBlogTopic');
  const statusEl = document.getElementById('blogGenStatus');
  const btn = document.getElementById('btnGenBlog');
  const topic = topicInput ? topicInput.value.trim() : '';

  btn.disabled = true;
  btn.textContent = 'Generating with AI...';
  if (statusEl) {
    statusEl.textContent = '🤖 Calling Gemini AI & generating thumbnail... takes ~10-15s';
    statusEl.style.display = 'block';
  }

  try {
    const res = await fetch('/api/blog/generate', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(topic ? { topic } : {})
    });
    const resText = await res.text();
    let data;
    try {
      data = JSON.parse(resText);
    } catch(e) {
      throw new Error('Server took too long to generate. Please try again.');
    }
    if (!res.ok) throw new Error(data.message || (data.error && data.error.message) || 'Generation failed');

    if (statusEl) {
      statusEl.textContent = `✓ Generated: "${data.title}"`;
      setTimeout(() => { statusEl.style.display = 'none'; }, 4000);
    }
    if (topicInput) topicInput.value = '';
    loadBlogs();
  } catch (err) {
    alert('Failed to generate blog: ' + err.message);
    if (statusEl) statusEl.style.display = 'none';
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Generate AI Blog`;
  }
}

// ── PRICING & SETTINGS ───────────────────────────────────────
const PRICING_KEYS = ['socialmedia', 'webdevelopment-starter', 'webdevelopment-pro', 'aivideos', 'metaads', 'quotation'];
const DEFAULT_PRICES = {
  'socialmedia': 999,
  'webdevelopment-starter': 2999,
  'webdevelopment-pro': 5999,
  'aivideos': 999,
  'metaads': 2999,
  'quotation': 2999
};

async function loadPricing() {
  try {
    const res = await fetch('/api/admin/payments?action=pricing', {
      headers: authHeaders()
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        PRICING_KEYS.forEach(key => {
          const valInPaise = json.data[key];
          const el = document.getElementById('price-' + key);
          if (el && valInPaise) {
            el.value = Math.round(valInPaise / 100);
          }
        });
        return;
      }
    }
  } catch(e) {
    console.warn('Could not fetch server pricing, using defaults/cached');
  }

  // Fallback to local defaults if server not set yet
  PRICING_KEYS.forEach(key => {
    const el = document.getElementById('price-' + key);
    if (el && !el.value) {
      el.value = DEFAULT_PRICES[key];
    }
  });
}

async function savePricing() {
  const btn = document.getElementById('savePricesBtn');
  const status = document.getElementById('pricingSaveStatus');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  const pricesInPaise = {};
  PRICING_KEYS.forEach(key => {
    const el = document.getElementById('price-' + key);
    const rupees = parseFloat(el.value) || DEFAULT_PRICES[key];
    pricesInPaise[key] = Math.round(rupees * 100);
  });

  try {
    const res = await fetch('/api/admin/payments?action=pricing', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ prices: pricesInPaise })
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to save');

    status.textContent = '✓ Prices updated in database!';
    status.style.color = '#22c55e';
    status.style.display = 'inline';
  } catch(err) {
    status.textContent = 'Error: ' + err.message;
    status.style.color = '#ef4444';
    status.style.display = 'inline';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Prices';
    setTimeout(() => { if (status) status.style.display = 'none'; }, 4000);
  }
}

// ── INITIALIZATION ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const p = document.getElementById('newClientPhone');
  if (p) p.addEventListener('keydown', e => { if (e.key === 'Enter') activateClient(); });

  // Hide nav and main until gate is passed
  document.querySelector('nav').style.display  = 'none';
  document.querySelector('main').style.display = 'none';
});

// ── EMAIL SETTINGS ───────────────────────────────────────────
async function loadEmailSettings() {
  try {
    const res = await fetch('/api/admin/payments?action=email-settings', { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok || !data.success) return;
    const s = data.data || {};
    if (s.subject)    document.getElementById('emailSubject').value    = s.subject;
    if (s.heading)    document.getElementById('emailHeading').value    = s.heading;
    if (s.subheading) document.getElementById('emailSubheading').value = s.subheading;
    if (s.message)    document.getElementById('emailMessage').value    = s.message;
    if (s.contactEmail) document.getElementById('emailContact').value  = s.contactEmail;
  } catch (err) {
    console.warn('Could not load email settings', err);
  }
}

async function saveEmailSettings() {
  const btn = document.getElementById('saveEmailBtn');
  const status = document.getElementById('emailSaveStatus');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  const settings = {
    subject:      document.getElementById('emailSubject').value.trim() || 'Payment Confirmed — {service} | Inpixel Network',
    heading:      document.getElementById('emailHeading').value.trim() || 'Payment Successful ✓',
    subheading:   document.getElementById('emailSubheading').value.trim() || 'Thank you for choosing Inpixel Network',
    message:      document.getElementById('emailMessage').value.trim() || 'Our team will reach out to you shortly to get started.',
    contactEmail: document.getElementById('emailContact').value.trim() || 'supportinpixelnetwork@gmail.com'
  };

  try {
    const res = await fetch('/api/admin/payments?action=email-settings', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ settings })
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to save');

    status.textContent = '✓ Email settings saved!';
    status.style.color = '#22c55e';
    status.style.display = 'inline';
  } catch (err) {
    status.textContent = 'Error: ' + err.message;
    status.style.color = '#ef4444';
    status.style.display = 'inline';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Email Settings';
    setTimeout(() => { if (status) status.style.display = 'none'; }, 4000);
  }
}

async function sendPreviewEmail() {
  const btn = document.getElementById('testEmailBtn');
  const status = document.getElementById('emailSaveStatus');
  btn.disabled = true;
  btn.textContent = 'Sending...';

  const settings = {
    subject:      document.getElementById('emailSubject').value.trim() || 'Payment Confirmed — {service} | Inpixel Network',
    heading:      document.getElementById('emailHeading').value.trim() || 'Payment Successful ✓',
    subheading:   document.getElementById('emailSubheading').value.trim() || 'Thank you for choosing Inpixel Network',
    message:      document.getElementById('emailMessage').value.trim() || 'Our team will reach out to you shortly to get started.',
    contactEmail: document.getElementById('emailContact').value.trim() || 'supportinpixelnetwork@gmail.com'
  };

  try {
    const res = await fetch('/api/admin/payments?action=test-custom-email', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ settings })
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to send');

    status.textContent = '✓ Test email sent to supportinpixelnetwork@gmail.com!';
    status.style.color = '#22c55e';
    status.style.display = 'inline';
  } catch (err) {
    status.textContent = 'Error: ' + err.message;
    status.style.color = '#ef4444';
    status.style.display = 'inline';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Send Test Email';
    setTimeout(() => { if (status) status.style.display = 'none'; }, 5000);
  }
}
