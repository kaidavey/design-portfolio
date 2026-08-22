# Paper Contract — Block Component Generation Rules

This document defines the exact interface Paper must generate to. Follow these rules precisely.

---

## Architecture Overview

### Shell & Routes
- **Home** and **CaseStudy** are two real routes (not modal-over-Home)
- Both share `Shell.jsx` component (container + dock + chrome)
- Shell has swappable **header slot**:
  - Home: bio + status
  - CaseStudy: breadcrumbs + prev/next/expand controls
- CaseStudy route has **two presentation states**:
  - **Compact**: ~800px container (readable, centered)
  - **Expanded**: full-width container (uses full viewport)
- User toggles between compact/expanded via expand button
- Swipe animation lives in CaseStudy route, works in both states

### Content Flow
```
Shell (@container on .shell__container)
  ├─ Header slot (swaps per route)
  └─ Content area
      └─ BlockRenderer (gap-16 stack)
          ├─ Block 1 (sees container width)
          ├─ Block 2 (sees container width)
          └─ Block N (sees container width)
```

---

## Container Contract

### Rule 1: Blocks Size Relative to Container
Blocks **MUST** use container-query variants (`@md:`, `@lg:`, `@xl:`), **NEVER**:
- Viewport units (`vw`, `vh`)
- Fixed pixel widths (`w-[770px]`, `w-83.25`)
- Viewport breakpoints (`md:`, `lg:`) - use `@md:`, `@lg:` instead

### Rule 2: Container Widths Blocks Will See

| State | Container Width | When @lg Triggers |
|-------|----------------|-------------------|
| **Compact** | ~804px (900px - 96px padding) | ✅ Yes (> 1024px) |
| **Expanded** | ~1344px (1440px viewport - 96px padding) | ✅ Yes |

**Key insight**: `@md:` triggers in compact, `@lg:` and `@xl:` only in expanded.

### Rule 3: Readable Max-Width for Text Blocks
Text-heavy blocks (paragraphs, long-form content) **MAY** use:
```jsx
className="max-w-readable mx-auto"
```
Where `max-w-readable` = `70ch` (~770px at 16px font-size).

**Do NOT** apply to:
- Image grids
- Multi-column layouts
- Blocks that should fill container width

### Rule 4: Full-Bleed Blocks
Blocks that need to break out to container edges:
```jsx
import { fullBleed } from '../../utils/containerUtils'

<div className={fullBleed()}>
  {/* Background/border bleeds full-width, content inset by shell padding */}
</div>
```

**Example use cases**: Full-width background color, section dividers, image carousels.

### Rule 5: Both States Have @container Context
Shell establishes `container-type: inline-size` on `.shell__container`.
Blocks inherit this context in **both** compact and expanded states.

---

## Two-Layer Block Architecture

Paper generates **presentation components only**. A thin wrapper connects Sanity to presentation.

### Layer 1: Presentation Component (Paper generates this)
**File**: `src/components/blocks/presentations/<Name>Presentation.jsx`

```jsx
/**
 * <Name>Presentation - Pure presentation component
 *
 * Props: Plain, well-named JavaScript values
 * No Sanity coupling, no side effects
 */
export default function TextImageRowPresentation({
  title,
  paragraphs = [],
  subtitle,
  media,
}) {
  return (
    <div className="flex flex-col @lg:flex-row items-start gap-8">
      <div className="flex-1">
        <h2 className="text-2xl font-medium">{title}</h2>
        {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        {subtitle && <p className="text-gray-500">{subtitle}</p>}
      </div>
      <CaseStudyMedia media={media} maxWidth={900} fillClassName="flex-1 rounded-[20px]" />
    </div>
  )
}
```

**Presentation Component Rules:**
1. ✅ Receive plain props (strings, arrays, numbers)
2. ✅ Use theme tokens (see Theme Tokens section)
3. ✅ Size via container queries (`@md:`, `@lg:`)
4. ✅ No Sanity imports (`urlFor`, `client`)
5. ✅ No mount/entrance animations
6. ✅ No side effects (fetching, state)

### Layer 2: Block Wrapper (Developer writes this)
**File**: `src/components/blocks/<Name>.jsx`

```jsx
import TextImageRowPresentation from './presentations/TextImageRowPresentation'

/**
 * TextImageRow - Block wrapper
 * Maps Sanity block → presentation props
 */
export default function TextImageRow({ block }) {
  return (
    <TextImageRowPresentation
      title={block.title}
      paragraphs={block.paragraphs || []}
      subtitle={block.subtitle}
      media={block.media}
    />
  )
}
```

