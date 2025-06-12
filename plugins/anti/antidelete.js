module.exports = {
  name: "antidelete",
  description: "Prevent deleted messages from disappearing",
  type: "anti",
  onMessageDeleted: async (sock, msg) => {
    const message = msg.message;
    if (message) {
      const sender = msg.key.participant || msg.key.remoteJid;
      const chat = msg.key.remoteJid;
      await sock.sendMessage(chat, {
        text: `⚠️ Message deleted by @${sender.split("@")[0]}:\n\n${JSON.stringify(message)}`,
        mentions: [sender],
      });
    }
  },
};
