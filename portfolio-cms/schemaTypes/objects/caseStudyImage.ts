import { defineType } from 'sanity'
import { themedImageFields } from './themedImage'
import { imageHeightField } from './imageHeight'

/**
 * caseStudyImage — the single image primitive for case study content.
 *
 * Every block that holds an image holds one of these, which is what lets a
 * framed device shot go anywhere a plain image goes: a column of an image row,
 * a cell of an image + text grid, the image half of a text + image row.
 *
 * `framed` is the switch. Off, the image fills its slot. On, it sits centred
 * and uncropped on the surface described by `frame`.
 *
 * `height` is optional here and required on the standalone Image and Framed
 * Image blocks: inside a row or a grid the slot already governs how tall an
 * image stands, so a height is an override rather than the rule.
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
    ...themedImageFields('image'),
    {
      name: 'alt',
      title: 'Alt Text',
      type: 'string',
      description: 'Describes the image for screen readers. Leave blank only if purely decorative.',
    },
    imageHeightField(),
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
        'Sits the image whole and uncropped on a surface — use for phone and laptop screenshots.',
      initialValue: false,
    },
    {
      name: 'frame',
      title: 'Frame',
      type: 'imageFrame',
      initialValue: { padding: 'md' },
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
