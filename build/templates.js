const { BASE_URL, FAVICON } = require('./data/site');

function localePath(locale, path) {
  // path starts with "/", e.g. "/projects/chromatic" or "/"
  if (locale === 'en') return path;
  return path === '/' ? '/zh/' : `/zh${path}`;
}

function tagList(tags) {
  return tags.map((t) => `<span class="tag">${t}</span>`).join('\n              ');
}

// `monolingual` is for pages that exist in one language only (a content page
// with no .zh.html twin): they get a canonical but no hreflang alternates,
// because pointing at a translation that does not exist is worse than none.
function head({ locale, s, title, description, canonicalPath, alternatePath, ogImage, monolingual = false }) {
  const url = `${BASE_URL}${canonicalPath}`;
  const altUrl = `${BASE_URL}${alternatePath}`;
  const image = `${BASE_URL}${ogImage}`;
  const enUrl = locale === 'en' ? url : altUrl;
  const zhUrl = locale === 'en' ? altUrl : url;
  const alternates = monolingual
    ? ''
    : `
  <link rel="alternate" hreflang="en" href="${enUrl}" />
  <link rel="alternate" hreflang="zh-CN" href="${zhUrl}" />
  <link rel="alternate" hreflang="x-default" href="${enUrl}" />`;
  return `  <meta name="description" content="${description}" />
  <link rel="canonical" href="${url}" />${alternates}
  <link rel="icon" type="image/webp" href="${FAVICON}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:locale" content="${s.ogLocale}" />${monolingual ? '' : `
  <meta property="og:locale:alternate" content="${s.altOgLocale}" />`}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />`;
}

// Card links: plain text links, in data order.
function externalLinksHtml(ui, links) {
  return links
    .map((ext) => `<a href="${ext.url}" class="project-link-ext" target="_blank" rel="noopener noreferrer">${ui.external[ext.type]}</a>`)
    .join('\n              ');
}

// Detail page: the first link is the call to action, the rest are secondary.
function detailLinksHtml(ui, links) {
  return links
    .map((ext, i) => `<a href="${ext.url}" class="btn ${i === 0 ? 'btn-primary' : 'btn-outline'}" target="_blank" rel="noopener noreferrer">${ui.external[ext.type]}</a>`)
    .join('\n            ');
}

// Renders a home ("featured") or listing project card. `view` is 'home' or 'listing'.
function projectCard(project, locale, view, ui) {
  const p = project[locale];
  const v = p[view];
  const detailHref = localePath(locale, `/projects/${project.slug}/`);
  const detailsBtn = p.detail
    ? `<a href="${detailHref}" class="btn-pixel">${ui.details}</a>\n              `
    : '';
  const thumbInner = project.cardIcon
    ? `<div class="project-thumb-inner">
              <span class="thumb-icon">${project.cardIcon}</span>
              <span class="thumb-label">${p.thumbLabel}</span>
            </div>`
    : `<img src="${project.cardImage.src}" alt="${project.cardImage.alt}" width="${project.cardImage.width}" height="${project.cardImage.height}" loading="lazy" class="thumb-img">
            <div class="thumb-overlay">
              <span class="thumb-label">${p.thumbLabel}</span>
            </div>`;

  return `        <div class="project-card reveal-target">
          <div class="project-thumb">
            ${thumbInner}
          </div>
          <div class="project-body">
            <div class="project-type">${p.type}</div>
            <h3>${p.title}</h3>
            <p class="project-role-date">${p.role} &middot; ${p.period}</p>
            <p class="project-desc">
              ${v.desc}
            </p>
            <div class="project-tags">
              ${tagList(v.tags)}
            </div>
            <div class="project-links">
              ${detailsBtn}${externalLinksHtml(ui, project.externalLinks)}
            </div>
          </div>
        </div>`;
}

function paragraphs(list) {
  return list.map((t) => `<p>\n            ${t}\n          </p>`).join('\n          ');
}

// Work-experience / leadership entry. `location` is optional.
function experienceCard(entry) {
  const location = entry.location
    ? `\n            <p class="exp-location">${entry.location}</p>`
    : '';
  return `      <div class="experience-card reveal-target">
        <div class="exp-header">
          <div class="exp-info">
            <h3>${entry.org}</h3>${location}
          </div>
          <div class="exp-dates">${entry.dates}</div>
        </div>
        <p class="exp-role">${entry.role}</p>
        <ul class="exp-bullets">
          ${entry.bullets.map((b) => `<li>${b}</li>`).join('\n          ')}
        </ul>
      </div>`;
}

