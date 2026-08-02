# Fluid Type & Responsive Image Scaling

This document describes the fluid type and responsive image implementation in the portfolio.

## Overview

The portfolio uses **fluid type scaling** for heading and subheading text to provide smooth, viewport-responsive sizing without breakpoint snaps. All content images use **responsive srcset delivery** with aspect-ratio preservation to prevent CLS and optimize payload.

---

## Fluid Type System

### Anchor Viewports

- **MIN size reached at:** ≤ 1440px viewport width
- **MAX size reached at:** ≥ 1920px viewport width
- **Scaling range:** Text scales smoothly between these anchors (e.g., a 1512px MacBook lands ~55% through the range, ~9% smaller than MAX)

### Fluid Type Tokens

Defined in `src/index.css` using Tailwind CSS v4 `@theme` block:

| Token | MIN Size | MAX Size | Clamp Expression | Line Height | Usage |
|-------|----------|----------|------------------|-------------|-------|
| `--text-fluid-heading` | 23px (1.4375rem) | 26px (1.625rem) | `clamp(1.4375rem, 0.875rem + 0.625vw, 1.625rem)` | 1.214 | Hero title, Home name |
| `--text-fluid-subheading` | 19px (1.1875rem) | 22px (1.375rem) | `clamp(1.1875rem, 0.625rem + 0.625vw, 1.375rem)` | 1.25 | Block titles (TextColumns, TextBlockCentered, TextImageRow, TextRowTwoColumn) |
| `--text-fluid-subheading-alt` | 17px (1.0625rem) | 18px (1.125rem) | `clamp(1.0625rem, 0.875rem + 0.2083vw, 1.125rem)` | 1.2 | Home subtitle |
| `--text-caption` | 13px (0.8125rem) | 14px (0.875rem) | `clamp(0.8125rem, 0.625rem + 0.2083vw, 0.875rem)` | 1.286 | Image captions, project detail labels |
| `--text-section-label` | 13px (0.8125rem) | 14px (0.875rem) | `clamp(0.8125rem, 0.625rem + 0.2083vw, 0.875rem)` | 1.286 | Section labels (uppercase) |

**Line-heights** are unitless ratios derived from the original pixel leading values to preserve vertical rhythm.

### Fixed Type Tokens

These use custom theme tokens (reduced ~8% from standard Tailwind sizes):

- **meta-value:** `--text-meta-value` (17px / 1.0625rem) — Status items, card titles
- **nav:** `--text-nav` (17px / 1.0625rem) — Breadcrumb navigation
- **body:** `--text-body` (15px / 0.9375rem) — Paragraphs, descriptions, project detail values

**Accessibility floor:** All text sizes floored at **13px minimum** (caption and section-label tokens).

### Zoom Safety

All fluid tokens include a `rem` term in the middle expression of `clamp()` (e.g., `1rem + 0.625vw`), ensuring browser zoom and user font-size preferences scale the text correctly. Pure `vw` units would ignore zoom.

---

## Responsive Image System

### CaseStudyImage Component

**Location:** `src/components/CaseStudyImage.jsx`

A centralized helper component that automatically generates `srcset` candidates and applies aspect-ratio preservation.

**Props:**

```jsx
<CaseStudyImage
  source={sanityImageAsset}    // Sanity image object
  alt="Image description"
  sizes="(max-width: 640px) 92vw, 907px"  // Per-block sizes string
  maxWidth={1800}              // Maximum candidate width for srcset
  widths={[500, 900, 1800]}    // Optional: explicit widths (default: auto-generated)
  className="w-full object-cover"
  style={{ borderRadius: '12px' }}
/>
```

**Default behavior:**

- Generates 5 srcset candidates: `[0.5×, 0.75×, 1×, 1.5×, 2×]` of `maxWidth`
- Extracts aspect-ratio from `source.asset.metadata.dimensions` if available (prevents CLS)
- Uses `@sanity/image-url` builder to construct optimized URLs

### Per-Block Image Strategies

Different block types render images at different widths, requiring per-block `sizes` and `maxWidth`:

| Block Type | Rendered Width | `sizes` Attribute | `maxWidth` | Notes |
|------------|----------------|-------------------|------------|-------|
| **ImageFull** | ~907px (full content width) | `(max-width: 1040px) 92vw, 907px` | 1800px | Full-width images (~2× for Retina) |
| **TextImageRow** | ~448px (half content width) | `(max-width: 640px) 92vw, 448px` | 900px | Image column in 2-column layout |
| **ImageRow** | ~440px (per image in row) | `(max-width: 640px) 92vw, (max-width: 1040px) 45vw, 440px` | 880px | Multiple images side-by-side |
| **ImageTextGrid** | ~440px (per column) | `(max-width: 640px) 92vw, (max-width: 1040px) 45vw, 440px` | 880px | Grid columns with image + card |
| **Home cover** | ~440px (grid card) | `(max-width: 640px) 92vw, (max-width: 900px) 45vw, 440px` | 880px | Project grid cards on home page |

**Container constraints:**

- **Compact mode:** `maxWidth: 1048px`, content padding 90px each side → ~868px effective width
- **Expanded mode:** `maxWidth: 907px`
- Home page grid: `max-width: 900px` with 2-column `@md` grid

### Small Fixed-Size Images

Icons and avatars remain at fixed sizes without srcset:

- **Hero icons:** 50px × 50px
- **Card icons:** 24px × 24px

These are appropriately sized and don't need responsive delivery.

---

## Implementation Notes

### Adding New Blocks

New content blocks inherit scaling for free:

1. **Text:** Use `text-fluid-heading`, `text-fluid-subheading`, or `text-fluid-subheading-alt` for titles; `text-base` for body
2. **Images:** Import and use `<CaseStudyImage>` with a `sizes` string matching the block's rendered width

### Verifying Layout

Test at these viewport widths to confirm smooth scaling with no snaps or breaks:

- **1280px** — Below MIN anchor (text at smallest size)
- **1440px** — At MIN anchor
- **1512px** — MacBook size (~55% through range)
- **1728px** — Mid-range
- **1920px** — At MAX anchor
- **2560px** — Above MAX anchor (text at largest size)

**Zoom test:** At 200% browser zoom (Cmd/Ctrl +), text should still enlarge (confirms `rem` term works).

### CLS Prevention

The `CaseStudyImage` component automatically pulls aspect-ratio from Sanity's `metadata.dimensions` when available, reserving space before the image loads. Ensure all images uploaded to Sanity have metadata populated (happens automatically for new uploads).

---

## References

- **Tailwind v4 theme docs:** https://tailwindcss.com/docs/theme
- **CSS clamp() spec:** https://developer.mozilla.org/en-US/docs/Web/CSS/clamp
- **Responsive images guide:** https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images
- **Sanity image-url builder:** https://www.sanity.io/docs/image-url

---

**Last updated:** 2026-08-01
