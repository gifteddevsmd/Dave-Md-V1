const ytdl = require("ytdl-core");
const fs = require("fs");

module.exports = {
  name: "yta",
  description: "Download audio from YouTube",
  execute: async (sock, msg, args) => {
    const jid = msg.key.remoteJid;
    const url = args[0];

    if (!url || !ytdl.validateURL(url)) {
      return sock.sendMessage(jid, {
        text: "❌ Please provide a valid YouTube URL.\n\nExample: `.yta <url>`",
      });
    }

    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, "");
    const filePath = `./${title}.mp3`;

    const audioStream = ytdl(url, { filter: "audioonly" });
    const writeStream = fs.createWriteStream(filePath);

    audioStream.pipe(writeStream);

    writeStream.on("finish", async () => {
      await sock.sendMessage(jid, {
        audio: { url: filePath },
        mimetype: "audio/mp4",
        ptt: false,
      });
      fs.unlinkSync(filePath);
    });

    writeStream.on("error", (err) => {
      console.error("Audio download error:", err);
      sock.sendMessage(jid, { text: "❌ Failed to download audio." });
    });
  },
};
