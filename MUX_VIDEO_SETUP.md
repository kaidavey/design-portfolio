# Mux Video Integration

This document explains the Mux video integration for case study covers.

## Architecture Overview

The implementation follows **progressive enhancement** principles:
- **Image-first**: Cover images are required and always load fast
- **Video as enhancement**: Cover videos are optional and load lazily
- **Graceful degradation**: If video fails or doesn't exist, the image is always shown

## Key Design Decisions

### 1. Progressive Enhancement
- `coverImage`: **Required** - Fast-loading fallback, also used as video poster
- `coverVideo`: **Optional** - Enhances the experience when present

### 2. Performance Optimizations
- **Lazy loading**: Videos only load when in viewport (IntersectionObserver)
- **Reduced motion**: Respects `prefers-reduced-motion` preference (shows image instead)
- **Error handling**: Falls back to image if video fails to load
- **Native video element**: Uses lightweight `<video>` instead of full Mux Player

### 3. User Experience
- Videos autoplay, loop, and are muted (required for autoplay)
- Smooth hover transitions maintained
- Works across all devices and connection speeds

## Components

### CaseStudyCover (`/src/components/CaseStudyCover.jsx`)
Smart component that handles both images and videos:
```jsx
<CaseStudyCover
  coverImage={caseStudy.coverImage}  // Required
  coverVideo={caseStudy.coverVideo}  // Optional
  alt={caseStudy.title}
  sizes="(max-width: 640px) 92vw, (max-width: 900px) 45vw, 440px"
  maxWidth={880}
/>
```

### Mux Utilities (`/src/utils/mux.js`)
Helper functions for working with Mux videos:
- `getMuxPlaybackUrl(muxVideo, options)` - Generates playback URL
- `getMuxThumbnailUrl(muxVideo, options)` - Generates thumbnail URL
- `isMuxVideoReady(muxVideo)` - Checks if video is ready

## Sanity Studio Setup

### Schema (`/portfolio-cms/schemaTypes/caseStudy.ts`)
The case study schema includes:
```typescript
{
  name: 'coverImage',
  type: 'image',
  validation: (Rule) => Rule.required(),
}
{
  name: 'coverVideo',
  type: 'mux.video',  // Mux video field
}
```

### Plugin Configuration (`/portfolio-cms/sanity.config.ts`)
The Mux plugin is registered:
```typescript
import {muxInput} from 'sanity-plugin-mux-input'

plugins: [structureTool(), visionTool(), muxInput()]
```

## Adding Videos in Sanity Studio

1. Open a case study in Sanity Studio
2. Scroll to "Cover Video (Optional)"
3. Click "Upload" or paste a video URL
4. Mux will automatically:
   - Upload and encode the video
   - Generate multiple quality versions
   - Create adaptive streaming versions
   - Make it available via CDN

### Recommended Video Specs
- **Duration**: 5-10 seconds
- **Resolution**: 720p (1280x720) - optimized for web
- **Format**: Any (Mux converts automatically)
- **File size**: Aim for source <50MB (Mux optimizes further)
- **Content**: Looping, ambient, no audio needed

## Cost Expectations (Mux Free Tier)

For a typical portfolio with 5 case studies:
- **Storage**: ~$0.001/month (essentially free)
- **Delivery**: Free (100K minutes/month = ~1.4M pageviews)
- **Encoding**: Free

You'll likely never need to pay for a portfolio site.

## Frontend Query

GROQ queries fetch the video data structure:
```groq
coverVideo {
  asset-> {
    _id,
    playbackId,
    status,
    duration
  }
}
```

## Testing Checklist

- [ ] Upload a test video in Sanity Studio
- [ ] Wait for Mux to finish encoding (status: "ready")
- [ ] Verify video plays on homepage
- [ ] Test on slow connection (video should lazy load)
- [ ] Test with browser DevTools > Rendering > "Emulate CSS prefers-reduced-motion" (should show image)
- [ ] Test with video field empty (should show image)
- [ ] Test video error handling (invalid playback ID should fall back to image)

## Troubleshooting

### Video not showing
1. Check Sanity Studio - is the video status "ready"?
2. Check browser console for errors
3. Verify `coverImage` exists (required fallback)

### Video loads slowly
- This is expected on first load
- Mux caches videos on CDN after first request
- Consider using smaller source videos

### Video doesn't autoplay
- Autoplay only works when muted (this is a browser requirement)
- Check for browser autoplay policies

## Future Enhancements

Potential improvements if needed:
- Thumbnail generation from Mux
- Quality selector (720p/1080p)
- Play/pause controls on hover
- Analytics integration via Mux Data
