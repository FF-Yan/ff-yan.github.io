const { BASE_URL, FAVICON } = require('./data/site');

const EXT_LABEL = {
  github: { en: '⟶ View on GitHub', zh: '⟶ 在 GitHub 上查看' },
  itch: { en: '▶ Play on itch.io', zh: '▶ 在 itch.io 游玩' },
};

function localePath(locale, path) {
  // path starts with "/", e.g. "/projects/chromatic" or "/"
  if (locale === 'en') return path;
  return path === '/' ? '/zh/' : `/zh${path}`;
}

function tagList(tags) {
  return tags.map((t) => `<span class="tag">${t}</span>`).join('\n              ');
}

function head({ locale, title, description, canonicalPath, alternatePath, ogImage }) {
  const url = `${BASE_URL}${canonicalPath}`;
  const altUrl = `${BASE_URL}${alternatePath}`;
  const image = `${BASE_URL}${ogImage}`;
  const altLocale = locale === 'en' ? 'zh_CN' : 'en_US';
  const ogLocale = locale === 'en' ? 'en_US' : 'zh_CN';
  const enUrl = locale === 'en' ? url : altUrl;
  const zhUrl = locale === 'en' ? altUrl : url;
  return `  <meta name="description" content="${description}" />
  <link rel="canonical" href="${url}" />
  <link rel="alternate" hreflang="en" href="${enUrl}" />
  <link rel="alternate" hreflang="zh-CN" href="${zhUrl}" />
  <link rel="alternate" hreflang="x-default" href="${enUrl}" />
  <link rel="icon" type="image/webp" href="${FAVICON}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:locale" content="${ogLocale}" />
  <meta property="og:locale:alternate" content="${altLocale}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />`;
}

// Card links: plain text links, in data order.
function externalLinksHtml(locale, links) {
  return links
    .map((ext) => `<a href="${ext.url}" class="project-link-ext" target="_blank" rel="noopener noreferrer">${EXT_LABEL[ext.type][locale]}</a>`)
    .join('\n              ');
}

// Detail page: the first link is the call to action, the rest are secondary.
function detailLinksHtml(locale, links) {
  return links
    .map((ext, i) => `<a href="${ext.url}" class="btn ${i === 0 ? 'btn-primary' : 'btn-outline'}" target="_blank" rel="noopener noreferrer">${EXT_LABEL[ext.type][locale]}</a>`)
    .join('\n            ');
}

// Renders a home ("featured") or listing project card. `view` is 'home' or 'listing'.
function projectCard(project, locale, view, { detailsLabel }) {
  const p = project[locale];
  const v = p[view];
  const detailHref = localePath(locale, `/projects/${project.slug}/`);
  const detailsBtn = p.detail
    ? `<a href="${detailHref}" class="btn-pixel">${detailsLabel}</a>\n              `
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
          <div class="project-thumb ${project.thumbClass}">
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
              ${detailsBtn}${externalLinksHtml(locale, project.externalLinks)}
            </div>
          </div>
        </div>`;
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

function navbarInner(locale, site, { menuLinks }) {
  const s = site[locale];
  const homeHref = localePath(locale, '/');
  return `<header class="navbar">
  <div class="nav-inner">
    <a href="${homeHref}" class="nav-logo">${s.logo.first}${s.logo.separator}<span>${s.logo.last}</span></a>
    <div class="nav-right">
      <button class="lang-toggle" data-lang-href="${localePath(locale === 'en' ? 'zh' : 'en', '/')}" aria-label="${s.langToggle.aria}">${s.langToggle.label}</button>
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
</div>
`;
}

function navbarDefault(locale, site) {
  const s = site[locale];
  const links = [
    [localePath(locale, '/'), '01', s.menu.home],
    [localePath(locale, '/projects/'), '02', s.menu.projects],
    [localePath(locale, '/about/'), '03', s.menu.about],
  ]
    .map(([href, num, label]) => `      <a href="${href}"><span class="menu-num">${num}</span> ${label}</a>`)
    .join('\n');
  return navbarInner(locale, site, { menuLinks: links });
}

function navbarMain(locale, site) {
  const s = site[locale];
  const links = [
    ['#hero', '01', s.menu.home],
    ['#featured', '02', s.menu.projects],
    ['#about', '03', s.menu.about],
    ['#skills', '04', s.menu.skills],
    ['#contact', '05', s.menu.contact],
  ]
    .map(([href, num, label]) => `      <a href="${href}"><span class="menu-num">${num}</span> ${label}</a>`)
    .join('\n');
  return navbarInner(locale, site, { menuLinks: links });
}

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
    <p class="footer-copy">&copy; <span id="year"></span> ${s.footer.name} &mdash; ${s.footer.copy}</p>
  </div>
</footer>
`;
}

