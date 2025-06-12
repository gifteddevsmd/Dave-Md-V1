module.exports = {
  name: "antidelete",
  description: "Toggle anti-delete mode per chat",
  type: "anti",

  // Command to toggle antidelete
  async command(sock, msg, args, db) {
    const chatId = msg.key.remoteJid;

    if (!db.chats[chatId]) db.chats[chatId] = {};
    db.chats[chatId].antidelete = !db.chats[chatId].antidelete;

    await sock.sendMessage(chatId, {
      text: `🛡️ Antidelete is now *${db.chats[chatId].antidelete ? "enabled" : "disabled"}* in this chat.`,
    });
  },

  // When a message is deleted
  async onMessageDeleted(sock, msg, db) {
    const chatId = msg.key.remoteJid;
    const settings = db.chats[chatId];
    if (!settings?.antidelete) return;

    const from = msg.key.participant || chatId;
    const deletedMsg = msg.message;
    if (!deletedMsg) return;

    await sock.sendMessage(chatId, {
      text: `⚠️ *Antidelete Activated!*\n👤 Sender: @${from.split("@")[0]}\n🗑️ Message:`,
      mentions: [from],
    });

    await sock.sendMessage(chatId, deletedMsg, { quoted: msg });
  },
};
