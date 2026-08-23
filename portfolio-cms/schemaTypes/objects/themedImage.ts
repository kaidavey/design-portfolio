import {defineField} from 'sanity'

/**
 * themedImageFields — the dark mode half of every image in the system.
 *
 * A case study is read in two themes, but an image is uploaded once. A light
 * mode diagram, chart or single-colour SVG is usually black on white, so on the
 * dark page it either disappears or arrives as a white slab. These fields are
 * how an editor says what should happen to that image when the reader flips the
 * switch.
 *
 * Three answers, in rising order of effort:
 *
 * - `same`   — leave it alone. Right for photography and for anything that
 *              already carries its own background.
 * - `invert` — flip it in dark mode with a CSS filter. Costs nothing, needs no
 *              second upload, and is right for line art: diagrams, wireframes,
 *              flow charts, mono SVG marks. Colours are preserved by the
 *              hue-rotate that follows the invert, so a blue arrow stays blue.
 * - `upload` — a second file, drawn for dark. The only honest answer for
 *              screenshots, anything with a photograph in it, and artwork whose
 *              dark version is a different drawing rather than the same one
 *              flipped.
 *
 * The two fields always travel together and are always named off the light
 * image they belong to, so a block can hold more than one themed image without
 * the names colliding: `image` → `imageDarkMode` + `imageDark`, `icon` →
 * `iconDarkMode` + `iconDark`.
 *
 * @param base - Name of the light image field these attach to.
 * @param options.title - Noun used in the field titles, e.g. 'Image', 'Icon'.
 */
export function themedImageFields(base: string, options: {title?: string} = {}) {
  const noun = options.title ?? 'Image'
  const modeName = `${base}DarkMode`
  const darkName = `${base}Dark`

  return [
    defineField({
      name: modeName,
      title: `${noun} in dark mode`,
      type: 'string',
      description:
        'What happens to this image when the reader switches to dark mode. Invert suits line art, diagrams and single-colour SVGs; upload a dark version for screenshots and anything with a photo in it.',
      options: {
        list: [
          {title: 'Use the same image', value: 'same'},
          {title: 'Invert it (line art, diagrams, mono SVGs)', value: 'invert'},
          {title: 'Use a separate dark version', value: 'upload'},
        ],
        layout: 'radio',
      },
      initialValue: 'same',
    }),
    defineField({
      name: darkName,
      title: `${noun} (dark)`,
      type: 'image',
      options: {hotspot: true},
      description: 'Shown in place of the light image while the site is in dark mode.',
      hidden: ({parent}) => parent?.[modeName] !== 'upload',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as Record<string, unknown> | undefined
          if (parent?.[modeName] !== 'upload') return true
          return value
            ? true
            : 'Add a dark version, or switch this image back to "Use the same image".'
        }),
    }),
  ]
}