function page({ locale, htmlLang, title, description, canonicalPath, alternatePath, ogImage, bodyAttrs, extraHead, body }) {
  return `<!DOCTYPE html>
<html lang="${htmlLang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
${head({ locale, title, description, canonicalPath, alternatePath, ogImage })}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Silkscreen:wght@400;700&family=Space+Grotesk:wght@500;600;700&display=swap" />
  <link rel="stylesheet" href="/style.css" />${extraHead ? `\n${extraHead}` : ''}
</head>
<body${bodyAttrs ? ` ${bodyAttrs}` : ''}>

  <div id="navbar"></div>
${body}
  <div id="footer"></div>

  <script src="/script.js"></script>
</body>
</html>
`;
}

function homePage(locale, site, projects, homeFeaturedSlugs) {
  const s = site[locale];
  const h = s.home;
  const otherLocale = locale === 'en' ? 'zh' : 'en';
  const cards = homeFeaturedSlugs
    .map((slug) => projects.find((p) => p.slug === slug))
    .map((p) => projectCard(p, locale, 'home', { detailsLabel: locale === 'en' ? 'Details →' : '深入了解 →' }))
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

  <!-- ===== About ===== -->
  <section id="about" class="section">
    <div class="container">
      <div class="section-header reveal-target">
        <div class="section-num">${h.aboutEyebrow}</div>
        <h2 class="section-title">${h.aboutTitle}</h2>
      </div>

      <div class="about-card reveal-target">
        <div class="avatar"><img src="/assets/images/profile.webp" alt="${s.footer.name}" width="800" height="1176" loading="lazy" class="avatar-img"></div>
        <div class="about-text">
          <p>
            ${h.aboutText[0]}
          </p>
          <p>
            ${h.aboutText[1]}
          </p>
          <p>
            ${h.aboutText[2]}
          </p>
          <a href="${localePath(locale, '/about/')}" class="btn btn-outline btn-sm">${h.fullProfile}</a>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== Skills ===== -->
  <section id="skills" class="section section-alt">
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
    htmlLang: s.htmlLang,
    title: h.title,
    description: h.description,
    canonicalPath: locale === 'en' ? '/' : '/zh/',
    alternatePath: otherLocale === 'en' ? '/' : '/zh/',
    ogImage: '/assets/images/profile.webp',
    bodyAttrs: `data-nav-variant="main" data-lang-href="${localePath(otherLocale, '/')}"`,
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
          <p>
            ${a.bio[0]}
          </p>
          <p>
            ${a.bio[1]}
          </p>
          <p>
            ${a.bio[2]}
          </p>
          <a href="mailto:${s.email}" class="btn btn-primary btn-sm">${a.getInTouch}</a>
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
  <section class="section">
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
    htmlLang: s.htmlLang,
    title: a.title,
    description: a.description,
    canonicalPath: locale === 'en' ? '/about/' : '/zh/about/',
    alternatePath: otherLocale === 'en' ? '/about/' : '/zh/about/',
    ogImage: '/assets/images/profile.webp',
    bodyAttrs: `data-lang-href="${localePath(otherLocale, '/about/')}"`,
    body,
  });
}

function projectsListPage(locale, site, projects) {
  const s = site[locale];
  const pp = s.projectsPage;
  const otherLocale = locale === 'en' ? 'zh' : 'en';
  const cards = projects
    .filter((p) => p[locale].listing)
    .map((p) => projectCard(p, locale, 'listing', { detailsLabel: locale === 'en' ? 'Details →' : '深入了解 →' }))
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
    htmlLang: s.htmlLang,
    title: pp.title,
    description: pp.description,
    canonicalPath: locale === 'en' ? '/projects/' : '/zh/projects/',
    alternatePath: otherLocale === 'en' ? '/projects/' : '/zh/projects/',
    ogImage: '/assets/images/chromatic/ingame1.webp',
    bodyAttrs: `data-lang-href="${localePath(otherLocale, '/projects/')}"`,
    body,
  });
}

