module.exports = {
  name: 'ping',
  ownerOnly: false,
  toggleable: false,
  execute: async (sock, msg) => {
    await sock.sendMessage(msg.key.remoteJid, { text: '🏓 Pong!' });
  }
};
