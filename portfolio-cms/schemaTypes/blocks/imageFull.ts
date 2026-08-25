import { defineType } from 'sanity'
import { imageHeightField } from '../objects/imageHeight'
import { themedImageFields } from '../objects/themedImage'

/**
 * imageFull — one image, the full width of the container.
 *
 * The height is the editor's, not the image's: the block stands exactly as
 * tall as `height` asks at every screen size, and the image fills that box,
 * cropped to it. The image's hotspot decides what survives the crop.
 *
 * For a screenshot that should sit whole on a surface rather than bleed edge to
 * edge, use Framed Image.
 */
export default defineType({
  name: 'imageFull',
  title: 'Image',
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
      description: 'Optional caption shown below the image.',
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
        title: caption || alt || 'Image',
        subtitle: height ? `Full width · ${height}vh` : 'Full width',
        media,
      }
    },
  },
})
