// Builds the whole site into _site/ from build/data/*.js and content/.
// Usage: node build/build.js   (or: npm run build; preview with npm run serve)
//
// _site/ is wiped and rebuilt every time, so nothing generated ever sits next
// to the sources and nothing deleted from content/ lingers. The deploy
// workflow publishes _site/ as it is. The navbar and footer are rendered
// straight into every page; the files in STATIC are copied over unchanged.

const fs = require('fs');
const path = require('path');

let marked;
try {
  ({ marked } = require('marked'));
} catch {
  throw new Error('build needs the "marked" package for Markdown in content/ — run `npm install` once, then build again');
}

const { site, BASE_URL } = require('./data/site');
const { projects, homeFeaturedSlugs } = require('./data/projects');
const templates = require('./templates');
const { finishBody, resolveLinks } = require('./prose');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, '_site');

// Published as they are. A new file meant for the live site joins this list
// (or goes in assets/); anything else at the repo root stays unpublished.
const STATIC = ['assets', 'style.css', 'script.js', 'course-copy.js', 'robots.txt', 'CNAME', 'projects.html'];

// A folder named _private, anywhere in the repo, is the author's own: git
// never commits it (see .gitignore), and the build never reads, lists or
// copies it, so the local preview matches the live site.
const PRIVATE = '_private';

// Every directory scan and copy below passes over these.
function skipped(absPath) {
  const name = path.basename(absPath);
  return name === PRIVATE || name === '.DS_Store';
}

function write(relPath, content) {
  const abs = path.join(OUT, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, 'utf8');
  console.log('wrote', relPath);
}

function copyIn(from, to) {
  fs.cpSync(from, path.join(OUT, to), {
    recursive: true,
    filter: (src) => !skipped(src),
  });
  console.log('copied', to);
}

function localeDir(locale, sub = '') {
  return locale === 'en' ? sub : path.posix.join('zh', sub);
}

// ---- content/: everything written by hand ----
//
//   content/extras/              -> /extras/    listed: menu, homepage strip, sitemap
//   content/individual/<name>    -> /<name>/    standalone and unlisted
//
// How to write pages, and what every header key does, is documented once, in
// the READMEs beside the content (content/README.md links them all). The
// comments here only explain how the build does it.
//
// Every fragment is .html or .md with the same <!-- key: value --> header. A
// .md body goes through marked, then every body through finishBody
// (build/prose.js). README.md is documentation, never content. A page or
// folder anywhere else in content/ fails the build (expectOnly) rather than
// silently building nothing.
const CONTENT_DIR = path.join(__dirname, '..', 'content');
const EXTRAS_DIR = path.join(CONTENT_DIR, 'extras');
const INDIVIDUAL_DIR = path.join(CONTENT_DIR, 'individual');
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
// The underscore keeps it from ever colliding with a slug.
const FOLDER_FILE = '_folder';

