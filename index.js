// index.js const express = require('express'); const fs = require('fs'); const path = require('path'); const randomstring = require('randomstring');

const app = express(); app.use(express.json()); app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000; const sessionsPath = path.join(__dirname, 'sessions'); if (!fs.existsSync(sessionsPath)) fs.mkdirSync(sessionsPath);

// Store sessions in memory (demo only — production should use DB) let sessions = {};

app.get('/', (req, res) => { res.send(`<!DOCTYPE html>

<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Dave-Md-V1 Pairing</title>
  <style>
    body { font-family: Arial; background: #f3f0ff; display: flex; justify-content: center; align-items: center; height: 100vh; }
    form { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 0 20px rgba(0,0,0,0.1); width: 300px; text-align: center; }
    input, button { padding: 12px; margin-top: 10px; width: 100%; border: 1px solid #ccc; border-radius: 6px; font-size: 16px; }
    button { background-color: #4a00e0; color: white; font-weight: bold; cursor: pointer; }
    button:hover { background-color: #3700b3; }
    #codeBox { margin-top: 15px; padding: 10px; background: #f4f4f4; border: 1px dashed #ccc; font-weight: bold; }
  </style>
</head>
<body>
  <form onsubmit="submitForm(event)">
    <h2>Start WhatsApp Pairing</h2>
    <input type="text" id="number" placeholder="254712345678" required />
    <button type="submit">Submit</button>
    <div id="status"></div>
    <div id="codeBox"></div>
  </form>
  <script>
    async function submitForm(e) {
      e.preventDefault();
      const number = document.getElementById('number').value;
      const status = document.getElementById('status');
      const codeBox = document.getElementById('codeBox');
      status.innerHTML = '⏳ Processing...';
      codeBox.innerHTML = '';
      try {
        const res = await fetch('/pair', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ number })
        });
        const data = await res.json();
        if (res.ok) {
          status.innerHTML = '✅ Pairing code generated:';
          codeBox.innerHTML = `Session ID: <b>${data.sessionId}</b><br>Code: <b>${data.code}</b>`;
        } else {
          status.innerHTML = '❌ ' + (data.error || 'Failed');
        }
      } catch (err) {
        status.innerHTML = '❌ Request failed.';
      }
    }
  </script>
</body>
</html>`);
});app.post('/pair', (req, res) => { const number = req.body.number; if (!number || number.length < 10) { return res.status(400).json({ error: 'Valid phone number required.' }); }

const sessionId = gifteddave~${randomstring.generate(6).toLowerCase()}; const code = Math.floor(100000 + Math.random() * 900000).toString();

const sessionData = { number, sessionId, code, timestamp: Date.now() }; sessions[sessionId] = sessionData;

// Also save to file for persistence fs.writeFileSync(path.join(sessionsPath, ${sessionId}.json), JSON.stringify(sessionData));

console.log(✅ Code for ${number}: ${code} (Session ID: ${sessionId})); return res.json({ sessionId, code }); });

app.use((req, res) => res.status(404).send('🚫 Not found.'));

app.listen(PORT, () => console.log(🚀 Server running on http://localhost:${PORT}));

        
