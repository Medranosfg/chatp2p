// ========== SMOOTH SCROLLING ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Cerrar menú móvil si está abierto
            navMenu.classList.remove('active');
        }
    });
});

// ========== FAQ TOGGLE ==========
document.querySelectorAll('.faq-header').forEach(header => {
    header.addEventListener('click', function() {
        const item = this.parentElement;
        
        // Cerrar otros items
        document.querySelectorAll('.faq-item').forEach(el => {
            if (el !== item) {
                el.classList.remove('active');
            }
        });
        
        // Toggle actual
        item.classList.toggle('active');
    });
});

// ========== ANIMATIONS ON SCROLL ==========
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observar todas las tarjetas
document.querySelectorAll('.feature-card, .faq-item, .security-item, .download-card, .step-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
});

// ========== MOBILE MENU ==========
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Cerrar menú al hacer click en un link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
}

// ========== DOWNLOAD BUTTON TRACKING ==========
document.querySelectorAll('.download-card .btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        const version = this.textContent.includes('Release') ? 'Release' : 'Debug';
        console.log(`📥 Usuario descargando: ${version} APK`);
    });
});

// ========== CONSOLE MESSAGE ==========
console.log('%c🚀 ChatP2P Landing Page Loaded', 'font-size: 16px; color: #FFD700; font-weight: bold;');
console.log('%cPrivacidad Digital es Libertad', 'font-size: 12px; color: #b0b0b0;');
