# Task: Reconcile the current build against this complete spec, fix the broken chrome, and persist the spec

## Why this prompt exists

Earlier context was compressed and you lost the detailed design intent, so the current build drifted (broken/placeholder icons, stubbed dock, flat cards, placeholder now-playing). This document restates the **entire** architecture and layout so nothing depends on prior conversation.

**First action:** save this spec verbatim to `SPEC.md` at the repo root and treat it as the source of truth. At the start of any future session on this project, re-read `SPEC.md` before making changes. Do not rely on conversation memory for layout intent — this file is authoritative.

Then **reconcile** the existing code against this spec: keep what already matches (shared shell, breadcrumbs, container, metadata row, View Solution callout, section blocks are largely correct), and fix only what diverges. Do not rebuild from scratch.

---

## Architecture (authoritative — no ambiguity)

- **Two real routes**, `/` (Home) and `/work/:slug` (Case Study). The Case Study route is **never** a modal or overlay of Home. If any modal-over-Home / background-location code still exists, remove it.
- **Both routes share one Shell component** that owns: the textured page background, the centered content column, and the bottom **dock**. Home and Case Study differ only in what fills the shell's **header slot** and **body**.
- **Header slot swaps by route:**
  - Home header = identity (name + subtitle) on the left, status (location/time + now-playing) on the right.
  - Case Study header = breadcrumbs (top center) + the container chrome (nav arrows, expand, close).
- **The Case Study route has TWO presentations, toggled by the expand control:**
  - **Compact** — the case study content sits inside a centered, frosted, rounded container floating on the page (neighbors may peek at the edges; see decision D1).
  - **Expanded** — the container grows to fill (near) the full viewport; the same content reflows wider.
- **Case study shuffling** — prev/next between case studies via the arrow buttons, ← / → keys, and horizontal swipe, with a direction-aware slide animation. This works in BOTH compact and expanded states. Blocks are animation-agnostic; the shell owns the transition.
- **Blocks size to their container, not the viewport** (container queries: `@md:`, `@lg:`). No `vw` widths, no hardcoded pixel widths. `770px` is allowed ONLY as a readable max-measure for text blocks, not as a global container width. Both compact and expanded states must establish an `@container` context at their own width.
- **Blocks are two-layer:** pure presentation component (plain props, no Sanity coupling) + thin wrapper mapping the Sanity block (`_type` + fields) → props, registered in `BlockRenderer`. See `PAPER_CONTRACT.md` if present.

---

## Layout spec — HOME (`/`)

Reference: clean off-white textured background, generous whitespace, centered column (~max 1200–1400px).

**Header row** (full content width, space-between):
- Left, stacked: **"Kai Davey"** — bold, large (~28–32px). Directly below: **"Design Engineer & CS at UCLA"** — regular weight, muted.
- Right, right-aligned, two stacked lines:
  - Line 1: a **clock icon** + `Seattle · 8:16 PM` (muted).
  - Line 2: a **music note icon** + now-playing, e.g. `Breathe · Malcolm Todd` (muted). See decision D2.