function detailPage(project, locale, site) {
  const s = site[locale];
  const p = project[locale];
  const d = p.detail;
  const otherLocale = locale === 'en' ? 'zh' : 'en';
  const backLabel = locale === 'en' ? '← Back to Projects' : '← 返回项目列表';
  const allProjectsLabel = locale === 'en' ? '← All Projects' : '← 全部项目';
  const roleLabel = locale === 'en' ? 'Role:' : '角色：';
  const periodLabel = locale === 'en' ? 'Period:' : '周期：';
  const contributionsHeading = locale === 'en' ? '// My Contributions' : (project.slug === 'chromatic' || project.slug === 'boston-tea-party' ? '// 我的职责' : '// 我的贡献');
  const techStackHeading = locale === 'en' ? '// Technical Stack' : '// 技术栈';
  const overviewHeading = locale === 'en' ? 'Overview' : '项目概述';
  const screenshotsCaption = locale === 'en' ? '// Screenshots' : '// 游戏截图';
  const prevLabel = locale === 'en' ? '◀ PREV' : '◀ 上一张';
  const nextLabel = locale === 'en' ? 'NEXT ▶' : '下一张 ▶';

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
    .map((_, i) => `            <div class="gallery-dot${i === 0 ? ' active' : ''}" data-idx="${i}"></div>`)
    .join('\n');
  const hasMultipleShots = d.gallery.length > 1;
  const galleryNav = hasMultipleShots
    ? `        <div class="gallery-nav">
          <button class="gallery-btn" data-dir="-1">${prevLabel}</button>
          <button class="gallery-btn" data-dir="1">${nextLabel}</button>
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

      <div class="game-back reveal-target">
        <a href="${localePath(locale, '/projects/')}">${backLabel}</a>
      </div>

      <!-- Overview -->
      <div class="game-overview reveal-target">
        <div class="game-overview-thumb ${project.thumbClass}">
          ${overviewThumb}
        </div>
        <div class="game-info">
          <h2>${overviewHeading}</h2>
          <p>
            ${d.overview}
          </p>
          <p>
            <strong>${roleLabel}</strong> ${p.role} &nbsp;&middot;&nbsp;
            <strong>${periodLabel}</strong> ${p.period}
          </p>
          <div class="project-tags" style="margin-bottom:0.5rem;">
            ${tagList(d.tags)}
          </div>
          <div class="game-links">
            ${detailLinksHtml(locale, project.externalLinks)}
            <a href="${localePath(locale, '/projects/')}" class="btn btn-outline">${allProjectsLabel}</a>
          </div>
        </div>
      </div>

      <!-- Screenshots -->
      <div class="screenshot-gallery reveal-target">
        <div class="gallery-slides">
${gallerySlides}
        </div>
${galleryNav}        <div class="gallery-footer">
${galleryDotsBlock}          <div class="gallery-caption">${screenshotsCaption}</div>
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
        <h2>${techStackHeading}</h2>
        <div class="project-tags">
          ${tagList(d.techTags)}
        </div>
      </div>

    </div>
  </section>
`;

  return page({
    locale,
    htmlLang: s.htmlLang,
    title: `${p.name || p.title} | ${locale === 'en' ? site.en.footer.name : site.zh.footer.name}`,
    description: p.seo,
    canonicalPath: localePath(locale, `/projects/${project.slug}/`),
    alternatePath: localePath(otherLocale, `/projects/${project.slug}/`),
    ogImage: project.cardImage ? project.cardImage.src : '/assets/images/profile.webp',
    bodyAttrs: `data-lang-href="${localePath(otherLocale, `/projects/${project.slug}/`)}"`,
    body,
  });
}

module.exports = {
  navbarDefault,
  navbarMain,
  footerHtml,
  homePage,
  aboutPage,
  projectsListPage,
  detailPage,
};