// Fails on any page (.html / .md other than a README) or folder in `dir` that
// is not in `allowed`. Other files are left alone, as everywhere in content/.
function expectOnly(dir, label, allowed, hint) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipped(path.join(dir, entry.name))) continue;
    const isPage = entry.isFile() && /\.(html|md)$/.test(entry.name) && !/^readme\.md$/i.test(entry.name);
    if ((entry.isDirectory() || isPage) && !allowed.includes(entry.name)) {
      throw new Error(`${label}${entry.name}: ${hint}`);
    }
  }
}

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
    if ((ext !== '.html' && ext !== '.md') || /^readme\.md$/i.test(file) || skipped(path.join(dir, file))) continue;
    const base = file.slice(0, -ext.length);
    const isZh = base.endsWith('.zh');
    const name = isZh ? base.slice(0, -'.zh'.length) : base;
    const label = `${labelPrefix}${file}`;
    if (name !== FOLDER_FILE && !SLUG_RE.test(name)) {
      throw new Error(`${label}: "${name}" must be lowercase words joined by hyphens`);
    }
    const parsed = parseMeta(fs.readFileSync(path.join(dir, file), 'utf8'), label, required(name));
    if (ext === '.md') parsed.body = marked.parse(parsed.body).trim();
    parsed.body = finishBody(parsed.body, parsed.meta);
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
  if (!fs.existsSync(EXTRAS_DIR)) return null;

  const items = [];
  let index = null;
  let label = null;

  for (const [name, twins] of readFragments(EXTRAS_DIR, 'content/extras/', () => ['title', 'description'])) {
    if (name !== 'index') {
      throw new Error(`content/extras/${name}.html: only index.html sits directly in content/extras/ — put pages in content/extras/pages/`);
    }
    index = toItem('extras', twins);
    label = labelFor(twins, 'Extras');
  }

  const dirs = fs
    .readdirSync(EXTRAS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !skipped(path.join(EXTRAS_DIR, d.name)))
    .map((d) => d.name)
    .sort();

  for (const folder of dirs) {
    if (!SLUG_RE.test(folder)) {
      throw new Error(`content/extras/${folder}/: folder name must be lowercase words joined by hyphens`);
    }
    const required = (name) =>
      // A stray index.html gets the rename hint below, not a missing-key error.
      name === FOLDER_FILE || name === 'index' ? [] : ['title', 'date'];
    const fragments = readFragments(path.join(EXTRAS_DIR, folder), `content/extras/${folder}/`, required);

    if (fragments.has('index')) {
      throw new Error(
        `content/extras/${folder}/index.html: a folder has no page of its own — the listing is content/extras/index.html, ` +
          `and the folder's label goes in content/extras/${folder}/${FOLDER_FILE}.html`
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
      throw new Error(`"${item.slug}" is in both content/extras/${seen.get(item.slug)}/ and content/extras/${item.folder}/ — every slug shares /extras/`);
    }
    seen.set(item.slug, item.folder);
  }

  if (!index) {
    if (items.length) throw new Error('content/extras/index.html is missing (it holds the /extras/ listing page)');
    return null;
  }

  // Newest first; equal dates fall back to the slug so builds stay stable.
  items.sort((a, b) =>
    a.meta.date === b.meta.date ? a.slug.localeCompare(b.slug) : b.meta.date.localeCompare(a.meta.date)
  );

  return { slug: 'extras', index, items, label, order: Number(index.meta.order) || 50 };
}

// ---- content/individual/: standalone pages and sections, unlisted ----
//
// Each folder is a section at /<folder>/ (readSection), each loose .md/.html a
// page at /<name>/ (readSinglePages), and courses/ a directory of sections
// (readCourses). All of it is English chrome with no .zh twins, so one URL per
// page. Pages and courses sort by `order`, then by name with numbers compared
// as numbers (week-2 before week-10).
const COURSES_DIR = path.join(INDIVIDUAL_DIR, 'courses');
const byName = new Intl.Collator('en', { numeric: true }).compare;

// Top-level names the rest of the site already builds into _site/.
const RESERVED = new Set(['about', 'projects', 'extras', 'zh', ...STATIC]);

function checkFreeName(name, where) {
  if (RESERVED.has(name)) {
    throw new Error(`${where}: /${name}/ is already part of the site — pick another name`);
  }
}

function sortKey(meta, label) {
  if (!meta.order) return Number.MAX_SAFE_INTEGER;
  const order = Number(meta.order);
  if (!Number.isFinite(order)) throw new Error(`${label}: "order:" must be a number`);
  return order;
}

const byOrderThenName = (a, b) => a.order - b.order || byName(a.slug, b.slug);

// One fragment's English side; a .zh file is refused, not silently dropped.
function englishOnly(twins, label) {
  if (twins.zh) {
    throw new Error(`${label}${twins.zh.file}: content/individual/ has one URL per page — rename it without .zh (any language is fine)`);
  }
  return twins.en;
}

