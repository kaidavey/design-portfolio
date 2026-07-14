import { defineType } from 'sanity'

export default defineType({
  name: 'textRowTwoColumn',
  title: 'Text Row - Two Column',
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
      description: 'Optional title below section',
    },
    {
      name: 'leftParagraphs',
      title: 'Left Column Paragraphs',
      type: 'array',
      of: [{ type: 'text' }],
      validation: (Rule) => Rule.required().min(1),
    },
    {
      name: 'rightParagraphs',
      title: 'Right Column Paragraphs',
      type: 'array',
      of: [{ type: 'text' }],
      description: 'Displayed in muted color',
    },
  ],
})
