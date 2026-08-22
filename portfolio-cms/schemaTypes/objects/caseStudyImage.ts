import { defineType } from 'sanity'

/**
 * caseStudyImage — the single image primitive for case study content.
 *
 * Every block that holds an image holds one of these, which is what lets a
 * framed device shot go anywhere a plain image goes: a column of an image row,
 * a cell of an image + text grid, the image half of a text + image row.
 *
 * `framed` is the switch. Off, the image fills its slot. On, it sits centred
 * and uncropped inside the frame described by `frame`.
 */
export default defineType({
  name: 'caseStudyImage',
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
    {
      name: 'framed',
      title: 'Show in a frame',
      type: 'boolean',
      description:
        'Sits the image uncropped in the centre of a fixed-ratio surface — use for phone and laptop screenshots.',
      initialValue: false,
    },
    {
      name: 'frame',
      title: 'Frame',
      type: 'imageFrame',
      initialValue: { aspectRatio: '16/10', padding: 'md', background: 'surface' },
      hidden: ({ parent }) => !parent?.framed,
    },
  ],
  preview: {
    select: {
      media: 'image',
      caption: 'caption',
      alt: 'alt',
      framed: 'framed',
    },
    prepare({ media, caption, alt, framed }) {
      return {
        title: caption || alt || 'Image',
        subtitle: framed ? 'Framed' : 'Full bleed',
        media,
      }
    },
  },
})
