// 📦 Core dependencies
const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const { Boom } = require('@hapi/boom');

// 📲 Baileys setup
const {
  default: makeWASocket,
  useSingleFileAuthState,
  DisconnectReason
} = require('@whiskeysockets/baileys');

// 🌍 Global Configs & Bot Logic
require('./settings');
require('./Dave-Md-V1.js'); // Main bot logic

// 🔐 Session Auth
const sessionPath = path.join(__dirname, 'session');
if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath);
const sessionFile = path.join(sessionPath, 'creds.json');
const { state, saveState } = useSingleFileAuthState(sessionFile);

// 🤖 Start Bot
async function startBot() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
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

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m?.message || m.key.fromMe) return;

    const sender = m.key.remoteJid;
    const text = m.message?.conversation || m.message?.extendedTextMessage?.text;
    if (text?.toLowerCase() === 'hi' || text?.toLowerCase() === 'hello') {
      await sock.sendMessage(sender, { text: '👋 Hello! Dave-Md-V1 is online and working.' });
    }
  });
}
startBot();

// 🌐 Express Setup
const app = express();
app.use(cors());
app.use(express.json());

// 🔁 API Handlers
const pairHandler = require('./api/pair');
const qrHandler = require('./api/qr');

app.use('/api/pair', pairHandler);
app.use('/api/qr', qrHandler);

// 🖼️ Static HTML Pages
app.use(express.static(path.join(__dirname, 'public')));

// 🧾 Direct Page Access
app.get('/pair', (_, res) => {
  res.sendFile(path.join(__dirname, 'public/pair.html'));
});
app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// ✅ Health Check
app.get('/health', (_, res) => {
  res.send('🟢 Dave-Md-V1 Pairing Backend Running');
});

// 🚀 Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌍 Server running at http://localhost:${PORT}`);
});

module.exports = app;
