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

// ---- content/pages: hand-written body fragments ----
//
// Drop an HTML fragment in content/pages/ and it becomes a page. The filename
// is the route: thoughts.html -> /thoughts/, thoughts.zh.html -> /zh/thoughts/.
// A leading HTML comment carries the metadata:
//
//   <!-- title: Thoughts
//        description: Notes on game design and code.
//        nav: Thoughts
//        navZh: 随笔
//        order: 25 -->
//
// title and description are required. `nav` adds it to the menu (omit to keep
// the page unlisted); `navZh` is its Chinese label, defaulting to `nav`.
// `order` places it in the menu — built-ins sit at 10 (home), 20 (projects),
// 30 (about); content pages default to 40. `ogImage` overrides the share image.
const PAGES_DIR = path.join(__dirname, '..', 'content', 'pages');

// Header values are plain text the author typed, but they land in attributes
// (<meta content="...">) and in text nodes, so they are escaped once here.
// Only the headers — a fragment's body is HTML on purpose. Strings in
// build/data/*.js are deliberately left alone: they already carry entities
// like &amp;, and escaping them again would print them literally.
function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parseMeta(source, label, required = ['title', 'description']) {
  const match = source.match(/^\s*<!--([\s\S]*?)-->/);
  if (!match) throw new Error(`${label}: missing the leading <!-- title: ... --> comment`);
  const meta = {};
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^\s*([A-Za-z][A-Za-z0-9]*)\s*:\s*(.*?)\s*$/);
    if (kv) meta[kv[1]] = escapeHtml(kv[2]);
  }
  for (const key of required) {
    if (!meta[key]) throw new Error(`${label}: missing "${key}:" in the comment header`);
  }
  return { meta, body: source.slice(match[0].length).trim() };
}

function readContentPages() {
  if (!fs.existsSync(PAGES_DIR)) return [];

  const bySlug = new Map();
  for (const file of fs.readdirSync(PAGES_DIR).sort()) {
    if (!file.endsWith('.html')) continue;
    const base = file.slice(0, -'.html'.length);
    const isZh = base.endsWith('.zh');
    const slug = isZh ? base.slice(0, -'.zh'.length) : base;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new Error(`content/pages/${file}: slug "${slug}" must be lowercase words joined by hyphens`);
    }

    const parsed = parseMeta(fs.readFileSync(path.join(PAGES_DIR, file), 'utf8'), `content/pages/${file}`);
    const entry = bySlug.get(slug) || { slug, locales: {}, metaByLocale: {} };
    entry.locales[isZh ? 'zh' : 'en'] = parsed.body;
    entry.metaByLocale[isZh ? 'zh' : 'en'] = parsed.meta;
    bySlug.set(slug, entry);
  }

  return [...bySlug.values()].map((entry) => {
    // The English header is the source of truth for ordering and the menu key;
    // a Chinese-only page falls back to its own.
    const primary = entry.metaByLocale.en || entry.metaByLocale.zh;
    return {
      ...entry,
      meta: primary,
      order: Number(primary.order) || 40,
      navLabel: primary.nav
        ? { en: primary.nav, zh: (entry.metaByLocale.zh && entry.metaByLocale.zh.nav) || primary.navZh || primary.nav }
        : null,
    };
  });
}

const contentPages = readContentPages();

// ---- content/<name>/: collections ----
//
// Any folder under content/ other than pages/ is a collection: a folder of
// entry fragments plus an index.html that is the collection's own page.
//
//   content/thought/index.html     -> /thought/        (listing page)
//   content/thought/thought1.html  -> /thought/thought1/
//   content/thought/thought1.zh.html -> /zh/thought/thought1/
//
// index.html header: title, description (both required), plus optional
// nav / navZh / order (same as content/pages), eyebrow and heading for the
// listing's hero. Its body is the page's own writing, shown above the list.
// Entry header: title and date (both required), plus optional summary
// (shown in the listing) and description (defaults to summary).
const CONTENT_DIR = path.join(__dirname, '..', 'content');

