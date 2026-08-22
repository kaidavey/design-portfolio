import { defineType } from 'sanity'

/**
 * imageFrame — frame settings shared by every framed image in the system.
 *
 * A frame is a fixed-ratio surface that the layout stretches and shrinks. The
 * image inside is never cropped or stretched to fill it: it is centred and
 * scaled down only far enough to fit. That is the whole point of the frame —
 * device shots (a phone screen, a MacBook lid) keep their own proportions
 * while the gray surface behind them adapts to the container.
 */
export default defineType({
  name: 'imageFrame',
  title: 'Frame',
  type: 'object',
  options: { columns: 2 },
  fields: [
    {
      name: 'aspectRatio',
      title: 'Frame Shape',
      type: 'string',
      description:
        'The shape of the frame itself, not the image. The frame keeps this ratio at every screen size.',
      options: {
        list: [
          { title: 'Wide (16:10)', value: '16/10' },
          { title: 'Widescreen (16:9)', value: '16/9' },
          { title: 'Classic (4:3)', value: '4/3' },
          { title: 'Photo (3:2)', value: '3/2' },
          { title: 'Square (1:1)', value: '1/1' },
          { title: 'Portrait (3:4)', value: '3/4' },
          { title: 'Tall (9:16)', value: '9/16' },
        ],
      },
      initialValue: '16/10',
      validation: (Rule) => Rule.required(),
    },
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
    {
      name: 'background',
      title: 'Backdrop',
      type: 'string',
      description:
        'Surface follows the site theme (light gray on light, dark gray on dark). Light and Dark stay fixed in both themes.',
      options: {
        list: [
          { title: 'Surface (follows theme)', value: 'surface' },
          { title: 'Light', value: 'light' },
          { title: 'Dark', value: 'dark' },
        ],
      },
      initialValue: 'surface',
      validation: (Rule) => Rule.required(),
    },
  ],
})
