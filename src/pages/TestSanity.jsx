import { useEffect, useState } from 'react'
import { client } from '../lib/sanity'

export default function TestSanity() {
  const [status, setStatus] = useState('Testing...')
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function test() {
      try {
        console.log('[TestSanity] Starting test...')
        console.log('[TestSanity] Client config:', {
          projectId: client.config().projectId,
          dataset: client.config().dataset,
          apiVersion: client.config().apiVersion,
        })

        // Super simple query
        const result = await client.fetch('*[_type == "caseStudy"][0...3] { _id, title }')

        console.log('[TestSanity] Success!', result)
        setStatus('✅ Connection successful!')
        setData(result)
      } catch (err) {
        console.error('[TestSanity] Error:', err)
        setStatus('❌ Connection failed')
        setError({
          message: err.message,
          statusCode: err.statusCode,
          details: err.details,
          response: err.response,
        })
      }
    }

    test()
  }, [])

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace' }}>
      <h1>Sanity Connection Test</h1>
      <h2>{status}</h2>

      {data && (
        <div style={{ marginTop: '20px' }}>
          <h3>Data Retrieved:</h3>
          <pre style={{ background: '#f5f5f5', padding: '20px', overflow: 'auto' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      {error && (
        <div style={{ marginTop: '20px', color: 'red' }}>
          <h3>Error Details:</h3>
          <pre style={{ background: '#fff0f0', padding: '20px', overflow: 'auto' }}>
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
