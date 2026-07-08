import { defineType } from 'sanity'

export default defineType({
  name: 'caseStudy',
  title: 'Case Study',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Short Description',
      type: 'string',
      description: 'Brief description shown on the home page (recommended 50-100 characters)',
      validation: (Rule) => Rule.max(150),
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Controls the order in which case studies appear (lower numbers first)',
      validation: (Rule) => Rule.required().integer().min(0),
    },
    {
      name: 'year',
      title: 'Year',
      type: 'number',
      validation: (Rule) => Rule.required().integer().min(2000).max(2100),
    },
    {
      name: 'role',
      title: 'Role',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'timeline',
      title: 'Timeline',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'team',
      title: 'Team',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'tools',
      title: 'Tools',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        { type: 'projectDetails' },
        { type: 'hero' },
        { type: 'textImageRow' },
        { type: 'imageRow' },
        { type: 'imageTextGrid' },
        { type: 'callToAction' },
        { type: 'textBlockCentered' },
        { type: 'textCardRow' },
        { type: 'textColumns' },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      media: 'coverImage',
      subtitle: 'year',
    },
  },
})
