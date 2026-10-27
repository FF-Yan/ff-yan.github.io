# content/

Everything you write by hand lives here, and **all of it is published under
`/extras/`**. Drop an HTML or Markdown file in, run `npm run build`, and it
becomes a full page: navbar, hero, back link, footer and sitemap entry are
added for you. No need to touch `build/templates.js` or `build/build.js`.

```
content/
  index.html                ->  /extras/               the listing page
  index.zh.html             ->  /zh/extras/
  pages/_folder.html        ->  (no page — the folder's settings)
  pages/colophon.html       ->  /extras/colophon/
  thoughts/_folder.html     ->  (no page — the folder's settings)
  thoughts/hello-extras.html    ->  /extras/hello-extras/
  thoughts/hello-extras.zh.html ->  /zh/extras/hello-extras/
  thoughts/writing-in-fragments.md  ->  /extras/writing-in-fragments/
```

- **Folders group items; they don't change the URL.** Every item lives at
  `/extras/<name>/`, so a name may be used only once across all of `content/`.
  A duplicate fails the build.
- **No folder is special by name.** Folders only differ by what their
  `_folder.html` says: the label on cards, and whether dates are shown.
- **Names** must be lowercase words joined by hyphens.

`/extras/` lists every item from every folder together, newest first. The
homepage archive strip shows the newest eight (`STRIP_LIMIT` in
`build/templates.js`), scrolling sideways inside a framed box; its
"All Extras →" button links to `/extras/`.
When `content/` holds no items, the strip, its homepage menu entry and the
Extras menu item all disappear.

Only `.html` and `.md` files are read, and `README.md` is always skipped. Keep
any other notes as `.txt` (or anything else) and the build leaves them alone.

---

## The comment header

Every file starts with one HTML comment carrying its settings:

```html
<!-- title: Hello, Extras
     date: 2026-10-27 -->
```

Everything after the comment is the body.

---

## HTML or Markdown

Any file (item, `index`, `_folder`) can be `.html` or `.md`. The comment
header is identical in both; only the body differs:

- **`.md`** is converted to HTML at build time (GitHub-flavoured Markdown, via
  `marked`). Best for prose. Raw HTML still works inside it when you need a
  card, a button, or anything Markdown cannot express.
- **`.html`** is inserted as-is. Best when most of the body is markup.

A name exists as one or the other: `thought1.md` next to `thought1.html` fails
the build. The two languages of a pair may differ (`thought1.md` +
`thought1.zh.html` is fine).

Markdown needs one `npm install` after cloning; CI runs `npm ci` itself. The
published site is plain HTML either way.

---

## Items

What you write is only the body. The build adds, top to bottom:

```
← Back to Extras        the back link
THOUGHTS                the folder's label
Hello, Extras           the title
2026-10-27              the date (unless the folder hides it)
───────────────────
your body
```

```markdown
<!-- title: Why puzzle bosses beat health bars
     date: 2026-10-21
     summary: One line shown in the listing. -->

Prose goes here, as Markdown.

## A heading

- A list item

> A pull quote.
```

| Key | |
| --- | --- |
| `title` | **Required.** The page's heading and its name in lists. The browser tab shows `<title> \| Binxuan Yan` (`… \| 颜彬轩` in Chinese). Don't add the site name yourself. |
| `date` | **Required.** `YYYY-MM-DD`. Sorts the item, newest first. Shown under the title and in lists unless the folder sets `date: hidden`. |
| `summary` | The line shown in lists. Defaults to `description`. |
| `description` | Meta description and social cards. Defaults to `summary`, then to the listing's description. |
| `width` | `wide` removes the reading-width limit (44rem), for cards and columns. |
| `nav` | Gives the item its own entry in the sub-page menu. Without it the item sits under Extras. |
| `navZh` | Chinese menu label. Defaults to `nav`. A `.zh` twin with its own `nav:` wins over this. |
| `order` | Menu position for `nav`, see *Menu order*. Defaults to `40`. |
| `ogImage` | Social share image. Defaults to the site favicon. |
| `back` | `false` removes the back link. |

### Prose, cards and buttons

