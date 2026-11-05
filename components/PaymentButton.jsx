'use client';

export default function PaymentButton({ serviceId, planName, amount, children, className }) {
  const handleClick = () => {
    if (typeof window !== 'undefined' && typeof window.openPaymentModal === 'function') {
      window.openPaymentModal(serviceId, planName, amount);
    } else {
      window.location.href = `https://wa.me/919697993131?text=Hi%20Inpixel,%20I%20want%20to%20get%20started%20with%20${encodeURIComponent(planName)}`;
    }
  };

  return (
    <button className={className} onClick={handleClick}>
      {children}
    </button>
  );
}
