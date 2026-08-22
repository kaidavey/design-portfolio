import { defineType } from 'sanity'

export default defineType({
  name: 'projectDetails',
  title: 'Project Details',
  type: 'object',
  fields: [
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
  ],
  preview: {
    select: { role: 'role', timeline: 'timeline' },
    prepare({ role, timeline }) {
      return {
        title: 'Project Details',
        subtitle: [role, timeline].filter(Boolean).join(' · '),
      }
    },
  },
})
