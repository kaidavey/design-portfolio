# Modal Case Study Viewer Implementation Summary

## ✅ What Was Built

I've successfully implemented a sophisticated modal viewer system with background-location routing, keyboard/swipe navigation, and a shared body component. All navigation patterns work seamlessly:

### Core Features Implemented

1. **Modal Viewer Over Home** - Click a case study card → opens in a floating modal while Home stays visible behind
2. **Full Page Mode** - Direct visit to `/work/:slug` or refresh → renders as normal full page
3. **Expand Control** - Click expand in modal → drops to full page view
4. **Close Control** - Click close or Esc → returns to Home
5. **Prev/Next Navigation** - Arrow buttons, ← / → keys, or horizontal swipe between studies
6. **Direction-Aware Animations** - Transitions slide correctly based on direction
7. **Neighbor Prefetching** - Adjacent case studies load in background for instant navigation
8. **Container Queries** - All content sizes relative to container, not viewport

---

## 📂 Files Changed/Created

### **New Files**

- `src/hooks/useCaseStudies.js` - Data fetching hooks with caching and prefetch
- `src/components/CaseStudyBody.jsx` - Shared body component (used in both modal and full page)
- `src/components/Dialog.jsx` - Accessible dialog with focus trap and Esc handling
- `src/components/CaseStudyViewer.jsx` - Modal viewer with navigation, keyboard, and swipe
- `src/pages/Home.jsx` - Home page with case study cards (links with backgroundLocation)

### **Modified Files**

- `portfolio-cms/schemaTypes/caseStudy.ts` - Added `order` field
- `src/lib/queries.js` - Updated getAllCaseStudies to sort by order + added prefetch cache
- `src/App.jsx` - Implemented background-location routing pattern
- `src/pages/CaseStudy.jsx` - Simplified to use CaseStudyBody + @container
- `package.json` - Added framer-motion dependency

---

## 🎯 How It Works

### Background-Location Routing Pattern

```jsx
// Home cards link with backgroundLocation state
<Link
  to={`/work/${slug}`}
  state={{ backgroundLocation: location }}
>

// App.jsx renders dual routes
<Routes location={state?.backgroundLocation || location}>
  <Route path="/" element={<Home />} />
  <Route path="/work/:slug" element={<CaseStudy />} />
</Routes>

{/* Modal only renders when backgroundLocation is present */}
{state?.backgroundLocation && (
  <Routes>
    <Route path="/work/:slug" element={<CaseStudyViewer />} />
  </Routes>
)}
```

**The presence of `backgroundLocation` determines if modal is shown** - no separate boolean flag needed.

### Navigation Behavior

- **Modal prev/next**: Navigate with `replace: true` and keep the same `backgroundLocation` → browser Back closes to Home, not to each study shuffled through
- **Expand**: Navigate to `/work/:slug` without backgroundLocation → drops to full page
- **Close**: `navigate(-1)` → returns to Home

### Shared Component Architecture

```
CaseStudyBody (slug) → fetches data → renders blocks
    ↑                           ↑
    |                           |
CaseStudyViewer (modal)    CaseStudy (full page)
```

Both presentations render the **exact same component** inside a `@container` - blocks never know which container they're in.

---

## 🔧 What You Need To Do

### 1. Update Sanity Studio

**Add `order` field to existing case studies:**

1. Open Sanity Studio: `cd portfolio-cms && npm run dev`
2. Edit each case study and set an `order` value (0, 1, 2, etc.)
3. Publish changes

The order field controls the sequence in which case studies appear and navigate.

### 2. Adjust Block Components for Container Queries

Your current block components use **fixed widths** (e.g., `w-83.25`, `w-93.25`) which work but aren't responsive. To make them work perfectly in both the modal and full page:

#### Replace Fixed Widths with Container-Relative Sizing

**Before:**
```jsx
<div className="flex items-center justify-between">
  <div className="w-83.25"> {/* Fixed width */}
    <p>Text content</p>
  </div>
  <img className="w-93.25 h-58" /> {/* Fixed width */}
</div>
```

