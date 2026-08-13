import { Music } from 'lucide-react'
import useNowPlaying from '../hooks/useNowPlaying'

const TEXT_CLASSES =
  "tracking-[-0.02em] font-['DM_Sans',system-ui,sans-serif] font-medium [color:var(--color-text-muted)] text-meta-value leading-[1.375rem]"

export default function NowPlaying({ data }) {
  const live = useNowPlaying()
  const { track, artist, albumArt, url, isPlaying, status } = data ?? live

  if (status === 'loading' || status === 'error' || !track) {
    return <div className="flex items-center gap-1.5 h-[1.375rem]" aria-hidden="true" />
  }

  const label = `${isPlaying ? 'Now playing' : 'Last played'}: ${track} by ${artist}`

  const Wrapper = url ? 'a' : 'div'

  const linkProps = url
    ? { href: url, target: '_blank', rel: 'noopener noreferrer' }
    : {}

  const wrapperClasses = [
    'flex items-center gap-1.5 min-w-0 transition-opacity duration-300',
    isPlaying ? 'opacity-100' : 'opacity-50',
    url ? 'hover:opacity-100' : '',
  ].join(' ')

  return (
    <Wrapper {...linkProps} className={wrapperClasses} aria-label={label}>
      {albumArt ? (
        <img
          src={albumArt}
          alt=""
          className="w-[18px] h-[18px] rounded-[3px] object-cover shrink-0"
        />
      ) : (
        <Music
          className="w-[18px] h-[18px] shrink-0 [color:var(--color-text-muted)]"
          strokeWidth={1.5}
        />
      )}
      <span className={`${TEXT_CLASSES} truncate`}>
        {track} · {artist}
      </span>
    </Wrapper>
  )
}