# Binxuan Yan – Personal Portfolio Website

Welcome to my personal website!

You can view the website here:
[binxuanyan.dev](https://binxuanyan.dev)

## About

This website serves as my portfolio for game development and programming projects.  
It showcases my work in game design, level design, and software development.

## Contents

The website includes:

- **Projects** – Selected game and programming projects
- **Experience** – Work, research, and leadership experience
- **About** – Introduction, education, and skills
- **Contact** – A contact form and links to reach me

## Technologies Used

This website is built using:

- HTML
- CSS
- JavaScript
- Node.js

## How It's Built

All page text lives in `build/data/site.js` and `build/data/projects.js`,
plus the hand-written pages in `content/` (see [content/README.md](content/README.md)).
A small Node.js script (`build/build.js`) turns them into the English and
Chinese pages, so both languages always share the same structure.

```
npm install      # once
npm run build    # writes the whole site to _site/
npm run serve    # previews _site/ at http://localhost:8001
```

`_site/` is rebuilt from scratch every time and is never committed. Only the
pages and the files listed in `STATIC` in `build/build.js` (`assets/`,
`style.css`, `script.js`, …) are published;

Every push to `main` runs a GitHub Actions workflow that builds `_site/` and
deploys it to GitHub Pages.
