import { describe, test, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CaseStudyImage from '../components/CaseStudyImage'
import CaseStudyMedia from '../components/CaseStudyMedia'
import ThemedIcon from '../components/ThemedIcon'
import BlockRenderer from '../components/BlockRenderer'
import { ThemeProvider, useTheme } from '../contexts/ThemeContext'
import { resetWarmedImages } from '../lib/warmImage'

/**
 * Light and dark images.
 *
 * A case study is written once and read in two themes, and the images that
 * dark mode breaks are the ones drawn on white: diagrams, charts, mono SVG
 * marks. The editor answers per image — same file, inverted, or a separate
 * dark upload — and these cover what each answer does on the page.
 *
 * The thing worth protecting is that the answer never involves a reload. An
 * inverted image swaps in CSS. An uploaded pair swaps by re-render, on the same
 * `<img>` element, with the twin already warmed into cache. Nothing here
 * refetches the document, and nothing remounts.
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
let warmedImages = []

beforeEach(() => {
  warmedImages = []
  resetWarmedImages()
  document.documentElement.removeAttribute('data-theme')
  localStorage.clear()

  // The warmer waits for idle; running it straight through keeps the tests
  // about what gets fetched rather than when.
  vi.stubGlobal('requestIdleCallback', (run) => run())

  vi.stubGlobal(
    'Image',
    class MockImage {
      // Declared so the warmer's capability check sees it, the way a real
      // HTMLImageElement does.
      fetchPriority = 'auto'

      constructor() {
        warmedImages.push(this)
      }
    }
  )

  vi.stubGlobal(
    'matchMedia',
    vi.fn((query) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
  document.documentElement.removeAttribute('data-theme')
})

/** A dereferenced Sanity image, shaped the way the case study query returns it. */
function imageAsset({ id = 'aaaaaa', width = 1600, height = 1000, extension = 'png' } = {}) {
  return {
    _type: 'image',
    asset: {
      _id: `image-${id}-${width}x${height}-${extension}`,
      extension,
      mimeType: extension === 'svg' ? 'image/svg+xml' : `image/${extension}`,
      metadata: { dimensions: { width, height, aspectRatio: width / height } },
    },
  }
}

const LIGHT = imageAsset({ id: 'aaaaaa' })
const DARK = imageAsset({ id: 'bbbbbb' })

/** A `caseStudyImage` value carrying a light/dark pair. */
function themedMedia(overrides = {}) {
  return {
    image: LIGHT,
    imageDark: DARK,
    imageDarkMode: 'upload',
    alt: 'A screen',
    ...overrides,
  }
}

function renderThemed(ui) {
  function Toggle() {
    const { toggleTheme } = useTheme()
    return <button onClick={toggleTheme}>toggle theme</button>
  }

  return render(
    <ThemeProvider>
      <Toggle />
      {ui}
    </ThemeProvider>
  )
}

function toggleTheme() {
  fireEvent.click(screen.getByText('toggle theme'))
}

describe('which file gets rendered', () => {
  test('the light image on the light page', () => {
    render(<CaseStudyImage source={LIGHT} darkSource={DARK} darkMode="upload" alt="A screen" maxWidth={800} />)

    expect(screen.getByAltText('A screen').getAttribute('src')).toContain('aaaaaa')
  })

  test('the dark image on the dark page', () => {
    document.documentElement.setAttribute('data-theme', 'dark')
    render(<CaseStudyImage source={LIGHT} darkSource={DARK} darkMode="upload" alt="A screen" maxWidth={800} />)

    expect(screen.getByAltText('A screen').getAttribute('src')).toContain('bbbbbb')
  })

  test('the light image on both, until the editor opts in', () => {
    // A dark file sitting in the document is not consent to use it — every
    // image written before this feature existed carries no mode at all.
    document.documentElement.setAttribute('data-theme', 'dark')
    render(<CaseStudyImage source={LIGHT} darkSource={DARK} alt="A screen" maxWidth={800} />)

    expect(screen.getByAltText('A screen').getAttribute('src')).toContain('aaaaaa')
  })

  test('the light image when a dark version was asked for but never uploaded', () => {
    // Half-filled is a normal state while a study is being written, and it must
    // leave a picture on the page rather than a hole.
    document.documentElement.setAttribute('data-theme', 'dark')
    render(<CaseStudyImage source={LIGHT} darkMode="upload" alt="A screen" maxWidth={800} />)

    expect(screen.getByAltText('A screen').getAttribute('src')).toContain('aaaaaa')
  })

  test('still nothing when there is no image at all', () => {
    const { container } = render(<CaseStudyImage source={undefined} darkMode="upload" alt="" maxWidth={800} />)
    expect(container.querySelector('img')).toBeNull()
  })
})

describe('inverting instead of uploading', () => {
  test('carries the invert class and keeps the one file', () => {
    render(<CaseStudyImage source={LIGHT} darkMode="invert" alt="A diagram" maxWidth={800} className="w-full" />)

    const img = screen.getByAltText('A diagram')
    // The class is unconditional — CSS scopes it to the dark page, so the swap
    // costs no re-render and cannot lag behind the theme.
    expect(img).toHaveClass('themed-image-invert')
    expect(img).toHaveClass('w-full')
    expect(img.getAttribute('src')).toContain('aaaaaa')
  })

  test('is the same markup in dark mode — nothing is refetched', () => {
    document.documentElement.setAttribute('data-theme', 'dark')
    render(<CaseStudyImage source={LIGHT} darkMode="invert" alt="A diagram" maxWidth={800} />)

    const img = screen.getByAltText('A diagram')
    expect(img).toHaveClass('themed-image-invert')
    expect(img.getAttribute('src')).toContain('aaaaaa')
  })

  test('leaves an untouched image unmarked', () => {
    render(<CaseStudyImage source={LIGHT} alt="A photo" maxWidth={800} className="w-full" />)

    const img = screen.getByAltText('A photo')
    expect(img).not.toHaveClass('themed-image-invert')
    expect(img).toHaveClass('w-full')
  })
})

describe('switching theme', () => {
  test('swaps the file on the element already on screen', () => {
    renderThemed(
      <CaseStudyImage source={LIGHT} darkSource={DARK} darkMode="upload" alt="A screen" maxWidth={800} />
    )

    const before = screen.getByAltText('A screen')
    expect(before.getAttribute('src')).toContain('aaaaaa')

    toggleTheme()

    const after = screen.getByAltText('A screen')
    // Same node, new source. A remount would blank the box for a frame, which
    // is the thing this whole approach exists to avoid.
    expect(after).toBe(before)
    expect(after.getAttribute('src')).toContain('bbbbbb')
    expect(after.getAttribute('srcset')).toContain('bbbbbb')
  })

  test('and back again', () => {
    renderThemed(
      <CaseStudyImage source={LIGHT} darkSource={DARK} darkMode="upload" alt="A screen" maxWidth={800} />
    )

    toggleTheme()
    toggleTheme()

    expect(screen.getByAltText('A screen').getAttribute('src')).toContain('aaaaaa')
  })
})

describe('warming the twin', () => {
  test('fetches the other file once the visible one has painted', () => {
    render(
      <CaseStudyImage
        source={LIGHT}
        darkSource={DARK}
        darkMode="upload"
        alt="A screen"
        sizes="100vw"
        maxWidth={800}
      />
    )

    expect(warmedImages).toHaveLength(0)

    fireEvent.load(screen.getByAltText('A screen'))

    // Warmed with the same candidate set the real element will ask for, so the
    // browser picks — and caches — the width it is actually going to render.
    expect(warmedImages).toHaveLength(1)
    expect(warmedImages[0].src).toContain('bbbbbb')
    expect(warmedImages[0].srcset).toContain('bbbbbb')
    expect(warmedImages[0].sizes).toBe('100vw')
    expect(warmedImages[0].fetchPriority).toBe('low')
  })

  test('warms nothing for an image with no second file', () => {
    render(<CaseStudyImage source={LIGHT} darkMode="invert" alt="A diagram" maxWidth={800} />)
    fireEvent.load(screen.getByAltText('A diagram'))

    expect(warmedImages).toHaveLength(0)
  })

  test('warms a given candidate set only once across the page', () => {
    render(
      <>
        <CaseStudyImage source={LIGHT} darkSource={DARK} darkMode="upload" alt="First" maxWidth={800} />
        <CaseStudyImage source={LIGHT} darkSource={DARK} darkMode="upload" alt="Second" maxWidth={800} />
      </>
    )

    fireEvent.load(screen.getByAltText('First'))
    fireEvent.load(screen.getByAltText('Second'))

    expect(warmedImages).toHaveLength(1)
  })
})

describe('SVG', () => {
  test('gets one URL rather than five of the same file', () => {
    // Sanity does not rasterise SVG, so a `?w=` candidate list is five names for
    // one file — no sharper anywhere, and five chances to miss the cache.
    render(<CaseStudyImage source={imageAsset({ id: 'cccccc', extension: 'svg' })} alt="A mark" maxWidth={800} />)

    const img = screen.getByAltText('A mark')
    expect(img.getAttribute('src')).toContain('.svg')
    expect(img.getAttribute('src')).not.toContain('w=')
    expect(img.getAttribute('srcset')).toBeNull()
  })

  test('still swaps between a light and dark pair', () => {
    document.documentElement.setAttribute('data-theme', 'dark')
    render(
      <CaseStudyImage
        source={imageAsset({ id: 'cccccc', extension: 'svg' })}
        darkSource={imageAsset({ id: 'dddddd', extension: 'svg' })}
        darkMode="upload"
        alt="A mark"
        maxWidth={800}
      />
    )

    expect(screen.getByAltText('A mark').getAttribute('src')).toContain('dddddd')
  })
})

describe('icons', () => {
  test('swap with the theme like any other image', () => {
    renderThemed(
      <ThemedIcon source={LIGHT} darkSource={DARK} darkMode="upload" size={24} className="size-6" />
    )

    const icon = document.querySelector('img')
    expect(icon.getAttribute('src')).toContain('aaaaaa')

    toggleTheme()

    expect(document.querySelector('img')).toBe(icon)
    expect(icon.getAttribute('src')).toContain('bbbbbb')
  })

  test('can be inverted instead', () => {
    render(<ThemedIcon source={LIGHT} darkMode="invert" size={24} className="size-6" />)

    const icon = document.querySelector('img')
    expect(icon).toHaveClass('themed-image-invert')
    expect(icon).toHaveClass('size-6')
  })

  test('stay decorative — an icon is never read out', () => {
    render(<ThemedIcon source={LIGHT} size={24} />)
    expect(document.querySelector('img')).toHaveAttribute('alt', '')
  })

  test('render nothing when the block carries no icon', () => {
    const { container } = render(<ThemedIcon source={undefined} size={24} />)
    expect(container.querySelector('img')).toBeNull()
  })
})

describe('every block that holds an image', () => {
  test('a media slot carries the choice through, framed or not', () => {
    document.documentElement.setAttribute('data-theme', 'dark')
    render(
      <>
        <CaseStudyMedia media={themedMedia()} maxWidth={800} />
        <CaseStudyMedia
          media={themedMedia({ alt: 'Framed', framed: true, frame: { aspectRatio: '4/3' } })}
          maxWidth={800}
        />
      </>
    )

    expect(screen.getByAltText('A screen').getAttribute('src')).toContain('bbbbbb')
    expect(screen.getByAltText('Framed').getAttribute('src')).toContain('bbbbbb')
  })

  test('reaches every block type from the document down', () => {
    document.documentElement.setAttribute('data-theme', 'dark')

    render(
      <BlockRenderer
        blocks={[
          {
            _key: 'hero',
            _type: 'hero',
            title: 'A study',
            icon: LIGHT,
            iconDark: DARK,
            iconDarkMode: 'upload',
          },
          {
            _key: 'cards',
            _type: 'textCardRow',
            cards: [
              {
                _key: 'c1',
                icon: LIGHT,
                iconDark: DARK,
                iconDarkMode: 'upload',
                subtitle: 'One',
                description: 'First',
              },
            ],
          },
          {
            _key: 'full',
            _type: 'imageFull',
            image: LIGHT,
            imageDark: DARK,
            imageDarkMode: 'upload',
            alt: 'Full bleed',
          },
          {
            _key: 'framed',
            _type: 'framedImage',
            image: LIGHT,
            imageDark: DARK,
            imageDarkMode: 'upload',
            alt: 'On a surface',
            frame: { aspectRatio: '16/9' },
          },
          {
            _key: 'row',
            _type: 'imageRow',
            images: [
              { ...themedMedia({ alt: 'Row left' }), _key: 'r1' },
              { ...themedMedia({ alt: 'Row right' }), _key: 'r2' },
            ],
          },
          {
            _key: 'grid',
            _type: 'imageTextGrid',
            columns: [
              { _key: 'g1', media: themedMedia({ alt: 'Grid one' }), subtitle: 'One', description: 'First' },
              { _key: 'g2', media: themedMedia({ alt: 'Grid two' }), subtitle: 'Two', description: 'Second' },
            ],
          },
          {
            _key: 'textImage',
            _type: 'textImageRow',
            title: 'Findings',
            paragraphs: ['A paragraph'],
            media: themedMedia({ alt: 'Beside the text' }),
          },
        ]}
      />
    )

    for (const alt of ['Full bleed', 'On a surface', 'Row left', 'Row right', 'Grid one', 'Grid two', 'Beside the text']) {
      expect(screen.getByAltText(alt).getAttribute('src')).toContain('bbbbbb')
    }

    // The two decorative icons — hero mark and card mark — carry empty alt, so
    // they are found by position rather than by name.
    const icons = Array.from(document.querySelectorAll('img[alt=""]'))
    expect(icons).toHaveLength(2)
    for (const icon of icons) {
      expect(icon.getAttribute('src')).toContain('bbbbbb')
    }
  })
})
