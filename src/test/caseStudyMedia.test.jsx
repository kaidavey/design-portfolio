import { describe, test, expect, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import CaseStudyMedia from '../components/CaseStudyMedia'
import CaseStudyImage from '../components/CaseStudyImage'
import BlockRenderer from '../components/BlockRenderer'
import { FRAME_DEFAULTS } from '../config/imageFrame'

/**
 * Image blocks — plain vs framed.
 *
 * The two behave in opposite ways on purpose. A plain image fills the width it
 * is given and takes its height from its own proportions. A framed image does
 * the reverse: the frame owns the shape and the image inside is only ever
 * scaled down to fit it, never cropped and never stretched.
 *
 * These cover that split, the fallbacks that keep a half-written block from
 * taking the page down, and the fact that a frame can appear in every slot an
 * image can.
 */

// jsdom ships no IntersectionObserver, and every block sets one up.
beforeAll(() => {
  if (!globalThis.IntersectionObserver) {
    globalThis.IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return []
      }
    }
  }
})

/** A dereferenced Sanity image, shaped the way the case study query returns it. */
function imageAsset({ width = 1600, height = 1000 } = {}) {
  return {
    _type: 'image',
    asset: {
      _id: `image-abc123-${width}x${height}-png`,
      metadata: { dimensions: { width, height, aspectRatio: width / height } },
    },
  }
}

function media(overrides = {}) {
  return { image: imageAsset(), alt: 'A screen', ...overrides }
}

/** The frame is the element carrying an inline aspect-ratio. */
function frameOf(container) {
  return container.querySelector('[style*="aspect-ratio"]:not(img)')
}

describe('CaseStudyImage', () => {
  test('reserves the image height from the dereferenced dimensions', () => {
    render(<CaseStudyImage source={imageAsset({ width: 1600, height: 1000 })} alt="A screen" maxWidth={800} />)

    // 1.6 is what stops the column jumping when the bytes land (jsdom
    // normalises the ratio to `<width> / <height>`).
    expect(screen.getByAltText('A screen').style.aspectRatio).toBe('1.6 / 1')
  })

  test('renders nothing when the image field was never filled in', () => {
    const { container } = render(<CaseStudyImage source={undefined} alt="" maxWidth={800} />)
    expect(container.querySelector('img')).toBeNull()
  })

  test('serves a srcset so the browser can pick a width', () => {
    render(<CaseStudyImage source={imageAsset()} alt="A screen" maxWidth={800} />)

    const img = screen.getByAltText('A screen')
    expect(img.getAttribute('srcset')).toContain('800w')
    expect(img).toHaveAttribute('loading', 'lazy')
  })
})

