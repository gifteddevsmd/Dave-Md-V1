module.exports = {
  name: "time",
  description: "Get the current server time",
  execute: async (sock, msg) => {
    const jid = msg.key.remoteJid;
    const now = new Date();
    await sock.sendMessage(jid, {
      text: `🕒 Current Time:\n${now.toLocaleString()}`,
    });
  },
};
