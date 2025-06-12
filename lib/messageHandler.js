const fs = require("fs");
const path = require("path");

const pluginsPath = path.join(__dirname, "..", "plugins");

const plugins = fs
  .readdirSync(pluginsPath)
  .filter((file) => file.endsWith(".js"))
  .map((file) => require(path.join(pluginsPath, file)));

async function handleMessage(sock, msg) {
  try {
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
    if (!text || !text.startsWith("!")) return;

    const args = text.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const plugin = plugins.find((p) => p.name === commandName);
    if (plugin) {
      await plugin.execute(sock, msg, args);
    }
  } catch (err) {
    console.error("Error handling message:", err);
  }
}

module.exports = handleMessage;
