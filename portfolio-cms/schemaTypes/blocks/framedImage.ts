import { defineType } from 'sanity'

/**
 * framedImage — one image centred inside a fixed-ratio surface.
 *
 * The surface is what responds to the container: it keeps its shape and grows
 * and shrinks with the screen. The image inside keeps its own proportions and
 * is only ever scaled down far enough to fit, never cropped and never
 * stretched. Built for device shots — a phone screen, a MacBook lid.
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
      description: 'Optional caption shown below the frame.',
    },
    {
      name: 'frame',
      title: 'Frame',
      type: 'imageFrame',
      initialValue: { aspectRatio: '16/10', padding: 'md', background: 'surface' },
    },
  ],
  preview: {
    select: {
      media: 'image',
      caption: 'caption',
      alt: 'alt',
      aspectRatio: 'frame.aspectRatio',
    },
    prepare({ media, caption, alt, aspectRatio }) {
      return {
        title: caption || alt || 'Framed Image',
        subtitle: `Framed${aspectRatio ? ` · ${aspectRatio.replace('/', ':')}` : ''}`,
        media,
      }
    },
  },
})
