const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const NOW_PLAYING_URL = 'https://api.spotify.com/v1/me/player/currently-playing'
const RECENT_URL = 'https://api.spotify.com/v1/me/player/recently-played?limit=1'

const EMPTY = { isPlaying: false, track: null, artist: null, albumArt: null, url: null }

async function getAccessToken(env) {
  const basic = btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`)

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: env.SPOTIFY_REFRESH_TOKEN,
    }),
  })

  if (!res.ok) throw new Error(`Spotify token exchange failed: ${res.status}`)
  const json = await res.json()
  return json.access_token
}

function formatTrack(item, isPlaying) {
  return {
    isPlaying,
    track: item.name,
    artist: item.artists.map((a) => a.name).join(', '),
    // Images come largest-first; last one is the small thumbnail.
    albumArt: item.album?.images?.at(-1)?.url ?? null,
    url: item.external_urls?.spotify ?? null,
  }
}

export async function getNowPlaying(env) {
  const token = await getAccessToken(env)
  const headers = { Authorization: `Bearer ${token}` }

  // 200 = a track is loaded (playing or paused). 204 = nothing at all.
  const live = await fetch(NOW_PLAYING_URL, { headers })

  if (live.status === 200) {
    const json = await live.json()
    if (json?.item && json.currently_playing_type === 'track') {
      return formatTrack(json.item, Boolean(json.is_playing))
    }
  }

  // Nothing live — fall back to history, always dimmed.
  const recent = await fetch(RECENT_URL, { headers })
  if (recent.status === 200) {
    const json = await recent.json()
    const item = json?.items?.[0]?.track
    if (item) return formatTrack(item, false)
  }

  return EMPTY
}