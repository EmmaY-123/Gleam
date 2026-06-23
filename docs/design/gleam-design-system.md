# Gleam Design System
*Last updated: June 2025 · v1.0*

---

## Overview

Gleam is a vision board / moodboard web app targeting aesthetic-conscious creatives — people who think in images, not to-do lists. The design language reflects the product's core promise: tactile, personal, mood-first. Every visual decision should reinforce the feeling of arranging photos on a real wall, not using software.

**Design principle:** Tools stay quiet. The board gets the space.

---

## Color Palette

### Core Colors

| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#F7F4EF` | Page background — warm off-white, slightly cooler than cream |
| `--bg-mid` | `#EDE8E1` | Secondary surfaces, hover states, section alternates |
| `--shell` | `#1C1917` | Dark sections, navbar on dark pages, text on light backgrounds |
| `--shell-mid` | `#242018` | Canvas surround in workspace |
| `--shell-lt` | `#2E2924` | Elevated dark surfaces, tooltips, context menus |
| `--text` | `#1C1917` | Primary text |
| `--muted` | `#6B6560` | Secondary text, labels, placeholders |
| `--border` | `rgba(28,25,23,0.10)` | Default border on light backgrounds |
| `--accent` | `#C9A99A` | Dusty rose — single accent color, used sparingly |
| `--accent-dk` | `#A07868` | Accent on text, active states, eyebrows |
| `--danger` | `#C0624A` | Destructive actions only |

### Shell (Dark Mode) Border
```css
--shell-border: rgba(247,244,239,0.08)
```

### Color Rules
- Never use the accent as a background fill on large areas — only for dots, underlines, active handles, and small UI accents
- `--bg` and `--shell` alternate as section backgrounds to create visual rhythm
- `--bg-mid` is always between `--bg` and `--shell` in the stack — never darker than `--shell`
- Board backgrounds (cork, linen, dark, white, blush) are separate from the UI palette and should only appear inside the canvas element

### Board Background Palette

| Name | Hex | Feel |
|---|---|---|
| Cork | `#3A2E28` | Warm dark, default |
| Linen | `#E8E0D4` | Neutral light |
| Dark wall | `#141210` | Deep black |
| White wall | `#F5F2ED` | Clean minimal |
| Soft blush | `#EADAD4` | Warm pink |

---

## Typography

### Typefaces

| Role | Font | Source |
|---|---|---|
| Display / headlines | `Cormorant Garamond` | Google Fonts |
| Body / UI | `Inter` | Google Fonts |

```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
```

```css
--serif: 'Cormorant Garamond', Georgia, serif;
--sans:  'Inter', system-ui, sans-serif;
```

### Type Scale

| Role | Font | Size | Weight | Notes |
|---|---|---|---|---|
| Hero headline | Serif | `clamp(48px, 5.5vw, 76px)` | 500 | Tight tracking `-0.01em` |
| Section headline | Serif | `clamp(32px, 3.5vw, 48px)` | 500 | |
| Closing CTA | Serif italic | `clamp(44px, 5.5vw, 72px)` | 400 | Always italic |
| Desire bridge | Serif italic | `clamp(40px, 5vw, 64px)` | 400 | |
| Canvas headline | Serif | `clamp(36px, 3.5vw, 52px)` | 500 | |
| Body copy | Sans | `17px` | 300 | Line height `1.65` |
| UI body | Sans | `14–15px` | 400 | |
| Eyebrow / label | Sans | `12px` | 500 | Uppercase, `0.14em` tracking |
| Small label | Sans | `11px` | 500 | Uppercase, `0.10em` tracking |
| Fine print | Sans | `12–13px` | 300 | |

### Typography Rules
- Cormorant Garamond is **only** for display moments: hero headlines, section headlines, closing CTAs, pull quotes, board names, and the Gleam logotype
- Inter handles everything else: nav, body, buttons, form fields, labels
- Italic Cormorant is reserved for emotional, editorial moments — not functional UI
- Never use font weight above 500 anywhere

---

## Spacing

### Section Padding

| Context | Padding |
|---|---|
| Standard sections | `120px 40px` |
| Dark hero sections (desire bridge, closing CTA) | `140–160px 40px` |
| Nav height | `64px` |
| Mobile sections | `80px 20px` |

### Layout Width

| Token | Value | Usage |
|---|---|---|
| `--inner` | `1200px` | Max content width, always centered |
| Body padding | `0 40px` | Applied at section level |
| Mobile padding | `0 20px` | At `max-width: 900px` |

### Grid Gaps

| Pattern | Gap |
|---|---|
| Two-column content grid | `80–100px` |
| Three-column feature grid | `48px` |
| Four-column use case grid | `2px` (flush cards) |
| Board card grid | `16–20px` |

---

## Components

### Buttons

#### Primary (dark fill)
```css
background: var(--shell);
color: var(--bg);
padding: 10px 20px;          /* default */
padding: 14px 32px;          /* large */
border-radius: 6–8px;
font-size: 14–15px;
font-weight: 500;
transition: background 0.2s, transform 0.15s;
```
Hover: `background: #2C2925; transform: translateY(-1px)`

#### Primary inverted (light fill, for dark sections)
```css
background: var(--bg);
color: var(--shell);
/* same sizing as above */
```

#### Ghost / text
```css
background: none;
border: none;
color: var(--muted);
font-size: 14px;
font-weight: 400;
```
Hover: `color: var(--text)`

#### Outline (dark sections)
```css
background: transparent;
border: 1px solid rgba(247,244,239,0.3);
color: var(--bg);
padding: 13px 32px;
border-radius: 8px;
```
Hover: `border-color: rgba(247,244,239,0.6)`

