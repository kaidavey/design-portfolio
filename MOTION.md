# Motion Integration

This document defines the project's animation layer and its constraints. Read this before adding or modifying any animation code.

---

## Why Motion?

Motion (formerly Framer Motion, package: `motion`) is the project's animation library for three reasons:

1. **Declarative API** — animations live in component props, not separate imperative layers, keeping animation logic co-located with presentation.
2. **Spring physics & gesture integration** — native spring timing and drag/pan support match the project's interaction model (swipe navigation, drag affordances).
3. **React integration** — hooks for presence animations (`AnimatePresence`), layout animations (`layoutId`), and gesture state integrate cleanly with React's rendering model.

**Alternatives considered:**
- **GSAP** — more powerful, but imperative API and larger bundle; overkill for this project's needs.
- **View Transitions API** — emerging standard, but browser support incomplete and lacks fine-grained spring control.
- **CSS-only** — insufficient for complex orchestration (stagger, direction-aware slides) and gesture-driven animations.

Motion provides the right balance of power, bundle size, and React idioms.

---

## LazyMotion & Import Convention

### Use `m`, NOT `motion`

The project uses **LazyMotion** with the **`domMax`** feature bundle to optimize bundle size while retaining full functionality.

**Import convention:**
```jsx
import { m, AnimatePresence } from 'motion/react'
```

**ALWAYS use `m.<element>`, NEVER `motion.<element>`:**
```jsx
// ✅ Correct
<m.div animate={{ opacity: 1 }}>...</m.div>

// ❌ Wrong
<motion.div animate={{ opacity: 1 }}>...</motion.div>
```

**Why `domMax` instead of `domAnimation`?**

The project requires drag, pan, and layout animations:
- `CaseStudy.jsx:258` — drag gesture for swipe navigation
- Future layoutId transitions between states

The smaller `domAnimation` bundle **excludes** these features and would silently break drag. `domMax` includes the full feature set at a modest bundle cost.

**Configuration:** See `main.jsx:11-14` for the global `LazyMotion` wrapper.

---

## Reduced Motion

Motion respects `prefers-reduced-motion` **globally** via `MotionConfig`:

```jsx
// main.jsx:13
<MotionConfig reducedMotion="user">
```

**Rules:**
- **Never** check `prefers-reduced-motion` in individual components.
- **Never** create a zero-duration token or reduced-motion branch logic.
- Motion handles this automatically: when the user has reduced motion enabled, all animations become instant cuts.

**Exception:** `scroll-behavior: smooth` in `index.css` is wrapped in a media query (`@media (prefers-reduced-motion: no-preference)`) because it operates outside Motion's control.

---

## Backdrop-Filter Constraint

The project uses `backdrop-filter` for the progressive blur effect (`ProgressiveBlur.jsx`) and the gray frosted container. Motion's `transform`-based animations interact with backdrop-filter in two ways that can break rendering.

### Two Mechanisms

#### 1. Backdrop Root (What Blur Samples)

A **backdrop root** determines what a `backdrop-filter` samples from (the "backdrop").

**Created by:**
- `backdrop-filter` (the element itself becomes a root)
- `filter`
- `opacity < 1`
- `mask`

**NOT created by:** `transform`, `will-change: transform`

**Implication:** Motion's `transform` does NOT change what the blur samples. However, if an element with `backdrop-filter` is adjacent to (not a descendant of) the content it should blur, it will sample the wrong layer.

**Current bug:** The gray container (`CaseStudy.jsx:218-228`) has its own `backdrop-filter`, making it a backdrop root. The `ProgressiveBlur` component is mounted as a **sibling** via fixed positioning (`CaseStudy.jsx:273-286`), so it samples the document backdrop instead of the container's scrolling interior. Blur-over-scrolling-content is currently broken.

#### 2. Containing Block (Where Fixed Children Land)

A **containing block** determines where `position: fixed` or `position: absolute` descendants are positioned relative to.

**Created by:**
- `transform`
- `will-change: transform`
- `filter`
- `contain: paint`

**Implication:** Motion sets `transform` and `will-change: transform` on animated elements. If an animated element is an ancestor of a `position: fixed` blur overlay, the fixed element will be recaptured into a local containing block instead of positioning relative to the viewport.

