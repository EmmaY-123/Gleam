# Backend Foundation: Auth, Saved Boards, and Private Uploads

Date: 2026-06-23

## Overview

This iteration moved Gleam from a static prototype toward a real account-based product. The main goal was to let users sign in, save boards to an account, return to My Boards, and reopen previous work across sessions.

## Product Context

Gleam started as a digital vision board workspace where users could upload photos, arrange them freely, and export the finished board as a wallpaper. As the product grew, the static prototype needed a backend so users could keep their boards instead of starting over every time.

This backend pass focused on the first useful saved-board loop:

```txt
Sign up / Sign in -> Create board -> Upload images -> Save board -> Return to My Boards -> Reopen board
```

## Key Changes

- Added Supabase email authentication for `login.html`.
- Added a Supabase-backed My Boards page in `boards.html`.
- Created `boards.js`, `login.js`, `workspace-sync.js`, and `supabase-client.js`.
- Connected `workspace.html` to create, save, and load boards from Supabase.
- Added private image uploads through the `board-images` Supabase Storage bucket.
- Added saved-board previews based on actual saved board items instead of placeholder artwork.
- Updated workspace navigation so the Gleam logo goes to the homepage, while My Boards links return to `boards.html`.
- Changed the workspace board to a 16:9 wallpaper-friendly canvas: `960 x 540`, exporting at `1920 x 1080`.

## Supabase Setup

The backend currently uses:

- Supabase Auth for user accounts.
- `boards` table for board-level metadata.
- `board_items` table for image placement, size, rotation, layer order, and opacity.
- `board-images` private Storage bucket for uploaded board images.
- Row Level Security policies so users can only access their own boards and board items.
- Storage policies that scope uploaded files by user ID folder.

Only the Supabase project URL and publishable key are used in frontend code. Secret/service-role keys are not used in the repo.

## UX Impact

- Users can now create an account and return to saved work.
- My Boards is no longer a static mockup; it reflects real saved boards.
- Board previews better match the actual workspace layout.
- The workspace is no longer a dead end because users can navigate back to My Boards.
- The export output now aligns with common laptop wallpaper dimensions.

## Current Limitations

- Email confirmation branding is still the default Supabase template. It should be customized later in Supabase Auth email settings.
- Google sign-in is not connected yet.
- Board sharing, categories, favorites, and shared-with-me views are future features.
- Image uploads are private and user-scoped, but the app does not yet support replacing or organizing uploaded assets.
- The frontend is still static HTML/JS rather than a full app framework.

## Verification

- Created a Supabase account through Gleam.
- Confirmed sign-in routes to My Boards.
- Created a board and saved it to Supabase.
- Uploaded an image and reopened the saved board.
- Confirmed My Boards preview renders behind the Open/Delete overlay.
- Confirmed workspace navigation routes back to My Boards.
- Ran `npm test`.
- Ran `npm run check`.
- Ran syntax checks for new backend JavaScript files.

## Next Opportunities

- Customize Supabase confirmation emails so they clearly come from Gleam.
- Add favorites once users have enough saved boards to organize.
- Add categories such as yearly goals, career, travel, home, or moodboard.
- Add shared-with-me boards when collaboration or public sharing becomes part of the product.
- Add richer board previews or generated thumbnails for faster My Boards loading.
