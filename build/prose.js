// Finishing touches every page body gets once it is HTML, whether it was
// written as HTML or as Markdown (build/build.js calls finishBody on each one):
//   - a `> [!NOTE] Label` or `> [!WARNING] Label` blockquote becomes a callout;
//   - a table gets a <div class="table-wrap">, so it scrolls on a phone;
//   - an h2 or h3 without an id gets one, so it can be linked to;
//   - with `toc:` in the header, a contents list of the h2s goes in just before
//     the first one, and style.css numbers the h2s to match it.
// This works on the HTML as text, which is enough for what content/ is written
// with; a table inside a table, or a callout inside a callout, is left as is.
// resolveLinks, for pages in a section, is separate: it needs the page's URL.

const path = require('path');

// GitHub's alert names, so a Markdown file reads the same on GitHub.
const CALLOUTS = {
  NOTE: ['', 'Note'],
  TIP: ['', 'Tip'],
  IMPORTANT: ['', 'Important'],
  WARNING: [' callout-trap', 'Warning'],
  CAUTION: [' callout-trap', 'Caution'],
};

// marked turns `> [!WARNING] Common mistakes` + `> - item` into a blockquote
// whose first paragraph starts with the marker; the rest of that first line
// is the label (plain text), anything after it the callout's content.
function callouts(html) {
  return html.replace(
    /<blockquote>\s*<p>\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*([^\n<]*)\n?([\s\S]*?)<\/p>([\s\S]*?)<\/blockquote>/g,
    (match, type, label, firstText, rest) => {
      const [variant, fallback] = CALLOUTS[type];
      const lead = firstText.trim() ? `\n<p>${firstText.trim()}</p>` : '';
      return `<div class="callout${variant}">\n<p class="callout-label">${label.trim() || fallback}</p>${lead}\n${rest.trim()}\n</div>`;
    }
  );
}

function wrapTables(html) {
  return html.replace(/(<div class="table-wrap">\s*)?<table\b[\s\S]*?<\/table>/g, (match, wrapped) =>
    wrapped ? match : `<div class="table-wrap">${match}</div>`
  );
}

function plainText(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

// GitHub's rule, so a link written against a README on GitHub works here too:
// lower case, punctuation dropped, each space a hyphen; letters of any script
// stay, so a Chinese heading keeps its Chinese id.
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s/g, '-');
}

function headingIds(html) {
  const used = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  const headings = [];
  const out = html.replace(/<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/g, (match, level, attrs = '', inner) => {
    let id = (attrs.match(/\sid="([^"]*)"/) || [])[1];
    let tag = match;
    if (!id) {
      const base = slugify(plainText(inner)) || 'section';
      id = base;
      for (let n = 1; used.has(id); n++) id = `${base}-${n}`;
      used.add(id);
      tag = `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
    }
    headings.push({ level: Number(level), id, inner });
    return tag;
  });
  return { html: out, headings };
}

function contents(html, label, headings) {
  const h2s = headings.filter((h) => h.level === 2);
  if (!h2s.length) return html;
  const items = h2s
    .map((h) => `  <li><a href="#${h.id}">${h.inner.replace(/<\/?a\b[^>]*>/g, '').trim()}</a></li>`)
    .join('\n');
  const nav = `<nav class="page-toc">\n<p class="page-toc-label">${label}</p>\n<ol>\n${items}\n</ol>\n</nav>\n\n`;
  const at = html.search(/<h2[\s>]/);
  return html.slice(0, at) + nav + html.slice(at);
}

// `toc: true` labels the list "Contents"; any other value is the label itself.
function finishBody(html, meta) {
  const { html: withIds, headings } = headingIds(wrapTables(callouts(html)));
  if (!meta.toc) return withIds;
  const label = /^(true|yes)$/i.test(meta.toc) ? 'Contents' : meta.toc;
  return contents(withIds, label, headings);
}

// In a section, links and images are written relative to the file, as in an
// editor or on GitHub: `week-3.pdf`, `img/diagram.png`. A page is published one
// folder deeper than its file (quiz.md -> /courses/cs4530/quiz/), so each such
// link becomes an absolute path under the section's URL, `base`. Links with a
// scheme (https:, mailto:), absolute paths and #anchors are left alone.
function resolveLinks(html, base) {
  return html.replace(
    /(\s(?:href|src)=")(?![a-z][a-z0-9+.-]*:|\/|#)([^"]*)"/gi,
    (match, attr, url) => `${attr}${path.posix.join(base, url)}"`
  );
}

module.exports = { finishBody, resolveLinks };
