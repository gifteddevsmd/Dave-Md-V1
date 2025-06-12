module.exports = {
  name: "info",
  description: "Show bot info and stats",
  execute: async (sock, msg) => {
    const jid = msg.key.remoteJid;
    const infoMsg = `
*🤖 Gifted-Dave-MD Bot*  
- Version: 1.0  
- Features: 300+ commands  
- Owner: Gifted-Dave  
- GitHub: https://github.com/gifteddaves/gifteddavemd
    `;
    await sock.sendMessage(jid, { text: infoMsg });
  },
};
