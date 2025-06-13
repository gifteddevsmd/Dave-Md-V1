import { useState } from 'react'

export default function Home() {
  const [number, setNumber] = useState('')
  const [pairCode, setPairCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setPairCode('')

    try {
      const res = await fetch('/api/pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number }),
      })

      const data = await res.json()

      if (res.ok) {
        setPairCode(data.pairCode)
      } else {
        setError(data.error || 'Something went wrong.')
      }
    } catch (err) {
      setError('Connection error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 20 }}>
      <h1>💬 Gifted-Dave-MD: Generate WhatsApp Pair Code</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="+254712345678"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          required
          style={{ padding: 10, width: 250, fontSize: 16 }}
        />
        <button
          type="submit"
          style={{ marginLeft: 10, padding: 10, fontSize: 16 }}
        >
          {loading ? 'Generating...' : 'Generate Pair Code'}
        </button>
      </form>

      {pairCode && (
        <div style={{ marginTop: 20 }}>
          <h3>🔐 Your Pair Code:</h3>
          <pre style={{ fontSize: 24, background: '#f5f5f5', padding: 10 }}>
            {pairCode}
          </pre>
          <p>➡️ Open WhatsApp → Linked Devices → Link a Device → Enter this code</p>
        </div>
      )}

      {error && (
        <div style={{ marginTop: 20, color: 'red' }}>
          ❌ {error}
        </div>
      )}
    </div>
  )
  }