**Wrapper Responsibilities:**
- Import presentation component
- Map `block.<field>` → plain props
- Pass images through as `caseStudyImage` values — `CaseStudyMedia` builds the
  URLs, so no wrapper calls `urlFor()` for a content image
- Handle optional fields (defaults)
- Export for BlockRenderer

### Layer 3: Registry Entry (Developer adds this)
**File**: `src/components/BlockRenderer.jsx`

```jsx
import TextImageRow from './blocks/TextImageRow'

const blockRegistry = {
  textImageRow: TextImageRow,  // ← Add one line
  // ... other blocks
}
```

---

## Plain-Prop Interfaces for Existing Blocks

Paper must generate presentations matching these prop shapes exactly.

### 1. projectDetails
```typescript
{
  role: string
  timeline: string
  team: string
  tools: string
}
```

### 2. hero
```typescript
{
  iconUrl?: string
  title: string
}
```

### 3. textImageRow
```typescript
{
  title: string
  paragraphs: string[]
  subtitle?: string
  media: CaseStudyImage   // see "The image primitive" below
}
```

### 4. imageRow
```typescript
{
  images: CaseStudyImage[]
}
```

### 5. imageTextGrid
```typescript
{
  columns: Array<{
    media: CaseStudyImage
    subtitle: string
    description: string
  }>
}
```

### 6. callToAction
```typescript
{
  title: string
  description: string
  buttonText: string
  buttonLink?: string
}
```

### 7. textBlockCentered
```typescript
{
  section?: string
  title?: string
  body: string
}
```

### 8. textCardRow
```typescript
{
  cards: Array<{
    iconUrl?: string
    subtitle: string
    description: string
  }>
}
```

### 9. textColumns
```typescript
{
  section?: string
  title: string
  paragraphs: string[]
  subtitle?: string
}
```

### 10. textRowTwoColumn
```typescript
{
  section?: string
  title?: string
  leftParagraphs: string[]
  rightParagraphs: string[]   // rendered muted
}
```

### 11. imageFull
```typescript
{
  imageSource: SanityImage    // passed to CaseStudyImage, not a URL
  imageAlt: string
  caption?: string
}
```

### 12. framedImage
```typescript
{
  imageSource: SanityImage
  imageAlt: string
  caption?: string
  frame?: ImageFrame
}
```

---

## The Image Primitive

Every image in a case study is a `caseStudyImage`. That is what lets a framed
device shot go anywhere a plain image goes — a column of an image row, a cell
of an image + text grid, the image half of a text + image row.

```typescript
type CaseStudyImage = {
  image: SanityImage       // dereferenced, carries asset.metadata.dimensions
  alt?: string
  caption?: string
  framed?: boolean         // false → fills the slot; true → sits in a frame
  frame?: ImageFrame
}

type ImageFrame = {
  aspectRatio: '16/10' | '16/9' | '4/3' | '3/2' | '1/1' | '3/4' | '9/16'
  padding: 'none' | 'sm' | 'md' | 'lg'
  background: 'surface' | 'light' | 'dark'
}
```

**Render one with `<CaseStudyMedia>`, never by hand.** It is the single place
that decides plain vs framed:

```jsx
import CaseStudyMedia from '../../CaseStudyMedia'

<CaseStudyMedia
  media={media}
  sizes="(max-width: 640px) 92vw, 448px"
  maxWidth={900}
  fillClassName="w-full rounded-[20px] object-cover"   // unframed only
/>
```

### The two behaviours

|  | Plain image | Framed image |
|---|---|---|
| Width | fills the slot | frame fills the slot |
| Height | from the image's own proportions | from the frame's ratio |
| Fit | `object-cover` — may crop | `object-contain` — **never** crops |
| What resizes | the image | the frame; the image is only scaled down to fit |

A frame is height-capped at `--frame-max-height` with its width derived from
the ratio, so a portrait frame stays on screen instead of becoming a column of
gray. `frameBoxStyle()` in `src/config/imageFrame.js` owns that maths — the
frame and its skeleton both read it, so they agree on the height.

---

## Structural Blocks

One block type is layout, not content, and Paper does not generate a
presentation for it:

**`blockGroup`** — a run of blocks sharing one gap, so a section can be spaced
tighter or looser than the body's 32px default. `BlockRenderer` renders it as a
nested flex column with an inline `gap`.

