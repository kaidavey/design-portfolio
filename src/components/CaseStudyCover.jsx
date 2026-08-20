import { useEffect, useRef, useState } from 'react'
import CaseStudyImage from './CaseStudyImage'
import { getMuxPlaybackUrl } from '../utils/mux'
import { useVideoCapability } from '../hooks/useVideoCapability'
import { useInView } from '../hooks/useInView'

/**
 * CaseStudyCover - Cover image, with video layered over it when that works out.
 *
 * The image is always rendered and never unmounted: it's the poster, the
 * fallback, and the thing that paints first. The video sits on top at zero
 * opacity and fades in only once it's actually playing.
 *
 * That ordering is what makes the failure modes free. A missing playback ID, a
 * still-encoding asset, a fatal HLS error, a refused autoplay — none of them
 * need to be predicted or handled, because the image underneath is already
 * showing and simply stays.
 *
 * Video bytes are spent only when the device, connection and viewport all say
 * it's worthwhile; hls.js itself is loaded on demand and never ships on the
 * critical path.
 *
 * @param {Object} coverImage - Sanity image object (required)
 * @param {Object} coverVideo - Sanity Mux asset (optional)
 * @param {string} alt - Alt text for the image
 * @param {string} sizes - Responsive sizes attribute
 * @param {number} maxWidth - Max width for image optimization
 * @param {string} className - Additional CSS classes
 * @param {Object} style - Inline styles
 */
export default function CaseStudyCover({
  coverImage,
  coverVideo,
  alt,
  sizes,
  maxWidth,
  className = '',
  style = {},
}) {
  const containerRef = useRef(null)
  const videoRef = useRef(null)

  const [failed, setFailed] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const isCapable = useVideoCapability()
  const inView = useInView(containerRef)

  const videoUrl = getMuxPlaybackUrl(coverVideo)
  const shouldLoad = Boolean(videoUrl) && isCapable && inView && !failed

  useEffect(() => {
    if (!shouldLoad) return

    const video = videoRef.current
    if (!video) return

    let cancelled = false
    let hls = null

    // Visitors always just get the image back. But swallowing the reason makes a
    // real playback failure indistinguishable from "no video configured", which
    // is exactly how this bug stayed hidden — so say what happened in dev.
    const fail = (reason, detail) => {
      if (import.meta.env.DEV) {
        console.warn('[CaseStudyCover] video disabled —', reason, detail ?? '')
      }
      setFailed(true)
    }

    const onPlaying = () => setIsPlaying(true)
    const onError = () =>
      fail('media element error', video.error && `code ${video.error.code}: ${video.error.message}`)
    video.addEventListener('playing', onPlaying)
    video.addEventListener('error', onError)

    // Belt and braces for autoplay policy: an unmuted video is never allowed to
    // start on its own, and React has historically been inconsistent about
    // reflecting the attribute onto the property.
    video.muted = true

    // Autoplay can still be refused — battery saver, an unusual policy. The
    // image is already on screen, so there's nothing to recover from.
    const play = () => video.play().catch(() => {})

    const canPlayNatively = () => Boolean(video.canPlayType('application/vnd.apple.mpegurl'))

    async function attach() {
      // `canPlayType` cannot be trusted to choose the path. Chrome answers
      // "maybe" for the HLS MIME type on some builds while having no demuxer
      // for it at all, so asking it first sets a src that can never decode —
      // one manifest request, an error event, and the video is retired for
      // good. Media Source Extensions is the capability that actually decides,
      // and hls.js documents testing it first for this reason.
      //
      // iOS is the one place native is unambiguously right: no MediaSource, but
      // real HLS in the platform. Catching it here keeps iPhones on zero-JS
      // playback instead of downloading a library they cannot use.
      if (typeof MediaSource === 'undefined') {
        if (canPlayNatively()) {
          video.src = videoUrl
          play()
        } else {
          fail('no playback path: neither MediaSource nor native HLS')
        }
        return
      }

      const { default: Hls } = await import('hls.js/light')

      // Scrolled past, or a StrictMode remount, while the chunk was in flight.
      if (cancelled) return

      if (!Hls.isSupported()) {
        // MSE exists but hls.js still declined it. Native is the last resort.
        if (canPlayNatively()) {
          video.src = videoUrl
          play()
        } else {
          fail('MediaSource present but hls.js reports no support')
        }
        return
      }

      hls = new Hls({
        enableWorker: true,
        capLevelToPlayerSize: true,
        maxBufferLength: 10, // a short looping cover never needs more
      })
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) fail(`fatal hls error (${data.type})`, data.details)
      })
      hls.on(Hls.Events.MANIFEST_PARSED, play)
      hls.loadSource(videoUrl)
      hls.attachMedia(video)
    }

    attach()

    return () => {
      cancelled = true
      // Detach before tearing down the source: clearing `src` fires its own
      // error event, and that must not be mistaken for a playback failure.
      video.removeEventListener('playing', onPlaying)
      video.removeEventListener('error', onError)
      setIsPlaying(false)

      if (hls) {
        hls.destroy()
      } else if (video.src) {
        // Abort an in-flight native fetch. Guarded, because the effect may be
        // tearing down while the hls.js import is still in flight, and calling
        // load() on a source-less element is its own error.
        video.removeAttribute('src')
        video.load()
      }
    }
  }, [shouldLoad, videoUrl])

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden [background-color:var(--color-bg-container-solid)] shadow-md hover:shadow-xl transition-all duration-300 ${className}`}
      style={{
        aspectRatio: 'var(--home-cover-aspect-ratio, 4 / 2.75)',
        borderRadius: 'var(--home-cover-border-radius, 30px)',
        ...style,
      }}
    >
      <CaseStudyImage
        source={coverImage}
        alt={alt}
        sizes={sizes}
        maxWidth={maxWidth}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />

      {shouldLoad && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
          tabIndex={-1}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-[transform,opacity] duration-300"
          style={{ opacity: isPlaying ? 1 : 0 }}
        />
      )}
    </div>
  )
}