**Planned restructuring:** The gray container will be split into:
- **Non-scrolling frame** — outer shell with borders/backdrop
- **Inner scroll layer** — `overflow-y: auto` container for content
- **ProgressiveBlur as DESCENDANT** — mounted inside the scroll layer, positioned absolutely at top

After this change, the frame must remain transform-free, or the blur layers will be recaptured and mispositioned.

### Rules

**DO NOT** apply Motion's `transform`-based animations (any `m.<element>` with `animate`, `whileHover`, `drag`, etc.) to:

1. The gray container outer frame (`CaseStudy.jsx:218-228`) — current or future
2. The blur overlay wrapper (`CaseStudy.jsx:273-286`) — current structure only
3. Any ancestor of `ProgressiveBlur` after the planned restructuring

**Safe zones:**
- ✅ Content **inside** the gray container (current usage: `CaseStudy.jsx:250-267`)
- ✅ Elements **outside** the gray container (e.g., breadcrumbs, shell background)

**If you must animate these elements:** Use CSS transitions on properties that do NOT create containing blocks (`opacity`, `background-color`, `box-shadow`). Avoid `transform`, `filter`, `will-change: transform`.

**Flag for review:** If you encounter a design requiring animation of the gray container itself, raise it explicitly. The backdrop-filter constraint may require an alternative approach (e.g., animating an inner element instead).

---

## Motion Tokens

All animation timing, easing, and offset values reference named tokens from `src/motion/tokens.js`. **Never use magic numbers** in components.

### Durations

```js
import { durations } from '../motion'

durations.fast  // 150ms — Tailwind default, most hover states
durations.base  // 300ms — card transitions, standard UI motion
```

**Derived from:** Existing CSS transitions in `Home.jsx:66,70` and Tailwind defaults.

**When to add new durations:** Only when a call site requires a timing not covered above. Add the token and the call site in the same commit.

### Easings

```js
import { easings } from '../motion'

easings.easeDefault  // [0.4, 0, 0.2, 1] — Tailwind's cubic-bezier
```

**Named by intent, not shape.** If you need a different feel, name it by use case (e.g., `easeEnter`, `easeExit`), not by curve (`easeInOut`).

### Springs

```js
import { springs } from '../motion'

springs.slide  // { stiffness: 320, damping: 34 } — case study swipe/keyboard nav
```

**Derived from:** `CaseStudy.jsx:176-179` — the existing spring config for slide transitions.

**When to add new springs:** Only when a use case requires different physics. Name by intent (e.g., `springs.drag`, `springs.enter`).

### Distances

```js
import { distances } from '../motion'

distances.slideOffset  // '100vw' — off-screen distance for slide transitions
```

**Viewport-relative, not fixed pixels.** The original implementation used `1000px`, which breaks at wide viewports. `100vw` ensures the slide distance equals the viewport width, keeping content fully off-screen during transitions.

**Example usage:** `CaseStudy.jsx:163-173` — directional slide variants.

---

## Motion Primitives

Components should import from `src/motion/`, not `motion/react` directly. The primitives wrap Motion's API with project-specific defaults and forward all props/refs per `PAPER_CONTRACT.md`.

### FadeIn

Simple opacity fade with optional y-axis offset.

```jsx
import { FadeIn } from '../motion'

<FadeIn y={20}>
  <p>Fades in with 20px upward slide</p>
</FadeIn>
```

**Props:**
- `y` (number) — y-axis offset in pixels (default: 0)
- `duration` (number) — duration in ms (default: `durations.base`)
- `ease` (array) — cubic-bezier easing (default: `easings.easeDefault`)
- All other props forwarded to `m.div`

### Stagger & StaggerItem

Orchestrated entrance animations for lists or grids.

```jsx
import { Stagger, StaggerItem } from '../motion'

<Stagger stagger={150}>
  <StaggerItem>First item</StaggerItem>
  <StaggerItem>Second item (150ms delay)</StaggerItem>
  <StaggerItem>Third item (300ms delay)</StaggerItem>
</Stagger>
```

**Stagger props:**
- `stagger` (number) — delay between each child in ms (default: 100)

