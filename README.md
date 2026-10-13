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

All page text lives in `build/data/site.js` and `build/data/projects.js`.
A small Node.js script (`build/build.js`) turns that data into the English
and Chinese pages, so both languages always share the same structure.

Every push to `main` runs a GitHub Actions workflow that builds the site and
deploys it to GitHub Pages.