### Pill / Badge
```css
font-size: 10–12px;
padding: 2–6px 8–14px;
border-radius: 100px;
font-weight: 500;
letter-spacing: 0.04–0.08em;
text-transform: uppercase;
```

### Nav

**Sticky nav on light pages:**
```css
position: fixed;
height: 64px;
background: rgba(247,244,239,0.92);
backdrop-filter: blur(12px);
border-bottom: 1px solid var(--border);
```

**Dark page nav:**
```css
background: var(--shell);
border-bottom: 1px solid var(--shell-border);
```

Nav always contains: logo left · links center · actions right.

### Form Fields
```css
padding: 11px 14px;
border: 1px solid var(--border);
border-radius: 7px;
font-size: 14px;
background: white (light) or rgba(247,244,239,0.07) (dark);
```
Focus: `border-color: var(--accent); box-shadow: 0 0 0 3px rgba(201,169,154,0.15)`

### Cards

**Board card (dark bg):**
```css
background: #2A2420;
border-radius: 8–10px;
overflow: hidden;
display: flex;
flex-direction: column;
```

**Feature / use-case card (light bg):**
```css
background: var(--bg);
padding: 36–40px 28–32px;
```
Hover (use-case): `background: var(--accent)` with all text switching to `var(--bg)`

**Section alternation:**
Cards in a row use `gap: 2px` (flush) for a monolithic block feel, then `border-radius` only on first and last.

---

## Motion & Animation

### Scroll reveal
```css
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
/* Stagger delays: 0.1s, 0.2s, 0.3s */
```

Triggered by `IntersectionObserver` at `threshold: 0.12`. Hero elements get `.visible` on load without waiting.

### Collage drift animation
Seven layered cards, each with independent slow float:
```css
@keyframes drift1 {
  0%, 100% { transform: rotate(-3deg) translateY(0px); }
  50%       { transform: rotate(-2.5deg) translateY(-6px); }
}
/* duration: 8–13s, staggered delays: 0–3s */
```
Always respect `prefers-reduced-motion: reduce` — disable all animations.

### Button transitions
```css
transition: background 0.2s, transform 0.15s;
/* hover: translateY(-1px) */
/* active: translateY(0) */
```

---

## Page Structure

### Homepage sections (in order)
1. **Hero** — full viewport, 2-col grid (text left, collage right)
2. **Desire bridge** — dark full-bleed, editorial text only
3. **How it works** — 3-col horizontal steps with visual mocks
4. **Canvas / All mood. No manual.** — 2-col, workspace mock left, features right
5. **Use cases** — 4-col flush card grid
6. **Showcase** — dark section, 3-col board previews
7. **Closing CTA** — full-viewport dark, large italic headline

### Workspace layout
```
[Topbar 52px]
[Sidebar 56px] | [Canvas flex-1] | [Right panel 220px]
```

### Boards dashboard
Sticky nav (logo + avatar + new board button) · page header · filter row · auto-fill card grid

### Login page (Option A — selected)
Full-bleed dark collage background with 55% overlay · centered cream card · Gleam logo top-left

---

## Copy Voice

| Moment | Tone | Example |
|---|---|---|
| Hero headline | Direct, confident | "Build a wall you keep revisiting." |
| Desire bridge | Quiet, intimate | "Some boards live in your head for years." |
| Feature headline | Punchy, two-part | "All mood. No manual." |
| CTA | Gentle urgency | "Make the board before the mood fades." |
| UI labels | Plain, functional | "Upload pictures · Drag, resize, layer" |
| Error messages | Kind, not clinical | "Please enter a valid email." |

### Key copy lines (locked, do not change)
- `"Build a wall you keep revisiting."` — hero headline
- `"All mood. No manual."` — canvas section headline
- `"Make the board before the mood fades."` — closing CTA
- `"Some boards live in your head for years."` — desire bridge
- `"Not every board is a life plan. Some are just a feeling."` — use cases
- `"What a finished board looks like."` — showcase headline
- `"Gleam gives that feeling a home — so you can actually see it."` — desire bridge close

---

## File Map

| File | Role | Deploy as |
|---|---|---|
| `gleam_index.html` | Homepage | `index.html` |
| `gleam_login_A.html` | Login / signup (selected) | `gleam_login.html` |
| `gleam_workspace.html` | Board editor | `gleam_workspace.html` |
| `gleam_boards.html` | Saved boards dashboard | `gleam_boards.html` |
| `gleam_about.html` | About + contact | `gleam_about.html` |

All files use relative paths and must be deployed in the same directory.

---

## Navigation Logic

| Entry point | Logged out routes to | Logged in routes to |
|---|---|---|
| My boards (nav) | `gleam_login.html?from=boards` | `gleam_boards.html` |
| Open workspace (CTA) | `gleam_login.html?from=boards` | `gleam_boards.html` |
| Create new board | `gleam_workspace.html` | `gleam_workspace.html` |
| Log in (nav) | `gleam_login.html` | — |
| Continue without account | `gleam_workspace.html` | — |

`?from=boards` param triggers contextual headline on login page:
- Default: "Welcome back."
- From boards: "Your boards are waiting."

---

## Accessibility

- All animated collage elements use `aria-hidden="true"`
- `prefers-reduced-motion: reduce` disables all CSS animations
- Form fields have explicit `<label>` associations
- Buttons have `title` attributes for icon-only cases
- Color contrast: text on `--bg` (#1C1917 on #F7F4EF) passes WCAG AA
- Nav keyboard accessible (all links, no JS required for navigation)

---

*Gleam design system · v1.0 · For internal use and future iteration reference*
