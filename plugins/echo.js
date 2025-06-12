module.exports = {
  name: "echo",
  description: "Echo back the message you send",
  execute: async (sock, msg, args) => {
    const jid = msg.key.remoteJid;
    const text = args.join(' ');
    if (!text) {
      await sock.sendMessage(jid, { text: "You didn't provide any text to echo!" });
    } else {
      await sock.sendMessage(jid, { text });
    }
  },
};
