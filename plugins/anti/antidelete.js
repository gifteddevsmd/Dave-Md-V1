const fs = require("fs");

// Your WhatsApp number in JID format (replace with your own)
const OWNER_JID = "254104260236@s.whatsapp.net";

module.exports = {
  name: "antidelete",
  description: "Toggle anti-delete mode and forward deleted messages to owner",
  type: "anti",

  async command(sock, msg, args, db) {
    const chatId = msg.key.remoteJid;
    const isEnabled = db.chats[chatId]?.antidelete;

    if (!db.chats[chatId]) db.chats[chatId] = {};
    db.chats[chatId].antidelete = !isEnabled;

    await sock.sendMessage(chatId, {
      text: `✅ Antidelete is now *${!isEnabled ? "enabled" : "disabled"}* in this chat.`,
    });
  },

  async onMessageDeleted(sock, msg, db) {
    const chatId = msg.key.remoteJid;
    const settings = db.chats[chatId];
    if (!settings?.antidelete) return;

    const deletedMsg = msg.message || {};
    const msgContent = deletedMsg?.extendedTextMessage?.text || "[Deleted Message Content]";

    await sock.sendMessage(OWNER_JID, {
      text: `🛡️ *Antidelete Triggered*\n📍 Group: ${chatId}\n💬 Deleted: ${msgContent}`,
    });
  },
};
