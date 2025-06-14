const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const randomstring = require('randomstring');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
const codesDir = path.join(__dirname, 'codes');
const sessionsDir = path.join(__dirname, 'sessions');

if (!fs.existsSync(codesDir)) fs.mkdirSync(codesDir);
if (!fs.existsSync(sessionsDir)) fs.mkdirSync(sessionsDir);

let pairing = {}; // { ip: timestamp/recent pairing }

app.post('/pair', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();

  if (!req.body.number) return res.status(400).json({ error: 'Phone number required' });
  if (pairing[ip] && now - pairing[ip] < 10000) {
    return res.status(429).json({ error: 'Please wait 10 seconds.' });
  }
  pairing[ip] = now;

  const number = req.body.number.replace(/\D/g, '');
  const code = `gifteddave~${randomstring.generate(6).toLowerCase()}`;
  const codePath = path.join(codesDir, code + '.json');

  // Save pairing record
  fs.writeFileSync(codePath, JSON.stringify({ number, code }));

  // Initialize WhatsApp session
  const client = new Client({
    authStrategy: new LocalAuth({ clientId: code }),
    puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }
  });

  client.on('ready', () => {
    console.log(`✅ WhatsApp ready for ${number} with code ${code}`);
    fs.writeFileSync(
      path.join(sessionsDir, code + '.json'),
      JSON.stringify({ number, code })
    );
    client.logout();
  });

  client.on('auth_failure', err => {
    console.error('❌ Auth failure', err);
    try { fs.unlinkSync(codePath); } catch {}
  });

  client.initialize();

  return res.json({ code });
});

app.get('/', (req, res) => {
  res.send(`
    <form onsubmit="e=>{}">
      <input id="num" placeholder="254712345678"/>
      <button onclick="pair()">Get Code</button>
      <div id="out"></div>
    </form>
    <script>
      async function pair(){
        const num = document.getElementById('num').value;
        const resp = await fetch('/pair',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({number:num})});
        const d = await resp.json();
        document.getElementById('out').innerText = resp.ok ? "Your code: " + d.code : d.error;
      }
    </script>
  `);
});

app.listen(PORT, () => console.log(`✅ Listening on port ${PORT}`));
