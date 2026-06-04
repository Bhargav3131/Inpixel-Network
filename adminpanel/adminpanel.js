// ============================================================
//   INPIXEL NETWORK — adminpanel.js (v3 — Supabase)
// ============================================================

const ADMIN_PASS = 'inpixel@0313';

document.getElementById('gateInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') checkGate();
});

function checkGate() {
  const val = document.getElementById('gateInput').value;
  if (val === ADMIN_PASS) {
    document.getElementById('adminGate').style.display = 'none';
    document.querySelector('nav').style.display  = 'flex';
    document.querySelector('main').style.display = 'block';
    loadSubmissions();
    loadAiAdsSubmissions();
    loadMetaAdsSubmissions();
    loadClients();
  } else {
    document.getElementById('gateError').style.display = 'block';
    document.getElementById('gateInput').value = '';
    document.getElementById('gateInput').focus();
  }
}

let allSubmissions = [], allAiAds = [], allMetaAds = [], allClients = [];
let currentFilter = 'all', currentSearch = '', currentOpenId = null;

// ── TAB SWITCHER ─────────────────────────────────────────────
function switchTab(tab) {
  document.getElementById('tabWebsite').classList.toggle('tab-active',  tab === 'website');
  document.getElementById('tabAiAds').classList.toggle('tab-active',   tab === 'aiads');
  document.getElementById('tabMetaAds').classList.toggle('tab-active', tab === 'metaads');
  document.getElementById('websitePanel').style.display  = tab === 'website'  ? 'block' : 'none';
  document.getElementById('aiAdsPanel').style.display    = tab === 'aiads'    ? 'block' : 'none';
  document.getElementById('metaAdsPanel').style.display  = tab === 'metaads'  ? 'block' : 'none';
}

// ── WEBSITE SUBMISSIONS ──────────────────────────────────────
async function loadSubmissions() {
  document.getElementById('cardsContainer').innerHTML = '<div class="empty-state"><p style="color:var(--text-muted);font-family:\'Space Mono\',monospace;font-size:0.8rem;">Loading...</p></div>';
  const { data, error } = await db
    .from('website_submissions')
    .select('*')
    .order('submitted_at', { ascending: false });
  if (error) {
    document.getElementById('cardsContainer').innerHTML = '<div class="empty-state"><p style="color:#ff4444;font-family:\'Space Mono\',monospace;font-size:0.8rem;">Failed to load.</p></div>';
    return;
  }
  allSubmissions = (data || []).map(r => ({
    id: r.id,
    submittedAt: r.submitted_at || new Date().toISOString(),
    user: { name: r.client_name || '', email: r.client_email || '', phone: String(r.client_phone || '') },
    businessName: r.business_name || '', industry: r.industry || '', location: r.location || '',
    description: r.description || '',
    websiteTypes: (r.services || '').split(',').map(s => s.trim()).filter(Boolean),
    features: (r.features || '').split(',').map(s => s.trim()).filter(Boolean),
    designStyle: r.design_style || '', colorTheme: r.colors || '', hasLogo: r.has_logo || '',
    referenceWebsites: r.references_urls || '', pages: r.pages || '', contentProvided: r.content_provided || '',
    hasDomain: r.has_domain || '', domainName: r.domain_name || '', hasHosting: r.has_hosting || '',
    extraNotes: r.extra_notes || '', hearAboutUs: r.source || '', budget: r.budget || '', timeline: r.timeline || ''
  }));
  updateStats(); renderCards();
}

function updateStats() {
  const now = new Date(), todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - 7);
  document.getElementById('statTotal').textContent = allSubmissions.length;
  document.getElementById('statToday').textContent = allSubmissions.filter(s => new Date(s.submittedAt) >= todayStart).length;
  document.getElementById('statWeek').textContent  = allSubmissions.filter(s => new Date(s.submittedAt) >= weekStart).length;
}

function getFiltered() {
  const now = new Date(), todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - 7);
  let list = allSubmissions;
  if (currentFilter === 'today') list = list.filter(s => new Date(s.submittedAt) >= todayStart);
  if (currentFilter === 'week')  list = list.filter(s => new Date(s.submittedAt) >= weekStart);
  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    list = list.filter(s => (s.user?.name||'').toLowerCase().includes(q) || (s.user?.email||'').toLowerCase().includes(q) || (s.user?.phone||'').toLowerCase().includes(q) || (s.businessName||'').toLowerCase().includes(q));
  }
  return list;
}