// Menu entries from content/ (the /extras/ listing, and any page with `nav:`).
// build.js fills this before rendering anything, so every page agrees on the menu.
// Each entry: { key, path, order, label: {en, zh}, locales: {en, zh} }
let navPages = [];

function setNavPages(pages) {
  navPages = pages;
}

// Whether content/ holds anything the homepage archive can list. When it is
// empty the section is not rendered, so its menu anchor must go too — otherwise
// the menu points at an id that does not exist on the page.
let hasArchive = false;

function setHasArchive(flag) {
  hasArchive = flag;
}

// Menu rows carry a sequence number; generating it here means adding or
// reordering an item never requires renumbering anything by hand.
function renderMenuLinks(rows) {
  return rows
    .map(({ href, label, attrs = '' }, i) => {
      const num = String(i + 1).padStart(2, '0');
      return `      <a href="${href}"${attrs}><span class="menu-num">${num}</span> ${label}</a>`;
    })
    .join('\n');
}

// Content-page menu rows for `locale`. A page with no twin in this locale still
// appears, pointing at the language it does exist in. `exact` means the current
// page IS this entry, so the link is inert; on a page *below* it (anything
// under /extras/) it stays clickable, which is how you get back up to the listing.
function navPageRows(locale, current, exact) {
  return navPages.map((entry) => {
    const href = localePath(entry.locales[locale] ? locale : entry.locales.en ? 'en' : 'zh', entry.path);
    let attrs = '';
    if (entry.key === current) {
      attrs = ' class="is-current" aria-current="page"';
      if (exact) attrs += ' aria-disabled="true" data-disabled-nav="true"';
    }
    return { order: entry.order, href, label: entry.label[locale] || entry.label.en, attrs };
  });
}

// `langToggle` = { label, aria, href }: the button that switches to the other
// language version of the current page (or, on the 404 page, to 首页). Pass null
// when the page has no twin — offering a switch that only dumps the reader on
// another homepage is worse than offering none.
function navbarInner(locale, site, { menuLinks, langToggle }) {
  const s = site[locale];
  const homeHref = localePath(locale, '/');
  const langButton = langToggle
    ? `
      <button class="lang-toggle" data-lang-href="${langToggle.href}" aria-label="${langToggle.aria}">${langToggle.label}</button>`
    : '';
  return `<header class="navbar">
  <div class="nav-inner">
    <a href="${homeHref}" class="nav-logo">${s.logo.first}${s.logo.separator}<span>${s.logo.last}</span></a>
    <div class="nav-right">${langButton}
      <button class="hamburger" aria-label="${s.hamburgerAria}" aria-expanded="false" aria-controls="menuOverlay">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</header>

<div class="menu-overlay" id="menuOverlay">
  <div class="menu-backdrop"></div>
  <div class="menu-panel">
    <button class="menu-close" aria-label="${s.menuCloseAria}">&times;</button>

    <div class="menu-logo">${s.logo.first}${s.logo.separator}<span>${s.logo.last}</span></div>
    <div class="menu-tagline">${s.tagline}</div>

    <nav class="menu-nav">
${menuLinks}
    </nav>

    <div class="menu-bottom">
      <div class="menu-bottom-label">${s.contactLabel}</div>
      <div class="menu-contacts">
        <a href="mailto:${s.email}">${s.email}</a>
        <a href="${s.github}" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="${s.resume.url}" target="_blank" rel="noopener noreferrer" download>${s.resume.label}</a>
      </div>
    </div>
  </div>
</div>`;
}

// Menu for every page except the homepage. `current` is the top-level section
// the page belongs to ('projects', 'about' or null); `exact` means the page IS
// that section's index, so its link is disabled rather than just highlighted.
function navbarDefault(locale, site, { current = null, exact = false, langToggle }) {
  const s = site[locale];
  const builtIn = [
    ['home', 10, localePath(locale, '/'), s.menu.home],
    ['projects', 20, localePath(locale, '/projects/'), s.menu.projects],
    ['about', 30, localePath(locale, '/about/'), s.menu.about],
  ].map(([key, order, href, label]) => {
    let attrs = '';
    if (key === current) {
      attrs = ' class="is-current" aria-current="page"';
      if (exact) attrs += ' aria-disabled="true" data-disabled-nav="true"';
    }
    return { order, href, label, attrs };
  });

  const rows = [...builtIn, ...navPageRows(locale, current, exact)].sort((a, b) => a.order - b.order);
  return navbarInner(locale, site, { menuLinks: renderMenuLinks(rows), langToggle });
}

