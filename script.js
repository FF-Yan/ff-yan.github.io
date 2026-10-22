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
// Footer year
// ===========================
// The navbar and footer are rendered into each page by build/build.js;
// the year is filled in at build time and refreshed here.
function syncYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

syncYear();

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
function scrollToAnchorWithoutHash(anchorHref, behavior = 'smooth') {
  const id = anchorHref.slice(1);
  const target = id ? document.getElementById(id) : null;
  if (!target) return false;
  target.scrollIntoView({ behavior, block: 'start' });
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

  // Let the browser handle modifier/middle clicks natively (new tab, new window, etc.).
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

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

// Cross-page anchors (e.g. /#archive, /about/#experience): land on the section
// instantly, then clear the hash.
//
// Two things this deliberately avoids. It does not wait for `load` — that waits
// on every subresource, and a slow or blocked third-party script (Turnstile) can
// hold it for seconds, so the reader would sit at the top and then get yanked.
// And it scrolls with 'instant' rather than 'smooth': arriving from another page
// should put you at the section, not fly you past the whole homepage to get
// there. 'instant' has to be explicit, since 'auto' defers to the CSS
// scroll-behavior, which is smooth.
const initialHash = window.location.hash;

function scrollToInitialHash() {
  if (!initialHash) return;
  scrollToAnchorWithoutHash(initialHash, 'instant');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scrollToInitialHash);
} else {
  scrollToInitialHash();
}

