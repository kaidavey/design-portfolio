import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { getNowPlaying } from './api/nowPlaying.js'

function spotifyDevApi(env) {
  return {
    name: 'spotify-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/now-playing', async (_req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Cache-Control', 'no-store')
        try {
          res.end(JSON.stringify(await getNowPlaying(env)))
        } catch (err) {
          // Degrade quietly — the UI shouldn't break because Spotify hiccuped.
          console.error('[spotify]', err.message)
          res.end(JSON.stringify({ isPlaying: false, track: null, error: true }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Empty prefix loads unprefixed vars into config scope only —
  // they never reach the client bundle.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
      babel({ presets: [reactCompilerPreset()] }),
      spotifyDevApi(env),
    ],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.js',
      css: true,
    },
  }
})