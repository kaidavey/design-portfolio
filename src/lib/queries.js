import { client } from './sanity'

// Every image projection goes through this fragment.
//
// The dereference is the point: `asset->metadata.dimensions` is what lets a
// block reserve an image's height before the bytes arrive. Without it the
// browser learns each image's shape on load and the column jumps under the
// reader.
const IMAGE_FIELDS = `
  ...,
  asset-> {
    _id,
    url,
    metadata {
      dimensions { width, height, aspectRatio }
    }
  }
`

// A `caseStudyImage` value: the image plus how it should be presented.
const MEDIA_FIELDS = `
  alt,
  caption,
  framed,
  frame,
  image { ${IMAGE_FIELDS} }
`

// The per-type projections, shared by the body and by the blocks inside a
// Group. Without this a grouped block would arrive carrying `_type` and nothing
// else, because GROQ applies a projection only at the level it is written.
//
// Deliberately does not mention `blockGroup` — groups do not nest, and this is
// what enforces it on the read side.
const BLOCK_FIELDS = `
  _type,
  _key,

  // projectDetails
  _type == "projectDetails" => {
    role,
    timeline,
    team,
    tools
  },

  // hero
  _type == "hero" => {
    icon,
    title
  },

  // textImageRow
  _type == "textImageRow" => {
    title,
    paragraphs,
    subtitle,
    media { ${MEDIA_FIELDS} }
  },

  // imageRow
  _type == "imageRow" => {
    images[] {
      _key,
      ${MEDIA_FIELDS}
    }
  },

  // imageTextGrid
  _type == "imageTextGrid" => {
    columns[] {
      _key,
      subtitle,
      description,
      media { ${MEDIA_FIELDS} }
    }
  },

  // callToAction
  _type == "callToAction" => {
    title,
    description,
    buttonText,
    buttonLink
  },

  // textBlockCentered
  _type == "textBlockCentered" => {
    section,
    title,
    body
  },

  // textCardRow
  _type == "textCardRow" => {
    cards[] {
      _key,
      icon,
      subtitle,
      description
    }
  },

  // textColumns
  _type == "textColumns" => {
    section,
    title,
    paragraphs,
    subtitle
  },

  // textRowTwoColumn
  _type == "textRowTwoColumn" => {
    section,
    title,
    leftParagraphs,
    rightParagraphs
  },

  // imageFull
  _type == "imageFull" => {
    alt,
    caption,
    image { ${IMAGE_FIELDS} }
  },

  // framedImage
  _type == "framedImage" => {
    alt,
    caption,
    frame,
    image { ${IMAGE_FIELDS} }
  },

  // spacer
  _type == "spacer" => {
    height
  }
`

// Fetch a single case study by slug
export async function getCaseStudyBySlug(slug) {
  const query = `
    *[_type == "caseStudy" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      body[] {
        ${BLOCK_FIELDS},

        // blockGroup — a run of blocks sharing one gap
        _type == "blockGroup" => {
          gap,
          blocks[] {
            ${BLOCK_FIELDS}
          }
        }
      }
    }
  `

  return await client.fetch(query, { slug })
}

// Fetch case study shape (block types only, for skeleton rendering)
export async function getCaseStudyShape(slug) {
  const query = `
    *[_type == "caseStudy" && slug.current == $slug][0]{
      "blockTypes": body[]{
        _type,
        _key,
        _type == "spacer" => { height },
        _type == "framedImage" => { frame },
        _type == "blockGroup" => {
          gap,
          blocks[]{
            _type,
            _key,
            _type == "framedImage" => { frame }
          }
        }
      }
    }
  `

  return await client.fetch(query, { slug })
}

// Fetch all case studies (for listing page)
//
// The cover video projection keeps only the two fields playback needs —
// dereferencing the whole Mux asset drags its full encoding metadata into every
// card on the page. The coalesce covers assets written before the Mux plugin
// lifted playbackId out of `data`.
export async function getAllCaseStudies() {
  const query = `
    *[_type == "caseStudy"] | order(order asc) {
      _id,
      title,
      slug,
      description,
      year,
      role,
      order,
      coverImage,
      "coverVideo": coverVideo.asset-> {
        "playbackId": coalesce(playbackId, data.playback_ids[0].id),
        status
      }
    }
  `

  return client.fetch(query)
}

// Simple cache for prefetching
const caseStudyCache = new Map()
const shapeCache = new Map()

export function getCachedCaseStudy(slug) {
  return caseStudyCache.get(slug)
}

export function setCachedCaseStudy(slug, data) {
  caseStudyCache.set(slug, data)
}

export function getCachedShape(slug) {
  return shapeCache.get(slug)
}

export function setCachedShape(slug, data) {
  shapeCache.set(slug, data)
}

export function clearAllCaches() {
  caseStudyCache.clear()
  shapeCache.clear()
}

export function clearCacheForSlug(slug) {
  caseStudyCache.delete(slug)
  shapeCache.delete(slug)
}

// Cache handles on `window`, for poking at content while writing it. Dev only —
// a production bundle has no business exposing internals on the global object,
// and the guard is static so the block is dropped at build time.
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.__clearCaseStudyCache = clearAllCaches
  window.__clearCacheForSlug = clearCacheForSlug
  window.__inspectCache = () => ({
    bodyCache: Array.from(caseStudyCache.keys()),
    shapeCache: Array.from(shapeCache.keys()),
  })
}

export async function prefetchCaseStudy(slug) {
  if (!slug || caseStudyCache.has(slug)) return

  try {
    const data = await getCaseStudyBySlug(slug)
    if (data) {
      caseStudyCache.set(slug, data)
    }
  } catch (error) {
    console.error('Prefetch error:', error)
  }
}
