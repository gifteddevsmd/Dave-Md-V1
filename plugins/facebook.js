const axios = require("axios");

module.exports = {
  name: "facebook",
  description: "Download Facebook video",
  execute: async (sock, msg, args) => {
    const jid = msg.key.remoteJid;
    const url = args[0];

    if (!url || !url.includes("facebook.com")) {
      return sock.sendMessage(jid, {
        text: "❌ Please provide a valid Facebook video URL.\n\nExample: `.facebook <url>`",
      });
    }

    try {
      const api = `https://api.akuari.my.id/downloader/fb2?link=${encodeURIComponent(url)}`;
      const { data } = await axios.get(api);

      if (data?.respon?.hd) {
        await sock.sendMessage(jid, {
          video: { url: data.respon.hd },
          caption: `🎬 Facebook video downloaded successfully!`,
        });
      } else {
        throw new Error("No HD video found.");
      }
    } catch (error) {
      console.error("Facebook error:", error.message);
      await sock.sendMessage(jid, {
        text: "❌ Failed to download Facebook video.",
      });
    }
  },
};
