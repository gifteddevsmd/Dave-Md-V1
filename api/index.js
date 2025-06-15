const { makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const randomstring = require('randomstring');

const sessionsPath = path.join(__dirname, 'sessions');
if (!fs.existsSync(sessionsPath)) fs.mkdirSync(sessionsPath);

let lastRequests = {};

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html');
    return res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Dave-Md-V1 Pair</title>
        <style>
          body {
            margin: 0;
            font-family: 'Segoe UI', sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #000000, #1f1f1f);
            color: white;
            text-align: center;
          }
          h1 {
            font-size: 2.5em;
            margin-bottom: 0.5em;
            animation: pulse 2s infinite;
          }
          input {
            padding: 10px;
            font-size: 16px;
            border-radius: 6px;
            border: none;
            width: 250px;
            margin-bottom: 10px;
          }
          button {
            padding: 10px 20px;
            font-size: 16px;
            border: none;
            border-radius: 6px;
            background-color: #00ff99;
            color: black;
            cursor: pointer;
          }
          #output {
            margin-top: 20px;
            font-size: 18px;
            white-space: pre-wrap;
          }
          .copy {
            margin-top: 10px;
            padding: 5px 10px;
            font-size: 14px;
            background: #444;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
          }
          @keyframes pulse {
            0%, 100% { color: #fff; }
            50% { color: #00ff99; }
          }
        </style>
      </head>
      <body>
        <h1>Dave-Md-V1 Code Pairing</h1>
        <input id="num" placeholder="Enter WhatsApp number e.g. 254712345678" />
        <button onclick="pair()">Get Pair Code</button>
        <div id="output"></div>
        <script>
          async function pair() {
            const num = document.getElementById('num').value;
            const res = await fetch('/api/index.js', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ number: num })
            });
            const data = await res.json();
            if (res.ok) {
              document.getElementById('output').innerHTML = 
                '✅ Your Code: <b>' + data.code + '</b><br>' +
                '📥 Session URL: <a href="' + data.sessionUrl + '" target="_blank">' + data.sessionUrl + '</a><br>' +
                '<button class="copy" onclick="copyCode(\\'' + data.code + '\\')">Copy Code</button>';
            } else {
              document.getElementById('output').innerText = '❌ ' + data.error;
            }
          }
          function copyCode(code) {
            navigator.clipboard.writeText(code);
            alert('Code copied: ' + code);
          }
        </script>
      </body>
      </html>
    `);
  }

  if (req.method === 'POST') {
    try {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const { number } = req.body;

      if (!number) return res.status(400).json({ error: 'Phone number required' });
      if (lastRequests[ip] && Date.now() - lastRequests[ip] < 10000) {
        return res.status(429).json({ error: 'Wait 10 seconds before trying again' });
      }
      lastRequests[ip] = Date.now();

      const cleanNumber = number.replace(/\D/g, '');
      const code = randomstring.generate({ length: 6, charset: 'alphanumeric' }).toUpperCase();
      const filename = `${code}.json`;
      const filepath = path.join(sessionsPath, filename);

      const { state, saveState } = useSingleFileAuthState(filepath);
      const sock = makeWASocket({ auth: state });

      sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') {
          console.log('✅ Connected: ' + number);
        }
      });

      sock.ev.on('creds.update', saveState);

      return res.status(200).json({
        code,
        sessionUrl: `https://${req.headers.host}/api/sessions/${filename}`
      });

    } catch (err) {
      console.error('❌ Pairing error:', err);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
