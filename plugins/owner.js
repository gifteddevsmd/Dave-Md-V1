module.exports = {
  name: "owner",
  description: "Show bot owner contact",
  execute: async (sock, msg) => {
    const jid = msg.key.remoteJid;
    await sock.sendMessage(jid, {
      text: "👑 *Owner Contact:*\nwa.me/254104260236",
    });
  },
};
