# Gleam V1 Redesign Spec

## Summary
Gleam V1 is a refined, Pinterest-inspired vision board website for making a pretty board without printing, cutting, and physically arranging materials. The product should feel like an art studio website first, then a quiet canvas editor.

The approved positioning line is: "Vision boards, without the clutter."

The approved hero headline is: "Design the wall you keep coming back to."

## Visual Direction
- Use a premium, muted, art-studio style: ivory, blush, cork, linen, charcoal, warm neutrals, and soft editorial contrast.
- Prefer refined serif display typography paired with clean sans-serif body text.
- Avoid cartoon doodle fonts, sticky-note icons, childish scrapbook styling, and dense toolbox panels.
- Finished boards should look like real Pinterest vision boards: rectangular image collages, cork/linen/dark-wall backgrounds, small quote cards, and physical wall-board composition.
- The homepage header can be wider than the main content so the brand and action buttons sit closer to the edges, while the main content remains comfortably contained.

## V1 Workflow
1. User opens the website.
2. User clicks a large "Create new board" CTA.
3. User chooses a background, with wood cork board as the default.
4. User uploads pictures.
5. User freely places pictures anywhere on the canvas.
6. User can resize pictures.
7. User can control layers: bring to front, send to back, move up one layer, move down one layer.
8. User exports a high-resolution image.

## Page Structure
- Landing hero: refined website-style page with the approved positioning line, headline, supporting copy, and large primary CTA.
- Editor preview section: "A website first, then a quiet canvas." Show the product structure with a slim toolbar, large board canvas, and small upload tray.
- Showcase section: include inspirational example board styles after the editor preview, such as Soft Summer Wall, Linen Pinboard, and Minimal Desk Wall.
- Actual editor: reduce visual clutter compared with the current prototype. Keep the board as the main character, with only the essential controls visible.

## Scope Decisions
- Remove AI sticker extraction from V1.
- Remove Mac wallpaper integration from V1.
- Keep export as high-resolution PNG.
- Keep local, browser-only behavior unless deployment requirements later require storage.
- Do not add account creation, templates marketplace, collaboration, payments, or onboarding complexity.

## Implementation Notes
- The current three-column toolbox layout should be replaced with a website-forward landing page and a simpler editor.
- The editor should support uploaded images as whole rectangular collage pieces, not cutout stickers.
- Board backgrounds should look more realistic and less cartoon-like: cork, linen, dark wall, white wall, and minimal neutral wall are good candidates.
- The CTA should be more prominent than in the current mockup.
- Preserve direct file/local usability where possible, but a local or deployed web URL is preferable for testing upload/export behavior.

## Acceptance Criteria
- The page no longer feels like a toolbox or school project.
- A first-time visitor immediately understands the value: beautiful vision boards without physical mess.
- The homepage feels premium, artsy, muted, and Pinterest-inspired.
- The editor supports the full V1 workflow with no AI dependency.
- Export produces a high-resolution image of the finished board.
