const { proto } = require('@whiskeysockets/baileys');
const db = require('../db');

// ====== CONFIG =======
const OWNER_JID = '123456789@s.whatsapp.net'; // <-- Put your WhatsApp number here, with full jid (e.g. 2547xxxxxx@s.whatsapp.net)
const PREFIX = '.'; // your command prefix (., !, /, etc)

const validFeatures = [
  'autoview',
  'antidelete',
  'anticall',
  'antiviewonce',
  'antiban',
  'faketyping',
  'fakerecording',
  'alwaysonline',
];

async function getToggle(chatId, feature) {
  await db.read();
  return db.data.toggles?.[chatId]?.[feature] || false;
}

async function setToggle(chatId, feature, value) {
  await db.read();
  if (!db.data.toggles[chatId]) db.data.toggles[chatId] = {};
  db.data.toggles[chatId][feature] = value;
  await db.write();
}

// In-memory cache for view-once media per chat
const viewOnceCache = new Map();

module.exports = {
  name: 'featureToggle',
  description: 'Toggle bot features on/off per chat (owner only)',

  execute: async (sock, msg) => {
    try {
      const sender = msg.key.participant || msg.key.remoteJid;
      if (sender !== OWNER_JID) {
        // Not owner
        return await sock.sendMessage(msg.key.remoteJid, { text: '❌ You are not authorized to use this command.' });
      }

      const textRaw = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim();
      if (!textRaw.startsWith(PREFIX)) return;

      const commandBody = textRaw.slice(PREFIX.length).trim();
      const [command, ...args] = commandBody.split(/\s+/);

      if (command !== 'toggle') return;

      if (args.length < 1) {
        return await sock.sendMessage(msg.key.remoteJid, { text: 'Please specify a feature to toggle.\nExample: .toggle antidelete' });
      }

      const feature = args[0].toLowerCase();
      if (!validFeatures.includes(feature)) {
        return await sock.sendMessage(msg.key.remoteJid, { text: `Invalid feature.\nValid features: ${validFeatures.join(', ')}` });
      }

      const chatId = msg.key.remoteJid;
      const current = await getToggle(chatId, feature);
      await setToggle(chatId, feature, !current);

      await sock.sendMessage(chatId, { text: `Feature *${feature}* is now *${!current ? 'ON' : 'OFF'}*.` });
    } catch (e) {
      console.error('Toggle command error:', e);
    }
  },

  onMessageUpsert: async (sock, m) => {
    const msg = m.messages[0];
    if (!msg || msg.key.fromMe) return;

    const chatId = msg.key.remoteJid;
    await db.read();
    const toggles = db.data.toggles[chatId] || {};

    // Antidelete
    if (toggles.antidelete) {
      sock.ev.on('messages.delete', async (deletedMessages) => {
        for (const dm of deletedMessages) {
          if (dm.key.remoteJid === chatId && !dm.key.fromMe) {
            let content = '[Deleted message]';
            if (dm.message?.conversation) content = dm.message.conversation;
            else if (dm.message?.imageMessage) content = '[Image]';
            else if (dm.message?.videoMessage) content = '[Video]';
            await sock.sendMessage(chatId, {
              text: `⚠️ Message deleted by ${dm.key.participant || dm.key.remoteJid}:\n${content}`,
            });
          }
        }
      });
    }

    // Anticall
    if (toggles.anticall) {
      sock.ev.on('call', async (callData) => {
        if (callData.isIncoming && callData.from === chatId) {
          await sock.sendMessage(chatId, {
            text: '📵 Owner cannot receive calls now, please try later! 😊',
          });
          await sock.rejectCall(callData.id, callData.from);
        }
      });
    }

    // Antiviewonce
    if (toggles.antiviewonce) {
      if (msg.message.viewOnceMessage) {
        const media = msg.message.viewOnceMessage.message;
        let buffer;
        if (media.imageMessage || media.videoMessage) {
          buffer = await sock.downloadMediaMessage(msg);
        }
        if (buffer) {
          viewOnceCache.set(chatId, buffer);
          await sock.sendMessage(chatId, { text: '👁️‍🗨️ ViewOnce media detected! Reply with `.vv` to view again.' });
        }
      }

      const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
      if (text.toLowerCase().startsWith('.vv')) {
        const cachedMedia = viewOnceCache.get(chatId);
        if (!cachedMedia) {
          await sock.sendMessage(chatId, { text: 'No cached view-once media found.' });
          return;
        }
        await sock.sendMessage(chatId, {
          video: cachedMedia,
          caption: 'Here is the view-once media you requested.',
          mimetype: 'video/mp4',
          viewOnce: false,
        });
        viewOnceCache.delete(chatId);
      }
    }

    // Presence toggles
    if (toggles.faketyping) {
      await sock.sendPresenceUpdate('composing', chatId);
    } else if (toggles.fakerecording) {
      await sock.sendPresenceUpdate('recording', chatId);
    } else if (toggles.alwaysonline) {
      await sock.sendPresenceUpdate('available', chatId);
    } else {
      await sock.sendPresenceUpdate('paused', chatId);
    }

    // Antiban placeholder
    if (toggles.antiban) {
      // Your antiban logic here
    }
  },
};
