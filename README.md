# Gleam - Digital Vision Boards Without the Mess

## Create personal vision boards online, save them to your account, and export them as laptop-ready wallpapers.

Gleam is a digital vision board builder for turning personal inspiration into a finished visual board. Instead of printing photos, cutting them out, and arranging them by hand, users can upload images, place them freely on a customizable canvas, save boards to their account, and export the final board as a wallpaper or visual reminder.

Live site: [https://www.gleamup.asia/](https://www.gleamup.asia/)

## Why Gleam

Vision boards are powerful because they make goals, moods, and intentions visible. The problem is that making one physically can be slow and messy: collecting images, printing them, cutting them out, arranging them, and finding a place to keep the final board.

Gleam keeps the emotional ritual of vision boarding but removes the friction. It gives users a quiet digital workspace where they can collect their own images, arrange them by feeling, save their boards, and revisit them whenever they need motivation or clarity.

## Demo

A short walkthrough video is coming soon. It will show the full flow from uploading photos to arranging a board, saving it, and exporting it as a wallpaper.

Design system: [docs/design/gleam-design-system.md](docs/design/gleam-design-system.md)

## What You Can Do With Gleam

Gleam helps users turn scattered inspiration into a finished visual board they can come back to.

- Create a personal vision board from your own uploaded photos
- Arrange images freely on a 16:9 canvas designed for laptop wallpapers
- Resize, rotate, layer, and reposition photos until the board feels right
- Choose from soft background styles to match the mood of the board
- Save boards to your account and return to them later
- Browse saved boards with visual previews
- Customize your profile with a username and avatar
- Export a finished board as a high-resolution image

## Product Status

Gleam is an early-stage working prototype. The current version supports account-based saved boards, image uploads, board editing, profile customization, and export.

The product is currently focused on the core creation loop:

```txt
Upload images -> arrange the board -> save it -> revisit or export it
```

The next product priority is improving smoothness, polish, and the saved-board experience before expanding into more advanced features.

## Tech Stack

- HTML
- CSS
- JavaScript
- Vite
- Supabase Auth
- Supabase Database
- Supabase Storage
- Vercel

## Local Development

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Run checks:

```bash
npm run check
npm test
```

## Project Structure

```txt
index.html              Homepage
about.html              About page
login.html              Authentication page
boards.html             Saved boards page
profile.html            Profile settings page
workspace.html          Vision board editor

styles.css              Shared styling
auth-nav.js             Auth-aware navigation behavior
supabase-client.js      Supabase client and shared data helpers
boards.js               Saved boards logic
profile.js              Profile settings logic
workspace-sync.js       Workspace save/load/sync behavior
app.js                  Workspace interaction logic
gleam-core.mjs          Testable board helper logic

docs/                   Public product and design documentation
tests/                  Node test suite
```

## Known Issues

- Some navigation still uses full page reloads, so small loading transitions may appear between pages.
- Email confirmation currently uses Supabase's default email branding.
- The saved-board experience is functional but still needs more polish around organization, filtering, and empty states.
- The current frontend is not yet a full single-page app, which limits how smooth page-to-page transitions can feel.

## Future Scope

Planned directions include:

- AI-assisted layout suggestions
- Automatic background removal for uploaded images
- Mood-based image, icon, and artifact generation
- Board categories, favorites, and recently edited views
- Shared boards from other users
- Public board links
- More export sizes for different devices
- A React-based app architecture for smoother navigation and shared state
