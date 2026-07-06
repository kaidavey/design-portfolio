import { defineType } from 'sanity'

export default defineType({
  name: 'textColumns',
  title: 'Text Columns',
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
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'paragraphs',
      title: 'Paragraphs',
      type: 'array',
      of: [{ type: 'text' }],
      validation: (Rule) => Rule.required().min(1),
    },
    {
      name: 'subtitle',
      title: 'Subtitle',
      type: 'text',
      description: 'Optional muted text below paragraphs',
    },
  ],
})
