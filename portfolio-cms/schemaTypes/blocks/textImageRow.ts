import { defineType } from 'sanity'

export default defineType({
  name: 'textImageRow',
  title: 'Text + Image Row',
  type: 'object',
  fields: [
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
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    },
  ],
})
