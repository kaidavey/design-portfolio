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
      <span className="tracking-tight font-['DM_Sans',system-ui,sans-serif] text-[#0000004D] text-[18px]">
        {track} · {artist}
      </span>
    </div>
  )
}
