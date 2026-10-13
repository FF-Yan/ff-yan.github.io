// Generates every bilingual static page from build/data/*.js.
// Usage: node build/build.js   (or: npm run build)
//
// The navbar and footer are rendered straight into every page. This does NOT
// touch style.css, script.js, projects.html (the /projects redirect shim), or
// anything under assets/.

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

// ---- 404 (single English page; the pixel cat lives in its own partial) ----
const catSvg = fs.readFileSync(path.join(__dirname, 'partials/pixel-cat.svg'), 'utf8');
write('404.html', templates.notFoundPage(site, catSvg));

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
