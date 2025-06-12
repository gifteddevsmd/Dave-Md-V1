module.exports = {
  name: "anticall",
  description: "Toggle anticall feature per chat",
  type: "anti",

  async command(sock, msg, args, db) {
    const chatId = msg.key.remoteJid;

    if (!db.chats[chatId]) db.chats[chatId] = {};
    db.chats[chatId].anticall = !db.chats[chatId].anticall;

    await sock.sendMessage(chatId, {
      text: `📵 Anticall is now *${db.chats[chatId].anticall ? "enabled" : "disabled"}* in this chat.`,
    });
  },

  async onCall(sock, callEvent, db) {
    const callerId = callEvent.from;
    const chatSettings = db.chats[callerId];

    if (chatSettings?.anticall) {
      await sock.sendMessage(callerId, {
        text: `🚫 Sorry! The bot owner can't take calls. Kindly send a message instead 😊`,
      });
    }
  },
};