function navbarMain(locale, site, { langToggle }) {
  const s = site[locale];
  const builtIn = [
    ['#hero', 10, s.menu.home],
    ['#featured', 20, s.menu.projects],
    ['#experience', 30, s.menu.experience],
    ['#about', 40, s.menu.about],
    ['#skills', 50, s.menu.skills],
    ['#archive', 55, s.menu.archive],
    ['#contact', 60, s.menu.contact],
  ]
    .filter(([href]) => href !== '#archive' || hasArchive)
    .map(([href, order, label]) => ({ order, href, label }));

  // Only the homepage's own sections. Everything under content/ is reachable
  // through #archive, so it is not repeated here; the sub-page menu
  // (navbarDefault) carries the real /extras/ links instead.
  const rows = builtIn.sort((a, b) => a.order - b.order);
  return navbarInner(locale, site, { menuLinks: renderMenuLinks(rows), langToggle });
}

// The year is rendered at build time and refreshed by script.js at runtime.
function footerHtml(locale, site) {
  const s = site[locale];
  return `<footer class="footer">
  <div class="footer-inner">
    <div class="footer-name">${s.footer.name}</div>
    <div class="footer-contacts">
      <a href="mailto:${s.email}">${s.email}</a>
      <a href="${s.github}" target="_blank" rel="noopener noreferrer">GitHub</a>
      <a href="${s.resume.url}" target="_blank" rel="noopener noreferrer" download>${s.resume.label}</a>
    </div>
    <p class="footer-copy">&copy; <span id="year">${new Date().getFullYear()}</span> ${s.footer.name} &mdash; ${s.footer.copy}</p>
  </div>
</footer>`;
}

// The "← Back to <section>" button every sub-page opens with: project details
// back to Projects, everything under /extras/ back to Extras. It sits just above
// the hero, close to the title; CSS pulls in the following .page-hero's top
// padding, which otherwise assumes it is first on the page.
function backBar(site, locale, href, name) {
  return `
  <div class="section-back">
    <div class="container">
      <div class="game-back">
        <a href="${href}">${site[locale].ui.backTo.replace('{name}', name)}</a>
      </div>
    </div>
  </div>
`;
}

// Language-toggle props for a page whose other-language twin lives at `alternatePath`.
function langToggleFor(s, alternatePath) {
  return { label: s.langToggle.label, aria: s.langToggle.aria, href: alternatePath };
}

// `headHtml` replaces the SEO/social block for pages that should not be
// indexed (404); everything else gets the full canonical/hreflang/OG set.
// `title` is the page's bare name; every tab and social card reads
// "<title> | <site name>", built here and nowhere else.
function page({ locale, site, title: name, description, canonicalPath, alternatePath, ogImage, nav, extraHead, headHtml, body, monolingual = false }) {
  const s = site[locale];
  const title = `${name} | ${s.footer.name}`;
  return `<!DOCTYPE html>
<html lang="${s.htmlLang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
${headHtml || head({ locale, s, title, description, canonicalPath, alternatePath, ogImage, monolingual })}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Silkscreen:wght@400;700&family=Space+Grotesk:wght@500;600;700&display=swap" />
  <link rel="stylesheet" href="/style.css" />${extraHead ? `\n${extraHead}` : ''}
</head>
<body>

  <div id="navbar">
${nav}
  </div>
${body}
  <div id="footer">
${footerHtml(locale, site)}
  </div>

  <script src="/script.js"></script>
</body>
</html>
`;
}

// Which language to send a reader to: this one if it exists, otherwise
// whichever does. Matches how the menu already links untranslated pages.
function linkLocaleFor(bodies, locale) {
  if (bodies[locale]) return locale;
  if (bodies.en) return 'en';
  return bodies.zh ? 'zh' : null;
}

// Everything under content/, newest first, as the homepage strip and the
// /extras/ listing both show it. In a folder with `date: hidden` the date
// only sorts — no view prints it. Untranslated items still appear, pointing at
// the language they exist in, rather than being hidden from one locale.
function extrasItems(locale, extras) {
  const out = [];
  for (const item of extras ? extras.items : []) {
    const target = linkLocaleFor(item.bodies, locale);
    if (!target) continue;
    // Title and summary come from the page being linked to, so the card never
    // promises Chinese and then lands on English.
    const meta = item.metaByLocale[target] || item.meta;
    out.push({
      kind: item.kind[locale],
      href: localePath(target, `/extras/${item.slug}/`),
      title: meta.title,
      summary: meta.summary || meta.description || '',
      date: item.showDate ? meta.date || item.meta.date : '',
    });
  }
  return out;
}

