// assets/js/checkout.js

// Ensure Razorpay script is loaded
if (!document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
  const script = document.createElement('script');
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  document.head.appendChild(script);
}

// Basic CSS for the modal if not present
const style = document.createElement('style');
style.textContent = `
  :root {
    --black: #060608;
    --gold: #f0a500;
    --white: #ffffff;
    --surface: #101018;
    --border: rgba(240,165,0,0.12);
    --radius: 8px;
  }
  .inpixel-payment-overlay {
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0,0,0,0.8); backdrop-filter: blur(4px);
    z-index: 9999; display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.3s ease;
  }
  .inpixel-payment-modal {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 32px; width: 90%; max-width: 400px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.5); transform: translateY(20px);
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    color: var(--white); font-family: 'DM Sans', sans-serif;
  }
  .inpixel-payment-modal.show {
    transform: translateY(0);
  }
  .inpixel-payment-title {
    font-family: 'Syne', sans-serif; font-size: 1.5rem; font-weight: 700;
    margin: 0 0 8px 0; color: var(--gold); text-align: center;
  }
  .inpixel-payment-desc {
    text-align: center; color: rgba(255,255,255,0.6); margin-bottom: 24px;
    font-size: 0.9rem;
  }
  .inpixel-payment-group {
    margin-bottom: 16px;
  }
  .inpixel-payment-group label {
    display: block; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em;
    color: rgba(255,255,255,0.5); margin-bottom: 6px;
  }
  .inpixel-payment-group input {
    width: 100%; padding: 12px; background: var(--black); border: 1px solid var(--border);
    border-radius: 4px; color: var(--white); font-family: 'DM Sans', sans-serif;
    outline: none; transition: border-color 0.2s; box-sizing: border-box;
  }
  .inpixel-payment-group input:focus {
    border-color: var(--gold);
  }
  .inpixel-payment-btn {
    width: 100%; padding: 14px; background: var(--gold); color: var(--black);
    border: none; border-radius: 4px; font-family: 'Syne', sans-serif; font-weight: 700;
    font-size: 1rem; cursor: pointer; transition: background 0.2s, transform 0.1s;
    margin-top: 8px;
  }
  .inpixel-payment-btn:hover {
    background: #fbc02d;
  }
  .inpixel-payment-btn:active {
    transform: scale(0.98);
  }
  .inpixel-payment-btn:disabled {
    opacity: 0.7; cursor: not-allowed;
  }
  .inpixel-payment-close {
    position: absolute; top: 16px; right: 16px; background: transparent; border: none;
    color: rgba(255,255,255,0.5); cursor: pointer; font-size: 1.2rem;
  }
  .inpixel-payment-close:hover {
    color: var(--white);
  }
  .inpixel-payment-error {
    color: #ff5252; font-size: 0.8rem; margin-top: 8px; text-align: center; display: none;
  }
  .success-checkmark {
    width: 60px; height: 60px; margin: 0 auto 20px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: rgba(34, 197, 94, 0.1); border: 2px solid #22c55e;
    color: #22c55e; font-size: 30px; animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  @keyframes scaleIn {
    0% { transform: scale(0); }
    100% { transform: scale(1); }
  }
`;
document.head.appendChild(style);