function readCollections() {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  const dirs = fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== 'pages')
    .map((d) => d.name)
    .sort();

  return dirs.map((slug) => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new Error(`content/${slug}/: collection name must be lowercase words joined by hyphens`);
    }
    const dir = path.join(CONTENT_DIR, slug);
    const index = { meta: null, metaByLocale: {}, bodies: {} };
    const bySlug = new Map();

    for (const file of fs.readdirSync(dir).sort()) {
      if (!file.endsWith('.html')) continue;
      const base = file.slice(0, -'.html'.length);
      const isZh = base.endsWith('.zh');
      const name = isZh ? base.slice(0, -'.zh'.length) : base;
      const locale = isZh ? 'zh' : 'en';
      const label = `content/${slug}/${file}`;

      if (name === 'index') {
        const parsed = parseMeta(fs.readFileSync(path.join(dir, file), 'utf8'), label);
        index.metaByLocale[locale] = parsed.meta;
        if (locale === 'en' || !index.meta) index.meta = parsed.meta;
        index.bodies[locale] = parsed.body || null;
        continue;
      }

      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {
        throw new Error(`${label}: entry name must be lowercase words joined by hyphens`);
      }
      const parsed = parseMeta(fs.readFileSync(path.join(dir, file), 'utf8'), label, ['title', 'date']);
      const entry = bySlug.get(name) || { slug: name, bodies: {}, metaByLocale: {} };
      entry.bodies[locale] = parsed.body;
      entry.metaByLocale[locale] = parsed.meta;
      bySlug.set(name, entry);
    }

    if (!index.meta) {
      throw new Error(`content/${slug}/: missing index.html (it holds the listing page)`);
    }

    const entries = [...bySlug.values()]
      .map((entry) => ({ ...entry, meta: entry.metaByLocale.en || entry.metaByLocale.zh }))
      // Newest first; equal dates fall back to the slug so builds stay stable.
      .sort((a, b) => (a.meta.date === b.meta.date
        ? a.slug.localeCompare(b.slug)
        : b.meta.date.localeCompare(a.meta.date)));

    // The collection's display name per locale, resolved once here so nothing
    // downstream has to re-derive it. A locale's own index.html wins; otherwise
    // navZh covers a Chinese name for an English-only collection.
    const label = {};
    for (const locale of ['en', 'zh']) {
      const own = index.metaByLocale[locale];
      label[locale] =
        // a locale that has its own index file names itself
        (own && (own.nav || own.heading)) ||
        // otherwise navZh is how an English-only collection gets a Chinese name
        (locale === 'zh' ? index.meta.navZh : null) ||
        index.meta.nav ||
        index.meta.heading ||
        slug;
    }

    return {
      slug,
      index,
      entries,
      label,
      order: Number(index.meta.order) || 50,
      // `listing: false` skips the generated index page; entries then link back
      // to the homepage archive instead of a page nothing else points at.
      listing: index.meta.listing !== 'false',
    };
  });
}

const collections = readCollections();

// Register menu entries before anything renders, so every page shows the same menu.
const navFromPages = contentPages
  .filter((entry) => entry.navLabel)
  .map((entry) => ({
    slug: entry.slug,
    order: entry.order,
    label: entry.navLabel,
    locales: { en: Boolean(entry.locales.en), zh: Boolean(entry.locales.zh) },
  }));

const navFromCollections = collections
  .filter((c) => c.index.meta.nav)
  .map((c) => ({
    slug: c.slug,
    order: c.order,
    label: c.label,
    locales: {
      en: 'en' in c.index.bodies,
      zh: 'zh' in c.index.bodies,
    },
  }));

templates.setNavPages([...navFromPages, ...navFromCollections]);

// Untranslated items fall back to the language they exist in, so one item
// anywhere is enough for both locales to show the archive.
templates.setHasArchive(
  contentPages.length > 0 || collections.some((collection) => collection.entries.length > 0)
);

// ---- Pages ----
for (const locale of ['en', 'zh']) {
  write(path.posix.join(localeDir(locale), 'index.html'), templates.homePage(locale, site, projects, homeFeaturedSlugs, { pages: contentPages, collections }));
  write(path.posix.join(localeDir(locale, 'about'), 'index.html'), templates.aboutPage(locale, site));
  write(path.posix.join(localeDir(locale, 'projects'), 'index.html'), templates.projectsListPage(locale, site, projects));

  for (const project of projects) {
    if (!project[locale].detail) continue;
    write(
      path.posix.join(localeDir(locale, `projects/${project.slug}`), 'index.html'),
      templates.detailPage(project, locale, site)
    );
  }

  for (const entry of contentPages) {
    if (!entry.locales[locale]) continue;
    write(
      path.posix.join(localeDir(locale, entry.slug), 'index.html'),
      templates.contentPage(entry, locale, site)
    );
  }

  for (const collection of collections) {
    if (!(locale in collection.index.bodies)) continue;
    if (collection.listing) {
      write(
        path.posix.join(localeDir(locale, collection.slug), 'index.html'),
        templates.collectionIndexPage(collection, locale, site)
      );
    }
    for (const entry of collection.entries) {
      if (!entry.bodies[locale]) continue;
      write(
        path.posix.join(localeDir(locale, `${collection.slug}/${entry.slug}`), 'index.html'),
        templates.collectionEntryPage(collection, entry, locale, site)
      );
    }
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

const contentUrls = contentPages.flatMap((entry) =>
  ['en', 'zh'].filter((l) => entry.locales[l]).map((l) => `/${localeDir(l, entry.slug)}/`)
);

const collectionUrls = collections.flatMap((collection) =>
  ['en', 'zh']
    .filter((l) => l in collection.index.bodies)
    .flatMap((l) => [
      ...(collection.listing ? [`/${localeDir(l, collection.slug)}/`] : []),
      ...collection.entries
        .filter((e) => e.bodies[l])
        .map((e) => `/${localeDir(l, `${collection.slug}/${e.slug}`)}/`),
    ])
);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...projectUrls, ...contentUrls, ...collectionUrls].map((u) => `  <url>\n    <loc>${BASE_URL}${u}</loc>\n  </url>`).join('\n')}
</urlset>
`;
write('sitemap.xml', sitemap);

console.log('\nDone.');
