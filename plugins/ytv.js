const ytdl = require("ytdl-core");
const fs = require("fs");

module.exports = {
  name: "ytv",
  description: "Download video from YouTube",
  execute: async (sock, msg, args) => {
    const jid = msg.key.remoteJid;
    const url = args[0];

    if (!url || !ytdl.validateURL(url)) {
      return sock.sendMessage(jid, {
        text: "❌ Please provide a valid YouTube URL.\n\nExample: `.ytv <url>`",
      });
    }

    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, "");
    const filePath = `./${title}.mp4`;

    const videoStream = ytdl(url, { quality: "18" }); // mp4 360p
    const writeStream = fs.createWriteStream(filePath);

    videoStream.pipe(writeStream);

    writeStream.on("finish", async () => {
      await sock.sendMessage(jid, {
        video: { url: filePath },
        caption: `🎬 *${title}*`,
      });
      fs.unlinkSync(filePath);
    });

    writeStream.on("error", (err) => {
      console.error("Download error:", err);
      sock.sendMessage(jid, { text: "❌ Failed to download video." });
    });
  },
};
