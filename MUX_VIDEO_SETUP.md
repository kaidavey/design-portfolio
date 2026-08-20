# Mux Video Integration

This document explains the Mux video integration for case study covers.

## Architecture Overview

The implementation follows **progressive enhancement** principles:
- **Image-first**: Cover images are required and always load fast
- **Video as enhancement**: Cover videos are optional and load lazily
- **Graceful degradation**: If video fails or doesn't exist, the image is always shown

## Key Design Decisions

### 1. The image is layered under the video, never replaced by it

The `<img>` is always rendered and never unmounted. The `<video>` sits on top of
it at `opacity: 0` and fades in **only once it fires a `playing` event**.

This is the load-bearing decision. Because the image is already on screen, the
component never has to predict whether video will work — it just tries, and
success reveals itself. A missing playback ID, a still-encoding asset, a fatal
HLS error, a refused autoplay, a 404 from Mux: every one of them just leaves the
image showing. Failure is free, silent and identical.

- `coverImage`: **Required** — the poster, the fallback, and the LCP element
- `coverVideo`: **Optional** — enhances the experience when it works out

### 2. Performance Optimizations
- **Lazy loading**: Videos load only when the card nears the viewport (`useInView`, 200px margin)
- **Capability gating**: `useVideoCapability` blocks loading on `prefers-reduced-motion`, Data Saver, `slow-2g`/`2g`/`3g`, or `deviceMemory < 4`. Both live signals are *subscribed*, so toggling the OS motion setting or dropping to cellular takes effect without a reload. A browser that doesn't report a signal counts as capable — never block on something you can't read.
- **On-demand player**: hls.js is `import()`ed only when a video actually loads, and uses the `hls.js/light` build (no alt-audio, subtitles or DRM — none of which a silent loop needs). This keeps **~183 kB gzipped off the critical path**; the main bundle is 172 kB gz instead of 355 kB gz.
- **Native HLS on Apple platforms**: Safari and iOS play the `.m3u8` directly, so they download no player library at all.
- **Capped delivery**: playback URLs request `?max_resolution=720p`. Cards render around 440 CSS px wide.

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
- `normalizeMuxAsset(input)` - Flattens either GROQ shape (`{ asset: {...} }` or the bare asset document) into `{ playbackId, status }`, or `null` if there's nothing playable
- `getMuxPlaybackUrl(input, options)` - Builds the HLS URL, capped at 720p by default

### Hooks
- `useVideoCapability()` (`/src/hooks/useVideoCapability.js`) - Should this device/connection spend bytes on decorative video?
- `useInView(ref, options)` (`/src/hooks/useInView.js`) - IntersectionObserver against a ref the caller already owns

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

`getAllCaseStudies` projects only the two fields playback needs — dereferencing
the whole Mux asset drags its full encoding metadata into every card on the page:

```groq
"coverVideo": coverVideo.asset-> {
  "playbackId": coalesce(playbackId, data.playback_ids[0].id),
  status
}
```

`status` is fetched for debugging only. **Nothing gates on it** — see below.

## Testing Checklist

- [ ] Upload a test video in Sanity Studio and **publish** the case study
- [ ] `npm test` — `src/test/mux.test.js` covers URL building and both GROQ shapes offline
- [ ] Verify the image paints immediately, then the video cross-fades in
- [ ] DevTools > Network: no `hls.light` chunk is requested until a card scrolls into view
- [ ] DevTools > Rendering > "Emulate prefers-reduced-motion: reduce" — video stops loading; toggle it back off and the video should start **without a reload**
- [ ] DevTools > Network > throttle to "Slow 3G" — no video requested at all
- [ ] Test with video field empty (should show image)
- [ ] Test video error handling (invalid playback ID should fall back to image, silently)

## Troubleshooting

### ⚠️ Never gate playback on the Sanity `status` field

This one cost a day. The `status` on a `mux.videoAsset` document is **a snapshot
taken moments after Mux ingests the file, while it is still encoding** — and
nothing routinely writes it back.

In `sanity-plugin-mux-input@5`, `updateAssetDocumentFromUpload` calls `pollUpload`,
which resolves as soon as `upload.data.asset_id` exists. It then does a
`createOrReplace` with `status: asset.data.status`, which at that instant is
`"preparing"`. The only code paths that ever update it afterwards are the
mezzanine/master-download poller, the "add captions" dialog, and the Studio
tool's manual *resync from Mux* button. There is no general poller, so the field
reads `"preparing"` more or less forever, long after the video plays fine.

`data.status` is captured in the same instant and is just as stale.

**The playback ID is the durable signal.** It is written correctly on first save
and never changes. If a playback ID exists, try to play it and let failure fall
back to the image.

To check what your dataset actually holds:

```bash
curl -sG 'https://6vslo6fw.api.sanity.io/v2025-08-15/data/query/production' \
  --data-urlencode 'query=*[_type=="caseStudy"]{title,"pid":coverVideo.asset->playbackId,"status":coverVideo.asset->status}'
```

A valid `pid` next to a non-`ready` `status` is the expected, healthy state.

### Video not showing
1. Confirm a `playbackId` exists (see the curl above). Ignore `status`.
2. Is the case study **published**? The frontend client is unauthenticated, so it only sees published documents — a video added to a draft is invisible.
3. Do you have **Reduce Motion** on at the OS level? That intentionally disables cover videos.
4. Are you on a throttled connection, or is Data Saver on? Both intentionally disable them.
5. Check that `https://stream.mux.com/<playbackId>.m3u8` returns 200 in the browser.
6. Verify `coverImage` exists — it is the required fallback and the video is layered over it.

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
