import { defineType } from 'sanity'

export default defineType({
  name: 'imageRow',
  title: 'Image Row',
  type: 'object',
  fields: [
    {
      name: 'images',
      title: 'Images',
      type: 'array',
      description:
        'Two or three images side by side. Any of them can be framed — toggle "Show in a frame" on the image.',
      of: [{ type: 'caseStudyImage' }],
      validation: (Rule) => Rule.required().min(2).max(3),
    },
  ],
  preview: {
    select: {
      images: 'images',
      media: 'images.0.image',
    },
    prepare({ images, media }) {
      const count = images?.length ?? 0
      return {
        title: 'Image Row',
        subtitle: `${count} image${count === 1 ? '' : 's'}`,
        media,
      }
    },
  },
})