// Horizontal, snap-scrolling strip. Native overflow scrolling, so the
// trackpad, shift+wheel, touch and keyboard all work without extra JS.
// The homepage is a way in, not the index: it shows the newest few and leaves
// the rest to /extras/. They scroll inside a framed box as wide as the other
// sections, so more cards never make this section stick out past them.
const STRIP_LIMIT = 8;

function contentStrip(locale, site, extras) {
  const items = extrasItems(locale, extras).slice(0, STRIP_LIMIT);
  if (!items.length) return '';

  const s = site[locale];
  const h = s.home;

  const moreLinks = `        <a class="btn btn-outline btn-sm" href="${extrasHref(extras, locale)}">${s.ui.allInCollection.replace('{collection}', extras.label[locale])}</a>`;
  const cards = items
    .map(
      (item) => `        <a class="strip-card" href="${item.href}">
          <span class="strip-kind">${item.kind}</span>
          <h3 class="strip-title">${item.title}</h3>${
            item.summary ? `\n          <p class="strip-summary">${item.summary}</p>` : ''
          }${item.date ? `\n          <span class="strip-date">${item.date}</span>` : ''}
        </a>`
    )
    .join('\n');

  return `
  <!-- ===== Archive ===== -->
  <section id="archive" class="section section-alt">
    <div class="container">
      <div class="section-header reveal-target">
        <div class="section-num">${h.contentEyebrow}</div>
        <h2 class="section-title">${h.contentTitle}</h2>
      </div>
      <div class="strip-scroll reveal-target">
        <div class="strip-track">
${cards}
        </div>
      </div>
      <div class="archive-more reveal-target">
${moreLinks}
      </div>
    </div>
  </section>
`;
}

