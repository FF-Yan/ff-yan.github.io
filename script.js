// ===========================
// Normalize URL (remove .html)
// ===========================
(function normalizeHtmlUrl() {
  const { pathname, search, hash } = window.location;
  if (!pathname.endsWith('.html')) return;

  const cleanPath = pathname === '/index.html'
    ? '/'
    : pathname.replace(/\.html$/, '');

  window.location.replace(cleanPath + search + hash);
})();

// ===========================
// Shared components loader
// ===========================
async function loadInto(el, url) {
  if (!el) return;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    el.innerHTML = await res.text();
  } catch (err) {
    console.warn(`Failed to load component: ${url}`, err);
  }
}

async function loadSharedComponents() {
  const navbarHost = document.getElementById('navbar');
  const footerHost = document.getElementById('footer');
  if (!navbarHost && !footerHost) return;

  const isZh = document.documentElement.lang.toLowerCase().startsWith('zh') || window.location.pathname.startsWith('/zh/');

  if (navbarHost) {
    await loadInto(navbarHost, isZh ? '/components/zh/navbar.html' : '/components/navbar.html');
    const toggle = navbarHost.querySelector('.lang-toggle');
    if (toggle) {
      const fallback = isZh ? '/' : '/zh/';
      toggle.dataset.langHref = document.body.dataset.langHref || fallback;
    }
  }

  if (footerHost) {
    await loadInto(footerHost, isZh ? '/components/zh/footer.html' : '/components/footer.html');
  }
}

function syncYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

document.addEventListener('click', e => {
  const langBtn = e.target.closest('.lang-toggle');
  if (!langBtn) return;
  const target = langBtn.dataset.langHref;
  if (target) window.location.href = target;
});

// ===========================
// Page Transition Overlay
// ===========================
let transitionOverlay = document.querySelector('.page-transition');
if (!transitionOverlay) {
  transitionOverlay = document.createElement('div');
  transitionOverlay.className = 'page-transition';
  document.body.appendChild(transitionOverlay);
}

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
function scrollToAnchorWithoutHash(anchorHref) {
  const id = anchorHref.slice(1);
  const target = id ? document.getElementById(id) : null;
  if (!target) return false;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  history.replaceState(null, '', window.location.pathname + window.location.search);
  return true;
}

document.addEventListener('click', e => {
  const link = e.target.closest('a[href]');
  if (!link) return;
  const href = link.getAttribute('href');
  if (!href) return;

  // In-page anchor scroll without writing #hash to URL.
  if (href.startsWith('#')) {
    if (!scrollToAnchorWithoutHash(href)) return;
    e.preventDefault();
    return;
  }

  if (href.startsWith('mailto:') || href.startsWith('tel:') || link.target === '_blank') return;
  e.preventDefault();
  transitionOverlay.classList.add('fade-active');
  setTimeout(() => { window.location.href = href; }, 280);
}, true);

// Fallback: if hash appears (e.g., browser behavior), scroll and clear it immediately.
window.addEventListener('hashchange', () => {
  if (!window.location.hash) return;
  scrollToAnchorWithoutHash(window.location.hash);
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
function getMenuElements() {
  return {
    hamburger: document.querySelector('.hamburger'),
    menuOverlay: document.querySelector('.menu-overlay')
  };
}

function openMenu() {
  const { hamburger, menuOverlay } = getMenuElements();
  if (!menuOverlay) return;
  menuOverlay.classList.add('open');
  if (hamburger) {
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
  }
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  const { hamburger, menuOverlay } = getMenuElements();
  if (!menuOverlay) return;
  menuOverlay.classList.remove('open');
  if (hamburger) {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }
  document.body.style.overflow = '';
}

function resetTransientUiState() {
  // Fix BFCache restore case: page may come back with black transition still active.
  if (transitionOverlay) transitionOverlay.classList.remove('fade-active');
  closeMenu();
  document.body.style.overflow = '';
}

window.addEventListener('pageshow', resetTransientUiState);

document.addEventListener('click', e => {
  if (e.target.closest('.hamburger')) {
    const { menuOverlay } = getMenuElements();
    if (menuOverlay && menuOverlay.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
    return;
  }

  if (e.target.closest('.menu-close') || e.target.closest('.menu-backdrop')) {
    closeMenu();
    return;
  }

  if (e.target.closest('.menu-overlay a')) {
    closeMenu();
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMenu();
});

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

(async function bootstrap() {
  await loadSharedComponents();
  syncYear();
})();
