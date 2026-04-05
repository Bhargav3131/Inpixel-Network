// Checkbox visual toggle
document.querySelectorAll('.checkbox-item input[type=checkbox]').forEach(cb => {
  cb.addEventListener('change', function() {
    this.closest('.checkbox-item').classList.toggle('selected', this.checked);
  });
});

// Radio visual toggle
document.querySelectorAll('.radio-item input[type=radio]').forEach(rb => {
  rb.addEventListener('change', function() {
    document.querySelectorAll(`input[name="${this.name}"]`).forEach(r => {
      r.closest('.radio-item').classList.remove('selected');
    });
    this.closest('.radio-item').classList.add('selected');
  });
});

// Terms toggle
function toggleTerms(cb) {
  document.getElementById('termsLabel').classList.toggle('agreed', cb.checked);
}

// Step 1 — Login
function handleLogin(e) {
  e.preventDefault();
  const name  = document.getElementById('l-name').value.trim();
  const email = document.getElementById('l-email').value.trim();
  const phone = document.getElementById('l-phone').value.trim();
  sessionStorage.setItem('inpixel_user', JSON.stringify({ name, email, phone }));
  document.getElementById('loginStep').style.display = 'none';
  document.getElementById('reqFormWrap').style.display = 'block';
  document.getElementById('greetName').textContent    = name;
  document.getElementById('greetContact').textContent = phone + ' · ' + email;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Step 2 — Submit
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyVtBf_GzWpbauRxqcsXX7eOS05PS3DcCpOYYyghNCQXpiwjw09rmithNxOC3lmJ5nx/exec';

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
  btn.textContent = 'Submitting...';
  btn.disabled = true;

  const user = JSON.parse(sessionStorage.getItem('inpixel_user') || '{}');

  const getChecked = n =>
    [...document.querySelectorAll(`input[name="${n}"]:checked`)].map(i => i.value).join(', ');

  const getRadio = n => {
    const el = document.querySelector(`input[name="${n}"]:checked`);
    return el ? el.value : 'Not selected';
  };

  const payload = {
    client_name:    user.name,
    client_phone:   user.phone,
    client_email:   user.email,
    services:       getChecked('websiteType'),
    business:       document.getElementById('r-business').value,
    industry:       document.getElementById('r-industry').value,
    location:       document.getElementById('r-location').value,
    description:    document.getElementById('r-desc').value,
    features:       getChecked('features'),
    design_style:   getRadio('designStyle'),
    colors:         document.getElementById('r-colors').value,
    has_logo:       getRadio('hasLogo'),
    references:     document.getElementById('r-refs').value,
    pages:          document.getElementById('r-pages').value,
    content:        getRadio('contentProvided'),
    domain:         getRadio('hasDomain'),
    hosting:        getRadio('hasHosting'),
    domain_name:    document.getElementById('r-domain').value,
    extra:          document.getElementById('r-extra').value,
    source:         document.getElementById('r-source').value
  };

  try {
    await fetch(SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // Success UI
    document.getElementById('reqForm').style.display = 'none';
    document.getElementById('userGreeting').style.display = 'none';
    document.getElementById('reqSuccess').classList.add('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });

  } catch (err) {
    console.error(err);
    btn.textContent = 'Submit Requirement';
    btn.disabled = false;
    alert('Failed to submit. Please try again.');
  }
}
