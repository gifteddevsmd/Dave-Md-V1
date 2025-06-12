module.exports = {
  name: "help",
  description: "List all available commands",
  execute: async (sock, msg) => {
    const jid = msg.key.remoteJid;
    const helpMessage = `
*Available Commands:*
- ping: Check if the bot is alive.
- help: Display this help message.
    
More commands coming soon! 🚀
    `;
    await sock.sendMessage(jid, { text: helpMessage });
  },
};
