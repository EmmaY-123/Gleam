# Gleam — Iteration Notes
*Product iteration documented by AI PM · June 2025 · v1.0*

---

## Iteration Overview

This document captures a full-cycle homepage and product design iteration for Gleam (gleamup.asia), a vision board web app. The work spanned from homepage diagnosis through full multi-page redesign, covering storytelling structure, copy, visual design, layout, and UX logic. This was a solo founder iteration conducted in a single extended session using Claude as AI design and development partner.

**Scope:** Homepage · Workspace · Login/Signup · Saved Boards · About page
**Output:** 6 production-ready HTML files + design system documentation

---

## Starting Point

The live site at gleamup.asia had several compounding problems that, taken together, made it feel generic and underpowered relative to what the product actually does.

**Structural diagnosis:**
- The page had 6+ sections but no narrative arc — it read as a feature catalog, not a product story
- Numbered steps (01/02/03) implied a rigid workflow that contradicted the product's freeform nature
- No emotional hook before the feature explanation — visitors were asked to understand before they were made to want

**Layout diagnosis:**
- Content container was approximately 900px max-width, creating wide dead zones on either side on standard laptop screens
- Section padding was too tight — sections blurred into each other without breathing room
- No sticky nav — disappeared on first scroll

**Copy diagnosis:**
- Hero subhead used "collage studio" — the most clinical possible framing for an emotional product
- "Local first" as a feature name read as developer jargon
- The best line on the entire page ("Make the board before the mood fades") was buried in the smallest, least-designed section
- Use case cards were generic and indistinguishable from each other

---

## Structural Decision: Linear as Reference

Emma identified Linear's homepage (linear.app/homepage) as a structural reference — specifically how each section functions as a proof point rather than a feature description, and how the narrative unfolds with escalating specificity.

**The pattern extracted from Linear:**

| Layer | Function |
|---|---|
| Hero | Bold identity promise, not a feature list |
| 3-pillar differentiator | Why this, why now |
| Feature proof sections (×5) | Each = one capability + live demo + benefit headline |
| Social proof | Named people, specific insight, not generic logos |
| Changelog | Signals active momentum |
| CTA | Full-bleed, single action |

**Applied to Gleam:** The section names were reframed as emotional states rather than product features — mirroring how a user actually experiences the product, not how an engineer would describe it.

**Resulting story arc:**
> Desire → Credibility → How → Proof → CTA

---

## Copy Iteration

### Hero
The subhead went through two rounds. The key decision was removing "collage studio" — it was the most functional, least emotional way to describe a product whose entire value is feeling.

| Version | Text | Decision |
|---|---|---|
| Original | "A refined collage studio for arranging your own pictures into Pinterest-inspired vision boards, no printer or messy table required." | Cut — clinical, kills mood |
| Final | "Your photos. Your layout. A board that actually looks like you — not a template." | Kept |

Hero headline "Build a wall you keep revisiting" was already strong — kept untouched.

### Canvas headline: the key creative moment

The original "A canvas that feels more like a wall than software" was identified as a good line buried under a bad section title. The brief was to find a replacement.

**Exploration path:**
- "The workspace gets out of the way. Your photos don't." — leans into tool disappearing
- "It feels like arranging, not designing." — tactile angle
- "Made to look at, not manage." — first strong parallel structure
- From "Made to look at, not manage" → exploration of the "good taste without the fuss" axis
- "All mood. No manual." — **selected**

**Why "All mood. No manual." works:**
- Sharpest compression of the idea
- "Manual" does double duty (instruction manual + manual effort)
- Satisfying rhythm — two two-word phrases in parallel
- Feels brand-specific, not generic SaaS copy

### Desire bridge copy evolution

The original subhead "The room you're designing. The year you're planning. The aesthetic you're still figuring out. Gleam gives that board a home — so you can actually see it." was good in structure but had two problems:

1. Running all four sentences together made it feel like a paragraph, not a list
2. "Gives that board a home" was slightly off — a board is an output, not a feeling

**Fix 1:** Break the three opening sentences into explicit line breaks — each gets its own beat before the final resolution.

