import { defineType } from 'sanity'

/**
 * imageFull — one image, the full width of the container.
 *
 * The height is whatever the image's own proportions make it. Nothing is
 * cropped. For a screenshot that should sit inside a surface instead of
 * bleeding edge to edge, use Framed Image.
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
    {
      name: 'alt',
      title: 'Alt Text',
      type: 'string',
      description: 'Describes the image for screen readers. Leave blank only if purely decorative.',
    },
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
    },
    prepare({ media, caption, alt }) {
      return {
        title: caption || alt || 'Image',
        subtitle: 'Full width',
        media,
      }
    },
  },
})
