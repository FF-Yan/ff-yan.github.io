# content/individual/

Standalone pages and sections, with no code to change:

- **A file here is a page of its own**: `uses.md` (or `uses.html`) becomes
  `/uses/`.
- **A folder here is a section of its own**: `notes/index.md` becomes
  `/notes/`, and every other page in the folder is listed under it.

```
content/individual/
  uses.md             ->  /uses/            a single page
  notes/
    index.md          ->  /notes/           the section's own page
    week-1.md         ->  /notes/week-1/
    week-2.md         ->  /notes/week-2/
    diagram.png       ->  /notes/diagram.png      (copied as-is)
    starter/          ->  /notes/starter/         (copied as-is)
    _private/         ->  never committed, never published
  courses/            ->  /courses/   its own layout: see courses/README.md
```

Files copied as-is are committed and published like the pages; link to them
relative to the page's own file (`![](diagram.png)`). Anything in a folder
named `_private` stays on this computer: never committed, never published,
and `npm run build` warns when a page links into it.

Everything here is **unlisted**, like `/courses/`: no menu entry, no homepage
link, no sitemap entry, `noindex, nofollow` on every page. The only way in is
typing the URL. Pages are English-chrome and have no `/zh/` twin; write the
body in any language.

The comment header, HTML vs Markdown and prose styling work as in
[../extras/README.md](../extras/README.md). Folded answers (`<details>`) work
everywhere; the **Copy page** / **Copy question** buttons are for course pages
only ([courses/README.md](courses/README.md)).

## A single page: `<name>.md`

Just the title and the body, nothing listed and no back link.

| Key | |
| --- | --- |
| `title` | **Required.** |
| `eyebrow` | The small line above the title. Defaults to `// <name>`. |
| `description` | Meta description. Defaults to `summary`. Optional. |
| `width` | `wide` removes the reading-width limit. |

## A section: `<folder>/index.md`

Its body is the intro, and the build lists the section's pages under it. A
folder with only `index.md` is just that page.

| Key | |
| --- | --- |
| `title` | **Required.** The page's heading. |
| `label` | The section's name above each page's title and in "← Back to …". Defaults to `title`. |
| `eyebrow` | The small line above the section's own title. Defaults to `// <folder>`. |
| `description` | Meta description, and the fallback for its pages. Optional. |
| `groups` | The order of the headings its pages are listed under: `Week 1, Week 2`. Groups not named here follow, in the order of their first page. |

## A section's other `.md` / `.html`: its pages

| Key | |
| --- | --- |
| `title` | **Required.** |
| `group` | The heading it is listed under on the section's page. Pages without one are listed first, with no heading. |
| `summary` | The line under it in the list. |
| `description` | Meta description. Defaults to `summary`, then the section's. |
| `order` | Position in the list. Lower first; without it, by file name, with numbers compared as numbers (`week-2` before `week-10`). |
| `width` | `wide` removes the reading-width limit. |

## Names

- File and folder names must be lowercase words joined by hyphens.
- A name cannot be one the site already uses: `about`, `projects`, `extras`,
  `zh`, `assets`. The build stops and says so instead of overwriting it.
- `uses.md` and a `uses/` folder would both be `/uses/`: keep one of the two.
- There is no `content/individual/index.md`: name the file after its URL.
- A copied file or folder cannot share its name with a page in the same
  section.

## Removing a page or section

Delete it here and build again: `_site/` is rebuilt from scratch, so whatever
you removed is gone from the site.
