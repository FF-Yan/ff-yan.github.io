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
// Page Transition Overlay
// ===========================
const transitionOverlay = document.createElement('div');
transitionOverlay.className = 'page-transition';
document.body.appendChild(transitionOverlay);

// Fade in on page load
transitionOverlay.classList.add('fade-active');
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    transitionOverlay.classList.remove('fade-active');
    // Start typewriter after fade-in
    setTimeout(startTypewriter, 300);
  });
});

// Fade out before navigation
document.addEventListener('click', e => {
  const link = e.target.closest('a[href]');
  if (!link) return;
  const href = link.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('mailto:') ||
      href.startsWith('tel:') || link.target === '_blank') return;
  e.preventDefault();
  transitionOverlay.classList.add('fade-active');
  setTimeout(() => { window.location.href = href; }, 280);
});

// ===========================
// Typewriter Effect (hero eyebrow)
// ===========================
function startTypewriter() {
  const el = document.querySelector('.hero-eyebrow');
  if (!el) return;
  const text = el.textContent.trim();
  el.textContent = '';
  el.classList.add('typewriter-active');
  let i = 0;
  const speed = 38; // ms per character
  function type() {
    if (i < text.length) {
      el.textContent += text[i++];
      setTimeout(type, speed);
    } else {
      el.classList.remove('typewriter-active');
    }
  }
  type();
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
// Screenshot Galleries
// ===========================
document.querySelectorAll('.screenshot-gallery').forEach(gallery => {
  const slides  = gallery.querySelector('.gallery-slides');
  const dotEls  = gallery.querySelectorAll('.gallery-dot');
  const btnEls  = gallery.querySelectorAll('.gallery-btn');
  const total   = gallery.querySelectorAll('.gallery-slide').length;
  let current   = 0;

  function goTo(idx) {
    // Wrap index to handle both PREV (negative) and NEXT directions
    current = ((idx % total) + total) % total;
    slides.style.transform = `translateX(-${current * 100}%)`;
    dotEls.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  btnEls.forEach(btn => {
    btn.addEventListener('click', () => goTo(current + parseInt(btn.dataset.dir, 10)));
  });
  dotEls.forEach((dot, i) => {
    dot.addEventListener('click', () => goTo(i));
  });
});

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
