const fs = require("fs");
const path = require("path");

module.exports = {
  name: "menu",
  description: "List all commands",
  execute: async (sock, msg) => {
    const jid = msg.key.remoteJid;
    const pluginPath = path.join(__dirname);
    const files = fs.readdirSync(pluginPath).filter(f => f.endsWith('.js'));

    let menu = "✨ *Available Commands:*\n\n";
    for (let file of files) {
      const plugin = require(path.join(pluginPath, file));
      menu += `• ${plugin.name} — ${plugin.description || "No description"}\n`;
    }

    await sock.sendMessage(jid, { text: menu });
  },
};
