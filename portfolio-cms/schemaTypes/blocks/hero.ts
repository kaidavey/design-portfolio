import { defineType } from 'sanity'

export default defineType({
  name: 'hero',
  title: 'Hero',
  type: 'object',
  fields: [
    {
      name: 'icon',
      title: 'Icon',
      type: 'image',
      description: 'Optional square mark shown beside the title. Decorative — it is not read out.',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
  ],
  preview: {
    select: {
      title: 'title',
      media: 'icon',
    },
    prepare({ title, media }) {
      return { title: title || 'Hero', subtitle: 'Hero', media }
    },
  },
})
