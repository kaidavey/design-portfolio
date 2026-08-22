import { defineType } from 'sanity'

/**
 * caseStudy — the document.
 *
 * This holds only what the document itself owns: how the study is identified,
 * how it is ordered on the home page, how its card looks there, and the body.
 *
 * Everything that appears *inside* the study is a block. Role, timeline, team
 * and tools belong to the Project Details block, so they are not asked for
 * here — one field, one home.
 */
export default defineType({
  name: 'caseStudy',
  title: 'Case Study',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'card', title: 'Home Card' },
  ],
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'array',
      group: 'content',
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
        { type: 'spacer' },
      ],
      validation: (Rule) => Rule.required().min(1),
    },
    {
      name: 'description',
      title: 'Short Description',
      type: 'string',
      group: 'card',
      description: 'Brief description shown on the home page (recommended 50-100 characters)',
      validation: (Rule) => Rule.max(150),
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
      group: 'card',
      description: 'Controls the order in which case studies appear (lower numbers first)',
      validation: (Rule) => Rule.required().integer().min(0),
    },
    {
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      group: 'card',
      options: {
        hotspot: true,
      },
      description: 'Required fallback image. Also used as poster frame for video.',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'coverVideo',
      title: 'Cover Video (Optional)',
      type: 'mux.video',
      group: 'card',
      description: 'Optional video enhancement. Recommended: 5-10 seconds, looping content at 720p.',
    },
  ],
  preview: {
    select: {
      title: 'title',
      media: 'coverImage',
      subtitle: 'slug.current',
    },
  },
})
