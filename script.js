// ===========================
// Normalize URL (remove .html)
// ===========================
(function normalizeHtmlUrl() {
  const { pathname, search, hash } = window.location;
  let cleanPath = pathname;

  if (cleanPath.endsWith('.html')) {
    cleanPath = cleanPath === '/index.html'
      ? '/'
      : cleanPath.replace(/\.html$/, '');
  }

  if (cleanPath !== '/' && !cleanPath.endsWith('/')) {
    cleanPath = `${cleanPath}/`;
  }

  if (cleanPath !== pathname) {
    window.location.replace(cleanPath + search + hash);
  }
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
  const navVariant = document.body.dataset.navVariant === 'main' ? 'main' : 'default';

  if (navbarHost) {
    const navbarUrl = navVariant === 'main'
      ? (isZh ? '/components/zh/navbar-main.html' : '/components/navbar-main.html')
      : (isZh ? '/components/zh/navbar.html' : '/components/navbar.html');

    await loadInto(navbarHost, navbarUrl);
    const toggle = navbarHost.querySelector('.lang-toggle');
    if (toggle) {
      const is404Page =
        document.body.dataset.is404 === 'true' ||
        Boolean(document.querySelector('.notfound-wrap')) ||
        /^404\b/.test(document.title);

      if (is404Page) {
        toggle.textContent = '首页';
        toggle.setAttribute('aria-label', '返回首页');
        toggle.dataset.langHref = '/zh/';
      } else {
        const fallback = isZh ? '/' : '/zh/';
        toggle.dataset.langHref = document.body.dataset.langHref || fallback;
      }
    }
    if (navVariant !== 'main') {
      applyCurrentPageStateToMenu(navbarHost, isZh);
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

function normalizePath(path) {
  if (!path) return '/';
  let p = path;
  if (p.includes('://')) p = new URL(p).pathname;
  p = p.replace(/\/index\.html$/, '/');
  p = p.replace(/\.html$/, '');
  if (!p.startsWith('/')) p = `/${p}`;
  if (p !== '/' && p.endsWith('/')) p = p.slice(0, -1);
  return p || '/';
}

function getTopLevelMenuPath(pathname, isZh) {
  const p = normalizePath(pathname);
  if (isZh) {
    if (p === '/zh') return '/zh';
    if (p.startsWith('/zh/projects')) return '/zh/projects';
    if (p.startsWith('/zh/about')) return '/zh/about';
    return null;
  }
  if (p === '/') return '/';
  if (p.startsWith('/projects')) return '/projects';
  if (p.startsWith('/about')) return '/about';
  return null;
}

function applyCurrentPageStateToMenu(navbarHost, isZh) {
  const menuLinks = navbarHost.querySelectorAll('.menu-nav a[href]');
  if (!menuLinks.length) return;

  if (document.body.dataset.is404 === 'true') {
    menuLinks.forEach(link => {
      link.classList.remove('is-current');
      link.removeAttribute('aria-current');
      link.removeAttribute('aria-disabled');
      delete link.dataset.disabledNav;
    });
    return;
  }

  const currentPath = normalizePath(window.location.pathname);
  const currentTop = getTopLevelMenuPath(window.location.pathname, isZh);
  menuLinks.forEach(link => {
    const href = link.getAttribute('href') || '';
    const targetTop = getTopLevelMenuPath(href, isZh);
    const isCurrent = currentTop !== null && targetTop !== null && targetTop === currentTop;
    const isExactSectionPage = targetTop !== null && currentPath === targetTop;
    link.classList.toggle('is-current', isCurrent);
    if (isCurrent && isExactSectionPage) {
      link.setAttribute('aria-current', 'page');
      link.setAttribute('aria-disabled', 'true');
      link.dataset.disabledNav = 'true';
    } else {
      if (isCurrent) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
      link.removeAttribute('aria-disabled');
      delete link.dataset.disabledNav;
    }
  });
}

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
  const langBtn = e.target.closest('.lang-toggle');
  if (langBtn) {
    const target = langBtn.dataset.langHref;
    if (target) window.location.href = target;
    return;
  }

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

  const link = e.target.closest('a[href]');
  if (!link) return;
  const inMenuOverlay = Boolean(link.closest('.menu-overlay'));

  if (link.dataset.disabledNav === 'true' || link.getAttribute('aria-disabled') === 'true') {
    e.preventDefault();
    if (inMenuOverlay) closeMenu();
    return;
  }

  const href = link.getAttribute('href');
  if (!href) {
    if (inMenuOverlay) closeMenu();
    return;
  }

  // In-page anchor scroll without writing #hash to URL.
  if (href.startsWith('#')) {
    if (scrollToAnchorWithoutHash(href)) {
      e.preventDefault();
    }
    if (inMenuOverlay) closeMenu();
    return;
  }

  if (href.startsWith('mailto:') || href.startsWith('tel:') || link.target === '_blank') {
    if (inMenuOverlay) closeMenu();
    return;
  }

  e.preventDefault();
  if (inMenuOverlay) closeMenu();
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
