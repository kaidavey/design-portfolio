import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '6vslo6fw',
    dataset: 'production'
  },
  deployment: {
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
    appId: 'w7n61g9mtb3m08t716iscqir',
  },
  /**
   * Studio hostname for deployment
   * This will be available at: https://kaidavey-portfolio.sanity.studio
   * You can change this to any unique name you prefer
   */
  studioHost: 'kaidavey-portfolio',
})
