# Codebase Audit Report — Paper Integration Seams

## Executive Summary

**CRITICAL MISMATCH**: The current architecture does **NOT** match your described mental model. You described "two real routes that share a shell," but the codebase has **three distinct presentation modes** with **NO shared shell component**. This must be resolved before Paper generates blocks.

---

## 1. Shell Factoring ⚠️ **ISSUE FOUND**

### Your Mental Model
> "Home and Case Study are two real routes that share a shell — the frosted container, the bottom dock, and the surrounding chrome — and swap what sits in the header slot."

### Actual Implementation
**No shared shell exists.** The current architecture has three completely separate layouts:

#### Mode 1: Home (`src/pages/Home.jsx`)
```jsx
<div className="home-page">
  <div className="home-page__bg" />          // Custom background
  <nav className="home-page__sidebar">        // Fixed bottom dock with NavBar
    <NavBar />
  </nav>
  <main className="home-page__content">      // Content area
    {/* Case study cards grid */}
  </main>
</div>
```
- **Unique layout** with `.home-page` CSS classes (App.css:3-32)
- Fixed sidebar at bottom with custom positioning
- Background image with mix-blend-mode
- No container, no chrome, no header slot

#### Mode 2: Case Study Full Page (`src/pages/CaseStudy.jsx`)
```jsx
<main className="min-h-screen bg-white @container">
  <CaseStudyBody slug={slug} />
</main>
```
- **Minimal wrapper** - just a white full-screen main tag
- No dock, no chrome, no shell structure
- Completely different from Home

#### Mode 3: Case Study Modal (`src/components/CaseStudyViewer.jsx`)
```jsx
<Dialog>
  <div className="bg-white rounded-2xl shadow-2xl w-[90vw] h-[90vh]">
    <div className="header-controls">...</div>    // Prev/next/expand/close
    <div className="scrollable-content">
      <CaseStudyBody slug={slug} />
    </div>
  </div>
</Dialog>
```
- **Modal over Home** with its own chrome (header with controls)
- Floats above Home page (which stays mounted)
- Different navigation model than full page

### **Problem**
Home and CaseStudy page do not share ANY layout code. They're architecturally distinct:
- Home has a custom shell with background + dock
- CaseStudy page is a bare wrapper
- Only the **modal** has chrome (header controls), not the full page

### **Impact on Paper**
If blocks are generated assuming they'll sit in "the shared shell," they won't have a stable target. The content max-width, padding, and container context vary across all three modes.

---

## 2. Block Prop Contract ✅ **DOCUMENTED**

### Current Interface
`BlockRenderer` passes the **raw Sanity block object** directly to each block component:

```jsx
// BlockRenderer.jsx:39
<Component key={block._key || index} block={block} />
```

**Every block receives:**
```typescript
{
  _type: string      // e.g., "textImageRow", "hero", "projectDetails"
  _key: string       // Sanity's unique key
  ...fields          // Block-specific Sanity fields (title, image, body, etc.)
}
```

### Block Implementation Pattern
All 9 existing blocks follow this single-layer pattern:

**Example: `TextImageRow.jsx`**
```jsx
export default function TextImageRow({ block }) {
  return (
    <div>
      <h2>{block.title}</h2>                         // Direct Sanity field access
      {block.paragraphs.map(...)}                    // Direct array access
      {block.subtitle && <p>{block.subtitle}</p>}   // Direct conditional
      <img src={urlFor(block.image).width(373)...} /> // Sanity image transform
    </div>
  )
}
```

**All blocks:**
1. Import `urlFor` from `../../lib/sanity`
2. Accept a single `{ block }` prop
3. Read fields directly from `block.fieldName`
4. Transform Sanity images via `urlFor(block.image).width()...url()`
5. Mix presentation (JSX/styling) with data access (Sanity coupling)

### **Problem**
**No separation** between presentation and data. Every block is tightly coupled to:
- Sanity field structure
- Image transformation logic
- Conditional data presence checks

Paper will generate **pure presentation components** with plain props. The current one-layer architecture won't accept Paper's output without refactoring every block.

---

## 3. Container Context in Both States ⚠️ **PARTIAL**

### Container Query Setup
- **Package**: `@tailwindcss/container-queries` v0.1.1 installed ✅
- **Tailwind v4**: Has **built-in** `@container` support (plugin not needed)

### Current `@container` Usage

#### ✅ Modal Viewer (CaseStudyViewer.jsx:252)
```jsx
<motion.div className="...overflow-y-auto @container">
  <CaseStudyBody slug={slug} />
</motion.div>
```
**Container established** in the scrollable panel. Width = modal panel width (~90vw with padding).

