import { useState, useEffect, useRef } from 'react'
import Hls from 'hls.js'
import CaseStudyImage from './CaseStudyImage'
import { getMuxPlaybackUrl } from '../utils/mux'

/**
 * CaseStudyCover - Displays case study cover with progressive enhancement
 *
 * Architecture:
 * - Image-first approach: Always loads image (required, fast)
 * - Video as enhancement: If video exists, loads it lazily
 * - Performance: IntersectionObserver for lazy loading
 * - Accessibility: Respects prefers-reduced-motion
 * - Graceful degradation: Falls back to image if video fails
 *
 * @param {Object} coverImage - Sanity image object (required)
 * @param {Object} coverVideo - Sanity Mux video object (optional)
 * @param {string} alt - Alt text for image
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
  const [videoError, setVideoError] = useState(false)
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const hlsRef = useRef(null)

  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Debug logging
  useEffect(() => {
    console.log('[CaseStudyCover] Props:', {
      hasCoverImage: !!coverImage,
      hasCoverVideo: !!coverVideo,
      coverVideo,
      coverVideoType: typeof coverVideo,
      coverVideoKeys: coverVideo ? Object.keys(coverVideo) : null,
      prefersReducedMotion,
    })

    // Log the full coverVideo object as JSON for inspection
    if (coverVideo) {
      console.log('[CaseStudyCover] coverVideo JSON:', JSON.stringify(coverVideo, null, 2))
    } else {
      console.warn('[CaseStudyCover] coverVideo is null/undefined!')
    }
  }, [coverImage, coverVideo, prefersReducedMotion])

  // Determine if we should show video (simplified - no lazy loading for now)
  const showVideo = coverVideo && !videoError && !prefersReducedMotion
  const videoUrl = showVideo ? getMuxPlaybackUrl(coverVideo) : null

  console.log('[CaseStudyCover] Video decision:', {
    showVideo,
    videoUrl,
    videoError,
    prefersReducedMotion,
  })

  // Setup HLS.js for browsers that don't support HLS natively
  useEffect(() => {
    console.log('[CaseStudyCover] HLS setup effect running', {
      hasVideoUrl: !!videoUrl,
      hasVideoRef: !!videoRef.current,
      videoUrl,
    })

    if (!videoUrl || !videoRef.current) {
      console.log('[CaseStudyCover] Skipping HLS setup - missing requirements')
      return
    }

    const video = videoRef.current
    console.log('[CaseStudyCover] Video element ready:', {
      readyState: video.readyState,
      networkState: video.networkState,
      src: video.src,
    })

    // Check if browser supports HLS natively (Safari, iOS)
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      console.log('[CaseStudyCover] Browser supports HLS natively')

      // Wait for metadata to load before playing
      const onLoadedMetadata = () => {
        console.log('[CaseStudyCover] Native HLS metadata loaded', {
          duration: video.duration,
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
        })
        video.play().catch(err => {
          console.warn('[CaseStudyCover] Native HLS autoplay prevented:', err)
        })
      }

      const onCanPlay = () => {
        console.log('[CaseStudyCover] Native HLS can play')
      }

      const onError = (e) => {
        console.error('[CaseStudyCover] Native HLS error event:', {
          error: video.error,
          errorCode: video.error?.code,
          errorMessage: video.error?.message,
          src: video.src,
        })
      }

      video.addEventListener('loadedmetadata', onLoadedMetadata)
      video.addEventListener('canplay', onCanPlay)
      video.addEventListener('error', onError)

      console.log('[CaseStudyCover] Setting video src:', videoUrl)
      video.src = videoUrl
      video.load()

      return () => {
        video.removeEventListener('loadedmetadata', onLoadedMetadata)
        video.removeEventListener('canplay', onCanPlay)
        video.removeEventListener('error', onError)
      }
    }
    // Use HLS.js for browsers that don't support HLS (Chrome, Firefox)
    else if (Hls.isSupported()) {
      console.log('[CaseStudyCover] Using HLS.js')
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        debug: false,
      })

      hlsRef.current = hls

      hls.loadSource(videoUrl)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('[CaseStudyCover] HLS manifest parsed, playing video')
        video.play().catch(err => {
          console.warn('[CaseStudyCover] Autoplay prevented:', err)
        })
      })

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('[CaseStudyCover] HLS error:', data)
        if (data.fatal) {
          console.error('[CaseStudyCover] Fatal HLS error, type:', data.type, 'details:', data.details)
          setVideoError(true)
        }
      })
    } else {
      console.error('[CaseStudyCover] HLS not supported in this browser')
      setVideoError(true)
    }

    // Cleanup
    return () => {
      if (hlsRef.current) {
        console.log('[CaseStudyCover] Cleaning up HLS.js')
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [videoUrl])

  return (
    <div
      ref={containerRef}
      className={`w-full overflow-hidden [background-color:var(--color-bg-container-solid)] shadow-md hover:shadow-xl transition-all duration-300 ${className}`}
      style={{
        aspectRatio: 'var(--home-cover-aspect-ratio, 4 / 2.75)',
        borderRadius: 'var(--home-cover-border-radius, 30px)',
        ...style,
      }}
    >
      {showVideo && videoUrl ? (
        <video
          ref={videoRef}
          loop
          muted
          playsInline
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            console.error('[CaseStudyCover] Video error:', e, e.target.error)
            if (e.target.error) {
              console.error('[CaseStudyCover] Error code:', e.target.error.code)
              console.error('[CaseStudyCover] Error message:', e.target.error.message)
            }
            setVideoError(true)
          }}
          onLoadedData={() => console.log('[CaseStudyCover] Video loaded successfully')}
          onCanPlay={() => console.log('[CaseStudyCover] Video can play')}
          onLoadedMetadata={() => console.log('[CaseStudyCover] Video metadata loaded')}
        >
          {/* Fallback to image if video fails */}
          Your browser does not support HLS video.
        </video>
      ) : (
        <CaseStudyImage
          source={coverImage}
          alt={alt}
          sizes={sizes}
          maxWidth={maxWidth}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      )}
    </div>
  )
}
