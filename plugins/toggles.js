const { proto } = require('@whiskeysockets/baileys');
const db = require('../db');

// ====== CONFIG =======
const OWNER_JID = '123456789@s.whatsapp.net'; // <-- Replace with your full WhatsApp JID
const PREFIX = '.';

const validFeatures = [
  'autoview',
  'antidelete',
  'anticall',
  'antiviewonce',
  'antiban',
  'faketyping',
  'fakerecording',
  'alwaysonline',
  'autoreactstatus',
  'autoreactmessages',
  'autosavestatus',
  'autoviewstatus',
  'antideletestatus',
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

const viewOnceCache = new Map();

module.exports = {
  name: 'featureToggle',
  description: 'Toggle bot features on/off per chat (owner only)',

  execute: async (sock, msg) => {
    try {
      const sender = msg.key.participant || msg.key.remoteJid;
      const from = msg.key.remoteJid;

      const textRaw =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        '';

      if (!textRaw || !textRaw.startsWith(PREFIX)) return;

      const commandBody = textRaw.slice(PREFIX.length).trim();
      const [command, ...args] = commandBody.split(/\s+/);

      if (command !== 'toggle') return;

      // Only allow OWNER_JID to run this command
      const isOwner = sender === OWNER_JID || from === OWNER_JID;
      if (!isOwner) {
        return await sock.sendMessage(from, {
          text: '❌ You are not authorized to use this command.',
        });
      }

      if (args.length < 1) {
        return await sock.sendMessage(from, {
          text: `Please specify a feature to toggle.\nExample: ${PREFIX}toggle antidelete`,
        });
      }

      const feature = args[0].toLowerCase();
      if (!validFeatures.includes(feature)) {
        return await sock.sendMessage(from, {
          text: `❌ Invalid feature.\nValid options: ${validFeatures.join(', ')}`,
        });
      }

      const chatId = from;
      const current = await getToggle(chatId, feature);
      await setToggle(chatId, feature, !current);

      await sock.sendMessage(chatId, {
        text: `✅ Feature *${feature}* is now *${!current ? 'ON' : 'OFF'}* in this chat.`,
      });
    } catch (e) {
      console.error('Toggle error:', e);
    }
  },

  onMessageUpsert: async (sock, m) => {
    const msg = m.messages[0];
    if (!msg || msg.key.fromMe) return;

    const chatId = msg.key.remoteJid;
    await db.read();
    const toggles = db.data.toggles[chatId] || {};

    // Logic for all features continues here as already provided...

    // (To avoid duplication, the full onMessageUpsert logic with toggles can be reused here exactly as in the previous full version I sent)

    // Example: autoreactmessages
    if (toggles.autoreactmessages) {
      await sock.sendMessage(chatId, {
        react: { text: '❤️', key: msg.key },
      });
    }

    // Continue other toggles: autoreactstatus, autosavestatus, autoviewstatus, etc...
  },
};
