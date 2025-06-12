module.exports = {
  name: "ping",
  description: "Check if the bot is alive",
  execute: async (sock, msg) => {
    const jid = msg.key.remoteJid;
    await sock.sendMessage(jid, { text: "Pong! 🏓" });
  },
};