// ===========================
// Typewriter Effect (hero eyebrow)
// ===========================
function startTypewriter() {
  const el = document.querySelector('.hero-eyebrow');
  if (!el) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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
// Turnstile Explicit Render
// ===========================
let turnstileWidgetId = null;
let turnstileToken = null;

function initTurnstile() {
  if (!window.turnstile) {
    console.warn('Turnstile did not load yet');
    return;
  }
  const container = document.getElementById('turnstile-container');
  if (!container || turnstileWidgetId !== null) return;

  turnstileWidgetId = window.turnstile.render('#turnstile-container', {
    sitekey: '0x4AAAAAACvDhtOvvBEaUTA2',
    callback: function (token) {
      turnstileToken = token;
    },
    // Tokens expire after ~5 minutes; drop the stale one and get a fresh challenge
    // so a slow writer isn't rejected by Formspree on submit.
    'expired-callback': function () {
      turnstileToken = null;
      resetTurnstile();
    },
    'timeout-callback': function () {
      turnstileToken = null;
      resetTurnstile();
    },
    'error-callback': function () {
      turnstileToken = null;
      console.warn('Turnstile failed');
    }
  });
}

function resetTurnstile() {
  if (turnstileWidgetId !== null && typeof window.turnstile?.reset === 'function') {
    window.turnstile.reset(turnstileWidgetId);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTurnstile);
} else {
  initTurnstile();
}

document.addEventListener('submit', e => {
  const form = e.target.closest('.contact-form');
  if (!form) return;

  e.preventDefault();

  const formspreeEndpoint = 'https://formspree.io/f/mojkoglo';

  const name = (form.querySelector('[name="name"]')?.value || '').trim();
  const email = (form.querySelector('[name="email"]')?.value || '').trim();
  const subject = (form.querySelector('[name="subject"]')?.value || '').trim();
  const message = (form.querySelector('[name="message"]')?.value || '').trim();

  if (!name || !email || !subject || !message) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const statusEl = form.querySelector('.contact-form-status');
  const defaultText = submitBtn?.dataset.textDefault || submitBtn?.textContent || 'Send Message';
  const successText = submitBtn?.dataset.textSuccess || 'Message sent!';
  const errorText = submitBtn?.dataset.textError || 'Failed to send. Please try again.';
  const captchaText = submitBtn?.dataset.textCaptcha || 'Please complete the human verification.';

  const showStatus = (text, type) => {
    if (!statusEl) return;
    statusEl.classList.remove('is-success', 'is-error', 'is-visible');
    if (!text) {
      statusEl.textContent = '';
      return;
    }
    statusEl.textContent = text;
    statusEl.classList.add(type === 'success' ? 'is-success' : 'is-error', 'is-visible');
  };

  showStatus('', 'error');

  const hasCaptcha = Boolean(form.querySelector('#turnstile-container'));

  if (hasCaptcha && !turnstileToken) {
    showStatus(`❌ ${captchaText}`, 'error');
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
  }

  const formData = new FormData(form);
  formData.set('name', name);
  formData.set('email', email);
  formData.set('subject', subject);
  formData.set('message', message);
  if (hasCaptcha) {
    formData.set('cf-turnstile-response', turnstileToken);
  }

  fetch(formspreeEndpoint, {
    method: 'POST',
    headers: {
      'Accept': 'application/json'
    },
    body: formData
  })
    .then(async res => {
      if (res.ok) {
        form.reset();
        turnstileToken = null;
        resetTurnstile();
        showStatus(`✅ ${successText}`, 'success');
        return;
      }

      let detail = '';
      try {
        const data = await res.json();
        if (Array.isArray(data?.errors) && data.errors.length) {
          detail = data.errors.map(item => item?.message).filter(Boolean).join(' / ');
        } else if (typeof data?.error === 'string') {
          detail = data.error;
        }
      } catch {
        // ignore parse error
      }

      if (/turnstile/i.test(detail)) {
        turnstileToken = null;
        resetTurnstile();
      }

      throw new Error(detail || `HTTP ${res.status}`);
    })
    .catch(err => {
      console.error('Formspree submission error:', err);
      const detail = err instanceof Error && err.message ? ` (${err.message})` : '';
      showStatus(`❌ ${errorText}${detail}`, 'error');
    })
    .finally(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        submitBtn.textContent = defaultText;
      }
    });
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
    dotEls.forEach((d, i) => {
      const active = i === current;
      d.classList.toggle('active', active);
      if (active) d.setAttribute('aria-current', 'true');
      else d.removeAttribute('aria-current');
    });
  }

  btnEls.forEach(btn => {
    btn.addEventListener('click', () => goTo(current + parseInt(btn.dataset.dir, 10)));
  });
  dotEls.forEach((dot, i) => {
    dot.addEventListener('click', () => goTo(i));
  });

  // Swipe on touch screens: a mostly-horizontal drag of 40px+ changes slide.
  if (total > 1) {
    let startX = null;
    let startY = 0;
    slides.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    slides.addEventListener('touchend', e => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      startX = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) goTo(current + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }
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

// ===========================
// Pointer-reactive paper
// ===========================
// Three effects share one rAF loop: a soft dent that follows the cursor
// across the stock, hero layers that drift against it, and the 404 cat's
// pupils. Skipped entirely for touch input and reduced-motion users.
(function initPointerEffects() {
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (!finePointer.matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const dent = document.createElement('div');
  dent.className = 'paper-dent';
  dent.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(dent, document.body.firstChild);

  // Each hero layer drifts by a different amount, which is what reads as depth.
  const LAYERS = [
    ['.hero-orb-1', 20],
    ['.hero-orb-2', -13],
    ['.hero-orb-3', 27],
    ['.hero-grid', 6],
  ]
    .map(([sel, depth]) => ({ el: document.querySelector(sel), depth }))
    .filter((l) => l.el);

  const catSvg = document.querySelector('.pixel-cat');
  const catEyes = document.querySelector('.cat-eyes');

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let x = targetX;
  let y = targetY;
  let eyeX = 0;
  let eyeY = 0;
  let frame = null;
  let visible = false;
  let needsSnap = true;

  // Pupils move in whole grid cells, so the look stays pixel-crisp.
  function pupilStep(distance, half) {
    if (!half) return 0;
    const n = distance / half;
    if (n > 0.28) return 1;
    if (n < -0.28) return -1;
    return 0;
  }

  function render() {
    frame = null;

    x += (targetX - x) * 0.22;
    y += (targetY - y) * 0.22;
    dent.style.transform = 'translate3d(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px, 0)';

    // -1..1 from the viewport centre drives the parallax
    const nx = (x / window.innerWidth) * 2 - 1;
    const ny = (y / window.innerHeight) * 2 - 1;
    for (const layer of LAYERS) {
      layer.el.style.transform =
        'translate3d(' + (-nx * layer.depth).toFixed(1) + 'px, ' +
        (-ny * layer.depth * 0.55).toFixed(1) + 'px, 0)';
    }

    if (catEyes && catSvg) {
      const box = catSvg.getBoundingClientRect();
      const nextX = pupilStep(x - (box.left + box.width / 2), box.width / 2);
      const nextY = pupilStep(y - (box.top + box.height / 2), box.height / 2);
      if (nextX !== eyeX || nextY !== eyeY) {
        eyeX = nextX;
        eyeY = nextY;
        catEyes.setAttribute('transform', 'translate(' + eyeX + ' ' + eyeY + ')');
      }
    }

    if (Math.abs(targetX - x) > 0.3 || Math.abs(targetY - y) > 0.3) {
      frame = requestAnimationFrame(render);
    }
  }

  function schedule() {
    if (frame === null) frame = requestAnimationFrame(render);
  }

  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      targetX = e.clientX;
      targetY = e.clientY;
      if (needsSnap) {
        // Land the dent under the cursor rather than sliding in from the centre.
        needsSnap = false;
        x = targetX;
        y = targetY;
      }
      if (!visible) {
        visible = true;
        dent.style.opacity = '1';
      }
      schedule();
    },
    { passive: true }
  );

  // Fade out when the cursor leaves the window; the next pointermove
  // re-snaps it into place and fades it back in.
  document.addEventListener('mouseleave', () => {
    visible = false;
    needsSnap = true;
    dent.style.opacity = '0';
  });
})();
