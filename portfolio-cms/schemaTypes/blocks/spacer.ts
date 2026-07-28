import { defineType } from 'sanity'

export default defineType({
  name: 'spacer',
  title: 'Spacer',
  type: 'object',
  fields: [
    {
      name: 'height',
      title: 'Height',
      type: 'number',
      options: {
        list: [
          { title: '4px', value: 4 },
          { title: '8px', value: 8 },
          { title: '16px', value: 16 },
          { title: '24px', value: 24 },
          { title: '36px', value: 36 },
          { title: '48px', value: 48 },
          { title: '64px', value: 64 },
        ],
      },
      validation: (Rule) => Rule.required(),
      initialValue: 24,
    },
  ],
  preview: {
    select: {
      height: 'height',
    },
    prepare({ height }) {
      return {
        title: `Spacer - ${height}px`,
      }
    },
  },
})
