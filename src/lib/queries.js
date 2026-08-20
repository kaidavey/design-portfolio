import { client } from './sanity'

// Fetch a single case study by slug
export async function getCaseStudyBySlug(slug) {
  const query = `
    *[_type == "caseStudy" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      year,
      role,
      timeline,
      team,
      tools,
      coverImage,
      body[] {
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
          title,
          timeframe
        },

        // textImageRow
        _type == "textImageRow" => {
          title,
          paragraphs,
          subtitle,
          image
        },

        // imageRow
        _type == "imageRow" => {
          images[] {
            image,
            caption
          }
        },

        // imageTextGrid
        _type == "imageTextGrid" => {
          columns[] {
            image,
            subtitle,
            description
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
          image,
          caption
        },

        // spacer
        _type == "spacer" => {
          height
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
        _type == "spacer" => { height }
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

// Debug utilities - expose cache clearing on window
export function clearAllCaches() {
  console.log('[Cache] Clearing all caches')
  caseStudyCache.clear()
  shapeCache.clear()
}

export function clearCacheForSlug(slug) {
  console.log('[Cache] Clearing cache for', slug)
  caseStudyCache.delete(slug)
  shapeCache.delete(slug)
}

// Expose to window for debugging
if (typeof window !== 'undefined') {
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
