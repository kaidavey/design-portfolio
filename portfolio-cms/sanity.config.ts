import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {muxInput} from 'sanity-plugin-mux-input'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'portfolio-cms',

  projectId: '6vslo6fw',
  dataset: 'production',

  plugins: [structureTool(), visionTool(), muxInput()],

  schema: {
    types: schemaTypes,
  },
})
