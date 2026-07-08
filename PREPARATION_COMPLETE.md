# Paper Integration Preparation — Complete ✅

The codebase is now ready for Paper to generate block components. All seams are locked.

---

## What Was Done

### ✅ Step 1: Architecture Correction
**Removed modal-over-Home** — The previous implementation had three presentation modes (Home, CaseStudy full page, modal viewer). This has been replaced with the correct architecture:

**New Architecture:**
- Home and CaseStudy are **two real routes** (not modal-over-Home)
- Both share **Shell.jsx** component (container + dock + chrome)
- Shell has **swappable header slot**:
  - Home: Bio + status
  - CaseStudy: Breadcrumbs + prev/next/expand controls
- CaseStudy route has **two presentation states**:
  - **Compact**: ~800px container (readable, centered)
  - **Expanded**: full-width container
  - Toggled by expand button in header

**Files Changed:**
- ✅ Created `src/components/Shell.jsx` (shared layout)
- ✅ Created `src/components/CaseStudyHeader.jsx` (controls header)
- ✅ Updated `src/App.css` (Shell styling with container contexts)
- ✅ Refactored `src/pages/Home.jsx` (uses Shell with bio header)
- ✅ Refactored `src/pages/CaseStudy.jsx` (uses Shell, compact/expanded, swipe animation)
- ✅ Simplified `src/App.jsx` (removed backgroundLocation routing)
- ✅ Deleted `src/components/Dialog.jsx` (no longer needed)
- ✅ Deleted `src/components/CaseStudyViewer.jsx` (no longer needed)

---

### ✅ Step 2: Container Contract Locked

**Problem Fixed**: CaseStudyBody had `max-w-[770px]` hardcoded, so blocks saw the same 770px width in both compact and expanded states, defeating the purpose of container queries.

**Solution**:
- ✅ Removed hardcoded 770px constraint from `CaseStudyBody.jsx`
- ✅ Shell establishes `@container` context in both states
- ✅ Created `src/utils/containerUtils.js` with:
  - `fullBleed()` utility for full-width backgrounds
  - `READABLE_MAX_WIDTH` constant for text blocks only
  - Container breakpoint documentation

**Container Widths Blocks Will See:**

| State | Container Width | What Triggers |
|-------|----------------|---------------|
| Compact | ~804px | `@md:` triggers, `@lg:` triggers |
| Expanded | ~1344px | `@md:`, `@lg:`, `@xl:` all trigger |

**Key Rule**: Blocks must use `@md:`, `@lg:`, `@xl:` (container queries), NEVER viewport breakpoints or fixed widths.

---

### ✅ Step 3: Two-Layer Block Pattern

**Refactored TextImageRow** as the reference example for Paper:

**Layer 1 - Presentation** (`presentations/TextImageRowPresentation.jsx`):
- Pure component with plain props
- No Sanity coupling
- Uses container queries (`@lg:flex-row`)
- Uses theme tokens
- No animations

**Layer 2 - Wrapper** (`blocks/TextImageRow.jsx`):
- Thin adapter
- Maps `block.*` Sanity fields → plain props
- Transforms images via `urlFor()`
- Exports for BlockRenderer

**Registry Entry** (`BlockRenderer.jsx`):
- One line: `textImageRow: TextImageRow`

**This is the pattern Paper must follow**. Paper generates Layer 1 only.

---

### ✅ Step 4: Animation Verified

**Checked all 9 existing blocks** — none have mount/entrance animations ✅

**Rule for Paper**: Blocks must render immediately with final styles. No `<motion.*>` components, no fade-ins, no slides. The Shell owns all page-level transitions.

---

### ✅ Step 5: Theme Tokens Defined

Created `src/theme/tokens.js` with semantic tokens:

**Typography**:
- `fonts.sans` - DM Sans stack
- `fontSizes.*` - xs through 3xl
- `fontWeights.*` - normal, medium, semibold
- `letterSpacing.*` - tighter, tight, normal

