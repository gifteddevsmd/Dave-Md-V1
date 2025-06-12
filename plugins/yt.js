const ytdl = require("ytdl-core");
const fs = require("fs");

module.exports = {
  name: "yt", // Command will be .yt
  description: "Download audio from YouTube",
  execute: async (sock, msg, args) => {
    const jid = msg.key.remoteJid;
    const url = args[0];

    if (!url || !ytdl.validateURL(url)) {
      return sock.sendMessage(jid, {
        text: "❌ Please provide a valid YouTube URL.\n\nExample: `.yt <url>`",
      });
    }

    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, ""); // Remove special chars
    const filePath = `./${title}.mp3`;

    const audioStream = ytdl(url, { filter: "audioonly" });
    const writeStream = fs.createWriteStream(filePath);

    audioStream.pipe(writeStream);

    writeStream.on("finish", async () => {
      await sock.sendMessage(jid, { audio: { url: filePath }, mimetype: "audio/mp4" });
      fs.unlinkSync(filePath); // Clean up after sending
    });

    writeStream.on("error", (err) => {
      console.error("Download error:", err);
      sock.sendMessage(jid, { text: "❌ Failed to download audio." });
    });
  },
};
