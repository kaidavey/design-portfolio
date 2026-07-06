# Case Study Block System Setup Guide

## System Overview

Your portfolio now has a complete block-based content system! Each case study is composed of reusable block types that you can mix and match.

## Available Block Types

1. **Project Details** - Horizontal metadata row (Role, Timeline, Team, Tools)
2. **Hero** - Header with icon, title, and timeframe
3. **Text + Image Row** - Two columns with text and image
4. **Image Row** - 2-3 images in a row with captions
5. **Image + Text Grid** - 2-3 columns with images and text cards
6. **Call to Action** - CTA card with button
7. **Text Block (Centered)** - Centered text with optional section/title
8. **Text Card Row** - 3 cards with icons and text
9. **Text Columns** - Two-column text layout

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
4. Fill in the metadata:
   - Title (e.g., "Redesigning the Dashboard")
   - Slug (click "Generate" button)
   - Year (e.g., 2024)
   - Role, Timeline, Team, Tools
   - Cover Image (upload an image)

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
7. **Image + Text Grid** - Key features
8. **Call to Action** - Next steps or related work

## Adding New Block Types

To add a new block type later:

1. Create schema in `portfolio-cms/schemaTypes/blocks/<name>.ts`
2. Add to `portfolio-cms/schemaTypes/index.ts`
3. Create React component in `src/components/blocks/<Name>.jsx`
4. Add one line to registry in `src/components/BlockRenderer.jsx`:
   ```js
   import NewBlock from './blocks/NewBlock'
   // ...
   const blockRegistry = {
     // ...
     newBlock: NewBlock,
   }
   ```

That's it! No other files need to change.

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
- Images are automatically optimized via @sanity/image-url
- The system is fully type-safe with TypeScript schemas