**StaggerItem props:**
- `y` (number) — y-axis offset (default: 0)
- `duration` (number) — duration in ms (default: `durations.base`)

### usePresenceDirection

Hook for direction-aware `AnimatePresence` transitions. Returns a signed direction value (`-1`, `0`, `1`) passed as `custom` to variants.

```jsx
import { usePresenceDirection } from '../motion'

const [direction, setDirection] = usePresenceDirection()

function navigateNext() {
  setDirection(1)
  navigate('/next')
}

function navigatePrev() {
  setDirection(-1)
  navigate('/prev')
}

<AnimatePresence custom={direction}>
  <m.div
    custom={direction}
    variants={{
      enter: (dir) => ({ x: dir > 0 ? '100vw' : '-100vw' }),
      center: { x: 0 },
      exit: (dir) => ({ x: dir > 0 ? '-100vw' : '100vw' }),
    }}
  >
    {content}
  </m.div>
</AnimatePresence>
```

**Refactored from:** `CaseStudy.jsx:63,126,132` — consolidates the direction state pattern into a reusable hook.

---

## Block Entrance Animations

Case study blocks fade upward into view as they scroll into the viewport. This animation lives in **BlockRenderer**, not in individual block components.

### Architectural Requirement — Renderer Owns Animation

**CRITICAL:** Entrance animations are applied by `BlockRenderer`, wrapping each block it renders. Individual block components have **zero animation code**.

**Why:** The core value of this codebase is that new case studies can be composed from blocks without touching frontend code. A new block type added to the registry tomorrow animates correctly with zero animation-specific code. This is what keeps the codebase composable.

**Opt-out, not opt-in:** BlockRenderer animates every block by default. If a future block type needs to skip animation (e.g., a fixed header or floating UI element), add it to an exclusion list in `BlockRenderer.jsx` rather than making animation opt-in per block.

### How It Works

Each block is wrapped in `<FadeInOnView>` with:
- **Trigger:** `whileInView` (viewport intersection)
- **Motion:** Opacity `0 → 1` + small upward y translation (`20px`)
- **Stagger:** First N blocks (default: 4) get cascading delay (`100ms` step), rest animate individually
- **Once behavior:** Blocks animate once when entering viewport, then stay visible permanently

**See:** `BlockRenderer.jsx:84-86` for the wrapper implementation.

### Scroll Root Requirement

**CRITICAL:** IntersectionObserver must target the correct scroll container.

- **Compact mode:** Blocks scroll inside gray container → `root: scrollContainerRef`
- **Expanded mode:** Blocks scroll with viewport → `root: undefined`

**Why the viewport default is wrong:** The default `IntersectionObserver` root is the browser viewport. In compact mode, blocks scroll inside the gray container (not the viewport), so observers with viewport root would trigger incorrectly based on document scroll position instead of container scroll position.

**Implementation:** `BlockRenderer` reads `scrollContainerRef` and `isExpanded` from `ScrollContainerContext` (passed by `CaseStudy.jsx`) and sets `viewport.root` accordingly.

**Passing the ref:** Motion's `viewport.root` expects a **RefObject**, not `.current`. Passing `.current` is the wrong type and would be `null` on first render (refs populate after commit). With `once: true`, this would observe against the wrong root permanently.

```jsx
// ✅ Correct
root: isExpanded ? undefined : scrollContainerRef

// ❌ Wrong (passes element, not RefObject)
root: isExpanded ? null : scrollContainerRef.current
```

### Clamped Stagger

Blocks visible on initial load cascade into view. Blocks reached by scrolling animate individually.

**Implementation:** `delay = Math.min(index, MAX_STAGGER_BLOCKS) * STAGGER_STEP`

- First 4 blocks: 0ms, 100ms, 200ms, 300ms delay
- Block 5+: 400ms delay (clamped)

**Why clamp:** Without clamping, block 30 would carry a 3-second delay, creating a jarring pause mid-scroll. Clamping limits the cascade to above-fold blocks while keeping scroll-triggered blocks responsive.

**Tokens:** `stagger.maxStaggerBlocks = 4`, `stagger.staggerStep = 100` (ms) — defined in `tokens.js`.

