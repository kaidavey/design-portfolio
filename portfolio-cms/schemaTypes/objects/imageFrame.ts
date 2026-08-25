import { defineType } from 'sanity'

/**
 * imageFrame — the surface a framed image sits on.
 *
 * The frame wears the same skin as every other surfaced block (Text Block,
 * Text Card Row, Call to Action): same radius, background, border and inset
 * highlight. That is deliberate and not configurable — a case study reads as
 * one system, and a frame with its own backdrop broke that.
 *
 * Height comes from the image's own `height` field, not from here: the frame
 * fills the width it is given and stands exactly as tall as the editor asked.
 */
export default defineType({
  name: 'imageFrame',
  title: 'Frame',
  type: 'object',
  fields: [
    {
      name: 'padding',
      title: 'Inset',
      type: 'string',
      description: 'Breathing room between the image and the edge of the frame.',
      options: {
        list: [
          { title: 'None', value: 'none' },
          { title: 'Small', value: 'sm' },
          { title: 'Medium', value: 'md' },
          { title: 'Large', value: 'lg' },
        ],
      },
      initialValue: 'md',
      validation: (Rule) => Rule.required(),
    },
  ],
})