The rule it imposes on everything else: **`data-block-index` runs in document
order across the whole tree, and a group claims no index of its own.**
`measureVisibleCut` walks those indices flat and stops at the first block past
the fold; `AnimatedBlock` then hides every block past the cut. Both hold only
while the numbering increases down the page. Any future block that nests other
blocks must contribute its children to that sequence and never itself.

## Theme Tokens

Paper must use semantic token classes, **not** raw values.

**Import tokens**: `import { tokens } from '../../../theme/tokens'`

### Typography
```javascript
// Font family
font-['DM_Sans',system-ui,sans-serif]  // Use this exact string

// Font sizes
tokens.fontSizes.sm    // text-sm (14px)
tokens.fontSizes.base  // text-base (16px)
tokens.fontSizes.lg    // text-lg (18px)
tokens.fontSizes['2xl'] // text-2xl (24px)

// Font weights
tokens.fontWeights.normal   // font-normal
tokens.fontWeights.medium   // font-medium
tokens.fontWeights.semibold // font-semibold

// Tracking
tokens.letterSpacing.tight // tracking-tight (-0.025em)
```

### Colors
```javascript
// Text
tokens.colors.textPrimary    // text-black
tokens.colors.textSecondary  // text-[#2F2F2F]
tokens.colors.textMuted      // text-[#0000004D]

// Backgrounds
tokens.colors.bgWhite        // bg-white
tokens.colors.bgGray         // bg-[#F2F2F2]

// Borders
tokens.colors.borderGray     // border-[#DEDEDE]
```

### Spacing
```javascript
tokens.spacing.md   // gap-4 (16px)
tokens.spacing.lg   // gap-6 (24px)
tokens.spacing.xl   // gap-8 (32px)
```

### Border Radius
```javascript
tokens.radii.lg     // rounded-[20px] (standard for images/cards)
tokens.radii.md     // rounded-xl (12px)
```

**Prefer tokens over raw values.** If a value isn't in tokens, use Tailwind standard classes (e.g., `text-gray-600`) rather than arbitrary values.

---

## Animation Rules

### ✅ Shell Owns Transitions
The Shell/CaseStudy route handles:
- Swipe transitions between case studies (framer-motion)
- Page-level enter/exit animations

### ❌ Blocks Must NOT Animate
Paper-generated presentation components must:
- Have **no mount/entrance animations**
- Have **no exit animations**
- Render instantly with final styles

**Why**: Block animations fight the shell's swipe transition. Blocks appear/disappear as the panel slides, creating visual chaos.

**Exceptions**: Hover states, interactive micro-animations (button press) are fine.

---

## Responsive Patterns

### Pattern 1: Stack → Side-by-Side
```jsx
<div className="flex flex-col @lg:flex-row gap-8">
  <div className="@lg:flex-1">Left</div>
  <div className="@lg:flex-1">Right</div>
</div>
```

### Pattern 2: Grid Columns
```jsx
<div className="grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3 gap-4">
  {items.map(item => <div key={item.id}>...</div>)}
</div>
```

### Pattern 3: Image Aspect Ratio
```jsx
<img className="w-full aspect-[16/10] rounded-[20px] object-cover" />
```

### Pattern 4: Readable Text Width
```jsx
<div className="max-w-readable mx-auto">
  <p>Long paragraph...</p>
</div>
```

---

## Reference Example: TextImageRow

### ✅ Presentation Component
**File**: `src/components/blocks/presentations/TextImageRowPresentation.jsx`

*(Abridged — the live file renders its image through `CaseStudyMedia`, per
"The Image Primitive" above.)*

```jsx
export default function TextImageRowPresentation({
  title,
  paragraphs = [],
  subtitle,
  media,
}) {
  return (
    <div className="flex flex-col @lg:flex-row items-start @lg:items-center gap-8 @lg:justify-between max-w-readable @lg:max-w-none mx-auto">
      {/* Text column */}
      <div className="flex flex-col items-start gap-4 flex-1">
        <h2 className="tracking-tight font-['DM_Sans',system-ui,sans-serif] font-medium text-black text-2xl">
          {title}
        </h2>
        <div className="flex flex-col items-start gap-2 w-full">
          {paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className="tracking-tight font-['DM_Sans',system-ui,sans-serif] text-black text-base"
            >
              {paragraph}
            </p>
          ))}
          {subtitle && (
            <p className="tracking-tight font-['DM_Sans',system-ui,sans-serif] text-[#0000004D] text-base">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Image column — plain or framed, CaseStudyMedia decides */}
      <div className="flex-1 w-full @lg:w-auto @lg:max-w-md">
        <CaseStudyMedia
          media={media}
          sizes="(max-width: 640px) 92vw, 448px"
          maxWidth={900}
          fillClassName="w-full rounded-[20px] object-cover"
        />
      </div>
    </div>
  )
}
```

