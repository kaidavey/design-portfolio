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
        }
      }
    }
  `

  return await client.fetch(query, { slug })
}

// Fetch all case studies (for listing page)
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
      coverImage
    }
  `

  return await client.fetch(query)
}

// Simple cache for prefetching
const caseStudyCache = new Map()

export function getCachedCaseStudy(slug) {
  return caseStudyCache.get(slug)
}

export function setCachedCaseStudy(slug, data) {
  caseStudyCache.set(slug, data)
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
