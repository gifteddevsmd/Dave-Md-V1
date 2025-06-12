const {
  default: makeWASocket,
  useSingleFileAuthState,
  DisconnectReason,
} = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const db = require('./db'); // Make sure you have db.js

// === Session Setup ===
const sessionFolder = path.join(__dirname, 'session');
if (!fs.existsSync(sessionFolder)) fs.mkdirSync(sessionFolder);
const { state, saveState } = useSingleFileAuthState(path.join(sessionFolder, 'auth.json'));

// === Bot Config ===
const OWNER_NUMBER = process.env.OWNER_NUMBER || '254104260236@s.whatsapp.net'; // Replace with your real owner JID
const PREFIX = process.env.PREFIX || '.';

// === Load Plugins ===
const plugins = [];
const pluginsPath = path.join(__dirname, 'plugins');

fs.readdirSync(pluginsPath).forEach(file => {
  if (file.endsWith('.js')) {
    const plugin = require(path.join(pluginsPath, file));
    plugins.push(plugin);
  }
});

// === Start Bot ===
async function startBot() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true, // Only shows QR on first run
  });

  sock.ev.on('creds.update', saveState);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code !== DisconnectReason.loggedOut) {
        console.log('⚠️ Reconnecting...');
        startBot();
      } else {
        console.log('🚫 Logged out from WhatsApp');
      }
    } else if (connection === 'open') {
      console.log('✅ Connected to WhatsApp!');
    }
  });

  async function handleMessage(msg) {
    try {
      const message = msg.message;
      if (!message) return;

      let text = '';
      if (message.conversation) text = message.conversation;
      else if (message.extendedTextMessage?.text) text = message.extendedTextMessage.text;
      else if (message.imageMessage?.caption) text = message.imageMessage.caption;
      else return;

      if (!text.startsWith(PREFIX)) return;

      const args = text.slice(PREFIX.length).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();
      const chatId = msg.key.remoteJid;
      const sender = msg.key.participant || msg.key.remoteJid;
      const isOwner = sender && sender.includes(OWNER_NUMBER);

      const plugin = plugins.find(p => p.name === commandName);
      if (!plugin) return;

      // Owner only?
      if (plugin.ownerOnly && !isOwner) {
        await sock.sendMessage(chatId, { text: '❌ You are not allowed to use this command.' });
        return;
      }

      // Check feature toggle
      if (plugin.toggleable) {
        await db.read();
        const isEnabled = db.data.toggles?.[chatId]?.[plugin.name];
        if (!isEnabled) {
          await sock.sendMessage(chatId, { text: `🚫 *${plugin.name}* is OFF in this chat.` });
          return;
        }
      }

      // Run plugin
      await plugin.execute(sock, msg, args);
    } catch (error) {
      console.error('❌ Error handling message:', error);
    }
  }

  sock.ev.on('messages.upsert', async (m) => {
    if (!m.messages) return;
    const msg = m.messages[0];
    if (!msg.key.fromMe) {
      await handleMessage(msg);
    }
  });
}

startBot().catch(console.error);
