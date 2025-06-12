const fs = require("fs");
const path = require("path");
const config = require("./config");

module.exports = (sock) => {
  // Load plugins
  const plugins = {};
  const pluginFiles = fs.readdirSync(path.join(__dirname, "plugins"));
  for (const file of pluginFiles) {
    if (file.endsWith(".js")) {
      const plugin = require(`./plugins/${file}`);
      plugins[plugin.name] = plugin;
    }
  }

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;
    if (msg.key.fromMe) return;

    let text = "";
    if (msg.message.conversation) text = msg.message.conversation;
    else if (msg.message.extendedTextMessage)
      text = msg.message.extendedTextMessage.text;
    else return;

    if (!text.startsWith(config.prefix)) return;

    const commandName = text.slice(config.prefix.length).split(" ")[0].toLowerCase();

    if (plugins[commandName]) {
      try {
        await plugins[commandName].execute(sock, msg);
      } catch (e) {
        console.error(e);
      }
    }
  });
};
