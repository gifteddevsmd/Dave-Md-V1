module.exports = {
  name: "fakerecording",
  description: "Simulate recording presence",
  type: "presence",
  enabled: true,
  execute: async (sock, msg) => {
    const jid = msg.key.remoteJid;
    await sock.sendPresenceUpdate('recording', jid);
  }
};
