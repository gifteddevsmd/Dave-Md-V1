const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const randomstring = require('randomstring');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 📁 Directory to store session files
const sessionsDir = path.join(__dirname, 'sessions');
if (!fs.existsSync(sessionsDir)) fs.mkdirSync(sessionsDir);

let cooldown = {};

app.post('/pair', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const number = req.body.number?.replace(/\D/g, '');

    if (!number) return res.status(400).json({ error: 'Phone number required' });

    // Cooldown: 1 request per IP every 10 seconds
    if (cooldown[ip] && Date.now() - cooldown[ip] < 10000) {
      return res.status(429).json({ error: 'Please wait 10 seconds before retrying.' });
    }
    cooldown[ip] = Date.now();

    const code = randomstring.generate({ length: 6, charset: 'alphanumeric' }).toUpperCase();
    const sessionFile = path.join(sessionsDir, `${code}.json`);
    const { state, saveState } = useSingleFileAuthState(sessionFile);

    const sock = makeWASocket({ auth: state });

    sock.ev.on('connection.update', ({ connection }) => {
      if (connection === 'open') {
        console.log(`✅ WhatsApp connected for: ${number}`);
      }
    });

    sock.ev.on('creds.update', saveState);

    return res.json({
      code,
      sessionFile: `/sessions/${code}.json`,
      message: 'Session initialized. Please complete linking via WhatsApp.'
    });

  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ error: 'Something went wrong initializing session.' });
  }
});

// Static session file access (if needed)
app.use('/sessions', express.static(sessionsDir));

// Optional health check
app.get('/', (req, res) => {
  res.send('✅ Dave-Md-V1 Pairing API is online.');
});

app.listen(PORT, () => {
  console.log(`🚀 Pairing backend running on port ${PORT}`);
});
