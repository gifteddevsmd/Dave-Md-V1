import { useState } from 'react';

export default function Home() {
  const [number, setNumber] = useState('');
  const [pairCode, setPairCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/pair', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number }),
    });
    const data = await res.json();
    setLoading(false);
    setPairCode(data.code);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🤖 Gifted-Dave Session Generator</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter your WhatsApp number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Generating...' : 'Get Pair Code'}
        </button>
      </form>

      {pairCode && (
        <div style={{ marginTop: 20 }}>
          <p>Your pair code:</p>
          <pre style={{ fontSize: 24 }}>{pairCode}</pre>
          <a
            href={`https://wa.me/${number}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Click here to open WhatsApp
          </a>
        </div>
      )}
    </div>
  );
  }