**Colors**:
- `colors.textPrimary` - text-black
- `colors.textMuted` - text-[#0000004D]
- `colors.bgGray` - bg-[#F2F2F2]
- `colors.borderGray` - border-[#DEDEDE]
- etc.

**Spacing, Radii, Shadows** all mapped.

**Rule for Paper**: Prefer tokens over raw hex values.

---

## Files Created

### Core Architecture
- `src/components/Shell.jsx` - Shared layout wrapper
- `src/components/CaseStudyHeader.jsx` - Case study controls header
- `src/App.css` - Shell styling with container contexts

### Contract & Utilities
- `src/utils/containerUtils.js` - Container helpers (fullBleed, READABLE_MAX_WIDTH)
- `src/theme/tokens.js` - Design tokens for Paper
- `PAPER_CONTRACT.md` - Complete generation rules for Paper

### Reference Implementation
- `src/components/blocks/presentations/TextImageRowPresentation.jsx` - Pure presentation example
- `src/components/blocks/TextImageRow.jsx` - Wrapper example (refactored)

### Documentation
- `AUDIT_REPORT.md` - Initial audit findings
- `PREPARATION_COMPLETE.md` - This file

---

## What Paper Needs to Know

### Read First
**`PAPER_CONTRACT.md`** — This is the canonical reference. It contains:

1. **Container Contract**
   - Blocks size via `@md:`, `@lg:`, `@xl:` (container queries)
   - No viewport breakpoints or fixed widths
   - Both compact and expanded have `@container` context
   - Text blocks can use `max-w-readable` (70ch) for readability

2. **Two-Layer Architecture**
   - Paper generates presentation components only
   - Plain props interface (no Sanity coupling)
   - Developer writes thin wrapper + registry entry

3. **Plain-Prop Interfaces**
   - Exact prop shapes for all 9 existing block types
   - TypeScript-style documentation

4. **Theme Tokens**
   - Use semantic tokens, not raw values
   - Import from `src/theme/tokens.js`

5. **Animation Rules**
   - No mount/entrance/exit animations
   - Blocks render immediately

6. **Reference Example**
   - TextImageRowPresentation.jsx - full working example
   - Shows container queries, tokens, plain props

7. **Common Mistakes**
   - What NOT to do (viewport breakpoints, hardcoded widths, animations)
   - What TO do instead

---

## Testing Checklist

Before Paper generates blocks, verify in `PAPER_CONTRACT.md`:

- [ ] Presentation component has plain-prop interface
- [ ] Uses `@md:`, `@lg:`, `@xl:` (NOT `md:`, `lg:`)
- [ ] No fixed pixel widths or `vw` units
- [ ] Uses theme tokens
- [ ] No animations
- [ ] No Sanity imports
- [ ] Works in both compact (~800px) and expanded (~1344px)

---

## How to Add a New Block (Workflow)

### 1. Paper Generates Presentation
```
src/components/blocks/presentations/NewBlockPresentation.jsx
```
- Plain props
- Container queries
- Theme tokens
- No animations

### 2. Developer Writes Wrapper
```javascript
// src/components/blocks/NewBlock.jsx
import { urlFor } from '../../lib/sanity'
import NewBlockPresentation from './presentations/NewBlockPresentation'

export default function NewBlock({ block }) {
  return (
    <NewBlockPresentation
      title={block.title}
      // ... map other props
    />
  )
}
```

### 3. Developer Adds Registry Entry
```javascript
// src/components/BlockRenderer.jsx
import NewBlock from './blocks/NewBlock'

const blockRegistry = {
  newBlock: NewBlock,  // ← One line
  // ...
}
```

**Done.** No other files change.

---

## What Changed from Before

### Removed
- ❌ Modal-over-Home architecture
- ❌ Dialog component
- ❌ CaseStudyViewer component
- ❌ backgroundLocation routing
- ❌ 770px hardcoded max-width in CaseStudyBody
- ❌ Separate Home and CaseStudy layouts

### Added
- ✅ Shell component (shared layout)
- ✅ CaseStudyHeader component
- ✅ Compact/expanded state system
- ✅ Container contract utilities
- ✅ Theme tokens
- ✅ Two-layer block pattern
- ✅ PAPER_CONTRACT.md

### Fixed
- ✅ Home and CaseStudy now share Shell
- ✅ Swappable header slot works
- ✅ Container queries work in both states
- ✅ Blocks see correct container widths

---

## Build Status

✅ **Build passes** (tested with `npm run build`)

All TypeScript/JavaScript compiles cleanly. No errors.

---

## Next Steps

1. **Hand `PAPER_CONTRACT.md` to Paper**
2. **Paper generates presentation components** matching the contract
3. **Developer writes thin wrappers** (2-5 lines each)
4. **Developer adds registry entries** (1 line each)
5. **Test in both compact and expanded states**

The expensive failure mode (regenerating many blocks because the seam changed) is now avoided. The contract is locked.

---

## Reference Files

- `PAPER_CONTRACT.md` - **START HERE** - Complete generation rules
- `src/components/blocks/presentations/TextImageRowPresentation.jsx` - Working example
- `src/theme/tokens.js` - Theme tokens
- `src/utils/containerUtils.js` - Container utilities
- `AUDIT_REPORT.md` - Initial analysis that led to these fixes

All seams are locked. Paper can generate safely. 🚀