function renderCards() {
  const container = document.getElementById('cardsContainer');
  const list = getFiltered();
  if (!list.length) { container.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><h3>No Submissions Yet</h3><p>Once clients fill the form, their entries appear here.</p></div>'; return; }
  container.innerHTML = '<div class="cards-grid">' + list.map((s, i) => cardHTML(s, i)).join('') + '</div>';
}

function initials(name) { if (!name) return '?'; return name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2); }
function formatDate(iso) { const d = new Date(iso); return d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }); }

function cardHTML(s, idx) {
  const chips = [];
  if (s.websiteTypes?.length) chips.push(...s.websiteTypes.slice(0,2).map(t => '<span class="chip">'+t+'</span>'));
  if (s.budget) chips.push('<span class="chip grey">'+s.budget+'</span>');
  return '<div class="sub-card" onclick="openModal('+s.id+')" style="animation-delay:'+idx*0.05+'s"><div class="card-top"><div class="card-avatar">'+initials(s.user?.name)+'</div><div class="card-date">'+formatDate(s.submittedAt)+'</div></div><div class="card-name">'+(s.user?.name||'—')+'</div><div class="card-contact"><span>'+(s.user?.email||'—')+'</span><span>'+(s.user?.phone||'—')+'</span></div><div class="card-chips">'+(chips.join('')||'<span class="chip grey">No type</span>')+'</div><div class="card-footer"><div class="card-business"><strong>'+(s.businessName||'No business name')+'</strong> · '+(s.industry||'—')+'</div><div class="view-btn">View <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></div></div></div>';
}

function openModal(id) {
  const s = allSubmissions.find(x => x.id === id); if (!s) return;
  currentOpenId = id;
  document.getElementById('mAvatar').textContent = initials(s.user?.name);
  document.getElementById('mAvatar').style.background = '';
  document.getElementById('mName').textContent = s.user?.name || '—';
  document.getElementById('mSub').textContent = (s.user?.email||'') + ' · ' + (s.user?.phone||'');
  document.getElementById('mTimestamp').textContent = 'Submitted: ' + new Date(s.submittedAt).toLocaleString('en-IN');
  const tagList = arr => arr?.length ? '<div class="tag-list">'+arr.map(t=>'<span class="tag">'+t+'</span>').join('')+'</div>' : '<p class="empty">None selected</p>';
  const val = v => v ? '<p>'+v+'</p>' : '<p class="empty">Not provided</p>';
  document.getElementById('mBody').innerHTML = '<div class="detail-section"><div class="detail-section-title">Contact</div><div class="detail-grid"><div class="detail-field"><label>Name</label>'+val(s.user?.name)+'</div><div class="detail-field"><label>Phone</label>'+val(s.user?.phone)+'</div><div class="detail-field full"><label>Email</label>'+val(s.user?.email)+'</div></div></div><div class="detail-section"><div class="detail-section-title">Business</div><div class="detail-grid"><div class="detail-field"><label>Business Name</label>'+val(s.businessName)+'</div><div class="detail-field"><label>Industry</label>'+val(s.industry)+'</div><div class="detail-field"><label>Location</label>'+val(s.location)+'</div><div class="detail-field"><label>Source</label>'+val(s.hearAboutUs)+'</div><div class="detail-field full"><label>Description</label>'+val(s.description)+'</div></div></div><div class="detail-section"><div class="detail-section-title">Website Requirements</div><div class="detail-grid"><div class="detail-field full"><label>Types</label>'+tagList(s.websiteTypes)+'</div><div class="detail-field full"><label>Features</label>'+tagList(s.features)+'</div><div class="detail-field full"><label>Pages</label>'+val(s.pages)+'</div></div></div><div class="detail-section"><div class="detail-section-title">Design</div><div class="detail-grid"><div class="detail-field"><label>Style</label>'+val(s.designStyle)+'</div><div class="detail-field"><label>Colors</label>'+val(s.colorTheme)+'</div><div class="detail-field"><label>Has Logo</label>'+val(s.hasLogo)+'</div><div class="detail-field"><label>Content</label>'+val(s.contentProvided)+'</div><div class="detail-field full"><label>References</label>'+val(s.referenceWebsites)+'</div></div></div><div class="detail-section"><div class="detail-section-title">Technical & Budget</div><div class="detail-grid"><div class="detail-field"><label>Domain?</label>'+val(s.hasDomain)+'</div><div class="detail-field"><label>Domain Name</label>'+val(s.domainName)+'</div><div class="detail-field"><label>Hosting?</label>'+val(s.hasHosting)+'</div><div class="detail-field"><label>Budget</label>'+val(s.budget)+'</div><div class="detail-field"><label>Timeline</label>'+val(s.timeline)+'</div></div></div>'+(s.extraNotes?'<div class="detail-section"><div class="detail-section-title">Notes</div><div class="detail-field"><p>'+s.extraNotes+'</p></div></div>':'');
  document.getElementById('mDeleteBtn').onclick = () => deleteEntry(id);
  document.getElementById('overlay').classList.add('show');
  document.getElementById('detailModal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('overlay').classList.remove('show');
  document.getElementById('detailModal').classList.remove('show');
  document.body.style.overflow = ''; currentOpenId = null;
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeClientsModal(); } });

