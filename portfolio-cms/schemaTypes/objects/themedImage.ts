import {defineField} from 'sanity'

/**
 * themedImageFields — optional dark mode handling for one image field.
 *
 * Most images work in both themes and carry neither of these. The ones that do
 * not are the ones drawn on white — diagrams, charts, mono SVG marks — which
 * either vanish on the dark page or arrive as a white slab.
 *
 * Two answers, and leaving both empty is the third. `invert` is the cheap one
 * and right for line art: one file, flipped by CSS, colours kept. A dark upload
 * is the honest one for screenshots and anything photographic, and wins when
 * both are set.
 *
 * Named off the light field they belong to, so a block can hold more than one
 * themed image without the names colliding: `image` → `imageDark` +
 * `imageDarkInvert`, `icon` → `iconDark` + `iconDarkInvert`.
 */
export function themedImageFields(base: string, noun = 'Image') {
  const dark = `${base}Dark`

  return [
    defineField({
      name: dark,
      title: `${noun} (dark mode)`,
      type: 'image',
      options: {hotspot: true},
      description: `Optional. Shown instead of the light ${noun.toLowerCase()} on the dark page — for screenshots and anything with a photo in it.`,
    }),
    defineField({
      name: `${base}DarkInvert`,
      title: 'Invert in dark mode',
      type: 'boolean',
      description:
        'Flips this image on the dark page, keeping its colours. For line art: diagrams, wireframes, mono SVGs. No second upload needed.',
      initialValue: false,
      // Moot once there is a dark file to show instead.
      hidden: ({parent}) => Boolean(parent?.[dark]),
    }),
  ]
}
