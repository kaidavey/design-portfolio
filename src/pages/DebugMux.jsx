import { useEffect, useState } from 'react'
import { client } from '../lib/sanity'

export default function DebugMux() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // Step 1: Test basic connection
        console.log('[DebugMux] Testing Sanity connection...')
        const testQuery = `*[_type == "caseStudy"][0..2] { _id, title }`
        const testResult = await client.fetch(testQuery)
        console.log('[DebugMux] Connection test passed:', testResult)

        // Step 2: Fetch full data with coverVideo
        const query = `*[_type == "caseStudy"] | order(order asc) {
          _id,
          title,
          slug,
          coverImage,
          coverVideo,
          "coverVideoAsset": coverVideo.asset->
        }`

        console.log('[DebugMux] Fetching full data...')
        const result = await client.fetch(query)
        console.log('[DebugMux] Fetched data:', result)
        setData(result)
      } catch (err) {
        console.error('[DebugMux] Error:', err)
        console.error('[DebugMux] Error details:', {
          message: err.message,
          stack: err.stack,
          response: err.response,
        })
        setError(err.message)
      }
    }

    fetchData()
  }, [])

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace', fontSize: '14px' }}>
      <h1>Mux Debug Page</h1>

      {error && (
        <div style={{ color: 'red', marginTop: '20px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {data && (
        <div style={{ marginTop: '20px' }}>
          <h2>Case Studies Data:</h2>
          <pre style={{ background: '#f5f5f5', padding: '20px', overflow: 'auto' }}>
            {JSON.stringify(data, null, 2)}
          </pre>

          <h2>Cover Video Analysis:</h2>
          {data.map((study) => (
            <div key={study._id} style={{ marginTop: '20px', borderBottom: '1px solid #ccc', paddingBottom: '20px' }}>
              <h3>{study.title}</h3>
              <p><strong>Has coverImage:</strong> {study.coverImage ? 'Yes' : 'No'}</p>
              <p><strong>Has coverVideo (reference):</strong> {study.coverVideo ? 'Yes' : 'No'}</p>
              <p><strong>Has coverVideoAsset (dereferenced):</strong> {study.coverVideoAsset ? 'Yes' : 'No'}</p>

              {study.coverVideo && (
                <details style={{ marginTop: '10px' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>coverVideo (reference)</summary>
                  <pre style={{ background: '#f0f0f0', padding: '10px', fontSize: '12px', marginTop: '10px' }}>
                    {JSON.stringify(study.coverVideo, null, 2)}
                  </pre>
                </details>
              )}

              {study.coverVideoAsset && (
                <>
                  <h4 style={{ marginTop: '15px' }}>Dereferenced Video Asset:</h4>
                  <p><strong>Playback ID:</strong> {study.coverVideoAsset.playbackId || 'MISSING'}</p>
                  <p><strong>Status:</strong> {study.coverVideoAsset.status || 'MISSING'}</p>
                  <p><strong>Duration:</strong> {study.coverVideoAsset.duration}</p>
                  <p><strong>Asset Type:</strong> {study.coverVideoAsset._type}</p>

                  {study.coverVideoAsset.playbackId && (
                    <>
                      <p style={{ marginTop: '10px' }}>
                        <strong>HLS Stream URL (recommended):</strong>{' '}
                        <a
                          href={`https://stream.mux.com/${study.coverVideoAsset.playbackId}.m3u8`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'blue', textDecoration: 'underline' }}
                        >
                          https://stream.mux.com/{study.coverVideoAsset.playbackId}.m3u8
                        </a>
                      </p>
                      <p style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                        <strong>MP4 Support:</strong> {study.coverVideoAsset.data?.mp4_support || 'none'}
                        {study.coverVideoAsset.data?.mp4_support === 'none' && ' (Enable in Mux settings for MP4 downloads)'}
                      </p>
                    </>
                  )}

                  <details style={{ marginTop: '10px' }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Full coverVideoAsset data</summary>
                    <pre style={{ background: '#f0f0f0', padding: '10px', fontSize: '12px', marginTop: '10px' }}>
                      {JSON.stringify(study.coverVideoAsset, null, 2)}
                    </pre>
                  </details>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {!data && !error && <p>Loading...</p>}
    </div>
  )
}
