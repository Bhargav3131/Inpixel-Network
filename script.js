// Smooth scrolling
function scrollToContact() {
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
}

// Enquiry popup functions
function openEnquiry() {
    document.getElementById('popupOverlay').classList.add('active');
    document.getElementById('enquiryPopup').classList.add('active');
    document.getElementById('floatingBtn').classList.add('hidden');
}

function closeEnquiry() {
    document.getElementById('popupOverlay').classList.remove('active');
    document.getElementById('enquiryPopup').classList.remove('active');
    document.getElementById('floatingBtn').classList.remove('hidden');
    document.getElementById('enquiryForm').style.display = 'block';
    document.getElementById('successMessage').classList.remove('active');
    document.getElementById('enquiryForm').reset();
}

// Form submission handler
function handleSubmit(event) {
    event.preventDefault();
    
    // Get form values
    const name = document.getElementById('name').value;
    const contact = document.getElementById('contact').value;
    const message = document.getElementById('message').value;

    // EmailJS parameters
    const params = {
        name: name,
        contact: contact,
        message: message
    };

    // Send email using EmailJS
    emailjs.send("service_p1upsrh", "template_mibmmmu", params)
        .then(function(response) {
            console.log('SUCCESS!', response.status, response.text);

            // Show success UI
            document.getElementById('enquiryForm').style.display = 'none';
            document.getElementById('successMessage').classList.add('active');

            // Close popup after 2 seconds
            setTimeout(() => {
                closeEnquiry();
            }, 2000);
        })
        .catch(function(error) {
            console.log('FAILED...', error);
            alert("Failed to send enquiry. Please try again.");
        });
}

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.service-card, .why-card');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
    
    // Add smooth scroll to all navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Close popup when pressing Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeEnquiry();
    }
});
// Mobile menu toggle
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.toggle('active');
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    
    if (mobileMenu && mobileMenuBtn) {
        if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            mobileMenu.classList.remove('active');
        }
    }
});
