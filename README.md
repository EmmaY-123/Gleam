# Gleam

Gleam is a visual moodboard and vision board web app prototype. It gives users a calm landing page first, then moves them into a focused workspace where they can upload images, arrange a board, choose a background, adjust layering, and export the finished board.

## Why I Built This

This project explores a product idea around personal visual planning: a digital version of the wall, corkboard, or collage people keep returning to. The goal was to make the experience feel more like arranging a tactile board than using a heavy design tool.

## Current Features

- Public homepage with product explanation, use cases, and inspiration examples
- Dedicated workspace page for board creation
- Local board persistence with `localStorage`
- Image upload support for JPG, PNG, and WebP files
- Drag, resize, rotate, and layer uploaded photos
- Background choices: wood cork, linen, dark wall, white wall, and soft blush
- Thin or thick photo edge styles
- High-resolution board export
- Basic unit tests for board logic

## Project Structure

```txt
index.html          Homepage
workspace.html      Board editor workspace
styles.css          Shared visual design and responsive layout
app.js              Browser interaction and board editor behavior
gleam-core.mjs      Testable core board helpers
tests/              Node test suite
docs/               Product specs, iteration notes, and screenshots
```

## Screenshots

Homepage:

![Gleam homepage](docs/screenshots/2026-06-05-homepage-workspace-split-homepage.jpg)

Workspace:

![Gleam workspace](docs/screenshots/2026-06-05-homepage-workspace-split-workspace.jpg)

## Iteration Notes

The latest documented iteration is here:

[Homepage + Workspace Split](docs/iterations/2026-06-05-homepage-workspace-split.md)

## Run Locally

Because this is a static prototype, you can open `index.html` directly in a browser.

For a local server preview:

```bash
python3 -m http.server 4173
```

Then open:

```txt
http://127.0.0.1:4173/index.html
```

## Checks

```bash
npm run check
npm test
```

## Tech

- HTML
- CSS
- Vanilla JavaScript
- Node test runner

## Notes

This prototype currently saves boards locally in the browser. A backend would become useful for accounts, cross-device sync, shareable board links, cloud image storage, and multiple saved boards per user.