describe('CaseStudyMedia', () => {
  test('an unframed image fills its slot and gets no frame', () => {
    const { container } = render(
      <CaseStudyMedia media={media()} maxWidth={800} fillClassName="w-full object-cover" />
    )

    expect(frameOf(container)).toBeNull()
    expect(screen.getByAltText('A screen')).toHaveClass('object-cover')
  })

  test('a framed image sits uncropped inside a frame that owns the shape', () => {
    const { container } = render(
      <CaseStudyMedia
        media={media({ framed: true, frame: { aspectRatio: '4/3', padding: 'lg', background: 'dark' } })}
        maxWidth={800}
        fillClassName="w-full object-cover"
      />
    )

    const frame = frameOf(container)
    expect(frame).not.toBeNull()
    expect(frame.style.aspectRatio).toBe('4/3')

    const img = screen.getByAltText('A screen')
    // Contained, not covered — cropping a device shot is the one thing a frame
    // must never do.
    expect(img).toHaveClass('object-contain')
    expect(img).not.toHaveClass('object-cover')
    expect(img).toHaveClass('max-h-full')
  })

  test('falls back to the default shape when a block carries no frame settings', () => {
    const { container } = render(<CaseStudyMedia media={media({ framed: true })} maxWidth={800} />)

    expect(frameOf(container).style.aspectRatio).toBe(FRAME_DEFAULTS.aspectRatio)
  })

  test('ignores a shape that is not on the schema list', () => {
    const { container } = render(
      <CaseStudyMedia media={media({ framed: true, frame: { aspectRatio: '13/7' } })} maxWidth={800} />
    )

    // A bad ratio would collapse the frame to zero height, so it degrades to
    // the default instead of passing straight through to CSS.
    expect(frameOf(container).style.aspectRatio).toBe(FRAME_DEFAULTS.aspectRatio)
  })

  test('caps a portrait frame by height so it never becomes a column of gray', () => {
    const { container } = render(
      <CaseStudyMedia media={media({ framed: true, frame: { aspectRatio: '9/16' } })} maxWidth={800} />
    )

    const frame = frameOf(container)
    // Height is capped first and the width follows from the ratio, so the shape
    // stays exact instead of the cap flattening it.
    expect(frame.style.maxHeight).toBe('var(--frame-max-height)')
    expect(frame.style.width).toBe('min(100%, calc(var(--frame-max-height) * 0.5625))')
  })

  test('a landscape frame still fills the container it is given', () => {
    const { container } = render(
      <CaseStudyMedia media={media({ framed: true, frame: { aspectRatio: '16/9' } })} maxWidth={800} />
    )

    // min() resolves to 100% at any realistic viewport for a wide frame.
    expect(frameOf(container).style.width).toContain('min(100%')
  })

  test('renders nothing when the media slot is empty', () => {
    const { container } = render(<CaseStudyMedia media={undefined} maxWidth={800} />)
    expect(container.querySelector('img')).toBeNull()
  })
})

describe('image blocks', () => {
  test('the standalone image block spans the container and keeps its own height', () => {
    const { container } = render(
      <BlockRenderer
        blocks={[{ _key: 'a', _type: 'imageFull', image: imageAsset(), alt: 'A screen', caption: 'Shipped' }]}
      />
    )

    const img = screen.getByAltText('A screen')
    expect(img).toHaveClass('w-full')
    expect(img).toHaveClass('h-auto')
    expect(img).not.toHaveClass('object-cover')
    expect(frameOf(container)).toBeNull()
    expect(screen.getByText('Shipped')).toBeInTheDocument()
  })

  test('the framed image block renders a frame', () => {
    const { container } = render(
      <BlockRenderer
        blocks={[
          {
            _key: 'a',
            _type: 'framedImage',
            image: imageAsset(),
            alt: 'A phone',
            frame: { aspectRatio: '1/1', padding: 'sm', background: 'surface' },
          },
        ]}
      />
    )

    expect(frameOf(container).style.aspectRatio).toBe('1/1')
    expect(screen.getByAltText('A phone')).toHaveClass('object-contain')
  })

  test('a frame can go in any slot a plain image can', () => {
    const framed = media({ framed: true, alt: 'Framed one', frame: { aspectRatio: '9/16' } })
    const plain = media({ alt: 'Plain one' })

    const { container } = render(
      <BlockRenderer
        blocks={[
          { _key: 'row', _type: 'imageRow', images: [{ ...framed, _key: 'r1' }, { ...plain, _key: 'r2' }] },
          {
            _key: 'grid',
            _type: 'imageTextGrid',
            columns: [
              { _key: 'c1', media: framed, subtitle: 'One', description: 'First' },
              { _key: 'c2', media: plain, subtitle: 'Two', description: 'Second' },
            ],
          },
          {
            _key: 'text',
            _type: 'textImageRow',
            title: 'Title',
            paragraphs: ['Body'],
            media: framed,
          },
        ]}
      />
    )

    // One frame per framed slot: image row, grid column, text + image row.
    expect(container.querySelectorAll('[style*="aspect-ratio"]:not(img)')).toHaveLength(3)
    expect(screen.getAllByAltText('Framed one')).toHaveLength(3)
    expect(screen.getAllByAltText('Plain one')).toHaveLength(2)
  })
})
