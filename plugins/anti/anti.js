const settings = {}; // chatId: { antidelete, antiviewonce, anticall, antiban }
const commandUsage = {}; // chatId: [timestamps]

const COMMAND_LIMIT = 10; // max commands
const TIME_WINDOW = 60 * 1000; // 1 minute cooldown

module.exports = {
  name: "anti",
  description: "Anti features: delete, viewonce, call, and antiban with toggles",

  execute: async (sock, msg) => {
    const chatId = msg.key.remoteJid;
    const from = msg.key.fromMe ? msg.key.participant || chatId : chatId;
    const content = msg.message;

    // Initialize settings for chat if not exist
    if (!settings[chatId]) {
      settings[chatId] = {
        antidelete: false,
        antiviewonce: false,
        anticall: false,
        antiban: false,
      };
      commandUsage[chatId] = [];
    }

    // Commands to toggle features on/off
    if (msg.message?.conversation) {
      const text = msg.message.conversation.toLowerCase();

      if (text.startsWith(".antidelete ")) {
        const val = text.split(" ")[1];
        settings[chatId].antidelete = val === "on";
        await sock.sendMessage(chatId, { text: `Antidelete is now ${val === "on" ? "enabled ✅" : "disabled ❌"}` });
        return;
      }

      if (text.startsWith(".antiviewonce ")) {
        const val = text.split(" ")[1];
        settings[chatId].antiviewonce = val === "on";
        await sock.sendMessage(chatId, { text: `Antiviewonce is now ${val === "on" ? "enabled ✅" : "disabled ❌"}` });
        return;
      }

      if (text.startsWith(".anticall ")) {
        const val = text.split(" ")[1];
        settings[chatId].anticall = val === "on";
        await sock.sendMessage(chatId, { text: `Anticall is now ${val === "on" ? "enabled ✅" : "disabled ❌"}` });
        return;
      }

      if (text.startsWith(".antiban ")) {
        const val = text.split(" ")[1];
        settings[chatId].antiban = val === "on";
        await sock.sendMessage(chatId, { text: `Antiban is now ${val === "on" ? "enabled ✅" : "disabled ❌"}` });
        return;
      }
    }

    // If antiban enabled, check command rate limiting
    if (settings[chatId].antiban) {
      const now = Date.now();
      commandUsage[chatId] = commandUsage[chatId].filter(t => now - t < TIME_WINDOW);
      if (commandUsage[chatId].length >= COMMAND_LIMIT) {
        await sock.sendMessage(chatId, {
          text: "⚠️ Too many commands used! Please wait a moment to avoid ban risks.",
        });
        return; // skip command processing
      } else {
        commandUsage[chatId].push(now);
      }
    }

    // Handle deleted messages (antidelete)
    if (settings[chatId].antidelete && msg.message?.protocolMessage?.type === 0) {
      const deletedMessage = msg.message.protocolMessage;
      if (deletedMessage.key && deletedMessage.key.remoteJid === chatId) {
        await sock.sendMessage(chatId, { text: `⚠️ A message was deleted! But I caught it!` });
      }
      return;
    }

    // Handle antiviewonce (auto open view once media)
    if (settings[chatId].antiviewonce) {
      const viewOnceMsg = msg.message?.[Object.keys(msg.message)[0]];
      if (viewOnceMsg?.viewOnce) {
        await sock.sendMessage(chatId, { text: "👀 Seen your view once!" });
        return;
      }
    }
  },

  // For calls (anticall), listen to call events (outside msg events)
  onCall: async (sock, caller) => {
    const chatId = caller.id;
    if (settings[chatId]?.anticall) {
      await sock.sendMessage(chatId, {
        text: "📵 Owner cannot receive calls right now. Please try later 😊",
      });
    }
  },
};
