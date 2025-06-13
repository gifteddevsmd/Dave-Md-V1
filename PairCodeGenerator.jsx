import React, { useState } from 'react';

export default function PairCodeGenerator() {
  const [number, setNumber] = useState('');
  const [pairCode, setPairCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const backendUrl = 'https://your-heroku-app.herokuapp.com/api/pair'; // replace with your Heroku URL

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setPairCode('');
    if (!number) {
      setError('Please enter your WhatsApp number');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number }),
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.statusText}`);
      }

      const data = await res.json();

      if (data.pairCode) {
        setPairCode(data.pairCode);
      } else {
        setError('No pair code received');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch pair code');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: '1rem', fontFamily: 'sans-serif' }}>
      <h2>WhatsApp Pair Code Generator</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter WhatsApp number (with country code)"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', fontSize: '1rem' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>
          {loading ? 'Generating...' : 'Get Pair Code'}
        </button>
      </form>

      {pairCode && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#dff0d8', borderRadius: 4 }}>
          <strong>Your Pair Code:</strong>
          <pre style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>{pairCode}</pre>
          <p>Scan this code with your WhatsApp to pair.</p>
        </div>
      )}

      {error && (
        <div style={{ marginTop: '1rem', color: 'red' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}