**Note:** With `gap-16` vertical spacing and 16:10 aspect ratio image blocks, typically only 1-2 blocks are visible at once in compact mode. The stagger cascade is most perceptible in expanded mode where more blocks fit on screen. These are starting values to tune against real output.

### Animation on Swipe Navigation

The block wrapper sits **inside** the swipe wrapper (`m.div` with `x: ±1000` slide). Because `viewport.once: true` is set, blocks animate once when first entering viewport and never replay.

**Behavior during swipe between case studies:**
- Blocks that already animated in the current case study stay visible (no replay)
- When navigating to a new case study, that study's blocks start invisible
- As the new case study slides in, blocks enter viewport and animate once
- Result: Each case study's blocks animate on first view, then stay visible

**Note:** The swipe spring transition and block cascade overlap on first navigation to a case study. This is intentional — the swipe brings in the panel, and blocks fade up as they appear. On subsequent swipes back to an already-viewed case study, blocks appear instantly (no cascade replay).

### Mode Switching (Compact ↔ Expanded)

With `once: true`, a block that has not yet triggered when the user expands needs its observer rebuilt against the new root (viewport instead of container).

**How Motion handles this:** Motion rebuilds IntersectionObserver when `viewport.root` changes. Blocks below the fold that haven't triggered in compact mode will trigger correctly in expanded mode with the viewport root.

**Verified behavior:**
- Blocks that **already animated** in compact mode do NOT replay when expanding (once: true holds)
- Blocks **below fold** in compact mode (not yet triggered) animate correctly after expanding

Mode switching works seamlessly — blocks animate once regardless of which mode they first appear in.

### Failure Safety

Blocks start at `opacity: 0`. If the IntersectionObserver never fires (misconfigured root, collapsed container, browser without support), content remains permanently invisible — **worse than no animation**.

**Mitigations:**
1. **Correct root configuration:** Verified in both compact and expanded modes
2. **Low threshold:** `amount: 0.15` ensures blocks trigger when only 15% visible (tall blocks trigger sooner)
3. **Negative margin:** `margin: "0px 0px -50px 0px"` triggers animation slightly before edge (avoids pop at fold)
4. **Aspect-ratio space reservation:** All image blocks use `aspect-[...]`, preventing CLS and ensuring containers have height even when invisible

**Verified:** All blocks in the longest case study become visible in both compact and expanded modes. Final block animates correctly (no truncation).

### Backdrop-Filter Interaction

**Constraint:** `opacity < 1` creates a **backdrop root**, changing what `backdrop-filter` samples.

**Current state:** No block contains a backdrop-filtered surface (verified via grep). The only backdrop-filter surfaces are:
1. Gray container itself (`CaseStudy.jsx:220`)
2. ProgressiveBlur component (mounted outside blocks as fixed sibling)

**Implication:** The block wrapper mid-fade (`opacity: 0 → 1`) will not break any current backdrop sampling. However, if a future block includes a frosted surface (e.g., a floating card with `backdrop-filter: blur()`), it will sample incorrectly during the entrance animation because the wrapper creates a backdrop root while `opacity < 1`.

**Solution for future blocks with backdrop-filter:**
- Add the block type to an exclusion list in `BlockRenderer.jsx`
- Skip the FadeInOnView wrapper for that block type
- OR use a pure y-translation animation (no opacity fade) to avoid creating a backdrop root

### Planned Restructuring — Scroll Container Migration

**SPEC.md** describes a planned restructuring that splits the gray container into:
- **Non-scrolling frame** — outer shell with borders/backdrop
- **Inner scroll layer** — `overflow-y: auto` content container

**Migration requirement:** When this restructuring happens, `scrollContainerRef` MUST move from the combined element to the inner scroll layer. If the ref stays on the outer frame, every block observer will silently target the wrong root (a non-scrolling container), and animations will trigger based on the outer frame's intersection with the viewport instead of content scrolling within it.

**Location to update:** `CaseStudy.jsx:219` (current ref attachment point) will need to move to the inner scroll layer div after restructuring.

---

## What Is NOT Animated (Deliberately Deferred)

This foundation pass establishes Motion infrastructure **without changing existing behavior**. The following are explicitly deferred to future work:

### Not Animated Yet