// One section folder: its index, its pages in order, and the other files it
// publishes as they are. `out` is where it builds, relative to _site/;
// `where` names the folder in error messages. The fields after the spread are
// what the templates show, and callers override the ones that differ.
function readSection(dir, out, where) {
  const fragments = readFragments(dir, where, () => ['title']);

  if (fragments.has(FOLDER_FILE)) {
    throw new Error(`${where}${FOLDER_FILE}: a section has no folders of pages — give each page a "group:" instead`);
  }
  if (!fragments.has('index')) throw new Error(`${where}index.md is missing (it holds the section's own page)`);
  const home = englishOnly(fragments.get('index'), where);
  fragments.delete('index');
  const base = `/${out}/`;

  const pages = [...fragments].map(([pageSlug, twins]) => {
    const { meta, body, file } = englishOnly(twins, where);
    return { slug: pageSlug, meta, body: resolveLinks(body, base), file, order: sortKey(meta, `${where}${file}`) };
  });
  pages.sort(byOrderThenName);

  // Everything else is published as-is (images, PDFs, code, subfolders),
  // except _private/ (see skipped).
  const files = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => !skipped(path.join(dir, d.name)) && !(d.isFile() && /\.(html|md)$/.test(d.name)))
    .map((d) => d.name);

  // A page builds <out>/<slug>/, so a copied file or folder of the same name
  // would land in (or on) it. Compared without case, as macOS does.
  for (const name of files) {
    const page = pages.find((p) => p.slug === name.toLowerCase());
    if (page) {
      throw new Error(`${where}${name}: has the same name as the page ${page.file} — rename one of them`);
    }
  }

  const { meta } = home;
  return {
    dir,
    out,
    meta,
    body: resolveLinks(home.body, base),
    file: home.file,
    pages,
    files,
    name: meta.label || meta.title, // above its pages' titles, in their back links
    eyebrow: meta.eyebrow || `// ${path.basename(out)}`,
    sub: '', // the line under its title
    tabTitle: meta.title,
    course: null, // set on courses only: turns on their pages' copy buttons
    back: null, // { href, name } of the page above it
    fallbackDescription: '',
  };
}

function readCourses() {
  if (!fs.existsSync(COURSES_DIR)) return null;

  let index = null;
  for (const [name, twins] of readFragments(COURSES_DIR, 'content/individual/courses/', () => ['title', 'description'])) {
    if (name !== 'index') {
      throw new Error(`content/individual/courses/${twins.en ? twins.en.file : twins.zh.file}: only index sits directly in content/individual/courses/ — put pages in a course's folder`);
    }
    index = englishOnly(twins, 'content/individual/courses/');
  }

  const list = [];
  const dirs = fs
    .readdirSync(COURSES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !skipped(path.join(COURSES_DIR, d.name)))
    .map((d) => d.name);

  for (const slug of dirs) {
    const where = `content/individual/courses/${slug}/`;
    if (!SLUG_RE.test(slug)) throw new Error(`${where}: folder name must be lowercase words joined by hyphens`);
    const course = readSection(path.join(COURSES_DIR, slug), `courses/${slug}`, where);
    const code = course.meta.code || slug.toUpperCase();
    list.push({
      ...course,
      slug,
      name: code,
      eyebrow: code,
      sub: course.meta.term,
      tabTitle: `${code} &middot; ${course.meta.title}`,
      course: `${code}: ${course.meta.title}`,
      order: sortKey(course.meta, `${where}${course.file}`),
    });
  }

  if (!index) {
    if (list.length) throw new Error('content/individual/courses/index.md is missing (it holds the /courses/ directory page)');
    return null;
  }

  const label = index.meta.label || 'Courses';
  for (const course of list) {
    course.back = { href: '/courses/', name: label };
    course.fallbackDescription = index.meta.description;
  }
  list.sort(byOrderThenName);
  return { index, list, label };
}

// Every folder in content/individual/ other than courses/.
function readSections() {
  if (!fs.existsSync(INDIVIDUAL_DIR)) return [];
  return fs
    .readdirSync(INDIVIDUAL_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== 'courses' && !skipped(path.join(INDIVIDUAL_DIR, d.name)))
    .map((d) => d.name)
    .sort()
    .map((slug) => {
      const where = `content/individual/${slug}/`;
      if (!SLUG_RE.test(slug)) throw new Error(`${where}: folder name must be lowercase words joined by hyphens`);
      checkFreeName(slug, where);
      return readSection(path.join(INDIVIDUAL_DIR, slug), slug, where);
    });
}

