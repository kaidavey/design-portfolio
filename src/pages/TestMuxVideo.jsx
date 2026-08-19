import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

export default function TestMuxVideo() {
  const videoRef = useRef(null)
  const [status, setStatus] = useState('Loading...')
  const [error, setError] = useState(null)

  // Direct Mux HLS URL from your debug page
  const videoUrl = 'https://stream.mux.com/V01u029lnS8qi9h501vMYtPIrZpEyZkFBEJyf02yUhsfaMc.m3u8'

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    console.log('[TestMuxVideo] Starting test with URL:', videoUrl)

    // Safari/iOS native HLS support
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      console.log('[TestMuxVideo] Using native HLS')
      setStatus('Using native HLS (Safari)')

      video.src = videoUrl
      video.load()

      video.addEventListener('loadedmetadata', () => {
        console.log('[TestMuxVideo] Metadata loaded')
        setStatus('Metadata loaded, attempting play...')
        video.play().then(() => {
          setStatus('✅ Playing with native HLS!')
        }).catch(err => {
          console.error('[TestMuxVideo] Play error:', err)
          setError(err.message)
          setStatus('❌ Failed to play')
        })
      })

      video.addEventListener('error', (e) => {
        console.error('[TestMuxVideo] Video error:', e, video.error)
        setError(`Error code: ${video.error?.code}, message: ${video.error?.message}`)
        setStatus('❌ Video error')
      })
    }
    // Chrome/Firefox with HLS.js
    else if (Hls.isSupported()) {
      console.log('[TestMuxVideo] Using HLS.js')
      setStatus('Using HLS.js (Chrome/Firefox)')

      const hls = new Hls({
        debug: true,
      })

      hls.loadSource(videoUrl)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('[TestMuxVideo] HLS manifest parsed')
        setStatus('Manifest parsed, attempting play...')
        video.play().then(() => {
          setStatus('✅ Playing with HLS.js!')
        }).catch(err => {
          console.error('[TestMuxVideo] Play error:', err)
          setError(err.message)
          setStatus('❌ Failed to play')
        })
      })

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('[TestMuxVideo] HLS error:', data)
        setError(`${data.type}: ${data.details}`)
        if (data.fatal) {
          setStatus('❌ Fatal HLS error')
        }
      })

      return () => hls.destroy()
    } else {
      setStatus('❌ HLS not supported in this browser')
    }
  }, [videoUrl])

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace' }}>
      <h1>Mux Video Test</h1>
      <h2>Status: {status}</h2>

      {error && (
        <div style={{ color: 'red', marginTop: '20px', padding: '20px', background: '#fff0f0' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ marginTop: '40px', maxWidth: '800px' }}>
        <video
          ref={videoRef}
          controls
          loop
          muted
          playsInline
          style={{
            width: '100%',
            borderRadius: '8px',
            background: '#000',
          }}
        />
      </div>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p><strong>Video URL:</strong> {videoUrl}</p>
        <p><strong>Browser:</strong> {navigator.userAgent}</p>
      </div>
    </div>
  )
}
