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
      console.log(`⚠️ Scan QR for ${number} (not shown, since using code only mode)`);
    }
  });

  sock.ev.on('creds.update', saveState);

  return res.json({ code, sessionFile: `/sessions/${filename}` });
});

app.use('/sessions', express.static(sessionsPath));

app.get('/', (req, res) => {
  res.send(`
    <form onsubmit="e=>{}">
      <input id="num" placeholder="254712345678" />
      <button onclick="pair()">Get Code</button>
      <div id="out"></div>
    </form>
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
          '✅ Your code: ' + data.code + '\\nDownload Session: ' + window.location.origin + data.sessionFile 
          : '❌ ' + data.error;
      }
    </script>
  `);
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