#### ✅ Full Page (CaseStudy.jsx:8)
```jsx
<main className="min-h-screen bg-white @container">
  <CaseStudyBody slug={slug} />
</main>
```
**Container established** on the main tag. Width = full viewport width.

#### ❌ Content Max-Width Inconsistency
`CaseStudyBody.jsx:42` sets content width **INSIDE** the `@container`:
```jsx
<div className="max-w-[770px] mx-auto px-6 pb-24">
  <BlockRenderer blocks={caseStudy.body} />
</div>
```

**Problem**: Blocks inherit a **770px container** in both modes, NOT the actual modal vs full-page width. The `@container` is effectively wasted because the content immediately constrains itself to 770px regardless of which mode it's in.

### Expected vs Actual Container Widths

| Mode | Expected Container Width | Actual Container Width |
|------|-------------------------|------------------------|
| Modal | ~800px (90vw panel - padding) | **770px** (max-w artificial limit) |
| Full Page | ~1440px (viewport - padding) | **770px** (max-w artificial limit) |

**Blocks see the same 770px container in both states**, defeating the purpose of container queries and expand mode.

### **Problem for Paper**
If Paper generates blocks with container-query breakpoints expecting the full modal or page width, they'll never trigger because content is pre-constrained to 770px.

---

## 4. Current Block Sizing Issues

### Fixed Pixel Widths (Not Container-Relative)
Many blocks use **arbitrary Tailwind values** that are fixed widths:

```jsx
// TextImageRow.jsx:10
<div className="w-83.25">  // Fixed 333px (83.25 * 4)

// ImageRow.jsx:5
<div className="w-192.5">  // Fixed 770px

// ImageRow.jsx:11
<img className="w-93.25 h-58"> // Fixed 373px x 232px
```

**Problems:**
1. Not responsive to container width
2. Break at narrow widths (e.g., mobile)
3. Don't benefit from expand mode's extra space

### No Container Query Variants
**Zero blocks** use `@md:`, `@lg:`, `@xl:` container breakpoints. All use viewport breakpoints or fixed widths.

---

## 5. Full-Bleed Pattern

### Current State
**No full-bleed blocks exist** in the current set. All blocks sit within the 770px content container.

### Defined Rule
None. If a future block needs full-bleed (e.g., a full-width image), there's no established pattern.

---

## 6. Theme Tokens

### Current Approach
Blocks use a **mix** of approaches with NO consistency:

#### Inline Hex Values
```jsx
text-[#0000004D]    // 30% opacity black (appears 13 times)
text-[#2F2F2F]      // Dark gray (appears 6 times)
bg-[#F2F2F2]        // Light gray background
border-[#DEDEDE]    // Border gray
text-[#E0E0E0]      // Lighter gray
```

#### Tailwind Semantic Tokens
```jsx
text-black
text-gray-400
bg-white
border-gray-200
```

#### Arbitrary Font Stacks
```jsx
font-['DM_Sans',system-ui,sans-serif]  // Repeated in every block
```

#### Fixed Spacing Values
```jsx
gap-4, gap-5, gap-6, gap-8, gap-9, gap-16
px-6, py-12, py-24
rounded-[20px]      // Hardcoded radius (appears 10+ times)
```

### **Problem**
**No theme tokens.** Paper will generate with raw values unless we define a token system first.

---

## 7. Animation Coupling

### Shell Animation
`CaseStudyViewer.jsx:239-260` wraps content in `<AnimatePresence>` + `<motion.div>` with:
- Slide transitions (x: ±1000 → 0)
- Spring physics (stiffness: 320, damping: 34)
- Drag gestures

### Block Animation
**Checked all 9 blocks** - none have mount/entrance animations. ✅

**Result**: Blocks are already animation-agnostic.

---

## Critical Path Forward

### Must Fix Before Paper
1. **Resolve shell architecture** - Decide if you want shared shell or keep current three-mode setup
2. **Remove 770px max-width constraint** from CaseStudyBody so `@container` sees real widths
3. **Establish two-layer block pattern** (presentation + wrapper)
4. **Define theme tokens** Paper can target

### Can Defer
- Full-bleed pattern (no current blocks need it)
- Refactoring existing blocks to container-relative sizing (Paper will generate correctly from start)

---

## Recommendation

**PAUSE Paper integration** until you clarify the shell architecture. The current code doesn't match your mental model, and I need to know which direction to build toward:

**Option A**: Keep current architecture (Home separate, CaseStudy minimal, modal-over-Home)
- Pro: No breaking changes
- Con: Blocks target inconsistent contexts

**Option B**: Build the shared shell you described
- Pro: Clean contract, one content width, one shell
- Con: Requires architectural refactor

Which matches your actual intent?
