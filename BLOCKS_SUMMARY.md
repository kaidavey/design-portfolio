# Block System Implementation Summary

## What's In The System

### 1. Shared Sanity objects
`portfolio-cms/schemaTypes/objects/`

- **caseStudyImage.ts** — the image primitive: image, alt, caption, a `framed`
  toggle and its frame. Every block that holds an image holds one of these,
  which is what lets a framed device shot go anywhere a plain image goes.
- **imageFrame.ts** — frame settings: shape, inset, backdrop.

### 2. Sanity block schemas (14 types)
`portfolio-cms/schemaTypes/blocks/`

| Schema | What it is |
|---|---|
| `hero.ts` | Optional icon + title |
| `projectDetails.ts` | Role, Timeline, Team, Tools |
| `textBlockCentered.ts` | Optional section/title + body text |
| `textColumns.ts` | Section/title on left, paragraphs on right |
| `textRowTwoColumn.ts` | Section/title header over two text columns |
| `textCardRow.ts` | 3 cards with icon, subtitle, description |
| `textImageRow.ts` | Title, paragraphs, optional subtitle, one image |
| `imageFull.ts` | One image, full container width |
| `framedImage.ts` | One image centred on a fixed-ratio surface |
| `imageRow.ts` | 2-3 images with captions |
| `imageTextGrid.ts` | 2-3 columns of image + text card |
| `callToAction.ts` | Title, description, button text/link |
| `blockGroup.ts` | A run of blocks sharing one gap |
| `spacer.ts` | Fixed vertical gap |

Every one of them is listed in the `body` array of `caseStudy.ts`. Registering
a type in `index.ts` alone does **not** make it available to an editor — that
was how `imageFull` and `textRowTwoColumn` sat unreachable for a while.

### 3. React components
`src/components/blocks/` — one wrapper per block, plus presentations under
`presentations/` for the blocks Paper generates.

Image rendering is centralised:

- **CaseStudyMedia.jsx** — takes a `caseStudyImage` and decides plain vs framed.
  Nothing else makes that decision.
- **CaseStudyFrame.jsx** — the surface a framed image sits on.
- **CaseStudyImage.jsx** — responsive `<img>` with srcset and a reserved aspect
  ratio.
- **config/imageFrame.js** — the option lists and `frameBoxStyle()`, shared by
  the frame and its skeleton so the two agree on height.

### 4. Core infrastructure

**BlockRenderer** (`src/components/BlockRenderer.jsx`)
- Registry-based component mapper
- Gracefully skips unknown block types
- Tags each block with `data-block-index` for the expand morph to measure

**Skeletons** (`src/components/skeletons/blockSkeletons.jsx`)
- One per block type, drawn from the shape query while the body loads

**Sanity Client** (`src/lib/sanity.js`) — projectId `6vslo6fw`, dataset `production`

**Data Layer** (`src/lib/queries.js`)
- `getCaseStudyBySlug(slug)` — full body, with every image's asset dereferenced
  for its dimensions
- `getCaseStudyShape(slug)` — block types only, for the skeleton
- `getAllCaseStudies()` — home page list

### 5. Document schema

**caseStudy** (`portfolio-cms/schemaTypes/caseStudy.ts`)

Two field groups, and nothing else:

- **Content** — title, slug, body
- **Home Card** — description, display order, cover image, optional cover video

Role, timeline, team and tools live on the **Project Details** block, not on the
document, so an editor is asked for them exactly once. `year` and the hero's
`timeframe` were asked for and never rendered anywhere, so they are gone.

## Key Features

### Pick-and-choose blocks
Each case study can use a different subset of blocks. No fixed template.

### Framed images anywhere
Toggling **Show in a frame** on any image slot — a cell of an image row, a
column of an image + text grid, the image half of a text + image row, or the
standalone Framed Image block — puts that image on a rounded surface. The
surface is the responsive part; the image inside is centred and only ever
scaled down to fit. It is never cropped.

### Grouped spacing
Body blocks sit 32px apart (`gap-8`, mirrored as `CASE_STUDY_LAYOUT.blockGap`).
A **Group** wraps a run of blocks in its own gap — the only way to space blocks
*closer* than the default, since a Spacer can only add to it.

Groups paint no content: `BlockRenderer` renders one as a nested flex column
and the group claims no `data-block-index`. That matters, because
`measureVisibleCut` walks those indices flat and stops at the first block past
the fold, and `AnimatedBlock` hides everything past the cut — both only hold
while the numbering increases down the page. `assignBlockIndices` numbers the
whole tree in document order to keep it that way, and
`src/test/expandMorph.test.jsx` pins the behaviour.

### Images that don't shift the page
The case study query dereferences `asset->metadata.dimensions`, so every block
knows an image's shape before its bytes land and reserves the height up front.

### Extensible design
To add a new block type:
1. Create the schema in `portfolio-cms/schemaTypes/blocks/<name>.ts`
2. Export it from `portfolio-cms/schemaTypes/index.ts`
3. Add it to the `body` array in `caseStudy.ts`
4. Project its fields in `getCaseStudyBySlug`
5. Create the React component in `src/components/blocks/<Name>.jsx`
6. Add its skeleton to `blockSkeletons.jsx`
7. Add one line to the `BlockRenderer.jsx` registry

If it holds an image, use a `caseStudyImage` field and `<CaseStudyMedia>` — the
framed variant then works in the new slot for free.

## Migrating Existing Content

These schema changes are not backwards compatible, which is deliberate — better
to land them before the case studies are imported than after.

If any documents already exist in the dataset, they need a one-off migration:

| Old path | New path |
|---|---|
| `caseStudy.year` / `.role` / `.timeline` / `.team` / `.tools` | gone — the values belong on a `projectDetails` block |
| `hero.timeframe` | gone |
| `textImageRow.image` | `textImageRow.media.image` |
| `imageRow.images[].image` | `imageRow.images[].image` (now inside a `caseStudyImage`, so `caption` sits beside it as before) |
| `imageTextGrid.columns[].image` | `imageTextGrid.columns[].media.image` |
| `imageFull` | unchanged, plus an optional `alt` |

`blockGroup` is additive — nothing existing has to move to adopt it.

An `imageRow` item and a `caseStudyImage` happen to have the same field names
for `image` and `caption`, so that one migrates by adding `_type` alone. The
other two need the image nested under `media`.

## Running It

**Sanity Studio:**
```bash
cd portfolio-cms && npm run dev     # http://localhost:3333
```

**React app:**
```bash
npm run dev                          # http://localhost:5173
```

**Checks:**
```bash
npm run lint
npm test
npm run build
cd portfolio-cms && npx sanity schema validate
```

## Design System

- **Font:** DM Sans
- **Colors / shadows:** theme-aware custom properties in `src/index.css`
- **Border radius:** 20px for images, cards and frames
- **Sizing:** container queries throughout — see `PAPER_CONTRACT.md`