The body sits in an `<article class="entry-body">`. Its prose styling (heading
sizes, blue list markers, quote bar, code boxes, framed images) reaches only
the article's **own** content: its top-level elements, and lists nested in
its top-level lists. Plain Markdown is styled with no classes needed.

Anything you wrap in your own element keeps its own look. You can use the
site's classes from `style.css` directly; set `width: wide` if they need
room:

```html
<div class="projects-grid">
  <div class="project-card">…</div>
</div>
<a class="btn btn-primary" href="…">A button</a>
```

The quickest class reference is a generated page: `about/index.html` for
cards and sections, `projects/index.html` for the card grid.

---

## `_folder.html`: a folder's settings

Optional. It builds no page, and its body is ignored.

```html
<!-- label: Ideas
     labelZh: 想法
     date: hidden -->
```

| Key | |
| --- | --- |
| `label` | The folder's name above each item's title, and on its cards and rows. Defaults to the folder name (`notes`). |
| `labelZh` | Its Chinese name. A `_folder.zh.html` with its own `label:` wins over this. |
| `date` | `hidden` keeps this folder's dates off its pages, cards and rows. They still sort, so every item still needs one. |

An `index.html` inside a folder fails the build: folders have no page of their
own, so the file is almost certainly meant to be `_folder.html` or
`content/index.html`.

---

## `content/index.html`: the `/extras/` listing

Configures the listing **and holds its content**: anything below the header
is rendered above the list, with the same prose styling as an item.

| Key | |
| --- | --- |
| `title` | **Required.** Just the name (`Extras`); the tab shows `Extras \| Binxuan Yan`. |
| `description` | **Required.** |
| `label` | The section's name: menu item, "All Extras →" button, "← Back to Extras" links. Defaults to `Extras`. |
| `labelZh` | Its Chinese name (菜单、"全部番外 →"、"← 返回番外"). `index.zh.html` with its own `label:` wins over this. |
| `heading` | The `<h1>`. Defaults to `label`. |
| `eyebrow` | The small label above the heading. Defaults to `// Extras`. |
| `order` | Menu position, see *Menu order*. Defaults to `50`. |

There is no `nav` here: `/extras/` is a section like Projects and About, not
an item you opt into the menu. It joins the sub-page menu on its own as soon
as there is at least one item.

`index.zh.html` is the Chinese listing at `/zh/extras/`. Without it, Chinese
pages link to the English listing. Each row shows the folder's label and,
unless hidden, the date: `Thoughts · 2026-10-21`, or just `Ideas`.

---

## Menu order

Built-in entries sit at fixed numbers. The displayed `01 02 03…` is generated
from the sort, so nothing needs renumbering by hand.

```
sub-page menu          homepage menu
10  Home               10  Home       (#hero)
20  Projects           20  Projects   (#featured)
30  About              30  Experience (#experience)
                       40  About      (#about)
                       50  Skills     (#skills)
                       55  Archive    (#archive)
                       60  Contact    (#contact)
```

The homepage menu lists only the homepage's own sections; `Archive` scrolls to
the strip. Extras and any `nav:` items show up in the **sub-page** menu. Pick
`25` to sit between Projects and About, or `70` to go last.

On an item without a menu entry of its own, the Extras item is highlighted
and stays clickable as the way back up to the listing.

---

## One language or two

Ship `thought1.md` alone and the page is English-only:

- no `hreflang` alternates (pointing at a translation that does not exist is
  worse than claiming none)
- **no language button in the navbar**, only the hamburger
- it still appears in the Chinese listing and strip, linking to the English page

Add `thought1.zh.md` (or `.zh.html`) and the two become a normal pair:
`hreflang` both ways, and the language button swaps between them. The same
goes for `index` itself.

---

## Notes

- **Unlisted still means indexed.** Every item goes into `sitemap.xml`, menu
  entry or not. The `/extras/` listing joins the sitemap the same way it joins
  the menu: only once there is at least one item.
- **Deleting takes two steps.** Remove the file *and* its generated directory
  (`rm -rf extras/thought1/`). The build writes files but never cleans up
  output for pages that no longer exist. (CI builds from a clean checkout, so
  the live site is unaffected either way.)
- `content/index.html` is required as soon as there is any item, because the
  listing's title and description live there.
