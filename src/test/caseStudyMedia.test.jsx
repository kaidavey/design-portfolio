import { describe, test, expect, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import CaseStudyMedia from '../components/CaseStudyMedia'
import CaseStudyImage from '../components/CaseStudyImage'
import BlockRenderer from '../components/BlockRenderer'
import { BLOCK_SURFACE } from '../config/blockSurface'

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

/** The frame is the surface a contained image sits on. */
function frameOf(container) {
  const image = container.querySelector('img.object-contain')
  return image?.parentElement ?? null
}

/** Every frame in the tree, in document order. */
function framesOf(container) {
  return [...container.querySelectorAll('img.object-contain')].map((img) => img.parentElement)
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

  test('a framed image sits uncropped on a surface that owns the height', () => {
    const { container } = render(
      <CaseStudyMedia
        media={media({ framed: true, height: 45, frame: { padding: 'lg' } })}
        maxWidth={800}
        fillClassName="w-full object-cover"
      />
    )

    const frame = frameOf(container)
    expect(frame).not.toBeNull()
    // svh, not vh: on a phone vh is measured against the largest viewport, so a
    // vh-sized block resizes every time the browser chrome hides on scroll.
    expect(frame.style.height).toBe('45svh')

    const img = screen.getByAltText('A screen')
    // Contained, not covered — cropping a device shot is the one thing a frame
    // must never do.
    expect(img).toHaveClass('object-contain')
    expect(img).not.toHaveClass('object-cover')
    expect(img).toHaveClass('max-h-full')
  })

  test('wears the same surface as every other block', () => {
    const { container } = render(
      <CaseStudyMedia media={media({ framed: true, height: 40 })} maxWidth={800} />
    )

    // The whole point of the shared constant: a frame cannot drift away from
    // the skin a Text Block or a Call to Action wears.
    for (const className of BLOCK_SURFACE.split(' ')) {
      expect(frameOf(container)).toHaveClass(className)
    }
  })

  test('takes its height from the slot when the editor set none', () => {
    const { container } = render(<CaseStudyMedia media={media({ framed: true })} maxWidth={800} />)

    // Inside a row or grid the slot governs the height, so the frame imposes
    // nothing of its own.
    expect(frameOf(container).style.height).toBe('')
  })

  test('clamps a height outside the range the schema allows', () => {
    const { container: tall } = render(
      <CaseStudyMedia media={media({ framed: true, height: 400 })} maxWidth={800} />
    )
    const { container: short } = render(
      <CaseStudyMedia media={media({ framed: true, height: 1 })} maxWidth={800} />
    )

    // A stray value must not collapse a block or run it off the screen.
    expect(frameOf(tall).style.height).toBe('100svh')
    expect(frameOf(short).style.height).toBe('10svh')
  })

  test('renders nothing when the media slot is empty', () => {
    const { container } = render(<CaseStudyMedia media={undefined} maxWidth={800} />)
    expect(container.querySelector('img')).toBeNull()
  })
})

describe('image blocks', () => {
  test('a plain image at a fixed height fills the box and crops to it', () => {
    render(
      <BlockRenderer
        blocks={[
          { _key: 'a', _type: 'imageFull', image: imageAsset(), alt: 'A screen', height: 35 },
        ]}
      />
    )

    const img = screen.getByAltText('A screen')
    // Fixed height plus full width means something has to give, and for a plain
    // image that is the crop — the alternative is letterboxing a bleed image.
    expect(img).toHaveClass('object-cover')
    expect(img.parentElement.style.height).toBe('35svh')
    // The intrinsic ratio would fight the fixed height, so it is not applied.
    expect(img.style.aspectRatio).toBe('')
  })

  test('crops a fixed-height image around its hotspot', () => {
    const withHotspot = { ...imageAsset(), hotspot: { x: 0.25, y: 0.8 } }

    render(
      <BlockRenderer
        blocks={[
          { _key: 'a', _type: 'imageFull', image: withHotspot, alt: 'A screen', height: 35 },
        ]}
      />
    )

    // The hotspot is the editor's answer to what has to survive the crop.
    expect(screen.getByAltText('A screen').style.objectPosition).toBe('25.00% 80.00%')
  })

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

  test('the framed image block stands at the height it was given', () => {
    const { container } = render(
      <BlockRenderer
        blocks={[
          {
            _key: 'a',
            _type: 'framedImage',
            image: imageAsset(),
            alt: 'A phone',
            height: 55,
            frame: { padding: 'sm' },
          },
        ]}
      />
    )

    expect(frameOf(container).style.height).toBe('55svh')
    expect(screen.getByAltText('A phone')).toHaveClass('object-contain')
  })

  test('a frame can go in any slot a plain image can', () => {
    const framed = media({ framed: true, alt: 'Framed one', height: 30 })
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
    expect(framesOf(container)).toHaveLength(3)
    expect(screen.getAllByAltText('Framed one')).toHaveLength(3)
    expect(screen.getAllByAltText('Plain one')).toHaveLength(2)
  })
})