function homePage(locale, site, projects, homeFeaturedSlugs, extras) {
  const s = site[locale];
  const h = s.home;
  const otherLocale = locale === 'en' ? 'zh' : 'en';
  const cards = homeFeaturedSlugs
    .map((slug) => projects.find((p) => p.slug === slug))
    .map((p) => projectCard(p, locale, 'home', s.ui))
    .join('\n\n');

  const body = `
  <!-- ===== Hero ===== -->
  <section id="hero" class="hero">
    <div class="hero-bg" aria-hidden="true">
      <span class="hero-orb hero-orb-1"></span>
      <span class="hero-orb hero-orb-2"></span>
      <span class="hero-orb hero-orb-3"></span>
      <span class="hero-grid"></span>
    </div>
    <div class="hero-inner">
      <div class="hero-eyebrow">${h.heroEyebrow}</div>
      <h1 class="hero-name">${h.heroNameFirst}<br><span class="accent">${h.heroNameLast}</span></h1>
      <p class="hero-desc">
        ${h.heroDesc}
      </p>
      <div class="hero-cta">
        <a href="#featured" class="btn btn-primary">${h.heroCta.primary}</a>
        <a href="#contact" class="btn btn-outline">${h.heroCta.secondary}</a>
        <a href="${s.resume.url}" class="btn btn-outline" target="_blank" rel="noopener noreferrer" download>${h.heroCta.resume}</a>
      </div>
      <div class="hero-meta">
        <span class="hero-meta-item">${h.heroLocation}</span>
        <span class="hero-meta-item">${h.heroAvailability}</span>
      </div>
    </div>
    <span class="hero-scroll" aria-hidden="true"></span>
  </section>

  <!-- ===== Featured Projects ===== -->
  <section id="featured" class="section section-alt">
    <div class="container">
      <div class="section-header reveal-target">
        <div class="section-num">${h.featuredEyebrow}</div>
        <h2 class="section-title">${h.featuredTitle}</h2>
      </div>

      <div class="feat-grid">

${cards}
      </div>
      <div class="projects-more">
        <a href="${localePath(locale, '/projects/')}" class="btn btn-outline">${h.seeAllProjects}</a>
      </div>
    </div>
  </section>

  <!-- ===== Experience ===== -->
  <section id="experience" class="section">
    <div class="container">
      <div class="section-header reveal-target">
        <div class="section-num">${h.experienceEyebrow}</div>
        <h2 class="section-title">${h.experienceTitle}</h2>
      </div>

${s.about.experiences.filter((e) => e.featured).map(experienceCard).join('\n\n')}
      <div class="projects-more">
        <a href="${localePath(locale, '/about/#experience')}" class="btn btn-outline">${h.seeAllExperience}</a>
      </div>
    </div>
  </section>

  <!-- ===== About ===== -->
  <section id="about" class="section section-alt">
    <div class="container">
      <div class="section-header reveal-target">
        <div class="section-num">${h.aboutEyebrow}</div>
        <h2 class="section-title">${h.aboutTitle}</h2>
      </div>

      <div class="about-card reveal-target">
        <div class="avatar"><img src="/assets/images/profile.webp" alt="${s.footer.name}" width="800" height="1176" loading="lazy" class="avatar-img"></div>
        <div class="about-text">
          ${paragraphs(h.aboutText)}
          <a href="${localePath(locale, '/about/')}" class="btn btn-outline btn-sm">${h.fullProfile}</a>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== Skills ===== -->
  <section id="skills" class="section">
    <div class="container">
      <div class="section-header reveal-target">
        <div class="section-num">${h.skillsEyebrow}</div>
        <h2 class="section-title">${h.skillsTitle}</h2>
      </div>

      <div class="skills-grid">
        <div class="skill-card reveal-target">
          <div class="skill-card-title">${h.skills.languagesTitle}</div>
          <ul class="skill-list">
            ${h.skills.languages.map((l) => `<li>${l}</li>`).join('\n            ')}
          </ul>
        </div>

        <div class="skill-card reveal-target">
          <div class="skill-card-title">${h.skills.toolsTitle}</div>
          <div class="tags-cloud">
            ${tagList(h.skills.tools)}
          </div>
        </div>

        <div class="skill-card reveal-target">
          <div class="skill-card-title">${h.skills.workflowTitle}</div>
          <div class="tags-cloud">
            ${tagList(h.skills.workflow)}
          </div>
        </div>

        <div class="skill-card reveal-target">
          <div class="skill-card-title">${h.skills.spokenTitle}</div>
          <ul class="skill-list">
            ${h.skills.spoken.map((l) => `<li>${l}</li>`).join('\n            ')}
          </ul>
        </div>
      </div>
    </div>
  </section>

${contentStrip(locale, site, extras)}
  <!-- ===== Contact ===== -->
  <section id="contact" class="section">
    <div class="container">
      <div class="section-header reveal-target">
        <div class="section-num">${h.contactEyebrow}</div>
        <h2 class="section-title">${h.contactTitle}</h2>
      </div>
      <p class="contact-intro reveal-target">
        ${h.contactIntro}
      </p>

      <form class="contact-form reveal-target">
        <div class="contact-form-row">
          <label class="form-field">
            <span class="form-label">${h.form.name}</span>
            <input class="contact-input" type="text" name="name" autocomplete="name" required />
          </label>
          <label class="form-field">
            <span class="form-label">${h.form.email}</span>
            <input class="contact-input" type="email" name="email" autocomplete="email" required />
          </label>
        </div>

        <label class="form-field">
          <span class="form-label">${h.form.subject}</span>
          <input class="contact-input" type="text" name="subject" required />
        </label>

        <label class="form-field">
          <span class="form-label">${h.form.message}</span>
          <textarea class="contact-input contact-textarea" name="message" rows="6" required></textarea>
        </label>

        <div class="contact-captcha">
          <div id="turnstile-container"></div>
        </div>

        <div class="contact-form-actions">
          <button
            type="submit"
            class="btn btn-primary"
            data-text-default="${h.form.submitDefault}"
            data-text-success="${h.form.submitSuccess}"
            data-text-error="${h.form.submitError}"
            data-text-captcha="${h.form.submitCaptcha}"
          >${h.form.submitDefault}</button>
        </div>
        <div class="contact-form-status" aria-live="polite"></div>
      </form>
    </div>
  </section>
`;

  return page({
    locale,
    site,
    title: h.title,
    description: h.description,
    canonicalPath: locale === 'en' ? '/' : '/zh/',
    alternatePath: localePath(otherLocale, '/'),
    ogImage: '/assets/images/profile.webp',
    nav: navbarMain(locale, site, { langToggle: langToggleFor(s, localePath(otherLocale, '/')) }),
    extraHead: '  <script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" defer></script>',
    body,
  });
}