function openPaymentModal(service, planName, amount) {
  const overlay = document.createElement('div');
  overlay.className = 'inpixel-payment-overlay';
  
  const modal = document.createElement('div');
  modal.className = 'inpixel-payment-modal';
  
  const serviceLabel = service.replace(/-/g, ' ').toUpperCase();
  const formattedAmount = '₹' + (amount / 100).toLocaleString('en-IN');
  
  modal.innerHTML = `
    <button class="inpixel-payment-close">&times;</button>
    <div style="text-align:center;">
      <span style="display:inline-block; padding:3px 10px; background:rgba(240,165,0,0.12); border:1px solid rgba(240,165,0,0.3); color:var(--gold); border-radius:12px; font-size:0.7rem; font-family:'Space Mono',monospace; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:8px;">${serviceLabel}</span>
      <h3 class="inpixel-payment-title" style="margin-bottom:4px;">${planName}</h3>
      <p class="inpixel-payment-desc" style="margin-bottom:20px;">Amount to Pay: <strong style="color:var(--white);">${formattedAmount}</strong></p>
    </div>
    
    <div id="payment-form-content">
      <div class="inpixel-payment-group">
        <label>Full Name</label>
        <input type="text" id="pay-name" placeholder="John Doe">
      </div>
      <div class="inpixel-payment-group">
        <label>Phone Number (for dashboard login)</label>
        <input type="tel" id="pay-phone" placeholder="+91 98765 43210">
      </div>
      <div class="inpixel-payment-group">
        <label>Email Address</label>
        <input type="email" id="pay-email" placeholder="john@example.com">
      </div>
      <div class="inpixel-payment-error" id="pay-error"></div>
      <button class="inpixel-payment-btn" id="pay-btn">Proceed to Pay ${formattedAmount}</button>
    </div>
  `;
  
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  
  // Trigger animation
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    modal.classList.add('show');
  });
  
  const closeBtn = modal.querySelector('.inpixel-payment-close');
  closeBtn.addEventListener('click', closeAndRemove);
  
  function closeAndRemove() {
    overlay.style.opacity = '0';
    modal.classList.remove('show');
    setTimeout(() => overlay.remove(), 300);
  }
  
  const btn = modal.querySelector('#pay-btn');
  const errorEl = modal.querySelector('#pay-error');
  
  btn.addEventListener('click', async () => {
    const client_name = modal.querySelector('#pay-name').value.trim();
    const client_phone = modal.querySelector('#pay-phone').value.trim();
    const client_email = modal.querySelector('#pay-email').value.trim();
    
    if (!client_name || !client_phone) {
      errorEl.textContent = 'Name and Phone are required.';
      errorEl.style.display = 'block';
      return;
    }
    errorEl.style.display = 'none';
    btn.disabled = true;
    btn.textContent = 'Processing...';
    
    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: service, service, amount, client_name, client_phone, client_email })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to create order');
      
      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: 'Inpixel Network',
        description: planName,
        order_id: data.order_id,
        handler: async function(response) {
          try {
            modal.querySelector('#payment-form-content').innerHTML = `
              <div style="text-align:center; padding: 20px 0;">
                <div style="color:var(--gold); font-family:'Space Mono',monospace; font-size:0.85rem; margin-bottom:10px;">Verifying Payment & Activating Account...</div>
              </div>
            `;
            
            const verifyRes = await fetch('/api/payments/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                client_name, client_phone, client_email, service, plan_name: planName, amount
              })
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.message || verifyData.error || 'Verification failed');
            
            modal.querySelector('.inpixel-payment-title').style.display = 'none';
            modal.querySelector('.inpixel-payment-desc').style.display = 'none';
            modal.querySelector('#payment-form-content').innerHTML = `
              <div style="text-align: center; padding: 10px 0;">
                <div class="success-checkmark">✓</div>
                <h3 style="font-family:'Syne',sans-serif; color:var(--white); margin:0 0 4px 0; font-size:1.4rem;">Payment Successful!</h3>
                <p style="color:#22c55e; margin-bottom:16px; font-size:0.85rem; font-family:'Space Mono',monospace;">✓ Account Auto-Activated</p>
                
                <div style="background:var(--black); border:1px solid var(--border); padding:14px; border-radius:6px; text-align:left; font-size:0.8rem; margin-bottom:20px; line-height:1.6;">
                  <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span style="color:rgba(255,255,255,0.5);">Name:</span><strong style="color:var(--white);">${client_name}</strong></div>
                  <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span style="color:rgba(255,255,255,0.5);">Phone:</span><strong style="color:var(--gold);">${client_phone}</strong></div>
                  ${client_email ? `<div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span style="color:rgba(255,255,255,0.5);">Email:</span><strong style="color:var(--white);">${client_email}</strong></div>` : ''}
                  <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span style="color:rgba(255,255,255,0.5);">Enrolled Plan:</span><strong style="color:var(--white);">${planName}</strong></div>
                  <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span style="color:rgba(255,255,255,0.5);">Amount Paid:</span><strong style="color:#22c55e;">${formattedAmount}</strong></div>
                  <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:rgba(255,255,255,0.4); margin-top:8px; border-top:1px solid rgba(255,255,255,0.1); padding-top:6px;"><span>Payment ID:</span><span>${response.razorpay_payment_id || '—'}</span></div>
                </div>

                <a href="/userlogin/" style="display:inline-block; text-decoration:none; width:100%; padding:14px; background:var(--gold); color:var(--black); border-radius:4px; font-family:'Syne',sans-serif; font-weight:700; font-size:1rem; transition:background 0.2s; box-sizing:border-box;">Login to Your Dashboard &rarr;</a>
              </div>
            `;
            
          } catch(err) {
            alert('Payment verification failed: ' + err.message);
            closeAndRemove();
          }
        },
        prefill: { name: client_name, email: client_email, contact: client_phone },
        theme: { color: '#f0a500' }
      };
      
      rzp.on('payment.failed', function (response) {
        const err = response && response.error;
        const failureReason = err ? (err.description ? err.description + (err.reason ? ' (' + err.reason + ')' : '') : (err.reason || err.code || 'Payment failed or cancelled')) : 'Cancelled by user / Payment failed';
        // Mark payment as failed in DB with failure reason
        fetch('/api/payments/update-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            razorpay_order_id: data.order_id, 
            status: 'failed',
            failure_reason: failureReason
          })
        }).catch(() => {});
        errorEl.textContent = 'Payment failed: ' + failureReason;
        errorEl.style.display = 'block';
        btn.disabled = false;
        btn.textContent = 'Proceed to Pay ' + formattedAmount;
      });
      rzp.open();
      
      btn.disabled = false;
      btn.textContent = 'Proceed to Pay ' + formattedAmount;
      
    } catch(err) {
      errorEl.textContent = err.message;
      errorEl.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Proceed to Pay ' + formattedAmount;
    }
  });
}

window.openPaymentModal = openPaymentModal;
