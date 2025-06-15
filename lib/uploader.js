//══════════════════════════════════════════════════════════════════════════════════════════════════════// //                                                                                                      // //                                    𝗗𝗔𝗩𝗘-𝗠𝗗-𝗩𝟭  𝐁𝐎𝐓                                                   // //                                                                                                      // //                                  📁 Upload & Media Utilities Plugin                                   // //                                                                                                      // //══════════════════════════════════════════════════════════════════════════════════════════════════════//

const axios = require('axios'); const fs = require('fs'); const FormData = require('form-data'); const { fromBuffer } = require('file-type'); const cheerio = require('cheerio');

module.exports = { commands: ['telegra.ph', 'uguu', 'webp2mp4', 'image2link'], description: 'Upload files to various platforms (Telegraph, Uguu, Flonime) or convert webp to mp4', usage: '.telegra.ph <media> | .uguu <media> | .webp2mp4 <webp> | .image2link <image>', type: 'tools',

callback: async ({ conn, m, command, quoted }) => { try { const mime = (quoted.mtype || '').includes('image') || (quoted.mtype || '').includes('video'); if (!mime) return m.reply('Please reply to an image/video/file message.');

const media = await quoted.download();
  const ext = (await fromBuffer(media))?.ext || 'bin';
  const path = `./temp_upload_${Date.now()}.${ext}`;
  fs.writeFileSync(path, media);

  switch (command) {
    case 'telegra.ph': {
      const form = new FormData();
      form.append('file', fs.createReadStream(path));
      const res = await axios.post('https://telegra.ph/upload', form, { headers: form.getHeaders() });
      fs.unlinkSync(path);
      return m.reply('Uploaded: https://telegra.ph' + res.data[0].src);
    }

    case 'uguu': {
      const form = new FormData();
      form.append('files[]', fs.createReadStream(path));
      const res = await axios.post('https://uguu.se/upload.php', form, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          ...form.getHeaders()
        }
      });
      fs.unlinkSync(path);
      return m.reply('Uploaded: ' + res.data.files[0]);
    }

    case 'webp2mp4': {
      const form = new FormData();
      form.append('new-image', fs.createReadStream(path));
      const { data: page1 } = await axios.post('https://s6.ezgif.com/webp-to-mp4', form, {
        headers: form.getHeaders()
      });

      const $ = cheerio.load(page1);
      const file = $('input[name="file"]').attr('value');
      const conv = new FormData();
      conv.append('file', file);
      conv.append('convert', 'Convert WebP to MP4!');
      const { data: page2 } = await axios.post('https://ezgif.com/webp-to-mp4/' + file, conv, {
        headers: conv.getHeaders()
      });

      const $$ = cheerio.load(page2);
      const result = 'https:' + $$('div#output > p.outfile > video > source').attr('src');
      fs.unlinkSync(path);
      return m.reply('Converted to MP4: ' + result);
    }

    case 'image2link': {
      const buffer = fs.readFileSync(path);
      const ext = (await fromBuffer(buffer))?.ext || 'jpg';
      const form = new FormData();
      form.append('file', buffer, 'upload.' + ext);

      const res = await axios.post('https://flonime.my.id/upload', form, {
        headers: form.getHeaders()
      });

      fs.unlinkSync(path);
      return m.reply('Uploaded Image: ' + res.data.result || JSON.stringify(res.data));
    }

    default:
      fs.unlinkSync(path);
      return m.reply('Invalid command.');
  }
} catch (err) {
  console.error(err);
  return m.reply('An error occurred: ' + err.message);
}

} };

	      
