module.exports = {
  name: "help",
  description: "List all commands and usage",
  execute: async (sock, msg, plugins) => {
    const jid = msg.key.remoteJid;
    let helpText = "✨ *Gifted-Dave-MD Commands List* ✨\n\n";
    plugins.forEach(plugin => {
      helpText += `• *${plugin.name}* - ${plugin.description}\n`;
    });
    await sock.sendMessage(jid, { text: helpText });
  },
};
