// ===========================
// Footer year
// ===========================
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===========================
// Language Toggle
// ===========================
const langBtn = document.querySelector('.lang-toggle');
if (langBtn) {
  langBtn.addEventListener('click', () => {
    window.location.href = langBtn.dataset.langHref;
  });
}

// ===========================
// Hamburger Menu Overlay
// ===========================
const hamburger    = document.querySelector('.hamburger');
const menuOverlay  = document.querySelector('.menu-overlay');
const menuClose    = document.querySelector('.menu-close');
const menuBackdrop = document.querySelector('.menu-backdrop');

function openMenu() {
  if (!menuOverlay) return;
  menuOverlay.classList.add('open');
  if (hamburger) {
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
  }
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  if (!menuOverlay) return;
  menuOverlay.classList.remove('open');
  if (hamburger) {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }
  document.body.style.overflow = '';
}

if (hamburger && menuOverlay) {
  hamburger.addEventListener('click', () => {
    menuOverlay.classList.contains('open') ? closeMenu() : openMenu();
  });

  if (menuClose)    menuClose.addEventListener('click', closeMenu);
  if (menuBackdrop) menuBackdrop.addEventListener('click', closeMenu);

  // Close when clicking any link inside the overlay
  menuOverlay.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Escape key closes menu
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
}

// ===========================
// Scroll-reveal animation
// ===========================
const revealEls = document.querySelectorAll('.reveal-target');
revealEls.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

revealEls.forEach(el => revealObserver.observe(el));
