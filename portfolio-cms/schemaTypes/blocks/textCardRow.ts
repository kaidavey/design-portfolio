import { defineType } from 'sanity'

export default defineType({
  name: 'textCardRow',
  title: 'Text Card Row',
  type: 'object',
  fields: [
    {
      name: 'cards',
      title: 'Cards',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'icon',
              title: 'Icon',
              type: 'image',
              options: {
                hotspot: true,
              },
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
        },
      ],
      validation: (Rule) => Rule.required().length(3),
    },
  ],
  preview: {
    select: { cards: 'cards' },
    prepare({ cards }) {
      const count = cards?.length ?? 0
      return { title: 'Text Card Row', subtitle: `${count} card${count === 1 ? '' : 's'}` }
    },
  },
})
