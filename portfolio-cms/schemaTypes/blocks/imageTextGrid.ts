import { defineType } from 'sanity'

export default defineType({
  name: 'imageTextGrid',
  title: 'Image + Text Grid',
  type: 'object',
  fields: [
    {
      name: 'columns',
      title: 'Columns',
      type: 'array',
      description:
        'Two or three columns, each an image above a text card. Any column image can be framed.',
      of: [
        {
          type: 'object',
          name: 'imageTextColumn',
          fields: [
            {
              name: 'media',
              title: 'Image',
              type: 'caseStudyImage',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'subtitle',
              title: 'Subtitle',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'description',
              title: 'Description',
              type: 'text',
              validation: (Rule) => Rule.required(),
            },
          ],
          preview: {
            select: {
              title: 'subtitle',
              subtitle: 'description',
              media: 'media.image',
            },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(2).max(3),
    },
  ],
  preview: {
    select: {
      columns: 'columns',
      media: 'columns.0.media.image',
    },
    prepare({ columns, media }) {
      const count = columns?.length ?? 0
      return {
        title: 'Image + Text Grid',
        subtitle: `${count} column${count === 1 ? '' : 's'}`,
        media,
      }
    },
  },
})