async function deleteEntry(id) {
  if (!confirm('Delete this submission?')) return;
  const { error } = await db.from('website_submissions').delete().eq('id', id);
  if (!error) {
    allSubmissions = allSubmissions.filter(s => s.id !== id);
    closeModal(); updateStats(); renderCards();
  } else {
    alert('Failed to delete. Please try again.');
  }
}
async function confirmClearAll() {
  if (!confirm('Delete ALL submissions?')) return;
  const { error } = await db.from('website_submissions').delete().gt('id', 0);
  if (!error) {
    allSubmissions = []; updateStats(); renderCards();
  } else {
    alert('Failed to clear all. Please try again.');
  }
}
function setFilter(f, btn) {
  currentFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active'); renderCards();
}
function filterCards() { currentSearch = document.getElementById('searchInput').value; renderCards(); }

// ── AI ADS SUBMISSIONS ───────────────────────────────────────
async function loadAiAdsSubmissions() {
  document.getElementById('aiAdsContainer').innerHTML = '<div class="empty-state"><p style="color:var(--text-muted);font-family:\'Space Mono\',monospace;font-size:0.8rem;">Loading AI Ads submissions...</p></div>';
  const { data, error } = await db
    .from('ai_ads_submissions')
    .select('*')
    .order('submitted_at', { ascending: false });
  if (error) { allAiAds = []; renderAiAdsCards(); return; }
  allAiAds = (data || []).map(r => ({
    id: r.id,
    'Name': r.name || '',
    'Phone': r.phone || '',
    'Model No': r.model_no || '',
    'Script': r.script || '',
    'Submitted At': r.submitted_at || ''
  }));
  renderAiAdsCards(); updateAiAdsStats();
}

function updateAiAdsStats() {
  document.getElementById('aiStatTotal').textContent = allAiAds.length;
  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  document.getElementById('aiStatToday').textContent = allAiAds.filter(s => new Date(s['Submitted At']) >= todayStart).length;
}

