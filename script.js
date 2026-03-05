// ===========================
// Language Toggle
// ===========================
const savedLang = localStorage.getItem('lang') || 'en';
const isZhInitial = savedLang === 'zh';
document.body.classList.toggle('lang-zh', isZhInitial);

const langToggleBtn = document.querySelector('.lang-toggle');
if (langToggleBtn) {
  langToggleBtn.textContent = isZhInitial ? 'EN' : '中文';
  langToggleBtn.addEventListener('click', () => {
    const isZh = document.body.classList.toggle('lang-zh');
    localStorage.setItem('lang', isZh ? 'zh' : 'en');
    langToggleBtn.textContent = isZh ? 'EN' : '中文';
  });
}

// ===========================
// Active Nav Link (multi-page)
// ===========================
const path = window.location.pathname;
let currentPage = 'index';
if (path.includes('about')) currentPage = 'about';
else if (path.includes('projects')) currentPage = 'projects';

const activeLink = document.querySelector(`.nav-links a[data-page="${currentPage}"]`);
if (activeLink) activeLink.classList.add('active');

// ===========================
// Footer year
// ===========================
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===========================
// Mobile navigation toggle
// ===========================
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', isOpen);
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ===========================
// Scroll-reveal animation
// ===========================
const revealElements = document.querySelectorAll('.reveal-target');
revealElements.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

revealElements.forEach(el => observer.observe(el));
