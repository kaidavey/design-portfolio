import { Music } from 'lucide-react'

/**
 * NowPlaying - Music status component
 *
 * Displays currently playing track with music icon.
 * Props-driven for easy future integration with Spotify API.
 *
 * @param {string} track - Track name
 * @param {string} artist - Artist name
 * @param {boolean} isPlaying - Whether music is currently playing
 */
export default function NowPlaying({ track = 'Breathe', artist = 'Malcolm Todd', isPlaying = true }) {
  if (!isPlaying) return null

  return (
    <div className="flex items-center gap-1.5">
      <Music className="w-[18px] h-[18px] text-[#0000004D]" strokeWidth={1.5} />
      <span className="tracking-[-0.02em] font-['DM_Sans',system-ui,sans-serif] font-medium text-[#0000004D] text-lg/5.5">
        {track} · {artist}
      </span>
    </div>
  )
}
