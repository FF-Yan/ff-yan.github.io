# content/

Everything you write by hand lives here, one folder per section. Run
`npm run build` after any change (it rebuilds the whole site into `_site/`,
so a deleted file disappears from the site too) and `npm run serve` to
preview it.

```
content/
  extras/           ->  /extras/    listed: the Extras page, the homepage strip,
                                    the menu and the sitemap
  individual/       standalone pages and sections, never listed anywhere
    courses/        ->  /courses/   a directory of courses
    <name>.md       ->  /<name>/    unlisted: reached only by typing the URL
    <any folder>/   ->  /<folder>/  unlisted, same
```

- **[extras/README.md](extras/README.md)**: writing Extras pages, plus what
  every page shares: the comment header, HTML vs Markdown, and the prose
  styling, tables, callouts and contents list.
- **[individual/README.md](individual/README.md)**: adding a page or a
  section of your own to `individual/`.
- **[individual/courses/README.md](individual/courses/README.md)**: course
  pages, folded answers and copying into Claude.

A page or folder anywhere else in `content/` fails the build instead of being
silently left out.

**Private material goes in a folder named `_private`**, anywhere in the repo
(for example `individual/courses/cs4530/_private/`, or `assets/_private/`).
It stays on this computer: never committed, never read or published by the
build.
Everything outside a `_private/` folder, PDFs included, is committed and
published. `npm run build` lists any page that links into `_private/` (or to a
file that doesn't exist) under "Broken links".
