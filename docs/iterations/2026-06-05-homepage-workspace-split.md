# Product Case Study: Homepage + Workspace Split

Date: 2026-06-05

## Overview

This iteration separated Gleam's public-facing homepage from its board creation workspace. The goal was to improve the first-time user journey by giving visitors a clear product introduction before moving them into the functional editor.

## Product Context

Gleam is a digital vision board generator for people who want the motivational and creative benefits of a physical vision board without the friction of printing, cutting, and manually arranging images.

The product needs to serve two distinct moments:

1. A discovery moment, where visitors understand what Gleam is and why they might use it.
2. A creation moment, where users focus on building and exporting their board.

Before this iteration, both moments lived on the same page. That made the product feel more like an embedded tool than a guided web experience.

## Design Goal

Create a clearer user flow:

```txt
Homepage -> Create new board -> Workspace -> Export
```

The homepage should explain the product, show visual examples, and build confidence. The workspace should stay focused on the actual board-making task.

## Key Changes

- Created `workspace.html` for the actual board editor.
- Removed the embedded editor from `index.html`.
- Updated homepage navigation and CTAs to route users into the workspace.
- Added homepage sections for product explanation, workspace features, use cases, and inspiration.
- Rebalanced the homepage hero so the headline and board preview feel more intentional.
- Updated `app.js` so editor behavior initializes only when workspace elements are present.

## UX Impact

- First-time users now land on a product page instead of immediately seeing the editor.
- The primary CTA has a clearer role: start a new board.
- The workspace feels more focused because it no longer competes with homepage content.
- The structure is easier to extend with future product features such as templates, accounts, saved boards, or AI-assisted layouts.

## Implementation Notes

The app remains a static HTML/CSS/JavaScript prototype. Board data is still stored locally in the browser using `localStorage`.

The routing model is intentionally simple:

- `index.html` handles the homepage.
- `workspace.html` handles the board editor.
- `workspace.html?new=1` starts a fresh board and then cleans the URL.

## Screenshots

Homepage:

![Gleam homepage after workspace split](../screenshots/2026-06-05-homepage-workspace-split-homepage.jpg)

Workspace:

![Gleam workspace after homepage split](../screenshots/2026-06-05-homepage-workspace-split-workspace.jpg)

## Verification

- `npm run check`
- `npm test`
- Browser desktop check with no console errors.
- Confirmed the homepage no longer contains the embedded editor.
- Confirmed Create new board opens `workspace.html`.
- Confirmed New board resets the workspace to a blank board.

## Next Opportunities

- Add starter templates for common use cases such as yearly goals, room moodboards, or career vision boards.
- Add real example boards or user-created examples to make the homepage feel more concrete.
- Introduce backend storage when saved boards, shareable links, or cross-device sync become product priorities.
- Explore AI-assisted layout, background removal, and mood-based asset generation.
