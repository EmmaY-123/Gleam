# Gleam

Gleam is a digital vision board generator for turning personal inspiration into a polished board users can save, export, and keep close as a wallpaper.

Live site: [https://www.gleamup.asia/](https://www.gleamup.asia/)

## Why I Built This

I built Gleam because I love the idea of vision boards for visualizing goals, collecting mood references, and keeping intentions visible, but the physical process can be messy and time-consuming: finding pictures, printing them, cutting them out, and arranging them by hand.

Gleam keeps the emotional ritual of making a board, but removes that friction. Users can upload photos, choose a background, freely place and resize images in the workspace, then export the finished board as something they can use as a laptop wallpaper or daily visual reminder.

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

## Product Process

Design and product documentation:

[Homepage + Workspace Split Case Study](docs/iterations/2026-06-05-homepage-workspace-split.md)

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

Future scope includes AI-assisted layout, automatic background removal for uploaded photos, and mood-based generation of images, icons, stickers, and collage artifacts.
