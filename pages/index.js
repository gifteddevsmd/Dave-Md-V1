export default function Home() {
  return (
    <div style={{
      fontFamily: 'Arial',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '100px'
    }}>
      <h1>🤖 Gifted-Dave-MD Pair Code Generator</h1>
      <p>Enter your WhatsApp number (with country code):</p>
      <input
        id="number"
        placeholder="+2547XXXXXXXX"
        style={{ padding: '10px', fontSize: '16px', width: '300px', marginBottom: '10px' }}
      />
      <button
        onClick={async () => {
          const number = document.getElementById('number').value
          if (!number) return alert('Please enter your WhatsApp number!')

          const res = await fetch('/api/pair', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ number })
          })

          const data = await res.json()
          if (data.pairCode) {
            alert('✅ Your Pair Code:\n\n' + data.pairCode)
          } else if (data.message) {
            alert('✅ ' + data.message)
          } else {
            alert('❌ Error:\n\n' + (data.error || 'Unknown error'))
          }
        }}
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
      >
        Generate Pair Code
      </button>
    </div>
  )
  }
