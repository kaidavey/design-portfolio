import { describe, test, expect, beforeAll } from 'vitest'
import { render } from '@testing-library/react'
import { measureVisibleCut } from '../hooks/useExpandMorph'
import { MorphCutProvider } from '../context/MorphCutContext'
import BlockRenderer from '../components/BlockRenderer'

/**
 * Expand morph — block cut
 *
 * The morph un-clips the compact box so the block column can grow past its
 * edges. Every block the user scrolled past is still mounted at opacity 1, so
 * without a cut they all paint, widen with the column, and then vanish at the
 * handoff because the expanded column never painted them.
 *
 * These cover the two halves of the fix: measuring which blocks the expanded
 * column will paint, and hiding everything past that in the compact column.
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

/** A detached expanded column whose blocks report the given viewport tops. */
function columnWithTops(tops) {
  const root = document.createElement('div')

  tops.forEach((top, index) => {
    const block = document.createElement('div')
    block.dataset.blockIndex = String(index)
    block.getBoundingClientRect = () => ({
      top,
      bottom: top + 100,
      left: 0,
      right: 0,
      width: 100,
      height: 100,
    })
    root.appendChild(block)
  })

  return root
}

function textBlocks(count) {
  return Array.from({ length: count }, (_, i) => ({
    _key: `block-${i}`,
    _type: 'textBlockCentered',
    body: `Block ${i}`,
  }))
}

describe('measureVisibleCut', () => {
  test('cuts at the last block that starts above the viewport fold', () => {
    const fold = window.innerHeight
    const root = columnWithTops([0, fold * 0.4, fold * 0.8, fold + 10, fold * 2])

    // Index 2 starts above the fold; index 3 does not, and everything after it
    // is further down still.
    expect(measureVisibleCut(root)).toBe(2)
  })

  test('stops at the first block past the fold rather than scanning on', () => {
    const fold = window.innerHeight
    // A short block below the fold followed by one that (impossibly) reports
    // back above it. The scan must not reach the second.
    const root = columnWithTops([0, fold + 10, 0])

    expect(measureVisibleCut(root)).toBe(0)
  })

  test('degrades to no cut when there are no blocks to measure', () => {
    expect(measureVisibleCut(document.createElement('div'))).toBeNull()
    expect(measureVisibleCut(null)).toBeNull()
    expect(measureVisibleCut(undefined)).toBeNull()
  })

  test('degrades to no cut when nothing has been laid out', () => {
    // Every rect reads zero before layout — and in jsdom generally. Every block
    // then measures as on-screen, so the cut lands on the last one and hides
    // nothing. The failure direction has to be "no cut", never "hide it all".
    const root = columnWithTops([0, 0, 0, 0])

    expect(measureVisibleCut(root)).toBe(3)
  })

  test('degrades to no cut when even the first block is past the fold', () => {
    const root = columnWithTops([window.innerHeight + 1, window.innerHeight + 200])

    expect(measureVisibleCut(root)).toBeNull()
  })
})

describe('BlockRenderer cut', () => {
  test('tags every block with its index for the morph to measure', () => {
    const { container } = render(<BlockRenderer blocks={textBlocks(3)} />)

    const indices = [...container.querySelectorAll('[data-block-index]')].map(
      (node) => node.dataset.blockIndex
    )
    expect(indices).toEqual(['0', '1', '2'])
  })

  test('hides blocks past the cut and leaves the rest painting', () => {
    const { container } = render(
      <MorphCutProvider cutIndex={1}>
        <BlockRenderer blocks={textBlocks(4)} />
      </MorphCutProvider>
    )

    const blocks = [...container.querySelectorAll('[data-block-index]')]
    expect(blocks).toHaveLength(4)
    expect(blocks[0].style.display).not.toBe('none')
    expect(blocks[1].style.display).not.toBe('none')
    expect(blocks[2].style.display).toBe('none')
    expect(blocks[3].style.display).toBe('none')
  })

  test('paints everything when there is no cut', () => {
    const { container } = render(
      <MorphCutProvider cutIndex={null}>
        <BlockRenderer blocks={textBlocks(3)} />
      </MorphCutProvider>
    )

    for (const block of container.querySelectorAll('[data-block-index]')) {
      expect(block.style.display).not.toBe('none')
    }
  })

  test('a cut of 0 keeps the first block', () => {
    const { container } = render(
      <MorphCutProvider cutIndex={0}>
        <BlockRenderer blocks={textBlocks(3)} />
      </MorphCutProvider>
    )

    const blocks = [...container.querySelectorAll('[data-block-index]')]
    expect(blocks[0].style.display).not.toBe('none')
    expect(blocks[1].style.display).toBe('none')
  })
})

