import { defineType } from 'sanity'

export default defineType({
  name: 'textBlockCentered',
  title: 'Text Block (Centered)',
  type: 'object',
  fields: [
    {
      name: 'section',
      title: 'Section Label',
      type: 'string',
      description: 'Optional uppercase section label',
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Optional title',
    },
    {
      name: 'body',
      title: 'Body',
      type: 'text',
      validation: (Rule) => Rule.required(),
    },
  ],
  preview: {
    select: { section: 'section', title: 'title', body: 'body' },
    prepare({ section, title, body }) {
      return { title: title || section || 'Text Block', subtitle: body }
    },
  },
})
