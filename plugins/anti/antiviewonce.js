module.exports = {
  name: "antiviewonce",
  description: "Toggle anti-viewonce feature per chat",
  type: "anti",

  // Toggle command
  async command(sock, msg, args, db) {
    const chatId = msg.key.remoteJid;

    if (!db.chats[chatId]) db.chats[chatId] = {};
    db.chats[chatId].antiviewonce = !db.chats[chatId].antiviewonce;

    await sock.sendMessage(chatId, {
      text: `👁️‍🗨️ Antiviewonce is now *${db.chats[chatId].antiviewonce ? "enabled" : "disabled"}* in this chat.`,
    });
  },

  // Intercept view-once media
  async onMessage(sock, msg, db) {
    const chatId = msg.key.remoteJid;
    const settings = db.chats[chatId];
    const from = msg.key.participant || chatId;

    if (!settings?.antiviewonce) return;

    const m = msg.message?.viewOnceMessage?.message;
    if (!m) return;

    await sock.sendMessage(chatId, {
      text: `🔓 *View Once Unlocked!*\n👤 From: @${from.split("@")[0]}`,
      mentions: [from],
    });

    await sock.sendMessage(chatId, m, { quoted: msg });
  },

  // Manual unlock using .vv command
  async manual(sock, msg, args) {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted?.viewOnceMessage) return;

    const media = quoted.viewOnceMessage.message;

    await sock.sendMessage(msg.key.remoteJid, {
      text: "🔍 Opening view-once message...",
    });
    await sock.sendMessage(msg.key.remoteJid, media);
  },
};
