const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const path = require('path');

// ✅ Session Directory
const sessionPath = path.join(__dirname, 'session');
if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath);

// ✅ Auth State File
const sessionFile = path.join(sessionPath, 'creds.json');
const { state, saveState } = useSingleFileAuthState(sessionFile);

// ✅ Bot Starter Function
async function startBot() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true, // Fallback for terminal login
  });

  sock.ev.on('creds.update', saveState);

  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      console.log(`❌ Disconnected. Reason: ${reason}`);
      if (reason !== DisconnectReason.loggedOut) startBot();
    } else if (connection === 'open') {
      console.log('✅ Dave-Md-V1 is connected to WhatsApp 🚀');
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