/**
 * Groups and the index contract.
 *
 * A Group nests blocks one level deep, which is exactly the shape that could
 * break the cut: measureVisibleCut walks [data-block-index] flat and stops at
 * the first block past the fold, and AnimatedBlock hides everything past that
 * index. Both only work while "past the cut" and "further down the page" mean
 * the same thing.
 *
 * So the numbering has to run in document order across the whole tree, and the
 * group itself must not take a number — it paints nothing.
 */
describe('BlockRenderer groups', () => {
  function group(gap, children) {
    return { _key: `group-${gap}`, _type: 'blockGroup', gap, blocks: children }
  }

  function text(key) {
    return { _key: key, _type: 'textBlockCentered', body: key }
  }

  function indicesOf(container) {
    return [...container.querySelectorAll('[data-block-index]')].map(
      (node) => node.dataset.blockIndex
    )
  }

  test('numbers grouped blocks in document order, and the group itself not at all', () => {
    const { container } = render(
      <BlockRenderer
        blocks={[text('a'), group(16, [text('b'), text('c')]), text('d')]}
      />
    )

    // Four blocks paint, so four indices — the group contributed its children
    // and took no number of its own.
    expect(indicesOf(container)).toEqual(['0', '1', '2', '3'])
  })

  test('keeps numbering monotonic across several groups', () => {
    const { container } = render(
      <BlockRenderer
        blocks={[
          group(8, [text('a'), text('b')]),
          text('c'),
          group(48, [text('d'), text('e'), text('f')]),
        ]}
      />
    )

    const indices = indicesOf(container).map(Number)
    expect(indices).toEqual([0, 1, 2, 3, 4, 5])
    // Document order is what measureVisibleCut walks; if this ever stops
    // increasing, the cut hides the wrong half of the column.
    expect([...indices].sort((a, b) => a - b)).toEqual(indices)
  })

  test('cuts through a group boundary without hiding anything retained', () => {
    const { container } = render(
      <MorphCutProvider cutIndex={1}>
        <BlockRenderer blocks={[text('a'), group(16, [text('b'), text('c')]), text('d')]} />
      </MorphCutProvider>
    )

    const hidden = [...container.querySelectorAll('[data-block-index]')].map(
      (node) => node.style.display === 'none'
    )
    // Indices 0 and 1 are retained, 2 and 3 are cut — a contiguous suffix even
    // though the cut lands inside the group.
    expect(hidden).toEqual([false, false, true, true])
  })

  test('applies the group gap, and falls back to the body default', () => {
    const { container } = render(
      <BlockRenderer
        blocks={[group(8, [text('a'), text('b')]), { _key: 'g2', _type: 'blockGroup', blocks: [text('c'), text('d')] }]}
      />
    )

    const columns = [...container.querySelectorAll('[style*="gap"]')]
    expect(columns[0].style.gap).toBe('8px')
    // No gap set on the block at all — the body default stands in.
    expect(columns[1].style.gap).toBe('32px')
  })

  test('hands the expand button to the first block even when it sits in a group', () => {
    render(
      <BlockRenderer
        blocks={[group(16, [text('a'), text('b')]), text('c')]}
        expandButton={<button type="button">Expand</button>}
      />
    )

    // The button belongs to whatever paints first, group or not.
    const first = document.querySelector('[data-block-index="0"]')
    expect(first.querySelector('button')).not.toBeNull()
  })
})