**Fix 2:** Copy rewrite — "Gleam gives that feeling a home" over "aura", "vibe", or "board."

**Why "feeling" over "aura" or "vibe":** Both "aura" and "vibe" carry cultural saturation risk — they date quickly. "Feeling" is quieter, more universal, and matches the emotional register of the rest of the section without borrowing from trend vocabulary.

---

## Design Decisions

### Layout: max-width and section padding
The single highest-impact fix applied before any copy or structure changes. Increasing from ~900px to 1200px inner container and adding 120px vertical section padding transformed the page from feeling cramped and narrow to feeling intentional and editorial.

### Color palette rationale
- `#F7F4EF` for background — warm off-white that reads as linen rather than sterile white, without the yellow-warmth of typical cream
- `#1C1917` for text and dark sections — deep brown-black that references natural cork and dark wood, not pure digital black
- `#C9A99A` (dusty rose) as the single accent — chosen specifically to not be terracotta (overused in this aesthetic space), to evoke blush and cork without being overtly feminine, and to work as both a UI color and a conceptual nod to the physical pinboard

### Typography: Cormorant Garamond + Inter
Cormorant was chosen over more common editorial serifs (Playfair, DM Serif) for its narrower proportions, which allow large display sizes without overwhelming the viewport, and its slightly romantic quality that suits the product's mood without being precious.

**Usage discipline:** Cormorant strictly for display (headlines, hero text, board names, logo). Inter for everything functional. The tension between the two — a romantic serif and a utilitarian sans — is the visual personality.

### Section alternation
Dark (`--shell`) and light (`--bg`) sections alternate throughout the homepage, creating natural pause points between ideas. This was a deliberate choice over a single-background page — it forces each section to be visually self-contained.

### Collage hero
The animated layered cards in the hero were built specifically to convey the product experience without needing real images. Seven cards with independent slow-drift animations simulate the physical quality of photos scattered on a wall. The card labeled "slow is good" is intentional — it telegraphs the product's philosophy while functioning as a visual texture element.

---

## UX Logic Decisions

### "Create new board" vs "Open workspace"
Originally both buttons in the closing CTA went to the same destination (workspace.html), making the choice meaningless. After discussion:

- **Create new board** → workspace (fresh start, blank canvas)
- **Open workspace** → boards dashboard (returning users, existing work)

This distinction maps to two real mental states: "I have a new idea" vs "I want to continue something." The buttons now serve different users at different moments.

### My boards → login redirect
Decision: unauthenticated users clicking "My boards" are redirected to login rather than an empty boards page.

**Reasoning:**
- "My boards" implies ownership, which implies an account — an empty page would feel broken
- The click is a warm intent signal (returning user mindset) — the ideal moment to prompt signup
- The login page still surfaces "Continue without account" so there is no hard wall

**Implementation:** `?from=boards` URL param triggers contextual headline swap on the login page:
- Default: "Welcome back."
- From boards: "Your boards are waiting."

This makes the redirect feel purposeful rather than like an error.

### Hero pills removed
The three feature pills ("Upload your pictures · Drag, resize, layer · Export high-res") were removed from the hero at Emma's direction. They added visual noise below the CTA and competed with the collage for attention. The hero is now cleaner — headline, subhead, CTA, collage. The feature explanation is handled by the "How it works" section where it belongs.

### Layer order (Up/Down buttons removed)
The workspace had four layer controls: Bring front, Send back, Up, Down. Up and Down were removed after reviewing: in an interface with no visible layer panel, "move one step" has no feedback and feels broken. "Bring front" and "Send back" cover all practical moodboard use cases and are immediately understandable.

---

## Page-by-Page Build Notes

### Homepage
- Full narrative arc: desire → credibility → how → proof → CTA
- New section added: desire bridge (between hero and how-it-works) — creates emotional hook before any feature explanation
- Showcase section rebuilt: equal-column cards, consistent aspect ratios, dark meta areas for readability
- Closing CTA: promoted "Make the board before the mood fades." to 64–72px hero treatment

