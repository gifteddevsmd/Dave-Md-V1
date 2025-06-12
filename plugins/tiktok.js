const axios = require("axios");

module.exports = {
  name: "tiktok",
  description: "Download TikTok video",
  execute: async (sock, msg, args) => {
    const jid = msg.key.remoteJid;
    const url = args[0];

    if (!url || !url.includes("tiktok.com")) {
      return sock.sendMessage(jid, {
        text: "❌ Please provide a valid TikTok URL.\n\nExample: `.tiktok <url>`",
      });
    }

    try {
      const api = `https://api.tiklydown.me/download?url=${encodeURIComponent(url)}`;
      const { data } = await axios.get(api);

      if (data?.video?.noWatermark) {
        await sock.sendMessage(jid, {
          video: { url: data.video.noWatermark },
          caption: `🎬 Downloaded from TikTok`,
        });
      } else {
        throw new Error("No video found.");
      }
    } catch (error) {
      console.error("TikTok error:", error);
      await sock.sendMessage(jid, {
        text: "❌ Failed to download TikTok video.",
      });
    }
  },
};