**Project grid** (below header, generous top margin):
- Responsive grid, **2 columns** on wide screens, 1 column when narrow (container-query driven).
- Each card: large radius (~20–24px), rich full-bleed imagery/thumbnail, subtle drop shadow, hover lift. Cards are the primary clickable element → navigate to `/work/:slug`.
- Below each card, a caption line: **`ProjectName`** (bold) `/ Tagline` (muted). Example: **SaveCantonese** / Volunteer Management System.
- Card *count and imagery come from Sanity content* — do not hardcode the number of cards. (The original mockup showed four; current content may have fewer. That's fine.) What matters is the card *treatment* (rich thumbnail, shadow, caption), which currently looks too flat — restore it to match the reference.

**Dock** (bottom center, shared): frosted rounded pill containing **home**, **work/briefcase**, **mail** icons + the **user avatar** (circular photo). Real icons and real navigation — not text placeholders.

---

## Layout spec — CASE STUDY (`/work/:slug`)

**Breadcrumbs** (top center, above the container): `Home / Work / {Title}` — "Home" and "Work" muted and clickable, current title bold.

**Container** (compact state): centered, frosted, large radius, floating on the textured background.

**Container chrome:**
- Top-left: **back (←)** and **forward (→)** in circular frosted buttons (prev/next case study).
- Top-right: **expand** (diagonal arrows) and **close (×)** in circular frosted buttons. Expand toggles compact↔expanded; close returns to Home.

**Case study header (inside container):**
- Left: project **logo/mark** + **Title** (large bold), e.g. `SaveCantonese`.
- Right: the **date/term**, muted, e.g. `Fall 2023`.

**Metadata row:** up to four columns, each a tiny uppercase muted **label** over a regular-weight **value**. Fields are content-driven (e.g. ROLE / TIMELINE / TEAM / TOOLS or DATE RANGE). Example: Product Designer · 5 Weeks · 4 Designers / 8 Devs · Figma.

**"View Solution" callout:** bordered rounded box. Left: "View Solution" heading + "If you're ready to see the solution, skip ahead." subtext. Right: a **"View Solution" / "Skip to Solution"** button (in-page anchor scroll to the solution section) + optional × to dismiss.

**Body blocks:** rendered via `BlockRenderer` — section headers (e.g. `OVERVIEW`, or numbered `01 Summary`), body text (max-measure width), image cards / image grids / callouts, etc. All must fit the container in both compact and expanded widths.

**Dock:** same shared dock. When a case study is open it may show a contextual state (e.g. an active/close affordance) — keep it consistent with the shared component.

---

## Known issues in the current build — fix these

1. **Icons fallback/placeholder glyphs everywhere** (header clock + music note, container back/forward/expand/close, dock). Diagnose why (missing icon library, unloaded icon font, or stub components) and wire a real icon set. Check what's already installed; if there's no icon library, add `lucide-react` and replace every placeholder glyph with the correct icon. No barcode/tofu glyphs should remain.
2. **Dock shows text placeholders ("h h h").** Replace with the real home / work / mail icons + avatar, each wired to its navigation.
3. **Now-playing is stubbed** ("Now Playing · Spotify"). Implement per decision D2.
4. **Home cards look flat.** Restore the rich card treatment (full-bleed thumbnail, radius, shadow, hover lift, caption line) to match the reference, driven by Sanity content.
5. Confirm the **expand/compact toggle** exists and works, and that **prev/next + swipe** work in both states. If expand was dropped during earlier drift, re-add it.

---

## Decisions I need you to surface (don't guess silently)

- **D1 — Peeking neighbor cards.** In the compact case-study view, colored cards may peek at the left/right edges behind the container. Confirm the intended source: (a) a decorative/carousel hint baked into the shell showing the neighboring case studies, or (b) nothing (remove them). Do **not** reintroduce a mounted Home page behind the container to fake this.
- **D2 — Now-playing source.** Options: (a) live Spotify integration later, with a clean static/prop-fed component now that matches the design; or (b) purely static. Default to (a) — build a `NowPlaying` component that takes `{ track, artist }` props and renders the music-note + text exactly like the reference, fed static data for now, easy to wire to a real source later. Flag if you'd do otherwise.
- **D3 — Visual polish source.** Fine visual styling (exact colors, spacing, shadows, card imagery) will be applied from my **Paper** designs in a later step against `PAPER_CONTRACT.md`. In THIS pass, fix structure/layout/broken chrome and get the tree close to the reference — don't over-invest in pixel-exact styling that Paper will define.

---

## Visual Effects

### Progressive Blur (Top Edge Dissolve)

The case study gray container features a **progressive blur** at its top edge that makes scrolling content softly blur and dissolve as it approaches the frame boundary, instead of being hard-clipped.

**Component:** `ProgressiveBlur` at `src/components/core/ProgressiveBlur.jsx`

**Props:**
- `edge`: `'top' | 'bottom' | 'left' | 'right'` (default: `'top'`) — which edge to blur
- `size`: string (default: `'160px'`) — height/width of the blurred region
- `maxBlur`: number (default: `12`) — base blur radius in px (compounds to much higher at edge)
- `layers`: number (default: `6`) — number of stacked blur layers (6 recommended, max 8)
- `tint`: boolean (default: `false`) — whether to fade container background to fully opaque at edge
- `tintColor`: string (default: `'rgb(240, 240, 240)'`) — color to fade to when tint is enabled
- `debug`: boolean (default: `false`) — show colored mask geometry instead of blur
- `className`: string — escape hatch for additional classes

**How it works:**

A single `backdrop-filter: blur()` layer produces a constant blur that can only fade in/out — it reads as "a blurry strip," not a smooth progressive dissolve. True progressive blur requires stacking N layers with **cumulative ramp masks** where blur compounds down the stack:

**Algorithm (cumulative ramps, NOT bands):**
1. `blur(k) = maxBlur / 2^(N-1-k)` — geometric progression, doubles each layer toward edge
2. `start(k) = (k / N) * 100` — percentage where this layer begins to fade in
3. `end(k) = ((k+1) / N) * 100` — percentage where this layer becomes fully opaque
4. `mask(k) = linear-gradient(<dir>, transparent start%, black end%)` — **TWO stops only**

Each layer fades in over its own range. Because `backdrop-filter` samples the composited result of sibling layers painted earlier, blur accumulates naturally. Layer 0 (weakest blur) renders first, layer N-1 (strongest blur) last.

**Why not bands?** An earlier implementation used narrow masked bands (transparent → opaque → opaque → transparent) where each layer was isolated to a window. This produces visible seams at every band boundary. The cumulative ramp approach eliminates seams entirely because there are no hard cutoffs — layer 0's bottom edge is a soft fade-in from zero opacity, and layers compound smoothly.

**Integration:**

The overlay is mounted as a direct child of the case study gray container (`CaseStudy.jsx:213`). The component uses `position: sticky` to stay fixed at the edge while content scrolls (Model A: scroll container with `overflow-y: auto`). The wrapper is constrained to `size` height/width. Child blur layers are absolutely positioned within the sticky wrapper and extend past the container's padding (`py-10` and `px-9`) via negative offsets to reach the actual frame edges.

**Critical stacking-context caveats:**

- `backdrop-filter` samples whatever is painted **behind** the element in the same stacking context
- Ancestors with `transform`, `filter`, `will-change`, or `perspective` create a containing block / stacking context that can silently break `backdrop-filter`
- The site uses `transform`-based swipe navigation between case studies (Framer Motion). The blur layers do NOT have `transform` themselves, so they remain in the same context as the scrolling content and sample it correctly during transitions
- Safari requires `-webkit-backdrop-filter` in addition to standard `backdrop-filter` or it will render nothing
- Each layer is `pointer-events: none` so the overlay never intercepts clicks or scroll
- `border-radius: inherit` on each layer ensures the blur respects the gray container's `rounded-tl-[70px] rounded-tr-[70px]` corners

**Tuning:**

Keep `layers` at 6–8. Each layer re-samples the backdrop; this is fill-rate intensive. Because blur now compounds, `maxBlur={12}` produces far more blur at the edge than the old band approach. A larger `size` (120px+) gives a gentler falloff; smaller values feel more aggressive.

Current settings in `CaseStudy.jsx:213`: `size="120px"`, `maxBlur={12}`, `layers={6}`, `tint={true}`.

Set `debug={true}` to see the mask geometry as colored stripes instead of blur — useful for diagnosing mask placement.

**Do not regress the algorithm:**
- Do not simplify back to a single blur layer — produces a "blurry strip," not a progressive dissolve
- Do not return to narrow masked bands (four-stop gradients with hard cutoffs) — produces visible seams at band boundaries
- The cumulative ramp approach with two-stop masks and compounding blur is load-bearing

---

## Deliverable

1. `SPEC.md` saved at repo root (this document).
2. The reconciliation applied: broken icons fixed with a real icon set, dock rebuilt with real icons + avatar + nav, now-playing per D2, Home card treatment restored, expand/compact + prev/next + swipe verified in both states.
3. Answers to D1/D2/D3 called out explicitly.
4. A short report of what you changed vs. what you left alone, and anything in the current code that fights this spec.

Start by saving `SPEC.md`, then give me the reconciliation report before making sweeping changes.
