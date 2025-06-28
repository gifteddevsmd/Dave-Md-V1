// 📦 Core dependencies
const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const { Boom } = require('@hapi/boom');

// 📲 Baileys dependencies
const {
  default: makeWASocket,
  useSingleFileAuthState,
  DisconnectReason
} = require('@whiskeysockets/baileys');

// 🌍 Load Global Bot Config and Main Bot Logic
require('./settings');         // Load env-based global configs
require('./Dave-Md-V1.js');    // Load bot logic, DB, and handlers

// 🗂 Ensure session folder exists
const sessionPath = path.join(__dirname, 'session');
if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath);
const sessionFile = path.join(sessionPath, 'creds.json');

// 🔐 Load auth state
const { state, saveState } = useSingleFileAuthState(sessionFile);

// 🤖 Start WhatsApp Bot
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

// 🌐 Express App Setup
const app = express();
app.use(cors());
app.use(express.json());

// 📩 Pairing API Route
const pairHandler = require('./api/pair');
app.post('/api/pair', pairHandler.handler);

// 🖼 Serve frontend files
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Health check
app.get('/health', (_, res) => {
  res.send('🟢 Dave-Md-V1 Pairing Backend Running');
});

// 🚀 Launch server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌍 Server running on http://localhost:${PORT}`);
});