function aboutPage(locale, site) {
  const s = site[locale];
  const a = s.about;
  const otherLocale = locale === 'en' ? 'zh' : 'en';

  const body = `
  <!-- ===== Page Hero ===== -->
  <div class="page-hero">
    <div class="container">
      <div class="page-eyebrow">${a.pageEyebrow}</div>
      <h1 class="page-title">${a.pageTitle}</h1>
    </div>
  </div>

  <!-- ===== Bio ===== -->
  <section class="section">
    <div class="container">
      <div class="about-card reveal-target">
        <div class="avatar"><img src="/assets/images/profile.webp" alt="${s.footer.name}" width="800" height="1176" loading="lazy" class="avatar-img"></div>
        <div class="about-text">
          ${paragraphs(a.bio)}
          <a href="${localePath(locale, '/#contact')}" class="btn btn-primary btn-sm">${a.getInTouch}</a>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== Education ===== -->
  <section class="section section-alt">
    <div class="container">
      <div class="section-header reveal-target">
        <div class="section-num">${a.educationEyebrow}</div>
        <h2 class="section-title">${a.educationTitle}</h2>
      </div>
      <div class="education-card reveal-target">
        <div class="edu-header">
          <div>
            <h3>${a.education.school}</h3>
            <p class="edu-location">${a.education.location}</p>
          </div>
          <div class="edu-dates">${a.education.dates}</div>
        </div>
        <p class="edu-degree">${a.education.degree}</p>
        <div class="edu-details">
          ${a.education.badges.map((b) => `<span class="edu-badge">${b}</span>`).join('\n          ')}
        </div>
        <div>
          <p class="edu-coursework-label">${a.education.courseworkLabel}</p>
          <p class="edu-coursework-list">
            ${a.education.coursework}
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== Work Experience ===== -->
  <section id="experience" class="section">
    <div class="container">
      <div class="section-header reveal-target">
        <div class="section-num">${a.experienceEyebrow}</div>
        <h2 class="section-title">${a.experienceTitle}</h2>
      </div>

${a.experiences.map(experienceCard).join('\n\n')}
    </div>
  </section>

  <!-- ===== Leadership ===== -->
  <section class="section section-alt">
    <div class="container">
      <div class="section-header reveal-target">
        <div class="section-num">${a.leadershipEyebrow}</div>
        <h2 class="section-title">${a.leadershipTitle}</h2>
      </div>

${experienceCard(a.leadership)}
    </div>
  </section>
`;

  return page({
    locale,
    site,
    title: a.title,
    description: a.description,
    canonicalPath: locale === 'en' ? '/about/' : '/zh/about/',
    alternatePath: localePath(otherLocale, '/about/'),
    ogImage: '/assets/images/profile.webp',
    nav: navbarDefault(locale, site, { current: 'about', exact: true, langToggle: langToggleFor(s, localePath(otherLocale, '/about/')) }),
    body,
  });
}

function projectsListPage(locale, site, projects) {
  const s = site[locale];
  const pp = s.projectsPage;
  const otherLocale = locale === 'en' ? 'zh' : 'en';
  const cards = projects
    .filter((p) => p[locale].listing)
    .map((p) => projectCard(p, locale, 'listing', s.ui))
    .join('\n\n');

  const body = `
  <!-- ===== Page Hero ===== -->
  <div class="page-hero">
    <div class="container">
      <div class="page-eyebrow">${pp.pageEyebrow}</div>
      <h1 class="page-title">${pp.pageTitle}</h1>
    </div>
  </div>

  <!-- ===== Projects Grid ===== -->
  <section class="section">
    <div class="container">
      <div class="feat-grid">

${cards}

      </div>
    </div>
  </section>
`;

  return page({
    locale,
    site,
    title: pp.title,
    description: pp.description,
    canonicalPath: locale === 'en' ? '/projects/' : '/zh/projects/',
    alternatePath: localePath(otherLocale, '/projects/'),
    ogImage: '/assets/images/chromatic/ingame1.webp',
    nav: navbarDefault(locale, site, { current: 'projects', exact: true, langToggle: langToggleFor(s, localePath(otherLocale, '/projects/')) }),
    body,
  });
}

