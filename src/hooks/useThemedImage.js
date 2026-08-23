import { useThemeMode } from '../contexts/ThemeContext'

/**
 * Dark mode for one image. Both fields are optional and most images carry
 * neither — they read fine in either theme and this resolves to a no-op.
 *
 * A dark upload wins when there is one. `invert` is returned as a class rather
 * than a decision, because `[data-theme='dark']` then scopes it in CSS: the
 * swap lands in the same style recalculation that flips the theme, with no
 * re-render and nothing to load.
 *
 * `alternate` is the file the *other* theme wants, for the caller to warm.
 */
export function useThemedImage(source, { darkSource, invert } = {}) {
  const isDark = useThemeMode() === 'dark'
  const paired = Boolean(darkSource?.asset)

  return {
    source: paired && isDark ? darkSource : source,
    alternate: paired ? (isDark ? source : darkSource) : null,
    invertClass: invert ? 'themed-image-invert' : '',
  }
}

/**
 * Pull the other theme's file into cache once the visible one has painted, so
 * the first toggle is a repaint rather than a round trip. Low priority — it
 * must never compete with something the reader is waiting on. Carries the same
 * candidate set as the real element so the browser warms the width it will
 * actually be asked for.
 */
export function warmImage({ src, srcSet, sizes }) {
  const img = new Image()
  img.fetchPriority = 'low'
  if (sizes) img.sizes = sizes
  if (srcSet) img.srcset = srcSet
  img.src = src
}