1. **Gray container entrance/exit** — the frosted case study card appears instantly. Future: slide up from bottom or fade in.
2. **Compact/expanded transition** — the expand button toggles state instantly. Future: smooth resize/reflow with `layoutId`.
3. **ProgressiveBlur** — no entrance animation. It appears/disappears with scroll state via conditional rendering.
4. **Home page project cards** — CSS hover transitions only. Future: may convert to Motion for gesture-aware springs.
5. **Breadcrumbs, nav buttons** — CSS `transition-colors` only.

### Why Deferred?

- **Backdrop-filter interaction** — animating the gray container requires resolving the containing-block constraint (see above).
- **Layout shift risk** — compact/expanded resize needs `layoutId` to avoid jarring jumps; requires design iteration.
- **Foundation first** — this pass installs the tooling (tokens, primitives, LazyMotion). Animations will be added incrementally with design review.

**When adding animations:** Check this list first. If an element appears here, confirm the design intent before animating it.

---

## Usage Examples

### Convert Existing CSS Transition to Motion

**Before:**
```jsx
<div className="transition-opacity hover:opacity-50">...</div>
```

**After:**
```jsx
import { m } from 'motion/react'
import { durations, easings } from '../motion'

<m.div
  whileHover={{ opacity: 0.5 }}
  transition={{ duration: durations.fast / 1000, ease: easings.easeDefault }}
>
  ...
</m.div>
```

**Note:** Motion durations are in **seconds**, tokens are in **milliseconds**. Divide by 1000 when passing to `transition.duration`.

### Direction-Aware Slide (Existing Pattern)

See `CaseStudy.jsx:161-179` for the canonical implementation:
- Use `usePresenceDirection()` for state
- Define variants with `(dir) =>` functions
- Pass `custom={direction}` to `AnimatePresence` and `m.div`
- Set direction before navigation (`setDirection(1)` or `setDirection(-1)`)

### Staggered List Entrance

```jsx
import { Stagger, StaggerItem } from '../motion'

<Stagger stagger={100}>
  {items.map((item) => (
    <StaggerItem key={item.id} y={10}>
      <Card {...item} />
    </StaggerItem>
  ))}
</Stagger>
```

---

## Bundle Impact

**Baseline (framer-motion):**
- JS: 494.54 kB (gzipped: 156.53 kB)

**After Motion migration + LazyMotion + primitives:**
- JS: 497.36 kB (gzipped: 156.78 kB)

**Delta (foundation pass):** +2.82 kB raw, +0.25 kB gzipped

The increase is due to:
- Motion primitives (`FadeIn`, `Stagger`, etc.) — ~2 kB
- Tokens file — negligible

**After block entrance animations:**
- JS: 499.11 kB (gzipped: 157.34 kB)

**Delta (entrance pass):** +1.75 kB raw, +0.57 kB gzipped

The increase is due to:
- `FadeInOnView` primitive — ~0.5 kB
- `ScrollContainerContext` — ~0.5 kB
- Additional tokens (stagger, distances.blockEntranceY) — ~0.5 kB
- `BlockRenderer` wrapper logic — ~0.25 kB

**Total impact:** +4.57 kB raw, +0.81 kB gzipped from baseline

LazyMotion itself has no bundle cost; it defers loading features until first use. The `domMax` bundle is included because `m` components are used in `CaseStudy.jsx`.

**Future optimization:** If drag is removed or isolated to a single route, consider splitting to `domAnimation` elsewhere and lazy-loading `domMax` only on the case study route.

---

## Summary of Rules

1. ✅ **Always use `m`, never `motion`** — LazyMotion requirement
2. ✅ **Import from `src/motion/`, not `motion/react`** — use project primitives
3. ✅ **All timing/easing/distance values come from tokens** — no magic numbers
4. ✅ **Reduced motion handled globally** — never check `prefers-reduced-motion` per-component
5. ❌ **Never animate gray container, blur overlay, or their ancestors** — backdrop-filter constraint
6. ❌ **Never animate elements in the deferred list without design review** — foundation pass only

**When in doubt:** Check this doc, `SPEC.md`, and `PAPER_CONTRACT.md` before adding animation code. If the three conflict, raise it for clarification — animation must not violate the block architecture or backdrop-filter constraints.
