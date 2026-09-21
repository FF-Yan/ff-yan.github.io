// Generates every bilingual static page from build/data/*.js.
// Usage: node build/build.js   (or: npm run build)
//
// This does NOT touch style.css, script.js, 404.html, projects.html
// (the /projects redirect shim), or anything under assets/ — only the
// pages/partials that used to be hand-duplicated between / and /zh/.

const fs = require('fs');
const path = require('path');

const { site, BASE_URL } = require('./data/site');
const { projects, homeFeaturedSlugs } = require('./data/projects');
const templates = require('./templates');

const ROOT = path.join(__dirname, '..');

function write(relPath, content) {
  const abs = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, 'utf8');
  console.log('wrote', relPath);
}

function localeDir(locale, sub = '') {
  return locale === 'en' ? sub : path.posix.join('zh', sub);
}

// ---- Pages ----
for (const locale of ['en', 'zh']) {
  write(path.posix.join(localeDir(locale), 'index.html'), templates.homePage(locale, site, projects, homeFeaturedSlugs));
  write(path.posix.join(localeDir(locale, 'about'), 'index.html'), templates.aboutPage(locale, site));
  write(path.posix.join(localeDir(locale, 'projects'), 'index.html'), templates.projectsListPage(locale, site, projects));

  for (const project of projects) {
    if (!project[locale].detail) continue;
    write(
      path.posix.join(localeDir(locale, `projects/${project.slug}`), 'index.html'),
      templates.detailPage(project, locale, site)
    );
  }
}

// ---- Shared nav/footer partials (still fetched at runtime by script.js) ----
write('components/navbar.html', templates.navbarDefault('en', site));
write('components/navbar-main.html', templates.navbarMain('en', site));
write('components/footer.html', templates.footerHtml('en', site));
write('components/zh/navbar.html', templates.navbarDefault('zh', site));
write('components/zh/navbar-main.html', templates.navbarMain('zh', site));
write('components/zh/footer.html', templates.footerHtml('zh', site));

// ---- sitemap.xml (kept in sync with the same project slugs) ----
const staticUrls = ['/', '/about/', '/projects/', '/zh/', '/zh/about/', '/zh/projects/'];
const projectUrls = projects
  .filter((p) => p.en.detail)
  .flatMap((p) => [`/projects/${p.slug}/`, `/zh/projects/${p.slug}/`]);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...projectUrls].map((u) => `  <url>\n    <loc>${BASE_URL}${u}</loc>\n  </url>`).join('\n')}
</urlset>
`;
write('sitemap.xml', sitemap);

console.log('\nDone.');
