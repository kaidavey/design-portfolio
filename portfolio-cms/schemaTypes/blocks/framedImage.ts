import { defineType } from 'sanity'
import { imageHeightField } from '../objects/imageHeight'
import { themedImageFields } from '../objects/themedImage'

/**
 * framedImage — one image centred on a surface.
 *
 * The surface stands exactly as tall as `height` asks and fills the width it is
 * given, so it is the part that responds to the screen. The image inside keeps
 * its own proportions and is only ever scaled down far enough to fit — never
 * cropped, never stretched. Built for device shots: a phone screen, a MacBook
 * lid.
 *
 * The surface wears the same skin as every other block, so a framed image reads
 * as one of the family rather than a thing of its own.
 */
export default defineType({
  name: 'framedImage',
  title: 'Framed Image',
  type: 'object',
  fields: [
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    },
    ...themedImageFields('image'),
    {
      name: 'alt',
      title: 'Alt Text',
      type: 'string',
      description: 'Describes the image for screen readers. Leave blank only if purely decorative.',
    },
    imageHeightField({ required: true }),
    {
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: 'Optional caption shown below the frame.',
    },
    {
      name: 'frame',
      title: 'Frame',
      type: 'imageFrame',
      initialValue: { padding: 'md' },
    },
  ],
  preview: {
    select: {
      media: 'image',
      caption: 'caption',
      alt: 'alt',
      height: 'height',
    },
    prepare({ media, caption, alt, height }) {
      return {
        title: caption || alt || 'Framed Image',
        subtitle: height ? `Framed · ${height}vh` : 'Framed',
        media,
      }
    },
  },
})
