import { describe, test, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CaseStudyImage from '../components/CaseStudyImage'
import ThemedIcon from '../components/ThemedIcon'
import BlockRenderer from '../components/BlockRenderer'
import { ThemeProvider, useTheme } from '../contexts/ThemeContext'

/**
 * Light and dark images.
 *
 * Both dark mode fields are optional — most images read fine in either theme
 * and carry neither. The ones that do not are drawn on white: diagrams, mono
 * SVG marks. An editor answers with a second upload or with `invert`.
 *
 * What is worth protecting is that neither answer involves a reload. Invert
 * swaps in CSS. A pair swaps by re-render, on the same `<img>` element, with
 * the twin already warmed into cache.
 */

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

/** Images created by the cache warmer, in the order it created them. */
let warmed = []

beforeEach(() => {
  warmed = []
  document.documentElement.removeAttribute('data-theme')
  localStorage.clear()

  vi.stubGlobal(
    'Image',
    class MockImage {
      // Declared so it behaves like the real element the warmer configures.
      fetchPriority = 'auto'

      constructor() {
        warmed.push(this)
      }
    }
  )

  vi.stubGlobal(
    'matchMedia',
    vi.fn((query) => ({ matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
  document.documentElement.removeAttribute('data-theme')
})

/** A dereferenced Sanity image, shaped the way the case study query returns it. */
function imageAsset({ id = 'aaaaaa', extension = 'png' } = {}) {
  return {
    _type: 'image',
    asset: {
      _id: `image-${id}-1600x1000-${extension}`,
      extension,
      metadata: { dimensions: { width: 1600, height: 1000, aspectRatio: 1.6 } },
    },
  }
}

const LIGHT = imageAsset()
const DARK = imageAsset({ id: 'bbbbbb' })

/** A `caseStudyImage` value carrying a light/dark pair. */
const pair = (alt) => ({ image: LIGHT, imageDark: DARK, alt })

function inDarkMode() {
  document.documentElement.setAttribute('data-theme', 'dark')
}

function srcOf(alt) {
  return screen.getByAltText(alt).getAttribute('src')
}

describe('which file gets rendered', () => {
  test('the light one, when no dark version was uploaded', () => {
    // The common case by far, and the reason both fields are optional.
    inDarkMode()
    render(<CaseStudyImage source={LIGHT} alt="A photo" maxWidth={800} />)

    expect(srcOf('A photo')).toContain('aaaaaa')
  })

  test('the light one on the light page, the dark one on the dark page', () => {
    const { unmount } = render(<CaseStudyImage source={LIGHT} darkSource={DARK} alt="A screen" maxWidth={800} />)
    expect(srcOf('A screen')).toContain('aaaaaa')
    unmount()

    inDarkMode()
    render(<CaseStudyImage source={LIGHT} darkSource={DARK} alt="A screen" maxWidth={800} />)
    expect(srcOf('A screen')).toContain('bbbbbb')
  })

  test('an inverted image is one file in both themes, marked for CSS', () => {
    render(<CaseStudyImage source={LIGHT} invert alt="A diagram" maxWidth={800} className="w-full" />)

    const img = screen.getByAltText('A diagram')
    // Unconditional — CSS scopes it to the dark page, so the swap costs no
    // re-render and cannot lag behind the theme.
    expect(img).toHaveClass('themed-image-invert', 'w-full')
    expect(img.getAttribute('src')).toContain('aaaaaa')
  })

  test('an ordinary image is left unmarked', () => {
    render(<CaseStudyImage source={LIGHT} alt="A photo" maxWidth={800} className="w-full" />)

    expect(screen.getByAltText('A photo')).not.toHaveClass('themed-image-invert')
  })
})

describe('switching theme', () => {
  function Toggle() {
    const { toggleTheme } = useTheme()
    return <button onClick={toggleTheme}>toggle theme</button>
  }

  test('swaps the file on the element already on screen', () => {
    render(
      <ThemeProvider>
        <Toggle />
        <CaseStudyImage source={LIGHT} darkSource={DARK} alt="A screen" maxWidth={800} />
      </ThemeProvider>
    )

    const before = screen.getByAltText('A screen')
    expect(before.getAttribute('src')).toContain('aaaaaa')

    fireEvent.click(screen.getByText('toggle theme'))

    // Same node, new source. A remount would blank the box for a frame, which
    // is the thing this whole approach exists to avoid.
    expect(screen.getByAltText('A screen')).toBe(before)
    expect(before.getAttribute('src')).toContain('bbbbbb')
    expect(before.getAttribute('srcset')).toContain('bbbbbb')
  })
})

describe('warming the twin', () => {
  test('fetches the other file, at low priority, once the visible one has painted', () => {
    render(<CaseStudyImage source={LIGHT} darkSource={DARK} alt="A screen" sizes="100vw" maxWidth={800} />)
    expect(warmed).toHaveLength(0)

    fireEvent.load(screen.getByAltText('A screen'))

    // Same candidate set as the real element, so the browser caches the width
    // it is actually going to be asked for.
    expect(warmed).toHaveLength(1)
    expect(warmed[0]).toMatchObject({ fetchPriority: 'low', sizes: '100vw' })
    expect(warmed[0].src).toContain('bbbbbb')
    expect(warmed[0].srcset).toContain('bbbbbb')
  })

  test('warms nothing for an image with no second file', () => {
    render(<CaseStudyImage source={LIGHT} invert alt="A diagram" maxWidth={800} />)
    fireEvent.load(screen.getByAltText('A diagram'))

    expect(warmed).toHaveLength(0)
  })
})

describe('SVG', () => {
  test('gets one URL rather than five names for one file', () => {
    render(<CaseStudyImage source={imageAsset({ id: 'cccccc', extension: 'svg' })} alt="A mark" maxWidth={800} />)

    const img = screen.getByAltText('A mark')
    expect(img.getAttribute('src')).toContain('.svg')
    expect(img.getAttribute('src')).not.toContain('w=')
    expect(img.getAttribute('srcset')).toBeNull()
  })
})

describe('icons', () => {
  test('take the dark file like any other image', () => {
    inDarkMode()
    render(<ThemedIcon source={LIGHT} darkSource={DARK} size={24} className="size-6" />)

    const icon = document.querySelector('img')
    expect(icon.getAttribute('src')).toContain('bbbbbb')
    // Decorative — an icon is never read out.
    expect(icon).toHaveAttribute('alt', '')
  })

  test('can be inverted instead', () => {
    render(<ThemedIcon source={LIGHT} invert size={24} className="size-6" />)

    expect(document.querySelector('img')).toHaveClass('themed-image-invert', 'size-6')
  })

  test('render nothing when the block carries no icon', () => {
    const { container } = render(<ThemedIcon source={undefined} size={24} />)
    expect(container.querySelector('img')).toBeNull()
  })
})

test('every block that holds an image passes the choice through', () => {
  inDarkMode()

  render(
    <BlockRenderer
      blocks={[
        { _key: 'hero', _type: 'hero', title: 'A study', icon: LIGHT, iconDark: DARK },
        {
          _key: 'cards',
          _type: 'textCardRow',
          cards: [{ _key: 'c1', icon: LIGHT, iconDark: DARK, subtitle: 'One', description: 'First' }],
        },
        { _key: 'full', _type: 'imageFull', image: LIGHT, imageDark: DARK, alt: 'Full bleed' },
        {
          _key: 'framed',
          _type: 'framedImage',
          image: LIGHT,
          imageDark: DARK,
          alt: 'On a surface',
          frame: { aspectRatio: '16/9' },
        },
        {
          _key: 'row',
          _type: 'imageRow',
          images: [
            { ...pair('Row left'), _key: 'r1' },
            { ...pair('Row right'), _key: 'r2' },
          ],
        },
        {
          _key: 'grid',
          _type: 'imageTextGrid',
          columns: [
            { _key: 'g1', media: pair('Grid one'), subtitle: 'One', description: 'First' },
            { _key: 'g2', media: pair('Grid two'), subtitle: 'Two', description: 'Second' },
          ],
        },
        {
          _key: 'textImage',
          _type: 'textImageRow',
          title: 'Findings',
          paragraphs: ['A paragraph'],
          media: pair('Beside the text'),
        },
      ]}
    />
  )

  for (const alt of ['Full bleed', 'On a surface', 'Row left', 'Row right', 'Grid one', 'Grid two', 'Beside the text']) {
    expect(srcOf(alt)).toContain('bbbbbb')
  }

  // The hero mark and the card mark, found by position — both carry empty alt.
  const icons = Array.from(document.querySelectorAll('img[alt=""]'))
  expect(icons).toHaveLength(2)
  for (const icon of icons) expect(icon.getAttribute('src')).toContain('bbbbbb')
})
