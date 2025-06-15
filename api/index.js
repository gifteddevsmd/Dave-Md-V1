// File: api/index.js

const { makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const randomstring = require('randomstring');
const fs = require('fs');
const path = require('path');

const sessionsDir = path.join(__dirname, 'sessions');
if (!fs.existsSync(sessionsDir)) fs.mkdirSync(sessionsDir);

const rateLimit = {}; // IP rate limiter

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (!req.body.number) return res.status(400).json({ error: 'Phone number required' });

    if (rateLimit[ip] && Date.now() - rateLimit[ip] < 10_000) {
      return res.status(429).json({ error: 'Too fast. Wait 10 seconds.' });
    }
    rateLimit[ip] = Date.now();

    const number = req.body.number.replace(/\D/g, '');
    const code = randomstring.generate({ length: 6, charset: 'alphanumeric' }).toUpperCase();
    const sessionFile = `${code}.json`;
    const sessionPath = path.join(sessionsDir, sessionFile);

    const { state, saveState } = useSingleFileAuthState(sessionPath);
    const sock = makeWASocket({ auth: state });

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === 'open') console.log(`✅ Connected: ${number}`);
      else if (update.qr) console.log(`⚠️ Scan QR for ${number} (suppressed for code-mode)`);
    });

    sock.ev.on('creds.update', saveState);

    return res.status(200).json({
      code,
      sessionUrl: `/api/sessions/${sessionFile}`
    });
  }

  // GET: Show frontend UI
  res.setHeader('Content-Type', 'text/html');
  return res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Dave-Md Pairing</title>
      <style>
        body {
          font-family: 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d);
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          color: white;
        }
        .box {
          background: rgba(0,0,0,0.6);
          padding: 2em;
          border-radius: 20px;
          text-align: center;
          animation: fadeIn 1s ease-in-out;
        }
        h1 {
          font-size: 2em;
          margin-bottom: 10px;
        }
        input {
          padding: 10px;
          border-radius: 10px;
          border: none;
          width: 220px;
          text-align: center;
          font-size: 16px;
        }
        button {
          margin-top: 1em;
          padding: 10px 20px;
          border: none;
          border-radius: 10px;
          background: #ffd700;
          color: black;
          cursor: pointer;
          font-weight: bold;
        }
        #output {
          margin-top: 15px;
          font-size: 1.1em;
          word-break: break-word;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      </style>
    </head>
    <body>
      <div class="box">
        <h1>🔐 Dave-Md-V1 Pairing</h1>
        <input id="number" placeholder="e.g. 254712345678" /><br/>
        <button onclick="getCode()">Get Pair Code</button>
        <div id="output"></div>
      </div>
      <script>
        async function getCode() {
          const number = document.getElementById('number').value;
          const res = await fetch(window.location.href, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ number })
          });
          const out = document.getElementById('output');
          const data = await res.json();
          if (res.ok) {
            out.innerHTML = \`✅ Pair Code: <b>\${data.code}</b><br>
            <button onclick="navigator.clipboard.writeText('\${data.code}')">📋 Copy Code</button><br>
            <small>Session File: <a href="\${data.sessionUrl}" target="_blank">Download</a></small>\`;
          } else {
            out.innerText = '❌ ' + data.error;
          }
        }
      </script>
    </body>
    </html>
  `);
};
