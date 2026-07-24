// ===== Preloader =====
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add('loaded');
            document.body.classList.remove('loading');
        }, 1000); // 1s delay to show the logo
    }
});

// ===== Reveal on Scroll =====
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ===== Parallax Effect =====
const parallaxEl = document.getElementById('contact-parallax');

if (parallaxEl) {
    window.addEventListener('scroll', () => {
        const rect = parallaxEl.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const viewportCenter = window.innerHeight / 2;
        const offset = (center - viewportCenter) * 0.08;
        parallaxEl.style.transform = `translateY(${offset}px)`;
    }, { passive: true });
}

// ===== Split Text Animation =====
document.querySelectorAll('.split-text:not(:has(>*))').forEach(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach((word, i) => {
        const span = document.createElement('span');
        span.className = 'split-word';
        span.style.setProperty('--i', i);
        span.textContent = word;
        el.appendChild(span);
        if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
});

// ===== Navbar scroll effect =====
const nav = document.querySelector('.nav');
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    // Hide when scrolling down, show when scrolling up
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
        nav.classList.add('nav-hidden');
    } else {
        nav.classList.remove('nav-hidden');
    }

    // Scrolled style when not at top
    nav.classList.toggle('scrolled', currentScrollY > 50);

    lastScrollY = currentScrollY;
});

// ===== FAQ Accordion =====
document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('active'));
        if (!isActive) item.classList.add('active');
        // Update max-height for smooth animation
        const answer = item.querySelector('.faq-answer');
        if (!isActive && answer) {
            answer.style.maxHeight = answer.scrollHeight + 'px';
        }
        document.querySelectorAll('.faq-item').forEach(el => {
            if (el !== item || isActive) {
                const a = el.querySelector('.faq-answer');
                if (a) a.style.maxHeight = '0';
            }
        });
    });
});

// ===== Mobile Menu =====
const menuBtn = document.getElementById('mobile-menu-toggle');
const closeBtn = document.getElementById('close-menu');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('#mobile-menu a');

const toggleMenu = () => mobileMenu.classList.toggle('active');

if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
if (closeBtn) closeBtn.addEventListener('click', toggleMenu);
mobileLinks.forEach(link => link.addEventListener('click', toggleMenu));

// ===== Counter Animation =====
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const target = el.getAttribute('data-count');
            const suffix = el.getAttribute('data-suffix') || '';
            const prefix = el.getAttribute('data-prefix') || '';
            const num = parseInt(target);
            const duration = 2000;
            const start = Date.now();

            const animate = () => {
                const elapsed = Date.now() - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = prefix + Math.floor(eased * num) + suffix;
                if (progress < 1) requestAnimationFrame(animate);
            };
            animate();
            counterObserver.unobserve(el);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

// ===== Service Cards Accordion =====
document.querySelectorAll('.service-expandable').forEach(card => {
    const header = card.querySelector('.service-card-header');

    header.addEventListener('click', () => {
        const isExpanded = card.classList.contains('expanded');

        document.querySelectorAll('.service-expandable.expanded').forEach(el => {
            if (el !== card) el.classList.remove('expanded');
        });

        if (isExpanded) {
            card.classList.remove('expanded');
        } else {
            card.classList.add('expanded');
        }
    });
});


