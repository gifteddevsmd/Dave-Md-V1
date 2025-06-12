const { default: makeWASocket, useSingleFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@adiwajshing/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const path = require('path');

const PREFIX = '!';
const SESSION_FILE_PATH = './session/session.json';

// Auth state (creates session folder and file automatically)
const { state, saveState } = useSingleFileAuthState(SESSION_FILE_PATH);

async function startBot() {
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`Using WA version v${version.join('.')}, isLatest: ${isLatest}`);

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
  });

  // Save auth state on updates
  sock.ev.on('creds.update', saveState);

  // Load all plugins from plugins folder
  const plugins = {};
  const pluginFiles = fs.readdirSync('./plugins').filter(file => file.endsWith('.js'));
  for (const file of pluginFiles) {
    const plugin = require(path.join(__dirname, 'plugins', file));
    plugins[plugin.name] = plugin;
  }
  console.log(`Loaded plugins: ${Object.keys(plugins).join(', ')}`);

  // Listen to incoming messages
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return; // Ignore system & own messages

    const jid = msg.key.remoteJid;
    const messageText = msg.message.conversation || msg.message.extendedTextMessage?.text;
    if (!messageText) return;

    // Check prefix
    if (!messageText.startsWith(PREFIX)) return;

    // Parse command and args
    const args = messageText.slice(PREFIX.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();

    // Run matching plugin command
    const plugin = plugins[commandName];
    if (plugin) {
      try {
        await plugin.execute(sock, msg, args);
      } catch (err) {
        console.error(`Error executing plugin ${commandName}:`, err);
      }
    }
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const status = new Boom(lastDisconnect?.error)?.output?.statusCode;
      if (status === DisconnectReason.loggedOut) {
        console.log('Logged out, please delete session and re-scan QR.');
      } else {
        console.log('Disconnected, reconnecting...');
        startBot();
      }
    } else if (connection === 'open') {
      console.log('Connected to WhatsApp!');
    }
  });
}

startBot();