### Workspace
- Design language: dark shell matching homepage's `--shell`, same Cormorant logo, accent for active states
- Left sidebar: tool icons with hover tooltips
- Canvas: cork texture via CSS noise, dot-grid surround, soft shadows on images
- Right panel: upload zone + image tray + layer controls + background swatches + properties panel
- Free rotate: drag handle above selected image, calculates angle from element center
- Snap to horizontal (0°) and snap to vertical (90°) added to sidebar
- Export button renamed from "Export high-res" → "Export" (cleaner, less functional-sounding)

### Login 
**Card on canvas:** Centered cream card floating over full-bleed dark collag, 
selected for its balance of atmosphere and form clarity — the collage provides visual richness without competing with the form fields.

### Saved boards
- Board card grid with CSS mini-previews (no real images needed)
- Inline board renaming by clicking the name
- Hover reveals Open + Delete overlays
- Delete triggers a confirmation modal (not immediate — prevents accidental deletion)
- Filter by All / Saved / Local + search + sort
- Nav-center tab switcher removed at Emma's direction — cleaner for a logged-in dashboard

### About page
Four sections: hero intro, mission statement (dark full-bleed), origin story with pull quote, three belief cards, contact form with subject dropdown. Mirrors the homepage's section rhythm and alternating backgrounds.

---

## Emma's Design Instincts — Observed Patterns

*This section captures product thinking demonstrated throughout the session, relevant for future AI PM collaboration.*

**Narrative-first:** Emma approached the homepage as a story problem before a design problem. The instinct to look at Linear's structure and extract the underlying pattern — rather than copy the aesthetic — reflects strong strategic product thinking.

**Copy sensitivity:** The willingness to push back on specific words ("collage studio", "aura", "Local first") and iterate toward more precise language shows a developed editorial sense. The best lines in the final product came from collaborative refinement, not first drafts.

**Functional over decorative:** Emma consistently removed elements that looked like features but added no value — the hero pills, the layer Up/Down buttons, the nav tab switcher on the boards page. The product benefits from this restraint.

**User journey logic:** The "My boards → login" redirect decision showed clear conversion-minded thinking: identifying the right moment to prompt signup (warm intent signal) rather than either blocking immediately or never prompting.

**Documentation habit:** Choosing to document the iteration as it happened — rewrite plan as a downloadable doc, design system, iteration notes — reflects a PM who treats product decisions as artifacts worth preserving, not just outputs worth shipping.

---

## Open Questions for Next Iteration

1. **Authentication:** All login/signup flows are currently front-end only. Backend session management, OAuth (Google/Apple), and persistent board storage are the next technical layer.

2. **Real board previews:** The boards page and showcase section use CSS color blocks as placeholders. These should be replaced with actual screenshots or canvas-rendered thumbnails as the product matures.

3. **Export:** The workspace export button shows a toast notification but doesn't produce a real file. `html2canvas` or a server-side render would be needed for production.

4. **Mobile workspace:** The workspace layout is desktop-only. A mobile-specific interaction model (tap to select, pinch to resize) would need separate treatment.

5. **Gleam's product-market fit hypothesis:** The product sits between Pinterest (too much other people's content) and Canva (too much design overhead). The copy now articulates this clearly. The next question is whether the user research confirms this is the tension real users feel — worth validating with a small cohort of target users before the next major feature build.

---

## Files Delivered

| File | Type | Status |
|---|---|---|
| `gleam_index.html` | Homepage | ✓ Production ready |
| `gleam_login_A.html` → deploy as `gleam_login.html` | Login/Signup | ✓ Production ready |
| `gleam_workspace.html` | Board editor | ✓ Production ready |
| `gleam_boards.html` | Saved boards | ✓ Production ready |
| `gleam_about.html` | About + contact | ✓ Production ready |
| `gleam_design_system.md` | Design reference | ✓ This session |
| `gleam_iteration_notes.md` | This document | ✓ This session |
| `Gleam_Homepage_Rewrite_Plan.docx` | Copy rewrite doc | ✓ Earlier in session |

---

*Gleam iteration notes · v1.0 · Documented June 2025*
*AI PM collaboration via Claude · For internal reference and future iteration continuity*
