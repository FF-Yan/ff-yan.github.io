<!-- title: Test Page
     summary: A Markdown test page in content/individual/.
     toc: Contents -->

This is a single page written in **Markdown**. It lives at
`content/individual/test-page.md` and is published at `/test-page/`, hidden
from the menu, the homepage and search engines. `toc: Contents` in the header
adds the numbered list of sections below.

## A list and a quote

- One item
- Another item, with `inline code`
  - And a nested one

> A plain quote, to check the styling.

## A table

| Term | Meaning |
| --- | --- |
| `await` | Pauses only the current function |
| Microtask | Runs before the next macrotask |

## Callouts

> [!NOTE] Key idea
> A `> [!NOTE]` blockquote becomes a green callout; the rest of the first
> line is its label.

> [!WARNING] Common mistakes
> - A `> [!WARNING]` blockquote becomes a red one.
> - Lists, `code` and links inside it are styled like the page.

## Code and a fold

```js
function greet(name) {
  return `Hello, ${name}!`;
}
```

<details>
<summary>Something folded</summary>

Hidden until you open it.

</details>
