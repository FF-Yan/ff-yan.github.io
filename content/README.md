# content/

Everything you write by hand lives here. Drop an HTML **body fragment** in and
`npm run build` turns it into a full page — `<head>`, navbar, menu, footer and
sitemap entry are added for you. No need to touch `build/templates.js` or
`build/build.js`.

Two shapes:

| | |
| --- | --- |
| `content/pages/` | **One-off pages** (`/uses/`, `/now/`, a standalone write-up). Listed in the homepage archive strip, since they have no listing of their own. |
| `content/<name>/` | A **collection** — a series with entries under a shared path (`/thoughts/thought1/`), plus its own page. See *Collections* below. |

Everything under `content/` is indexed by the homepage archive strip. When
`content/` holds nothing the strip is not rendered at all, and its menu entry
disappears with it.

---

# content/pages

## Filename is the route

| File | URL |
| --- | --- |
| `thoughts.html` | `/thoughts/` |
| `thoughts.zh.html` | `/zh/thoughts/` |
| `how-i-work.html` | `/how-i-work/` |

Slugs must be lowercase words joined by hyphens. Anything else fails the build.

## The comment header

Every fragment starts with one HTML comment:

```html
<!-- title: Binxuan Yan | Thoughts
     description: Notes on game design and gameplay programming.
     nav: Thoughts
     navZh: 随笔
     order: 25
     ogImage: /assets/images/profile.webp -->

<div class="page-hero">
  <div class="container">
    <div class="page-eyebrow">// Notes</div>
    <h1 class="page-title">Thoughts</h1>
  </div>
</div>
```

| Key | |
| --- | --- |
| `title` | **Required.** Goes in `<title>`, `og:title`, `twitter:title`. |
| `description` | **Required.** Meta description + social cards. |
| `nav` | Menu label. **Leave it out and the page stays off every menu** — reachable only by its URL or from the archive strip. Add it later to promote the page; that is the only change needed. |
| `navZh` | Chinese menu label. Defaults to `nav`. A `.zh.html` twin with its own `nav:` wins over this. |
| `order` | Menu position. See below. Defaults to `40`. |
| `ogImage` | Social share image. Defaults to the site favicon. |

Everything after the comment is the page body, inserted as-is.

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
                       60  Contact    (#contact)
```

The default `40` ties with About on the homepage and lands just after it,
which is probably not what you want. Pick explicitly:

- `25` — after Projects, before About / Experience
- `70` — last in both menus

## One language or two

Ship `thoughts.html` alone and the page is English-only:

- no `hreflang` alternates (pointing at a translation that does not exist is
  worse than claiming none)
- **no language button in the navbar** — only the hamburger. A switch that just
  dumps the reader on another homepage is worse than no switch at all.
- if it has a `nav:` label, the Chinese menu still lists it, pointing at the
  English page

Add `thoughts.zh.html` and the two become a normal pair: `hreflang` both ways,
and the language button swaps between them.

## Notes

- **Unlisted still means indexed.** A page with no `nav:` is absent from the
  menus but still goes into `sitemap.xml`, so search engines will find it.
  It is hidden from site navigation, not from the web.
- **Deleting a page takes two steps.** Remove the fragment *and* the generated
  directory (`rm -rf thoughts/`) — the build writes files but never cleans up
  output for pages that no longer exist.
- **Class names** come from `style.css`. The quickest reference is a generated
  page: `about/index.html` for cards and sections, `projects/index.html` for
  the card grid.
- Non-`.html` files are ignored by the build, so this README and any notes you
  leave beside your fragments are safe.
- Menus: the **homepage** menu lists only the homepage's own sections, with
  `Archive` covering everything here. The **sub-page** menu lists real pages,
  so that is where a `nav:` entry shows up. On a collection entry the menu
  highlights its collection and stays clickable, so you can go up to the
  listing — the same way a project detail page behaves.

---

# Collections (`content/<name>/`)

Any folder under `content/` other than `pages/` is a collection: a folder of
entry fragments plus an `index.html` that is the collection's own page. The
entry list on it is **generated from the entries**, so adding a post means
adding one file — nothing to wire up by hand.

```
content/thought/
  index.html           ->  /thought/            (its page + the entry list)
  thought1.html        ->  /thought/thought1/
  thought2.html        ->  /thought/thought2/
  thought2.zh.html     ->  /zh/thought/thought2/
```

The folder name is the URL segment, so `content/blog/` gives `/blog/blog1/`.
You can have as many collections as you like.

## `index.html`

Configures the listing page **and holds its content**. Anything you write
below the comment header is rendered above the entry list — this is where a
collection's own writing lives, not just a one-line blurb. It gets the same
prose styling as an entry (`h2` `h3` `p` `ul` `ol` `blockquote` `code` `pre`
`img`), so write plain HTML.

```html
<!-- title: Binxuan Yan | Thoughts
     description: Short notes on game design and gameplay programming.
     eyebrow: // Notes
     heading: Thoughts
     nav: Thoughts
     order: 25
     listing: false -->

<p>Optional intro paragraph.</p>
```

| Key | |
| --- | --- |
| `title` | **Required.** `<title>` and social cards. |
| `description` | **Required.** |
| `heading` | The `<h1>`. Defaults to `nav`, then the folder name. |
| `eyebrow` | Small red label above the heading. Defaults to `// <folder>`. |
| `nav` / `navZh` / `order` | Omit `nav` and the collection stays off the menus while `/<name>/` keeps building — the way to have a page you reach only by link or from the archive. `navZh` is its Chinese menu label; `order` places it (see *Menu order*). |
| `listing` | Set to `false` to skip the generated index page. Entries still build; their back-link points at the homepage archive strip instead. See below. |

## Entries

```html
<!-- title: Why puzzle bosses beat health bars
     date: 2026-10-21
     summary: One line shown in the listing. -->

<p>Prose goes here, as plain HTML.</p>
<h2>A heading</h2>
<ul><li>A list item</li></ul>
<blockquote>A pull quote.</blockquote>
```

| Key | |
| --- | --- |
| `title` | **Required.** |
| `date` | **Required.** `YYYY-MM-DD`. Sorts the listing, newest first, and shows as the entry's eyebrow. |
| `summary` | One line in the listing. Also the meta description unless `description` is set. |
| `description` | Overrides `summary` for search and social cards. |

Entry bodies are wrapped in `.entry-body` and the listing's intro in
`.entry-intro`; both style `h2` `h3` `p` `ul` `ol` `blockquote` `code` `pre`
`img` to match the site. Write plain HTML — no classes needed.

## Notes

- Entries are sorted by `date` descending; same-date entries fall back to
  filename order so builds stay reproducible.
- A collection with no `index.html` fails the build — even with
  `listing: false` the entries need a title, description and label from
  somewhere, and that file is where they live.

## `listing: false`

Every entry still gets its own page, but `/<name>/` is not generated and the
collection is absent from the sitemap's listing URLs. Entries link back to the
homepage archive strip (`/#archive`) instead of a page nothing else points at.

Use it while a collection is small enough that the homepage strip *is* the
index. Drop the line once there is enough in it to want a real index page —
nothing else needs to change.

One tradeoff: `/<name>/` returns 404, so trimming an entry's URL by hand lands
on the 404 page rather than a list.
- Same deletion caveat as pages: remove the fragment *and* the generated
  directory, then rebuild.