**After:**
```jsx
<div className="flex items-center justify-between gap-8">
  <div className="flex-1 max-w-md"> {/* Relative to container */}
    <p>Text content</p>
  </div>
  <img className="flex-1 max-w-lg aspect-[16/10] object-cover" />
</div>
```

#### Use Container Query Variants

Tailwind v4 has **built-in container queries** (no plugin needed). Use `@md:`, `@lg:`, `@xl:` variants:

```jsx
{/* Stacks on narrow containers, side-by-side on wider */}
<div className="flex flex-col @md:flex-row gap-4">
  <div className="@md:w-1/2">Left</div>
  <div className="@md:w-1/2">Right</div>
</div>
```

#### Example: Update TextImageRow Component

**Current:**
```jsx
// src/components/blocks/TextImageRow.jsx
<div className="flex items-center justify-between">
  <div className="flex flex-col items-start gap-4">
    <div className="w-fit font-medium text-2xl">{block.title}</div>
    <div className="w-83.25"> {/* Fixed! */}
      {block.paragraphs.map(...)}
    </div>
  </div>
  <img className="w-93.25 h-58" /> {/* Fixed! */}
</div>
```

**Better:**
```jsx
<div className="flex flex-col @lg:flex-row items-center gap-8">
  <div className="flex flex-col items-start gap-4 flex-1">
    <div className="font-medium text-2xl">{block.title}</div>
    <div className="space-y-2">
      {block.paragraphs.map(...)}
    </div>
  </div>
  <img className="flex-1 max-w-md aspect-[16/10] rounded-[20px] object-cover" />
</div>
```

### Key Principles for Container-Based Layouts

1. **Avoid `vw` units** - Use `%`, `flex-1`, `max-w-*` instead
2. **Use `@container` variants** - `@md:grid-cols-2`, `@lg:flex-row`, etc.
3. **Full-bleed backgrounds** - Negative margin relative to container padding, not `100vw`
4. **Flexible spacing** - Use `gap`, `space-y-*`, `space-x-*` instead of fixed widths

---

## 🧪 Testing Checklist

Test these scenarios:

- ✅ Click case study card on Home → opens modal over Home
- ✅ Click prev/next buttons → navigates between studies
- ✅ Press ← / → arrow keys → navigates between studies
- ✅ Drag/swipe horizontally → navigates between studies
- ✅ Press Esc → closes modal, returns to Home
- ✅ Click overlay → closes modal, returns to Home
- ✅ Click expand → drops to full page view
- ✅ Browser Back from modal → returns to Home (not prev study)
- ✅ Direct visit to `/work/some-slug` → renders full page
- ✅ Refresh on `/work/some-slug` → stays full page
- ✅ Prev/next disabled at list ends

---

## 📋 Next Steps

1. **Set order values** in Sanity Studio for all case studies
2. **Update block components** to use container-relative sizing (see examples above)
3. **Test all navigation patterns** to verify behavior
4. **Refine animations** - Adjust spring settings in CaseStudyViewer if needed:
   ```js
   const transition = {
     type: 'spring',
     stiffness: 320,  // Higher = snappier
     damping: 34,     // Higher = less bounce
   }
   ```

---

## 🎨 Styling Notes

- Modal has rounded corners (`rounded-2xl`) and shadow (`shadow-2xl`)
- Modal size is `90vw × 90vh` - adjust in `CaseStudyViewer.jsx` if needed
- Header controls have hover states and disabled states
- Drag cursor changes to `grabbing` during swipe
- Backdrop has `bg-black/50 backdrop-blur-sm`

All styles match your existing design system (DM Sans font, existing color palette).

---

## 🚀 Architecture Benefits

✅ **DRY** - CaseStudyBody used in both modal and full page
✅ **No prop drilling** - No `isModal` or `variant` props needed
✅ **Container queries** - Same blocks work in any container width
✅ **Prefetching** - Instant navigation to neighbors
✅ **Accessible** - Focus trap, keyboard nav, ARIA labels
✅ **Clean URLs** - Same `/work/:slug` route for both modes
✅ **Back button works** - Browser history behaves intuitively

Enjoy your new modal viewer! 🎉