function detailPage(project, locale, site) {
  const s = site[locale];
  const p = project[locale];
  const d = p.detail;
  const otherLocale = locale === 'en' ? 'zh' : 'en';
  const ui = s.ui;
  const contributionsHeading = d.contributionsHeading || ui.contributions;

  const overviewImgAttrs = `width="${d.overviewImage.width}" height="${d.overviewImage.height}"`;
  const overviewThumb = d.overviewImage.overlay
    ? `<img src="${d.overviewImage.src}" alt="${d.overviewImage.alt}" ${overviewImgAttrs} class="thumb-img">
          <div class="thumb-overlay">
            <span class="thumb-label">${p.thumbLabel}</span>
          </div>`
    : `<img src="${d.overviewImage.src}" alt="${d.overviewImage.alt}" ${overviewImgAttrs} class="thumb-img">`;

  const gallerySlides = d.gallery
    .map((g) => `          <div class="gallery-slide">
            <img src="${g.src}" alt="${g.alt}" width="${g.width}" height="${g.height}" loading="lazy">
          </div>`)
    .join('\n');
  const galleryDots = d.gallery
    .map((_, i) => `            <button type="button" class="gallery-dot${i === 0 ? ' active' : ''}" aria-label="${ui.dotAria.replace('{n}', i + 1)}"${i === 0 ? ' aria-current="true"' : ''}></button>`)
    .join('\n');
  const hasMultipleShots = d.gallery.length > 1;
  const galleryNav = hasMultipleShots
    ? `        <div class="gallery-nav">
          <button type="button" class="gallery-btn" data-dir="-1" aria-label="${ui.prevAria}">${ui.prev}</button>
          <button type="button" class="gallery-btn" data-dir="1" aria-label="${ui.nextAria}">${ui.next}</button>
        </div>
`
    : '';
  const galleryDotsBlock = hasMultipleShots
    ? `          <div class="gallery-dots">
${galleryDots}
          </div>
`
    : '';

  const body = `
${backBar(site, locale, localePath(locale, '/projects/'), s.menu.projects)}
  <!-- ===== Page Hero ===== -->
  <div class="page-hero">
    <div class="container">
      <div class="page-eyebrow">${d.pageEyebrow}</div>
      <h1 class="page-title">${p.title}</h1>
    </div>
  </div>

  <!-- ===== Detail Content ===== -->
  <section class="section">
    <div class="container">

      <!-- Overview -->
      <div class="game-overview reveal-target">
        <div class="game-overview-thumb">
          ${overviewThumb}
        </div>
        <div class="game-info">
          <h2>${ui.overview}</h2>
          <p>
            ${d.overview}
          </p>
          <p>
            <strong>${ui.role}</strong> ${p.role} &nbsp;&middot;&nbsp;
            <strong>${ui.period}</strong> ${p.period}
          </p>
          <div class="project-tags">
            ${tagList(d.tags)}
          </div>
          <div class="game-links">
            ${detailLinksHtml(ui, project.externalLinks)}
            <a href="${localePath(locale, '/projects/')}" class="btn btn-outline">${ui.allProjects}</a>
          </div>
        </div>
      </div>

      <!-- Screenshots -->
      <div class="screenshot-gallery reveal-target">
        <div class="gallery-slides">
${gallerySlides}
        </div>
${galleryNav}        <div class="gallery-footer">
${galleryDotsBlock}          <div class="gallery-caption">${ui.screenshots}</div>
        </div>
      </div>

      <!-- Contributions -->
      <div class="game-section reveal-target">
        <h2>${contributionsHeading}</h2>
        <ul>
          ${d.contributions.map((c) => `<li>${c}</li>`).join('\n          ')}
        </ul>
      </div>

      <!-- Technical Details -->
      <div class="game-section reveal-target">
        <h2>${ui.techStack}</h2>
        <div class="project-tags">
          ${tagList(d.techTags)}
        </div>
      </div>

    </div>
  </section>
`;

  return page({
    locale,
    site,
    title: p.name || p.title,
    description: p.seo,
    canonicalPath: localePath(locale, `/projects/${project.slug}/`),
    alternatePath: localePath(otherLocale, `/projects/${project.slug}/`),
    ogImage: project.cardImage ? project.cardImage.src : '/assets/images/profile.webp',
    nav: navbarDefault(locale, site, { current: 'projects', langToggle: langToggleFor(s, localePath(otherLocale, `/projects/${project.slug}/`)) }),
    body,
  });
}

// GitHub Pages serves this one file for every missing URL, in either language.
function notFoundPage(site, catSvg) {
  const nf = site.en.notFound;
  const body = `
  <main class="notfound-wrap">
    <div class="notfound-inner">

      <div class="notfound-text">
        <p class="notfound-code">${nf.code}</p>
        <h1 class="notfound-title">${nf.heading}</h1>
        <p class="notfound-sub">${nf.sub}</p>
        <div class="notfound-actions">
          <a href="/" class="btn btn-outline">${nf.home}</a>
        </div>
      </div>

      <figure class="notfound-art">
${catSvg.trimEnd()}
        <figcaption class="notfound-caption">${nf.caption}</figcaption>
      </figure>

    </div>
  </main>
`;

  return page({
    locale: 'en',
    site,
    title: nf.title,
    headHtml: `  <meta name="robots" content="noindex" />
  <link rel="icon" type="image/webp" href="${FAVICON}" />`,
    nav: navbarDefault('en', site, { langToggle: nf.langToggle }),
    body,
  });
}

