import { useThemeMode } from '../contexts/ThemeContext'

/**
 * Dark mode handling for one image, resolved for the theme on screen.
 *
 * An image is uploaded once but read in two themes, and a light mode diagram or
 * mono SVG is usually black on white — on the dark page it vanishes or arrives
 * as a white slab. The editor picks one of three answers per image (see
 * `themedImageFields` in the studio schema); this is the read side of that
 * choice, and the only place the three modes are interpreted.
 *
 * - `same` (and anything unrecognised, and no value at all — every image
 *   written before this feature existed) — one file, both themes.
 * - `invert` — one file, flipped in dark mode by CSS. Returned as a class name
 *   rather than a decision, because the swap then belongs entirely to the style
 *   engine: it lands in the same frame `data-theme` changes, with no re-render,
 *   no second file, and nothing to load.
 * - `upload` — two files. This hook picks the one the current theme wants and
 *   hands back the other so the caller can warm it (see `warmImage`), which is
 *   what keeps that swap from being a visible round trip.
 *
 * `upload` with nothing uploaded falls back to the light image rather than
 * rendering a hole — a half-filled block is a normal state while a study is
 * being written.
 *
 * @param source - The light mode Sanity image
 * @param options.darkSource - The dark mode Sanity image, when mode is 'upload'
 * @param options.darkMode - 'same' | 'invert' | 'upload'
 * @returns {{source: object, alternate: object|null, invertClassName: string}}
 */
export const THEMED_IMAGE_INVERT_CLASS = 'themed-image-invert'

export function useThemedImage(source, { darkSource, darkMode } = {}) {
  const theme = useThemeMode()
  const isDark = theme === 'dark'
  const hasDarkUpload = darkMode === 'upload' && Boolean(darkSource?.asset)

  return {
    source: hasDarkUpload && isDark ? darkSource : source,
    alternate: hasDarkUpload ? (isDark ? source : darkSource) : null,
    invertClassName: darkMode === 'invert' ? THEMED_IMAGE_INVERT_CLASS : '',
  }
}
