// ============================================================
//   INPIXEL NETWORK — userlogin.js (v2)
//   Two-service portal: Website & AI Ads
// ============================================================

const CLIENT_SHEET_URL = 'https://script.google.com/macros/s/AKfycbzBjJN_VQMS5QRG6J1d2RwrEC13XhSEeUTCv0tObV9UkrReiAKmgr1DgQaWo3cczhi9MA/exec';
const SHEET_URL        = 'https://script.google.com/macros/s/AKfycbyVtBf_GzWpbauRxqcsXX7eOS05PS3DcCpOYYyghNCQXpiwjw09rmithNxOC3lmJ5nx/exec';

let currentUser = null;

// ── Checkbox / Radio visual toggles ────────────────────────
document.querySelectorAll('.checkbox-item input[type=checkbox]').forEach(cb => {
  cb.addEventListener('change', function() {
    this.closest('.checkbox-item').classList.toggle('selected', this.checked);
  });
});
document.querySelectorAll('.radio-item input[type=radio]').forEach(rb => {
  rb.addEventListener('change', function() {
    document.querySelectorAll('input[name="'+this.name+'"]').forEach(r => r.closest('.radio-item').classList.remove('selected'));
    this.closest('.radio-item').classList.add('selected');
  });
});
function toggleTerms(cb) { document.getElementById('termsLabel').classList.toggle('agreed', cb.checked); }

// ── Model selection ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.model-card').forEach(card => {
    card.addEventListener('click', function() {
      document.querySelectorAll('.model-card').forEach(c => c.classList.remove('selected'));
      this.classList.add('selected');
      document.getElementById('selectedModelInput').value = this.dataset.model;
    });
  });
});

// ── Step 1: Login ───────────────────────────────────────────
async function handleLogin(e) {
  e.preventDefault();
  const name  = document.getElementById('l-name').value.trim();
  const email = document.getElementById('l-email').value.trim();
  const phone = document.getElementById('l-phone').value.trim();
  const btn   = document.getElementById('loginBtn');
  const errEl = document.getElementById('loginError');

  errEl.style.display = 'none';
  btn.disabled = true;
  btn.innerHTML = '<svg class="spin" viewBox="0 0 24 24" stroke-width="2.5" style="width:16px;fill:none;stroke:currentColor"><path d="M12 2a10 10 0 1 0 10 10" stroke-linecap="round"/></svg> Verifying...';

  try {
    const result = await checkPhoneInSheet(phone);
    if (!result.approved) {
      errEl.style.display = 'flex';
      btn.disabled = false;
      btn.innerHTML = '<svg viewBox="0 0 24 24" stroke-width="2.5" style="width:16px;fill:none;stroke:currentColor"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg> Continue';
      return;
    }

    currentUser = { name, email, phone, services: result.services || 'website' };
    sessionStorage.setItem('inpixel_user', JSON.stringify(currentUser));

    // Show service dashboard
    document.getElementById('loginStep').style.display = 'none';
    document.getElementById('serviceDashboard').style.display = 'block';
    document.getElementById('dashGreetName').textContent = name;

    // Set lock state on cards
    const hasWeb = currentUser.services.includes('website') || currentUser.services === 'both';
    const hasAi  = currentUser.services.includes('aiads')   || currentUser.services === 'both';
    document.getElementById('websiteFrame').classList.toggle('locked', !hasWeb);
    document.getElementById('aiAdsFrame').classList.toggle('locked', !hasAi);
    document.getElementById('websiteLock').style.display = hasWeb ? 'none' : 'flex';
    document.getElementById('aiAdsLock').style.display   = hasAi  ? 'none' : 'flex';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    errEl.style.display = 'flex';
    errEl.querySelector('span').textContent = 'Could not verify. Please check your connection.';
    btn.disabled = false;
    btn.innerHTML = '<svg viewBox="0 0 24 24" stroke-width="2.5" style="width:16px;fill:none;stroke:currentColor"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg> Continue';
  }
}

function checkPhoneInSheet(phone) {
  return new Promise((resolve, reject) => {
    const cbName = '_inpixelCheck_' + Date.now();
    const script = document.createElement('script');
    const timeout = setTimeout(() => { delete window[cbName]; script.remove(); reject(new Error('Timeout')); }, 8000);
    window[cbName] = function(data) {
      clearTimeout(timeout); delete window[cbName]; script.remove();
      resolve({ approved: data && data.approved === true, services: data && data.services ? data.services : 'website' });
    };
    const normalized = phone.replace(/[\s\-\(\)]/g, '');
    script.src = CLIENT_SHEET_URL + '?action=checkClient&phone=' + encodeURIComponent(normalized) + '&callback=' + cbName + '&t=' + Date.now();
    script.onerror = () => { clearTimeout(timeout); delete window[cbName]; reject(new Error('Script load failed')); };
    document.body.appendChild(script);
  });
}

