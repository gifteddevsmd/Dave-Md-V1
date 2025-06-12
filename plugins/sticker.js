const { writeFileSync, unlinkSync } = require("fs");
const path = require("path");
const { exec } = require("child_process");

module.exports = {
  name: "sticker",
  description: "Convert image to sticker",
  execute: async (sock, msg, args) => {
    const jid = msg.key.remoteJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quoted || !quoted.imageMessage) {
      return sock.sendMessage(jid, {
        text: "🖼️ Please reply to an image to convert it to sticker.\n\nUsage: `.sticker`",
      });
    }

    try {
      const buffer = await sock.downloadMediaMessage({
        key: msg.message.extendedTextMessage.contextInfo.stanzaId
          ? {
              remoteJid: msg.key.remoteJid,
              id: msg.message.extendedTextMessage.contextInfo.stanzaId,
              fromMe: msg.message.extendedTextMessage.contextInfo.participant === sock.user.id,
              participant: msg.message.extendedTextMessage.contextInfo.participant,
            }
          : msg.key,
        message: quoted,
      });

      const filename = `sticker-${Date.now()}`;
      const inputPath = path.join(__dirname, "..", "temp", `${filename}.jpg`);
      const outputPath = path.join(__dirname, "..", "temp", `${filename}.webp`);

      writeFileSync(inputPath, buffer);

      exec(`ffmpeg -i ${inputPath} -vcodec libwebp -filter:v fps=fps=15 -lossless 1 -compression_level 6 -q:v 90 -loop 0 -preset default -an -vsync 0 ${outputPath}`, async (err) => {
        if (err) {
          console.error("Sticker error:", err);
          return sock.sendMessage(jid, {
            text: "❌ Failed to convert image to sticker.",
          });
        }

        await sock.sendMessage(jid, {
          sticker: { url: outputPath },
        });

        unlinkSync(inputPath);
        unlinkSync(outputPath);
      });
    } catch (e) {
      console.error(e);
      await sock.sendMessage(jid, {
        text: "❌ An error occurred while creating the sticker.",
      });
    }
  },
};
