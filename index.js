const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

const { state, saveState } = useSingleFileAuthState('./session.json');

// Set your bot owner's WhatsApp number here (without @s.whatsapp.net)
const OWNER_NUMBER = process.env.OWNER_NUMBER || 'owner-number-here'; 
// Command prefix (like '!' or '.')
const PREFIX = process.env.PREFIX || '.';

// Load plugins dynamically from /plugins folder
const plugins = [];
const pluginsPath = path.join(__dirname, 'plugins');

fs.readdirSync(pluginsPath).forEach(file => {
  if (file.endsWith('.js')) {
    const plugin = require(path.join(pluginsPath, file));
    plugins.push(plugin);
  }
});

async function startBot() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on('creds.update', saveState);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode !== DisconnectReason.loggedOut) {
        console.log('Reconnecting...');
        startBot();
      } else {
        console.log('Logged out from WhatsApp');
      }
    } else if (connection === 'open') {
      console.log('Connected to WhatsApp');
    }
  });

  // Message handler function
  async function handleMessage(msg) {
    try {
      const message = msg.message;
      if (!message) return;

      // Get the text from different possible message types
      let text = '';
      if (message.conversation) text = message.conversation;
      else if (message.extendedTextMessage?.text) text = message.extendedTextMessage.text;
      else if (message.imageMessage?.caption) text = message.imageMessage.caption;
      else return; // Unsupported message type

      // Check if message starts with prefix
      if (!text.startsWith(PREFIX)) return;

      // Extract command and args
      const args = text.slice(PREFIX.length).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();

      // Find matching plugin
      const plugin = plugins.find(p => p.name === commandName);
      if (!plugin) return;

      // If plugin is owner-only, verify sender is owner
      const sender = msg.key.participant || msg.key.remoteJid;
      const isOwner = sender && sender.includes(OWNER_NUMBER);
      if (plugin.ownerOnly && !isOwner) {
        await sock.sendMessage(msg.key.remoteJid, { text: '❌ You are not authorized to use this command.' });
        return;
      }

      // Execute plugin
      await plugin.execute(sock, msg, args);
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  // Listen for new messages
  sock.ev.on('messages.upsert', async (m) => {
    if (!m.messages) return;
    const msg = m.messages[0];
    if (!msg.key.fromMe) { // Only respond to incoming messages
      await handleMessage(msg);
    }
  });
}

startBot().catch(console.error);