// A page of its own straight in content/individual/: uses.md -> /uses/.
// title (required); eyebrow (above it, default: // <name>), summary,
// description, `width: wide`.
function readSinglePages() {
  if (!fs.existsSync(INDIVIDUAL_DIR)) return [];
  const where = 'content/individual/';
  return [...readFragments(INDIVIDUAL_DIR, where, () => ['title'])].map(([slug, twins]) => {
    const page = englishOnly(twins, where);
    if (slug === 'index' || slug === FOLDER_FILE) {
      throw new Error(`${where}${page.file}: individual/ has no page of its own — name the file after its URL, e.g. uses.md -> /uses/`);
    }
    if (fs.existsSync(path.join(INDIVIDUAL_DIR, slug))) {
      throw new Error(`${where}${page.file}: ${where}${slug}/ would build the same /${slug}/ — keep one of the two`);
    }
    checkFreeName(slug, `${where}${page.file}`);
    return { slug, ...page };
  });
}

expectOnly(CONTENT_DIR, 'content/', ['extras', 'individual'],
  'content/ holds only extras/ and individual/ — an Extras page goes in content/extras/<folder>/');

const extras = readExtras();
const extrasItems = extras ? extras.items : [];
const courses = readCourses();
const sections = readSections();
const singlePages = readSinglePages();

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

// ---- _site/ ----
// Everything above only read, so a content error stops the build before this
// point and leaves the last good _site/ alone. From here on it writes, into an
// empty _site/.
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT);
for (const name of STATIC) {
  if (!fs.existsSync(path.join(ROOT, name))) {
    throw new Error(`${name} is listed in STATIC (build/build.js) but missing from the repo root`);
  }
  copyIn(path.join(ROOT, name), name);
}

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

// ---- content/individual/: /courses/, every other section, single pages ----
function writeSection(section) {
  for (const name of section.files) copyIn(path.join(section.dir, name), `${section.out}/${name}`);
  write(`${section.out}/index.html`, templates.sectionPage(section, site));
  for (const item of section.pages) {
    write(`${section.out}/${item.slug}/index.html`, templates.sectionItemPage(section, item, site));
  }
}

if (courses) {
  write('courses/index.html', templates.coursesIndexPage(courses, site));
  courses.list.forEach(writeSection);
}
sections.forEach(writeSection);
for (const page of singlePages) {
  write(`${page.slug}/index.html`, templates.singlePage(page, site));
}

// A page may link to a file beside it that never reaches _site/: one in
// _private/, or a typo. The link would be broken on the site (and in the
// preview), so say which, without failing the build.
const brokenLinks = [];
for (const section of [...(courses ? courses.list : []), ...sections]) {
  const base = `/${section.out}/`;
  for (const { file, body } of [section, ...section.pages]) {
    for (const [, url] of body.matchAll(/\s(?:href|src)="(\/[^"#?]*)/g)) {
      if (!url.startsWith(base) || fs.existsSync(path.join(OUT, decodeURI(url)))) continue;
      const why = url.split('/').includes(PRIVATE) ? 'it is in _private/' : 'it does not exist';
      brokenLinks.push(`  ${path.relative(ROOT, path.join(section.dir, file))} links to ${url}, but ${why}`);
    }
  }
}

// ---- 404 (single English page; the pixel cat lives in its own partial) ----
const catSvg = fs.readFileSync(path.join(__dirname, 'partials/pixel-cat.svg'), 'utf8');
write('404.html', templates.notFoundPage(site, catSvg));

// ---- sitemap.xml (kept in sync with the same project slugs) ----
// Nothing from content/individual/ goes in: it is reached only by typing its URL.
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

if (brokenLinks.length) console.warn(`\nBroken links (the build still finished):\n${brokenLinks.join('\n')}`);
console.log('\nDone.');
