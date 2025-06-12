const ytdl = require('ytdl-core');
const fs = require('fs');

module.exports = {
  name: "yt",
  description: "Download YouTube video as audio",
  execute: async (sock, msg, args) => {
    const jid = msg.key.remoteJid;
    const url = args[0];

    if (!url || !ytdl.validateURL(url)) {
      return sock.sendMessage(jid, { text: "❌ Provide a valid YouTube URL." });
    }

    const info = await ytdl.getInfo(url);
    const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
    const fileName = `yt_${Date.now()}.mp3`;

    const writeStream = fs.createWriteStream(fileName);
    ytdl(url, { filter: 'audioonly' }).pipe(writeStream);

    writeStream.on('finish', async () => {
      await sock.sendMessage(jid, {
        document: fs.readFileSync(fileName),
        fileName,
        mimetype: 'audio/mpeg'
      });
      fs.unlinkSync(fileName);
    });
  }
};
