// plugins/presence/presence.js
module.exports = {
  name: "presence",
  description: "Toggle presence features: fake recording, fake typing, always online",
  execute: async (sock, msg, commands, presenceStatus) => {
    // presenceStatus is an object with keys: fakeRecording, fakeTyping, alwaysOnline (true/false)
    const jid = msg.key.remoteJid;
    const fromMe = msg.key.fromMe;
    const command = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";

    // Helper to send status message
    const sendStatus = async (text) => {
      await sock.sendMessage(jid, { text });
    };

    switch (command.toLowerCase()) {
      case "fake recording on":
        presenceStatus.fakeRecording = true;
        sendStatus("⚡ Fake recording is now ON");
        break;
      case "fake recording off":
        presenceStatus.fakeRecording = false;
        sendStatus("⚡ Fake recording is now OFF");
        break;
      case "fake typing on":
        presenceStatus.fakeTyping = true;
        sendStatus("⚡ Fake typing is now ON");
        break;
      case "fake typing off":
        presenceStatus.fakeTyping = false;
        sendStatus("⚡ Fake typing is now OFF");
        break;
      case "always online on":
        presenceStatus.alwaysOnline = true;
        sendStatus("⚡ Always online is now ON");
        break;
      case "always online off":
        presenceStatus.alwaysOnline = false;
        sendStatus("⚡ Always online is now OFF");
        break;
      default:
        sendStatus(
          "⚡ Presence features commands:\n" +
          "fake recording on/off\n" +
          "fake typing on/off\n" +
          "always online on/off"
        );
        break;
    }

    // Implement presence updates based on presenceStatus flags elsewhere in your bot's main logic
  },
};
