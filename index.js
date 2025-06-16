const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { Boom } = require('@hapi/boom');
const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');

// 📁 Ensure session folder exists
const sessionPath = path.join(__dirname, 'session');
if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath);

const sessionFile = path.join(sessionPath, 'creds.json');
const { state, saveState } = useSingleFileAuthState(sessionFile);

// ✅ Start WhatsApp bot
async function startBot() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on('creds.update', saveState);

  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      console.log('❌ Disconnected. Reason:', reason);
      if (reason !== DisconnectReason.loggedOut) startBot();
    } else if (connection === 'open') {
      console.log('✅ Dave-Md-V1 connected to WhatsApp.');
    }
  });

  sock.ev.on('messages.upsert', async (msg) => {
    const m = msg.messages[0];
    if (!m?.message || m.key.fromMe) return;
    const sender = m.key.remoteJid;
    const text = m.message.conversation || m.message?.extendedTextMessage?.text;
    if (text?.toLowerCase() === 'hi' || text?.toLowerCase() === 'hello') {
      await sock.sendMessage(sender, { text: '👋 Hello! Dave-Md-V1 is online.' });
    }
  });
}

startBot();

// 🌐 Backend API + static hosting
const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// 📩 Pairing endpoint handler (you must have ./api/pair.js)
const pairHandler = require('./api/pair');
app.post('/api/pair', pairHandler.handler);

// Health check
app.get('/health', (_, res) => {
  res.send('🟢 Dave-Md Pairing Backend Running');
});

// ✅ Listen on dynamic PORT (Predoctyle, Railway, Heroku, etc.)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌍 Server running on http://localhost:${PORT}`);
});
