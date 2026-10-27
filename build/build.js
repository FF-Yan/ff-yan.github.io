// Generates every bilingual static page from build/data/*.js.
// Usage: node build/build.js   (or: npm run build)
//
// The navbar and footer are rendered straight into every page. This does NOT
// touch style.css, script.js, projects.html (the /projects redirect shim), or
// anything under assets/.

const fs = require('fs');
const path = require('path');

let marked;
try {
  ({ marked } = require('marked'));
} catch {
  throw new Error('build needs the "marked" package for content/*.md — run `npm install` once, then build again');
}

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

// ---- content/: everything here is published under /extras/ ----
//
//   content/index.html           -> /extras/            (the listing page)
//   content/pages/uses.html      -> /extras/uses/
//   content/thoughts/a.md        -> /extras/a/
//   any of the above as .zh.*    -> the /zh/ twin
//
// Any fragment may be .html or .md: same comment header, and a .md body is
// Markdown, converted to HTML at build time (raw HTML inside it still passes
// through). A name may exist as .md or .html, not both. README.md is
// documentation, never content.
//
// Every slug shares /extras/, so a slug may appear only once across content/.
// Folders are not special by name — they differ only by their _folder.html.
// Every fragment opens with an HTML comment header:
//
//   <!-- title: Thoughts
//        date: 2026-10-21 -->
//
// content/index.html — title, description (required); label / labelZh name the
//   section (menu, buttons, back links; default "Extras"); eyebrow and heading
//   (default: label) for the hero; order places it in the menu, which it joins
//   on its own once content/ holds an item. Its body is the listing's intro.
// content/<folder>/<slug> — an item: title, date (required). The build adds
//   the hero (folder label, title, date) and the back link; the body is the
//   article. Optional: summary (the line in lists, defaults to description),
//   description (meta, defaults to summary), nav / navZh / order (its own menu
//   entry), ogImage, `back: false` (no back link), `width: wide` (no prose
//   width limit, for cards and columns).
// content/<folder>/_folder — optional, builds no page: label / labelZh name the
//   folder on its hero and cards (default: the folder name); `date: hidden`
//   keeps its items' dates out of sight (they still sort).
const CONTENT_DIR = path.join(__dirname, '..', 'content');
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
// The underscore keeps it from ever colliding with a slug.
const FOLDER_FILE = '_folder';