function renderAiAdsCards() {
  const container = document.getElementById('aiAdsContainer');
  const search = (document.getElementById('aiSearchInput')?.value || '').toLowerCase();
  let list = allAiAds;
  if (search) list = list.filter(s => (s['Name']||'').toLowerCase().includes(search) || (s['Phone']||'').toLowerCase().includes(search));
  if (!list.length) { container.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg><h3>No AI Ads Submissions Yet</h3><p>Activated AI Ads clients will appear here.</p></div>'; return; }
  container.innerHTML = '<div class="cards-grid">' + list.map((s, i) => aiCardHTML(s, i)).join('') + '</div>';
}

function aiCardHTML(s, idx) {
  const preview = (s['Script']||'').slice(0, 80) + ((s['Script']||'').length > 80 ? '…' : '');
  return '<div class="sub-card" onclick="openAiModal('+s.id+')" style="animation-delay:'+idx*0.05+'s"><div class="card-top"><div class="card-avatar" style="background:linear-gradient(135deg,#7c3aed,#a855f7)">'+initials(s['Name'])+'</div><div class="card-date">'+formatDate(s['Submitted At'])+'</div></div><div class="card-name">'+(s['Name']||'—')+'</div><div class="card-contact"><span>'+(s['Phone']||'—')+'</span></div><div class="card-chips"><span class="chip" style="background:rgba(168,85,247,0.12);border-color:rgba(168,85,247,0.3);color:#a855f7;">Model '+(s['Model No']||'—')+'</span></div><div class="card-footer"><div class="card-business" style="font-size:0.8rem;color:var(--text-muted)">'+(preview||'No script')+'</div><div class="view-btn">View <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></div></div></div>';
}

function openAiModal(id) {
  const s = allAiAds.find(x => x.id === id); if (!s) return;
  document.getElementById('mAvatar').textContent = initials(s['Name']);
  document.getElementById('mAvatar').style.background = 'linear-gradient(135deg,#7c3aed,#a855f7)';
  document.getElementById('mName').textContent = s['Name'] || '—';
  document.getElementById('mSub').textContent = s['Phone'] || '—';
  document.getElementById('mTimestamp').textContent = 'Submitted: ' + new Date(s['Submitted At']).toLocaleString('en-IN');
  document.getElementById('mBody').innerHTML = '<div class="detail-section"><div class="detail-section-title">Client Info</div><div class="detail-grid"><div class="detail-field"><label>Name</label><p>'+(s['Name']||'—')+'</p></div><div class="detail-field"><label>Phone</label><p>'+(s['Phone']||'—')+'</p></div></div></div><div class="detail-section"><div class="detail-section-title">AI Ad Details</div><div class="detail-grid"><div class="detail-field"><label>Selected Model</label><p style="color:#a855f7;font-family:\'Syne\',sans-serif;font-weight:700;font-size:1.1rem;">Model '+(s['Model No']||'—')+'</p></div><div class="detail-field full"><label>Ad Script</label><p style="white-space:pre-wrap;line-height:1.7">'+(s['Script']||'—')+'</p></div></div></div>';
  document.getElementById('mDeleteBtn').onclick = async () => {
    if (!confirm('Delete this entry?')) return;
    const { error } = await db.from('ai_ads_submissions').delete().eq('id', id);
    if (!error) { allAiAds = allAiAds.filter(x => x.id !== id); closeModal(); renderAiAdsCards(); updateAiAdsStats(); }
    else alert('Failed to delete.');
  };
  document.getElementById('overlay').classList.add('show');
  document.getElementById('detailModal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

// ── META ADS SUBMISSIONS ─────────────────────────────────────
async function loadMetaAdsSubmissions() {
  document.getElementById('metaAdsContainer').innerHTML = '<div class="empty-state"><p style="color:var(--text-muted);font-family:\'Space Mono\',monospace;font-size:0.8rem;">Loading Meta Ads submissions...</p></div>';
  const { data, error } = await db
    .from('meta_ads_submissions')
    .select('*')
    .order('submitted_at', { ascending: false });
  if (error) { allMetaAds = []; renderMetaAdsCards(); return; }
  allMetaAds = (data || []).map(r => ({
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
  renderMetaAdsCards(); updateMetaAdsStats();
}

function updateMetaAdsStats() {
  document.getElementById('metaStatTotal').textContent = allMetaAds.length;
  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  document.getElementById('metaStatToday').textContent = allMetaAds.filter(s => new Date(s['Submitted At']) >= todayStart).length;
}

function renderMetaAdsCards() {
  const container = document.getElementById('metaAdsContainer');
  const search = (document.getElementById('metaSearchInput')?.value || '').toLowerCase();
  let list = allMetaAds;
  if (search) list = list.filter(s => (s['Name']||'').toLowerCase().includes(search) || (s['Phone']||'').toLowerCase().includes(search) || (s['Business Name']||'').toLowerCase().includes(search));
  if (!list.length) { container.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg><h3>No Meta Ads Submissions Yet</h3><p>Activated Meta Ads clients will appear here.</p></div>'; return; }
  container.innerHTML = '<div class="cards-grid">' + list.map((s, i) => metaCardHTML(s, i)).join('') + '</div>';
}

function metaCardHTML(s, idx) {
  const preview = (s['What Advertising']||'').slice(0, 80) + ((s['What Advertising']||'').length > 80 ? '…' : '');
  return '<div class="sub-card" onclick="openMetaModal(' + s.id + ')" style="animation-delay:' + idx*0.05 + 's">'
    + '<div class="card-top"><div class="card-avatar" style="background:linear-gradient(135deg,#1565d8,#1877f2)">' + initials(s['Name']) + '</div><div class="card-date">' + formatDate(s['Submitted At']) + '</div></div>'
    + '<div class="card-name">' + (s['Name']||'—') + '</div>'
    + '<div class="card-contact"><span>' + (s['Phone']||'—') + '</span></div>'
    + '<div class="card-chips">'
      + '<span class="chip" style="background:rgba(24,119,242,0.12);border-color:rgba(24,119,242,0.3);color:#6aabff;">' + (s['Campaign Objective']||'—') + '</span>'
      + (s['Daily Budget'] ? '<span class="chip grey">₹' + s['Daily Budget'] + '/day</span>' : '')
    + '</div>'
    + '<div class="card-footer"><div class="card-business" style="font-size:0.8rem;color:var(--text-muted)">' + (s['Business Name']||'—') + ' · ' + (preview||'No details') + '</div><div class="view-btn">View <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></div></div>'
    + '</div>';
}

function openMetaModal(id) {
  const s = allMetaAds.find(x => x.id === id); if (!s) return;
  document.getElementById('mAvatar').textContent = initials(s['Name'] || '?');
  document.getElementById('mAvatar').style.background = 'linear-gradient(135deg,#1565d8,#1877f2)';
  document.getElementById('mName').textContent = s['Name'] || '—';
  document.getElementById('mSub').textContent = s['Phone'] || '—';
  const ts = s['Submitted At'] ? new Date(s['Submitted At']) : null;
  document.getElementById('mTimestamp').textContent = 'Submitted: ' + (ts && !isNaN(ts) ? ts.toLocaleString('en-IN') : '—');
  const val = v => (v && String(v).trim()) ? '<p>' + String(v) + '</p>' : '<p class="empty">Not provided</p>';
  document.getElementById('mBody').innerHTML =
    '<div class="detail-section"><div class="detail-section-title">Client Info</div><div class="detail-grid">'
    + '<div class="detail-field"><label>Name</label>' + val(s['Name']) + '</div>'
    + '<div class="detail-field"><label>Phone</label>' + val(s['Phone']) + '</div>'
    + '</div></div>'
    + '<div class="detail-section"><div class="detail-section-title">Campaign Details</div><div class="detail-grid">'
    + '<div class="detail-field"><label>Business Name</label>' + val(s['Business Name']) + '</div>'
    + '<div class="detail-field"><label>Campaign Objective</label>'
      + (s['Campaign Objective'] && String(s['Campaign Objective']).trim()
        ? '<p style="color:#6aabff;font-family:\'Syne\',sans-serif;font-weight:700;">' + s['Campaign Objective'] + '</p>'
        : '<p class="empty">Not provided</p>') + '</div>'
    + '<div class="detail-field"><label>Daily Budget</label>'
      + (s['Daily Budget'] && String(s['Daily Budget']).trim()
        ? '<p>₹' + s['Daily Budget'] + ' / day</p>'
        : '<p class="empty">Not provided</p>') + '</div>'
    + '<div class="detail-field"><label>Lead Destination</label>' + val(s['Lead Destination']) + '</div>'
    + '<div class="detail-field full"><label>Website / Link</label>' + val(s['Website Link']) + '</div>'
    + '<div class="detail-field full"><label>What They\'re Advertising</label>' + val(s['What Advertising']) + '</div>'
    + '<div class="detail-field full"><label>Target Audience</label>' + val(s['Target Audience']) + '</div>'
    + (s['Extra Notes'] && String(s['Extra Notes']).trim()
      ? '<div class="detail-field full"><label>Extra Notes</label>' + val(s['Extra Notes']) + '</div>'
      : '')
    + '</div></div>';
  document.getElementById('mDeleteBtn').onclick = async () => {
    if (!confirm('Delete this entry?')) return;
    const { error } = await db.from('meta_ads_submissions').delete().eq('id', id);
    if (!error) { allMetaAds = allMetaAds.filter(x => x.id !== id); closeModal(); renderMetaAdsCards(); updateMetaAdsStats(); }
    else alert('Failed to delete.');
  };
  document.getElementById('overlay').classList.add('show');
  document.getElementById('detailModal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

// ── MANAGE CLIENTS ───────────────────────────────────────────
function openClientsModal() {
  document.getElementById('clientsOverlay').style.zIndex = '10200';
  document.getElementById('clientsModal').style.zIndex   = '10300';
  document.getElementById('clientsOverlay').classList.add('show');
  document.getElementById('clientsModal').classList.add('show');
  document.body.style.overflow = 'hidden';
  renderClientsList();
}
function closeClientsModal() {
  document.getElementById('clientsOverlay').classList.remove('show');
  document.getElementById('clientsModal').classList.remove('show');
  document.body.style.overflow = '';
  document.getElementById('newClientName').value = '';
  document.getElementById('newClientPhone').value = '';
  document.getElementById('svcWebsite').checked = true;
  document.getElementById('svcAiAds').checked = false;
  document.getElementById('svcMetaAds').checked = false;
  document.getElementById('clientAddError').style.display = 'none';
  document.getElementById('clientAddSuccess').style.display = 'none';
}

async function loadClients() {
  const { data, error } = await db
    .from('clients')
    .select('*')
    .order('added_at', { ascending: false });
  allClients = error ? [] : (data || []).map(r => ({
    name: r.name,
    phone: r.phone,
    services: r.services || 'website',
    addedAt: r.added_at
  }));
}

function renderClientsList() {
  const container = document.getElementById('clientsList');
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
      + '<div class="client-info"><div class="client-name">'+c.name+'</div><div class="client-phone">'+phone+'</div></div>'
      + '<div style="display:flex;gap:6px;flex-shrink:0;flex-wrap:wrap;">'
        + (hasWeb  ? '<span style="font-family:\'Space Mono\',monospace;font-size:0.6rem;padding:3px 8px;background:rgba(240,165,0,0.1);border:1px solid rgba(240,165,0,0.3);color:var(--gold);">WEBSITE</span>' : '')
        + (hasAi   ? '<span style="font-family:\'Space Mono\',monospace;font-size:0.6rem;padding:3px 8px;background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.3);color:#a855f7;">AI ADS</span>' : '')
        + (hasMeta ? '<span style="font-family:\'Space Mono\',monospace;font-size:0.6rem;padding:3px 8px;background:rgba(24,119,242,0.1);border:1px solid rgba(24,119,242,0.3);color:#6aabff;">META ADS</span>' : '')
      + '</div>'
      + '<div class="client-added">'+(c.addedAt ? formatDate(c.addedAt) : 'Recently')+'</div>'
      + '<div class="client-status-dot"></div>'
      + '<button onclick="deactivateClient(\''+phone+'\')" style="background:transparent;border:1px solid rgba(255,68,68,0.3);color:#ff6666;font-family:\'Space Mono\',monospace;font-size:0.6rem;padding:4px 8px;cursor:pointer;flex-shrink:0;transition:all 0.2s;" onmouseover="this.style.borderColor=\'#ff4444\';this.style.background=\'rgba(255,68,68,0.08)\'" onmouseout="this.style.borderColor=\'rgba(255,68,68,0.3)\';this.style.background=\'transparent\'">Remove</button>'
      + '</div>';
  }).join('');
}

async function deactivateClient(phone) {
  if (!confirm('Remove this client? They will no longer be able to log in.')) return;
  const normalized = String(phone).replace(/[\s\-\(\)]/g, '');
  const { error } = await db.from('clients').delete().eq('phone', normalized);
  if (!error) {
    allClients = allClients.filter(c => String(c.phone).replace(/[\s\-\(\)]/g, '') !== normalized);
    renderClientsList();
  } else {
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

  // Upsert: insert or update if phone already exists
  const { error } = await db.from('clients').upsert(
    { name, phone, services, added_at: new Date().toISOString() },
    { onConflict: 'phone' }
  );

  if (!error) {
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
    sucEl.style.display = 'block'; renderClientsList();
    setTimeout(() => { sucEl.style.display = 'none'; }, 3000);
  } else {
    errEl.textContent = error.message || 'Failed to save.'; errEl.style.display = 'block';
  }
  reset();
}

document.addEventListener('DOMContentLoaded', () => {
  const p = document.getElementById('newClientPhone');
  if (p) p.addEventListener('keydown', e => { if (e.key === 'Enter') activateClient(); });
  // Hide nav and main until gate is passed
  document.querySelector('nav').style.display  = 'none';
  document.querySelector('main').style.display = 'none';
});
