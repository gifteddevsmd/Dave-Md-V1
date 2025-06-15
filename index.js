const express = require('express');
const { makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const randomstring = require('randomstring');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
const sessionsPath = path.join(__dirname, 'sessions');
if (!fs.existsSync(sessionsPath)) fs.mkdirSync(sessionsPath);

let lastRequests = {};

app.post('/pair', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  if (!req.body.number) return res.status(400).json({ error: 'Phone number required' });

  if (lastRequests[ip] && Date.now() - lastRequests[ip] < 10000) {
    return res.status(429).json({ error: 'Please wait 10 seconds.' });
  }
  lastRequests[ip] = Date.now();

  const number = req.body.number.replace(/\D/g, '');
  const code = randomstring.generate({ length: 6, charset: 'alphanumeric' }).toUpperCase();
  const filename = `${code}.json`;
  const filepath = path.join(sessionsPath, filename);

  const { state, saveState } = useSingleFileAuthState(filepath);
  const sock = makeWASocket({ auth: state });

  sock.ev.on('connection.update', (update) => {
    const { connection, qr } = update;
    if (connection === 'open') {
      console.log(`✅ WhatsApp connected: ${number}`);
    } else if (qr) {
      console.log(`⚠️ QR code generated (not shown, using code only): ${qr}`);
    }
  });

  sock.ev.on('creds.update', saveState);

  return res.json({ code, sessionFile: `/sessions/${filename}` });
});

app.use('/sessions', express.static(sessionsPath));

app.get('/', (req, res) => {
  res.send(`
    <html>
    <head>
      <title>Dave-Md-V1 Code Pairing</title>
      <style>
        body {
          font-family: 'Segoe UI', sans-serif;
          background: linear-gradient(to right, #1e3c72, #2a5298);
          color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          animation: fadeIn 1s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        h1 {
          font-size: 2.5rem;
          margin-bottom: 20px;
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        input {
          padding: 10px;
          font-size: 1rem;
          border: none;
          border-radius: 8px;
          margin-bottom: 10px;
          width: 250px;
        }
        button {
          padding: 10px 20px;
          font-size: 1rem;
          border: none;
          border-radius: 8px;
          background-color: #ffffff;
          color: #1e3c72;
          cursor: pointer;
        }
        #out {
          margin-top: 20px;
          white-space: pre-line;
          background-color: rgba(255,255,255,0.1);
          padding: 15px;
          border-radius: 10px;
          max-width: 400px;
          text-align: left;
        }
        .hidden {
          display: none;
        }
        .copy-btn {
          margin-top: 10px;
          background: #0f0;
          color: black;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
        }
      </style>
    </head>
    <body>
      <h1>✨ Dave-Md-V1 Pairing ✨</h1>
      <input id="num" placeholder="Enter phone e.g. 254712345678" />
      <button onclick="pair()">Generate Code</button>
      <div id="out" class="hidden"></div>
      <button id="copyBtn" class="copy-btn hidden" onclick="copyCode()">📋 Copy</button>

      <script>
        async function pair(){
          const num = document.getElementById('num').value.trim();
          const res = await fetch('/pair', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ number: num })
          });
          const data = await res.json();
          const out = document.getElementById('out');
          const copyBtn = document.getElementById('copyBtn');

          if (res.ok) {
            const text = '✅ Your code: ' + data.code + '\\n📁 Download Session: ' + window.location.origin + data.sessionFile;
            out.innerText = text;
            out.classList.remove('hidden');
            copyBtn.classList.remove('hidden');
            copyBtn.setAttribute('data-copy', text);
          } else {
            out.innerText = '❌ ' + data.error;
            out.classList.remove('hidden');
            copyBtn.classList.add('hidden');
          }
        }

        function copyCode() {
          const text = document.getElementById('copyBtn').getAttribute('data-copy');
          navigator.clipboard.writeText(text).then(() => {
            alert("✅ Copied to clipboard!");
          });
        }
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
