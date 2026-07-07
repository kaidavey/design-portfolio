# Container Queries Quick Reference

## Why Container Queries?

Your modal viewer is **770px wide** (with padding) while full page can be **1440px wide**. Container queries let the **same blocks** adapt to both widths automatically.

---

## Tailwind v4 Container Query Syntax

### 1. Mark the Container

Both containers are already marked with `@container`:

```jsx
// CaseStudyViewer - modal scroll container
<div className="@container">
  <CaseStudyBody slug={slug} />
</div>

// CaseStudy - full page main
<main className="@container">
  <CaseStudyBody slug={slug} />
</main>
```

### 2. Use Container Breakpoints in Children

Instead of `md:`, `lg:`, `xl:` (viewport breakpoints), use `@md:`, `@lg:`, `@xl:` (container breakpoints):

| Breakpoint | Container Width | Use Case |
|------------|-----------------|----------|
| `@sm:` | 640px+ | Mobile → tablet |
| `@md:` | 768px+ | Tablet → desktop |
| `@lg:` | 1024px+ | Desktop wide |
| `@xl:` | 1280px+ | Desktop extra wide |

---

## Common Patterns

### Two-Column → Stack on Narrow

```jsx
// Before: Always side-by-side (breaks in narrow modal)
<div className="flex justify-between">
  <div className="w-1/2">Left</div>
  <div className="w-1/2">Right</div>
</div>

// After: Stacks in modal, side-by-side in full page
<div className="flex flex-col @md:flex-row gap-8">
  <div className="@md:flex-1">Left</div>
  <div className="@md:flex-1">Right</div>
</div>
```

### Grid Columns Responsive

```jsx
// Before: Always 3 columns (too cramped in modal)
<div className="grid grid-cols-3 gap-4">

// After: 1 col in modal, 2-3 cols in full page
<div className="grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3 gap-4">
```

### Image Sizing

```jsx
// Before: Fixed px widths
<img className="w-93.25 h-58" />

// After: Relative to container
<img className="w-full max-w-md aspect-[16/10] object-cover" />
```

### Text Width for Readability

```jsx
// Before: Fixed width
<div className="w-83.25">
  <p>Long paragraph...</p>
</div>

// After: Max width with container-aware adjustment
<div className="max-w-prose @lg:max-w-2xl">
  <p>Long paragraph...</p>
</div>
```

---

## Quick Fixes for Your Block Components

### TextImageRow, TextColumns

Replace fixed `w-83.25` with:
```jsx
className="flex-1 max-w-md"
// or
className="@md:w-1/2"
```

### ImageRow (2-3 images)

```jsx
// Before: Always flex row
<div className="flex gap-6">

// After: Stack on narrow, row on wide
<div className="flex flex-col @md:flex-row gap-6">
  {images.map(img => (
    <div className="@md:flex-1">
      <img className="w-full aspect-video" />
    </div>
  ))}
</div>
```

### ImageTextGrid (3 columns)

```jsx
// Before: Always 3 columns
<div className="flex gap-4">

// After: Responsive grid
<div className="grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3 gap-4">
  {columns.map(...)}
</div>
```

### ProjectDetails (4 columns)

```jsx
// Before: Always 4 columns
<div className="flex justify-between gap-5">

// After: Wrap on narrow
<div className="grid grid-cols-2 @md:grid-cols-4 gap-5">
  <div>Role</div>
  <div>Timeline</div>
  <div>Team</div>
  <div>Tools</div>
</div>
```

---

## Testing Your Changes

1. Open a case study in **modal** (narrow)
2. Click **expand** to see **full page** (wide)
3. Verify layout adapts correctly

---

## Don't Overdo It

**Keep simple blocks simple.** If a component is naturally narrow (like a centered text block), you don't need container queries:

```jsx
// This is fine - centered content with max-width
<div className="max-w-xl mx-auto px-6">
  <p>Centered text</p>
</div>
```

Only add container queries where **layout structure** changes (column count, flex direction, etc.).