**Notice**:
- ✅ Container queries (`@lg:flex-row`, `@lg:items-center`)
- ✅ Plain props (no `block.field`)
- ✅ Theme tokens (font, colors, radii)
- ✅ Readable max-width for text, flexible for layout
- ✅ No animations
- ✅ No Sanity coupling

### ✅ Block Wrapper
**File**: `src/components/blocks/TextImageRow.jsx`

```jsx
import TextImageRowPresentation from './presentations/TextImageRowPresentation'

export default function TextImageRow({ block }) {
  return (
    <TextImageRowPresentation
      title={block.title}
      paragraphs={block.paragraphs || []}
      subtitle={block.subtitle}
      media={block.media}
    />
  )
}
```

**Notice**:
- ✅ Imports presentation
- ✅ Maps Sanity fields → plain props
- ✅ Passes the image through as a `caseStudyImage`, so `CaseStudyMedia` can
  decide plain vs framed — the wrapper does not build URLs itself
- ✅ Handles optional fields

### ✅ Registry Entry
**File**: `src/components/BlockRenderer.jsx`

```jsx
import TextImageRow from './blocks/TextImageRow'

const blockRegistry = {
  textImageRow: TextImageRow,
  // ... other blocks
}
```

---

## Workflow for Adding a New Block

### Step 1: Paper Generates Presentation Component
```
src/components/blocks/presentations/NewBlockPresentation.jsx
```
- Receives plain props
- Uses container queries
- Uses theme tokens
- No animations

### Step 2: Developer Writes Wrapper
```
src/components/blocks/NewBlock.jsx
```
- Imports presentation
- Maps `block.*` → plain props

### Step 3: Developer Adds Registry Entry
```javascript
// BlockRenderer.jsx
import NewBlock from './blocks/NewBlock'

const blockRegistry = {
  newBlock: NewBlock,  // ← Add this line
  // ...
}
```

**Done.** No other files need updating.

---

## Checklist for Paper

Before generating a block component, verify:

- [ ] Presentation component has plain-prop interface
- [ ] Uses `@md:`, `@lg:`, `@xl:` container queries (NOT viewport `md:`, `lg:`)
- [ ] No fixed pixel widths or `vw` units
- [ ] Uses theme tokens for fonts, colors, spacing, radii
- [ ] No mount/entrance/exit animations
- [ ] No Sanity imports
- [ ] Text blocks use `max-w-readable` if appropriate
- [ ] Images go through `<CaseStudyMedia>`, never a bare `<img>` or `urlFor()`
- [ ] Works in both compact (~800px) and expanded (~1344px) containers

---

## Common Mistakes to Avoid

### ❌ DON'T: Use viewport breakpoints
```jsx
<div className="md:flex-row">  // ❌ Wrong - viewport-based
```

### ✅ DO: Use container breakpoints
```jsx
<div className="@md:flex-row">  // ✅ Correct - container-based
```

---

### ❌ DON'T: Hardcode container widths
```jsx
<div className="max-w-[770px] mx-auto">  // ❌ Defeats container queries
```

### ✅ DO: Let container control width
```jsx
<div className="w-full">  // ✅ Or omit width entirely
```

---

### ❌ DON'T: Mix presentation with data
```jsx
export default function Block({ block }) {
  return <div>{block.title}</div>  // ❌ Presentation sees Sanity
}
```

### ✅ DO: Separate layers
```jsx
// Presentation
export default function BlockPresentation({ title }) {
  return <div>{title}</div>  // ✅ Plain prop
}

// Wrapper
export default function Block({ block }) {
  return <BlockPresentation title={block.title} />  // ✅ Mapping layer
}
```

---

### ❌ DON'T: Add mount animations
```jsx
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
  // ❌ Fights shell animation
</motion.div>
```

### ✅ DO: Render immediately
```jsx
<div>  // ✅ No animation
  {/* content */}
</div>
```

---

## Questions?

If Paper encounters ambiguity:
1. Check this contract first
2. Reference `TextImageRowPresentation.jsx` as the canonical example
3. Use theme tokens from `src/theme/tokens.js`
4. Default to container-relative sizing (flex, grid, percentages)

**When in doubt**: Less is more. Simple, responsive, token-based components work in both compact and expanded states.