// The /extras/ listing in `locale`, or the language it exists in.
function extrasHref(extras, locale) {
  return localePath(linkLocaleFor(extras.index.bodies, locale) || 'en', '/extras/');
}

// The way back from an item: up to the /extras/ listing.
function extrasBackBar(extras, locale, site) {
  return backBar(site, locale, extrasHref(extras, locale), extras.label[locale]);
}

// Shared chrome for every page under /extras/. Headers carry the bare name
// (`title: Uses`), which lists show as-is; page() adds the site's name.
function extrasPage({ locale, site, extras, slugPath, meta, bodies, current, exact, body }) {
  const otherLocale = locale === 'en' ? 'zh' : 'en';
  const hasTwin = otherLocale in bodies;
  const alternatePath = localePath(otherLocale, hasTwin ? slugPath : '/');
  const indexMeta = extras.index.metaByLocale[locale] || extras.index.meta;
  return page({
    locale,
    site,
    title: meta.title,
    description: meta.description || meta.summary || indexMeta.description,
    canonicalPath: localePath(locale, slugPath),
    alternatePath,
    ogImage: meta.ogImage || indexMeta.ogImage || FAVICON,
    monolingual: !hasTwin,
    nav: navbarDefault(locale, site, {
      current,
      exact,
      langToggle: hasTwin ? langToggleFor(site[locale], alternatePath) : null,
    }),
    body,
  });
}

// /extras/: content/index.html's own writing, then everything under content/,
// newest first. Entries show their date; pages show only what they are.
function extrasIndexPage(extras, locale, site) {
  const indexMeta = extras.index.metaByLocale[locale];
  const intro = extras.index.bodies[locale];

  const rows = extrasItems(locale, extras)
    .map((item) => {
      const summary = item.summary ? `\n            <p class="entry-summary">${item.summary}</p>` : '';
      return `          <a class="entry-row reveal-target" href="${item.href}">
            <span class="entry-date">${item.kind}${item.date ? ` &middot; ${item.date}` : ''}</span>
            <h3 class="entry-title">${item.title}</h3>${summary}
          </a>`;
    })
    .join('\n');

  const list = rows
    ? `        <div class="entry-list">\n${rows}\n        </div>`
    : `        <p class="contact-intro">${site[locale].ui.collectionEmpty}</p>`;

  return extrasPage({
    locale,
    site,
    extras,
    slugPath: '/extras/',
    meta: indexMeta,
    bodies: extras.index.bodies,
    current: 'extras',
    exact: true,
    body: `
  <div class="page-hero">
    <div class="container">
      <div class="page-eyebrow">${indexMeta.eyebrow || '// Extras'}</div>
      <h1 class="page-title">${indexMeta.heading || extras.label[locale]}</h1>
    </div>
  </div>

  <section class="section">
    <div class="container">
${intro ? `      <div class="entry-intro reveal-target">\n${intro}\n      </div>\n\n` : ''}${list}
    </div>
  </section>
`,
  });
}

// Any item under content/<folder>/: back link, a hero naming the folder
// (Thoughts, Ideas…) with the title and, unless the folder hides it, the date
// under it — then the body as an article. `width: wide` lifts the prose width
// limit for cards and columns. With its own `nav:` the item is its own menu
// entry; otherwise it sits under Extras, which stays clickable as the way up.
function extrasItemPage(extras, item, locale, site) {
  const meta = item.metaByLocale[locale];
  const back = meta.back !== 'false' ? extrasBackBar(extras, locale, site) : '';
  const date = item.showDate
    ? `\n      <time class="page-date" datetime="${meta.date}">${meta.date}</time>`
    : '';
  const bodyClass = meta.width === 'wide' ? 'entry-body entry-body-wide' : 'entry-body';
  return extrasPage({
    locale,
    site,
    extras,
    slugPath: `/extras/${item.slug}/`,
    meta,
    bodies: item.bodies,
    current: item.navLabel ? `extras/${item.slug}` : 'extras',
    exact: Boolean(item.navLabel),
    body: `${back}
  <div class="page-hero">
    <div class="container">
      <div class="page-eyebrow">${item.kind[locale]}</div>
      <h1 class="page-title">${meta.title}</h1>${date}
    </div>
  </div>

  <section class="section">
    <div class="container">
      <article class="${bodyClass} reveal-target">
${item.bodies[locale]}
      </article>
    </div>
  </section>
`,
  });
}

module.exports = {
  setNavPages,
  setHasArchive,
  extrasIndexPage,
  extrasItemPage,
  homePage,
  aboutPage,
  projectsListPage,
  detailPage,
  notFoundPage,
};
