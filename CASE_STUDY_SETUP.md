# Case Study Block System Setup Guide

## System Overview

Your portfolio now has a complete block-based content system! Each case study is composed of reusable block types that you can mix and match.

## Available Block Types

1. **Hero** - Header with optional icon and a title
2. **Project Details** - Horizontal metadata row (Role, Timeline, Team, Tools)
3. **Text Block (Centered)** - Centered text with optional section/title
4. **Text Columns** - Two-column text layout
5. **Text Row - Two Column** - Section/title header over two columns of text
6. **Text Card Row** - 3 cards with icons and text
7. **Text + Image Row** - Text on one side, an image on the other
8. **Image** - One image, full container width, height from the image
9. **Framed Image** - One image centred on a surface, uncropped
10. **Image Row** - 2-3 images in a row with captions
11. **Image + Text Grid** - 2-3 columns with images and text cards
12. **Call to Action** - CTA card with button
13. **Spacer** - Fixed vertical gap

### Image vs Framed Image

**Image** bleeds to the full width of the container. Its height comes from the
image's own proportions — nothing is cropped and no ratio is imposed. Use it
for photography and wide artwork.

**Framed Image** puts the image on a rounded surface instead. The surface is
the responsive part: it keeps the shape you choose and grows and shrinks with
the screen, while the image inside stays centred at its own proportions and is
only ever scaled down far enough to fit. Use it for phone screens, laptop
shots, and anything else that should not run edge to edge.

A framed image is not limited to its own block. Every image slot in the system
— both or all three cells of an **Image Row**, any column of an **Image + Text
Grid**, the image half of a **Text + Image Row** — has a **Show in a frame**
toggle that turns that one image into a framed one, with its own shape, inset
and backdrop.

Frame options:

| Option | What it does |
|---|---|
| **Frame Shape** | The shape of the surface, not the image. 16:10 through 9:16. |
| **Inset** | Breathing room between the image and the edge of the frame. |
| **Backdrop** | *Surface* follows the site theme; *Light* and *Dark* stay fixed. |

Portrait frames are capped by height and sized from the ratio, so a 9:16 frame
stays on screen instead of turning into a long column of gray.

## Getting Started

### 1. Start the Sanity Studio

```bash
cd portfolio-cms
npm run dev
```

This will open the Sanity Studio at http://localhost:3333

### 2. Start the React Dev Server

In a separate terminal:

```bash
npm run dev
```

This will start your React app at http://localhost:5173

### 3. Create Your First Case Study

1. Open Sanity Studio at http://localhost:3333
2. Click "Case Study" in the document types
3. Click "Create new Case Study"
4. Fill in the **Content** tab:
   - Title (e.g., "Redesigning the Dashboard")
   - Slug (click "Generate" button)

   Then the **Home Card** tab, which is only about how the study appears on the
   home page:
   - Short Description, Display Order, Cover Image, and an optional Cover Video

   Role, Timeline, Team and Tools are *not* document fields — they belong to
   the **Project Details** block, so you fill them in there. One field, one
   home.

5. Add blocks to the Body array:
   - Click "+ Add item"
   - Choose a block type (e.g., "Hero")
   - Fill in the fields for that block
   - Repeat to build your case study

6. Click "Publish" when done

### 4. View Your Case Study

Navigate to:
```
http://localhost:5173/case-study/your-slug-here
```

Replace `your-slug-here` with the slug you created.

## Example Case Study Structure

Here's a typical case study flow:

1. **Hero** - Introduction with project title
2. **Project Details** - Metadata overview
3. **Text Block (Centered)** - Problem statement
4. **Text + Image Row** - Research findings
5. **Image Row** - Design explorations
6. **Text Columns** - Solution explanation
7. **Framed Image** - The final screen, on a surface
8. **Image + Text Grid** - Key features
9. **Call to Action** - Next steps or related work

## Adding New Block Types

To add a new block type later:

1. Create schema in `portfolio-cms/schemaTypes/blocks/<name>.ts`
2. Add to `portfolio-cms/schemaTypes/index.ts`
3. Add it to the `body` array in `portfolio-cms/schemaTypes/caseStudy.ts` —
   registering the type is not enough to make it available to an editor
4. Project its fields in `getCaseStudyBySlug` (`src/lib/queries.js`); a block
   with no projection arrives with `_type` and nothing else
5. Create React component in `src/components/blocks/<Name>.jsx`
6. Add a skeleton in `src/components/skeletons/blockSkeletons.jsx`
7. Add one line to registry in `src/components/BlockRenderer.jsx`:
   ```js
   import NewBlock from './blocks/NewBlock'
   // ...
   const blockRegistry = {
     // ...
     newBlock: NewBlock,
   }
   ```

If the block holds an image, give it a `caseStudyImage` field and render it
with `<CaseStudyMedia>` — that is what makes framed images work in the new slot
for free.

## System Architecture

- **Sanity Studio** (`portfolio-cms/`) - Content management backend
- **Schemas** (`portfolio-cms/schemaTypes/`) - Define data structure
- **React Components** (`src/components/blocks/`) - Visual rendering
- **BlockRenderer** (`src/components/BlockRenderer.jsx`) - Maps blocks to components
- **Queries** (`src/lib/queries.js`) - Fetch data with GROQ
- **Sanity Client** (`src/lib/sanity.js`) - API connection and image URLs

## Tips

- Each case study can use a DIFFERENT combination of blocks
- Blocks are ordered in the body array (drag to reorder in Sanity)
- If a block type has no component, it's skipped silently
- Images are automatically optimized via @sanity/image-url, and the query pulls
  each one's dimensions so its height is reserved before it loads
- Alt text is optional but worth filling in — leave it blank only when the
  image is purely decorative
- The system is fully type-safe with TypeScript schemas
