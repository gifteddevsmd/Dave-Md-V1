const express = require('express');
const { makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const randomstring = require('randomstring');
const app = express();

const PORT = process.env.PORT || 3000;
const sessionsPath = path.join(__dirname, 'sessions');
if (!fs.existsSync(sessionsPath)) fs.mkdirSync(sessionsPath);

let lastRequests = {};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/pair', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  if (!req.body.number) return res.status(400).json({ error: 'Phone number required' });

  if (lastRequests[ip] && Date.now() - lastRequests[ip] < 10000)
    return res.status(429).json({ error: 'Please wait 10 seconds.' });

  lastRequests[ip] = Date.now();

  const number = req.body.number.replace(/\D/g, '');
  const code = `DAVE-${randomstring.generate({ length: 4, charset: 'alphanumeric' })}`.toUpperCase();
  const filename = `${code}.json`;
  const filepath = path.join(sessionsPath, filename);

  const { state, saveState } = useSingleFileAuthState(filepath);
  const sock = makeWASocket({ auth: state });

  sock.ev.on('connection.update', ({ connection }) => {
    if (connection === 'open') {
      console.log(`✅ Connected: ${number}`);
    }
  });

  sock.ev.on('creds.update', saveState);

  res.json({
    code,
    sessionFile: `/sessions/${filename}`,
    download: `${req.protocol}://${req.get('host')}/sessions/${filename}`
  });
});

app.use('/sessions', express.static(sessionsPath));

app.get('/', (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>Dave-Md-V1 Pair</title>
    <style>
      body {
        margin: 0;
        font-family: 'Segoe UI', sans-serif;
        background: linear-gradient(135deg, #2c3e50, #3498db);
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        flex-direction: column;
      }
      h1 {
        animation: pulse 2s infinite;
        font-size: 2.5em;
      }
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      input, button {
        padding: 12px;
        font-size: 1em;
        border: none;
        border-radius: 8px;
        margin: 10px 0;
      }
      button {
        background-color: #e67e22;
        color: white;
        cursor: pointer;
        transition: 0.3s;
      }
      button:hover {
        background-color: #d35400;
      }
      #out {
        margin-top: 15px;
        white-space: pre-wrap;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <h1>🚀 Dave-Md-V1 Bot Pairing</h1>
    <input id="num" placeholder="Enter your phone e.g. 254712345678" />
    <button onclick="pair()">Generate Pair Code</button>
    <div id="out"></div>

    <script>
      async function pair(){
        const num = document.getElementById('num').value;
        const res = await fetch('/pair', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ number: num })
        });
        const data = await res.json();
        document.getElementById('out').innerText = res.ok ? 
          '✅ Pair Code: ' + data.code + '\\nDownload Session: ' + data.download 
          : '❌ ' + data.error;
      }
    </script>
  </body>
  </html>
  `);
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
