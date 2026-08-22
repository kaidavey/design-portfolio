import { defineType } from 'sanity'

/**
 * blockGroup — a run of blocks with their own spacing.
 *
 * Blocks in the body sit 32px apart by default. A Spacer can only ever push
 * them further apart, so a group is the only way to bring blocks *closer* —
 * a heading 8px above its paragraph, a caption tight under an image.
 *
 * Groups do not nest. One level covers the rhythm this needs and keeps both
 * the Studio and the renderer easy to reason about. Spacers are not offered
 * inside one either: a group exists to make its spacing uniform, and a Spacer
 * in the middle of it would quietly undo that.
 */
export default defineType({
  name: 'blockGroup',
  title: 'Group',
  type: 'object',
  fields: [
    {
      name: 'gap',
      title: 'Spacing',
      type: 'number',
      description: 'Distance between every block in this group. The body default is 32px.',
      options: {
        list: [
          { title: '0px — flush', value: 0 },
          { title: '4px', value: 4 },
          { title: '8px', value: 8 },
          { title: '16px', value: 16 },
          { title: '24px', value: 24 },
          { title: '32px — same as default', value: 32 },
          { title: '48px', value: 48 },
          { title: '64px', value: 64 },
        ],
      },
      initialValue: 16,
      validation: (Rule) => Rule.required().min(0),
    },
    {
      name: 'blocks',
      title: 'Blocks',
      type: 'array',
      description: 'Blocks to space evenly. Everything the body accepts, except Spacers and other Groups.',
      of: [
        { type: 'hero' },
        { type: 'projectDetails' },
        { type: 'textBlockCentered' },
        { type: 'textColumns' },
        { type: 'textRowTwoColumn' },
        { type: 'textCardRow' },
        { type: 'textImageRow' },
        { type: 'imageFull' },
        { type: 'framedImage' },
        { type: 'imageRow' },
        { type: 'imageTextGrid' },
        { type: 'callToAction' },
      ],
      validation: (Rule) => Rule.required().min(2),
    },
  ],
  preview: {
    select: {
      gap: 'gap',
      blocks: 'blocks',
    },
    prepare({ gap, blocks }) {
      const count = blocks?.length ?? 0
      return {
        title: `Group — ${gap ?? 0}px`,
        subtitle: `${count} block${count === 1 ? '' : 's'}`,
      }
    },
  },
})
