# content/individual/courses/

Course material (practice sets, exam reviews, handouts), published under
`/courses/`. It is **unlisted**: nothing on the site links to it, it has no
menu entry and no sitemap entry, and every page carries
`<meta name="robots" content="noindex, nofollow">`. The only way in is typing
the URL.

The comment header, HTML vs Markdown and prose styling work as in
[../../extras/README.md](../../extras/README.md). Each course folder is a
section like any other in `individual/` ([../README.md](../README.md)), with
a directory of courses above it and two extra keys, `code` and `term`.

```
content/individual/courses/
  index.md                    ->  /courses/                     the directory of courses
  cs4530/
    index.md                  ->  /courses/cs4530/              the course's page
    practice-1.md             ->  /courses/cs4530/practice-1/
    exam-1-practice.md        ->  /courses/cs4530/exam-1-practice/
    diagram.png               ->  /courses/cs4530/diagram.png
    starter/                  ->  /courses/cs4530/starter/      (copied as-is)
    _private/                 ->  never committed, never published
      week-3-slides.pdf
      my-notes.pages
```

- **The URL mirrors the folder.** A new course is a new folder with an
  `index.md`; a new page is a new `.md` (or `.html`) beside it.
- **Everything else is copied as-is**: images, PDFs, code and whole
  subfolders keep their path, and are committed and published. Link to them
  relative to the page's own file, as in an editor or on GitHub:
  `![](diagram.png)`, `[starter](starter/main.ts)`.
- **Only a `_private/` folder stays private**: slides, PDFs, notes, anything
  in it. A folder named `_private`, anywhere in the repo, is never committed
  (the root `.gitignore`) and never read or published by the build, so it
  isn't in the local preview either. Make one per course, or put subfolders
  in it, as you like.
- **Broken links are reported.** If a page links to a file in `_private/`, or
  to one that doesn't exist, `npm run build` lists it under "Broken links"
  (the build still finishes).
- **Remember the repo is public**: a PDF outside `_private/` is visible on
  GitHub, and on the site to anyone with its URL. A PDF has no `noindex`, so a
  search engine that finds a link to it can list it.
- **English chrome, one URL per page.** There are no `/zh/` twins, so a
  `.zh.md` fails the build; write the body in whatever language you like.
- **Nothing to clean up.** The site is rebuilt from scratch every build, so
  deleting a file here is enough.

Course pages use the same comment header as everything else.

**`index.md`** — the directory page. Its body is the intro
above the list of courses.

| Key | |
| --- | --- |
| `title` | **Required.** |
| `description` | **Required.** The fallback description for every course page. |
| `label` | The section's name in "← Back to Courses". Defaults to `Courses`. |
| `heading` / `eyebrow` | The `<h1>` (default: `label`) and the small line above it (default: `// Courses`). |

**`<course>/index.md`** — the course's page. Its body is the
intro; the build lists the course's pages under it.

| Key | |
| --- | --- |
| `title` | **Required.** `Fundamentals of Software Engineering`. |
| `code` | Shown above the title and in back links. Defaults to the folder name in capitals (`CS4530`). |
| `term` | `Fall 2026`. Shown under the title and in the directory. |
| `summary` | The line under it in the directory. |
| `groups` | The order of the headings its pages are listed under: `Practice, Exam Practice`. Groups not named here follow, in the order of their first page. |
| `order` | Position in the directory. Lower first; without it, by folder name. |

**`<course>/<page>.md`** — a practice set, an exam review…

| Key | |
| --- | --- |
| `title` | **Required.** |
| `group` | The heading it is listed under on the course page (`Practice`, `Exam Practice`). Pages without one are listed first, with no heading. |
| `summary` | The line under it on the course page. |
| `description` | Meta description. Defaults to `summary`, then the course's. |
| `order` | Position on the course page. Lower first; without it, by file name, with numbers compared as numbers (`week-2` before `week-10`). |
| `width` | `wide` removes the reading-width limit. |

## Folded answers

For practice questions, wrap an answer in `<details>` so it stays closed until
the reader opens it. Markdown works inside — keep a blank line after
`<summary>` and before `</details>`. The summary must start with **Answer**,
**Solution**, **答案** or **解答** (`Answer to part b` works too). A `<details>`
with any other summary, such as `Hint` or `Starter code`, still folds, but it
counts as part of the question, not as an answer:

```markdown
## Question 1

What does `add(1, 2)` return?

<details>
<summary>Answer</summary>

`3`

</details>
```

## Study guides

A longer review page usually wants `toc:` in its header (a numbered contents
list), tables, and `> [!NOTE]` / `> [!WARNING]` callouts for key ideas and
common mistakes. They work on every page and are documented once, in
[Tables, callouts and a contents list](../../extras/README.md#tables-callouts-and-a-contents-list).
`cs4530/exam-1-study-guide.html` uses all of them (written in HTML);
`../test-page.md` shows the same in Markdown. **Copy page** leaves the
contents list out.

## Answering and copying into Claude

Above each folded answer, every course page shows a **Your answer** box with
a **Copy question** link, and a **Copy page** button sits above the text.
Write your answers in the boxes, then copy and paste into Claude (claude.ai,
the Claude app, or Claude Code), so it runs on your Claude plan with no API
key.

- **Copy question**: one question (everything since the previous heading),
  your answer under **My answer:**, then the folded reference answer, plus a
  line naming the page it came from.
- **Copy page**: the title, the course, the page's URL and the whole body,
  with each of your answers under its question and the folded answers
  included (as `<details>` blocks, the same format you write them in).
- An empty box adds nothing, so either button also works before you answer.
- What you write is kept in your browser per page and per question, so a
  reload does not lose it. It is filed under the question's text: editing a
  question's wording starts its box over.

Then ask Claude for whatever you need, for example:

- "Grade my answer against the reference answer and tell me what I missed."
- "Grade every answer on this page, question by question."
- "Quiz me on this page one question at a time, without showing the answers."

The logic is `course-copy.js` (repo root).

## What "unlisted" does and does not cover

- Search engines that respect `noindex` (Google, Bing…) will not list these
  pages, even if someone else links to them.
- `robots.txt` deliberately does **not** mention `/courses/`: a `Disallow`
  line would advertise the path to anyone reading it, and stop crawlers from
  ever seeing the `noindex`.
- PDFs and other files cannot carry a `noindex` tag (GitHub Pages cannot set
  headers). They stay out of search only as long as nothing public links to
  them; the course pages that do are `nofollow`.
- This is not access control: anyone with the URL can open it, and the
  sources in `content/individual/courses/` are visible in the GitHub repository.
