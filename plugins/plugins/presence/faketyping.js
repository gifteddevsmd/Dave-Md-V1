module.exports = {
  name: "faketyping",
  description: "Simulate typing presence",
  type: "presence",
  enabled: true,
  execute: async (sock, msg) => {
    const jid = msg.key.remoteJid;
    await sock.sendPresenceUpdate('composing', jid);
  }
};
