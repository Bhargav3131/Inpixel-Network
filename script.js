/* ============================================================
   INPIXEL NETWORK — script.js
   ============================================================ */

// ── EmailJS Init ──
(function () {
  emailjs.init({ publicKey: "TWpQ-zENXGGMzDMFd" });
})();



// ── Nav scroll shrink ──
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 60);
});

// ── 3D Tilt Card ──
const scene = document.getElementById('tiltScene');
const card  = document.getElementById('tiltCard');
if (scene && card) {
  scene.addEventListener('mousemove', e => {
    const rect = scene.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `rotateY(${x * 20}deg) rotateX(${-y * 20}deg)`;
  });
  scene.addEventListener('mouseleave', () => {
    card.style.transform = 'rotateY(0deg) rotateX(0deg)';
  });
}

// ── Scroll Reveal ──
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), 100);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Popup Open / Close ──
function openPopup() {
  document.getElementById('overlay').classList.add('show');
  document.getElementById('popup').classList.add('show');
  document.getElementById('floatingCta').style.opacity = '0';
}

function closePopup() {
  document.getElementById('overlay').classList.remove('show');
  document.getElementById('popup').classList.remove('show');
  document.getElementById('floatingCta').style.opacity = '1';
  document.getElementById('popupForm').style.display   = 'block';
  document.getElementById('popupSuccess').classList.remove('show');
  document.getElementById('popupForm').reset();
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closePopup();
});

// ── EmailJS Send Helper ──
function sendEmail(name, contact, message, onSuccess, onFail) {
  emailjs.send("service_p1upsrh", "template_mibmmmu", { name, contact, message })
    .then(onSuccess)
    .catch(onFail);
}

// ── Popup Form Submit ──
function handlePopupSubmit(e) {
  e.preventDefault();
  const name    = document.getElementById('p-name').value;
  const contact = document.getElementById('p-phone').value;
  const message = document.getElementById('p-message').value;
  const btn     = e.target.querySelector('button[type=submit]');

  btn.textContent = 'Sending…';
  btn.disabled    = true;

  sendEmail(name, contact, message,
    () => {
      document.getElementById('popupForm').style.display = 'none';
      document.getElementById('popupSuccess').classList.add('show');
      setTimeout(() => closePopup(), 2500);
    },
    () => {
      alert('Failed to send. Please try again.');
      btn.textContent = 'Send Enquiry';
      btn.disabled    = false;
    }
  );
}

// ── Main Contact Form Submit ──
function handleMainSubmit(e) {
  e.preventDefault();
  const name    = document.getElementById('m-name').value;
  const contact = document.getElementById('m-phone').value;
  const message = document.getElementById('m-message').value;
  const btn     = e.target.querySelector('button[type=submit]');

  btn.textContent = 'Sending…';
  btn.disabled    = true;

  sendEmail(name, contact, message,
    () => {
      document.getElementById('mainForm').style.display = 'none';
      document.getElementById('mainSuccess').classList.add('show');
    },
    () => {
      alert('Failed to send. Please try again.');
      btn.textContent = 'Send Message';
      btn.disabled    = false;
    }
  );
}

// ── Animated Number Counters ──
function animateCounter(el, target, suffix = '') {
  const duration = 2000;
  const start    = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const counterObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const nums = entry.target.querySelectorAll('.metric-num, .card-stat-num');
      nums.forEach(el => {
        const text = el.textContent;
        if      (text.includes('150')) animateCounter(el, 150, '+');
        else if (text.includes('300')) animateCounter(el, 300, '%');
        else if (text.includes('5M'))  { el.textContent = '0M+'; setTimeout(() => el.textContent = '5M+', 1500); }
      });
      counterObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.metrics-row, .card-stats').forEach(el => counterObs.observe(el));