// ── Service Dashboard: open a section ───────────────────────
function openService(type) {
  const hasWeb = currentUser.services.includes('website') || currentUser.services === 'both';
  const hasAi  = currentUser.services.includes('aiads')   || currentUser.services === 'both';

  if (type === 'website' && !hasWeb) return;
  if (type === 'aiads'   && !hasAi)  return;

  document.getElementById('serviceDashboard').style.display = 'none';

  if (type === 'website') {
    document.getElementById('reqFormWrap').style.display = 'block';
    document.getElementById('greetName').textContent    = currentUser.name;
    document.getElementById('greetContact').textContent = currentUser.phone + ' · ' + currentUser.email;
  } else {
    document.getElementById('aiAdsWrap').style.display = 'block';
    document.getElementById('aiGreetName').textContent    = currentUser.name;
    document.getElementById('aiGreetContact').textContent = currentUser.phone;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goBackToDashboard() {
  document.getElementById('reqFormWrap').style.display  = 'none';
  document.getElementById('aiAdsWrap').style.display    = 'none';
  document.getElementById('serviceDashboard').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Website Requirement Form ────────────────────────────────
async function handleReqSubmit(e) {
  e.preventDefault();
  if (!document.getElementById('termsCheck').checked) {
    const lbl = document.getElementById('termsLabel');
    lbl.style.borderColor = '#ff4444';
    lbl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => lbl.style.borderColor = '', 2500);
    return;
  }
  const btn = document.getElementById('reqSubmitBtn');
  btn.textContent = 'Submitting...'; btn.disabled = true;
  const user = currentUser || JSON.parse(sessionStorage.getItem('inpixel_user') || '{}');
  const getChecked = n => [...document.querySelectorAll('input[name="'+n+'"]:checked')].map(i => i.value).join(', ');
  const getRadio   = n => { const el = document.querySelector('input[name="'+n+'"]:checked'); return el ? el.value : 'Not selected'; };
  const payload = {
    client_name: user.name, client_phone: user.phone, client_email: user.email,
    services: getChecked('websiteType'), business: document.getElementById('r-business').value,
    industry: document.getElementById('r-industry').value, location: document.getElementById('r-location').value,
    description: document.getElementById('r-desc').value, features: getChecked('features'),
    design_style: getRadio('designStyle'), colors: document.getElementById('r-colors').value,
    has_logo: getRadio('hasLogo'), references: document.getElementById('r-refs').value,
    pages: document.getElementById('r-pages').value, content: getRadio('contentProvided'),
    domain: getRadio('hasDomain'), hosting: getRadio('hasHosting'),
    domain_name: document.getElementById('r-domain').value, extra: document.getElementById('r-extra').value,
    source: document.getElementById('r-source').value
  };
  try {
    await fetch(SHEET_URL, { method:'POST', mode:'no-cors', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    document.getElementById('reqForm').style.display      = 'none';
    document.getElementById('userGreeting').style.display = 'none';
    document.getElementById('reqSuccess').classList.add('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    btn.textContent = 'Submit Requirement'; btn.disabled = false;
    alert('Failed to submit. Please try again.');
  }
}

// ── AI Ads Form ─────────────────────────────────────────────
function handleAiAdsSubmit(e) {
  e.preventDefault();
  const model  = document.getElementById('selectedModelInput').value;
  const script = document.getElementById('ai-script').value.trim();
  const btn    = document.getElementById('aiSubmitBtn');
  const errEl  = document.getElementById('aiFormError');

  errEl.style.display = 'none';
  if (!model) { errEl.textContent = 'Please select a model first.'; errEl.style.display = 'block'; return; }
  if (!script) { errEl.textContent = 'Please enter your ad script.'; errEl.style.display = 'block'; return; }

  const user = currentUser || JSON.parse(sessionStorage.getItem('inpixel_user') || '{}');
  btn.innerHTML = '<svg class="spin" viewBox="0 0 24 24" stroke-width="2.5" style="width:16px;fill:none;stroke:currentColor"><path d="M12 2a10 10 0 1 0 10 10" stroke-linecap="round"/></svg> Submitting...';
  btn.disabled = true;

  const cbName = '_aiAdsSubmit_' + Date.now();
  const scriptEl = document.createElement('script');
  const timeout = setTimeout(() => {
    delete window[cbName]; scriptEl.remove();
    errEl.textContent = 'Request timed out. Please try again.'; errEl.style.display = 'block';
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:16px"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Submit Ad Request';
    btn.disabled = false;
  }, 10000);

  window[cbName] = function(res) {
    clearTimeout(timeout); delete window[cbName]; scriptEl.remove();
    if (res && res.success) {
      document.getElementById('aiAdsForm').style.display  = 'none';
      document.getElementById('aiGreeting').style.display = 'none';
      document.getElementById('aiSuccess').classList.add('show');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      errEl.textContent = (res && res.error) ? res.error : 'Failed to submit. Please try again.';
      errEl.style.display = 'block';
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:16px"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Submit Ad Request';
      btn.disabled = false;
    }
  };

  scriptEl.onerror = () => {
    clearTimeout(timeout); delete window[cbName];
    errEl.textContent = 'Network error. Please try again.'; errEl.style.display = 'block';
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:16px"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Submit Ad Request';
    btn.disabled = false;
  };

  scriptEl.src = CLIENT_SHEET_URL
    + '?action=submitAiAds'
    + '&name='   + encodeURIComponent(user.name  || '')
    + '&phone='  + encodeURIComponent(user.phone || '')
    + '&model='  + encodeURIComponent(model)
    + '&script=' + encodeURIComponent(script)
    + '&callback=' + cbName
    + '&t=' + Date.now();
  document.body.appendChild(scriptEl);
}