// Header values are plain text the author typed, but they land in attributes
// (<meta content="...">) and in text nodes, so they are escaped once here.
// Only the headers — a fragment's body is HTML (or Markdown) on purpose. Strings in
// build/data/*.js are deliberately left alone: they already carry entities
// like &amp;, and escaping them again would print them literally.
function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parseMeta(source, label, required) {
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

// Reads every .html / .md in `dir` and groups locale twins: { name: { en, zh } },
// each side { meta, body, file }, body already HTML. `required(name)` picks the
// header keys to enforce.
function readFragments(dir, labelPrefix, required) {
  const byName = new Map();
  for (const file of fs.readdirSync(dir).sort()) {
    const ext = path.extname(file);
    if ((ext !== '.html' && ext !== '.md') || /^readme\.md$/i.test(file)) continue;
    const base = file.slice(0, -ext.length);
    const isZh = base.endsWith('.zh');
    const name = isZh ? base.slice(0, -'.zh'.length) : base;
    const label = `${labelPrefix}${file}`;
    if (name !== FOLDER_FILE && !SLUG_RE.test(name)) {
      throw new Error(`${label}: "${name}" must be lowercase words joined by hyphens`);
    }
    const parsed = parseMeta(fs.readFileSync(path.join(dir, file), 'utf8'), label, required(name));
    if (ext === '.md') parsed.body = marked.parse(parsed.body).trim();
    parsed.file = file;
    const locale = isZh ? 'zh' : 'en';
    const twins = byName.get(name) || {};
    if (twins[locale]) {
      throw new Error(`${label}: ${labelPrefix}${twins[locale].file} is the same page — keep one of the two`);
    }
    twins[locale] = parsed;
    byName.set(name, twins);
  }
  return byName;
}

// One listed item, page or entry. The English header is the source of truth
// for sorting and the menu; a Chinese-only item falls back to its own.
function toItem(slug, twins, extra) {
  const metaByLocale = {};
  const bodies = {};
  for (const locale of ['en', 'zh']) {
    if (!twins[locale]) continue;
    metaByLocale[locale] = twins[locale].meta;
    bodies[locale] = twins[locale].body;
  }
  return { slug, metaByLocale, bodies, meta: metaByLocale.en || metaByLocale.zh, ...extra };
}

// A display name per locale from `label` / `labelZh`, the same rule for
// content/index.html and every _folder.html. A locale's own file wins;
// otherwise labelZh covers an English-only one.
function labelFor(twins, fallback) {
  const primary = (twins.en || twins.zh || { meta: {} }).meta;
  return {
    en: (twins.en && twins.en.meta.label) || primary.label || fallback,
    zh: (twins.zh && twins.zh.meta.label) || primary.labelZh || primary.label || fallback,
  };
}

function readExtras() {
  if (!fs.existsSync(CONTENT_DIR)) return null;

  const items = [];
  let index = null;
  let label = null;

  for (const [name, twins] of readFragments(CONTENT_DIR, 'content/', () => ['title', 'description'])) {
    if (name !== 'index') {
      throw new Error(`content/${name}.html: only index.html sits directly in content/ — put pages in content/pages/`);
    }
    index = toItem('extras', twins);
    label = labelFor(twins, 'Extras');
  }

  const dirs = fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  for (const folder of dirs) {
    if (!SLUG_RE.test(folder)) {
      throw new Error(`content/${folder}/: folder name must be lowercase words joined by hyphens`);
    }
    const required = (name) =>
      // A stray index.html gets the rename hint below, not a missing-key error.
      name === FOLDER_FILE || name === 'index' ? [] : ['title', 'date'];
    const fragments = readFragments(path.join(CONTENT_DIR, folder), `content/${folder}/`, required);

    if (fragments.has('index')) {
      throw new Error(
        `content/${folder}/index.html: a folder has no page of its own — the listing is content/index.html, ` +
          `and the folder's label goes in content/${folder}/${FOLDER_FILE}.html`
      );
    }
    const settings = fragments.get(FOLDER_FILE) || {};
    const kind = labelFor(settings, folder);
    const showDate = (settings.en || settings.zh || { meta: {} }).meta.date !== 'hidden';
    fragments.delete(FOLDER_FILE);

    for (const [slug, twins] of fragments) {
      const item = toItem(slug, twins, { folder, kind, showDate });
      const nav = item.meta.nav;
      item.order = Number(item.meta.order) || 40;
      item.navLabel = nav
        ? { en: nav, zh: (item.metaByLocale.zh && item.metaByLocale.zh.nav) || item.meta.navZh || nav }
        : null;
      items.push(item);
    }
  }

  const seen = new Map();
  for (const item of items) {
    if (seen.has(item.slug)) {
      throw new Error(`"${item.slug}" is in both content/${seen.get(item.slug)}/ and content/${item.folder}/ — every slug shares /extras/`);
    }
    seen.set(item.slug, item.folder);
  }

  if (!index) {
    if (items.length) throw new Error('content/index.html is missing (it holds the /extras/ listing page)');
    return null;
  }

  // Newest first; equal dates fall back to the slug so builds stay stable.
  items.sort((a, b) =>
    a.meta.date === b.meta.date ? a.slug.localeCompare(b.slug) : b.meta.date.localeCompare(a.meta.date)
  );

  return { slug: 'extras', index, items, label, order: Number(index.meta.order) || 50 };
}

const extras = readExtras();
const extrasItems = extras ? extras.items : [];

// Register menu entries before anything renders, so every page shows the same menu.
const localesOf = (bodies) => ({ en: 'en' in bodies, zh: 'zh' in bodies });
templates.setNavPages([
  // /extras/ joins the menu once there is something to list, not before.
  ...(extrasItems.length > 0
    ? [{ key: 'extras', path: '/extras/', order: extras.order, label: extras.label, locales: localesOf(extras.index.bodies) }]
    : []),
  ...extrasItems
    .filter((item) => item.navLabel)
    .map((item) => ({
      key: `extras/${item.slug}`,
      path: `/extras/${item.slug}/`,
      order: item.order,
      label: item.navLabel,
      locales: localesOf(item.bodies),
    })),
]);

// Untranslated items fall back to the language they exist in, so one item
// anywhere is enough for both locales to show the archive.
templates.setHasArchive(extrasItems.length > 0);

// ---- Pages ----
for (const locale of ['en', 'zh']) {
  write(path.posix.join(localeDir(locale), 'index.html'), templates.homePage(locale, site, projects, homeFeaturedSlugs, extras));
  write(path.posix.join(localeDir(locale, 'about'), 'index.html'), templates.aboutPage(locale, site));
  write(path.posix.join(localeDir(locale, 'projects'), 'index.html'), templates.projectsListPage(locale, site, projects));

  for (const project of projects) {
    if (!project[locale].detail) continue;
    write(
      path.posix.join(localeDir(locale, `projects/${project.slug}`), 'index.html'),
      templates.detailPage(project, locale, site)
    );
  }

  if (!extras) continue;
  if (locale in extras.index.bodies) {
    write(path.posix.join(localeDir(locale, 'extras'), 'index.html'), templates.extrasIndexPage(extras, locale, site));
  }
  for (const item of extras.items) {
    if (!(locale in item.bodies)) continue;
    write(
      path.posix.join(localeDir(locale, `extras/${item.slug}`), 'index.html'),
      templates.extrasItemPage(extras, item, locale, site)
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

// Same rule as the menu: an empty listing still builds (its URL keeps working)
// but is not advertised anywhere until there is something in it.
const extrasUrls = extrasItems.length
  ? ['en', 'zh'].flatMap((l) => [
      ...(l in extras.index.bodies ? [`/${localeDir(l, 'extras')}/`] : []),
      ...extras.items.filter((item) => l in item.bodies).map((item) => `/${localeDir(l, `extras/${item.slug}`)}/`),
    ])
  : [];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...projectUrls, ...extrasUrls].map((u) => `  <url>\n    <loc>${BASE_URL}${u}</loc>\n  </url>`).join('\n')}
</urlset>
`;
write('sitemap.xml', sitemap);

console.log('\nDone.');
