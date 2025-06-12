module.exports = {
  name: "ping",
  description: "Ping the bot",
  execute: async (sock, msg) => {
    const jid = msg.key.remoteJid;
    await sock.sendMessage(jid, { text: "Pong! 🏓" });
  },
};
