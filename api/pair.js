const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL'); // Use your real dev key
const { makeid } = require('./id');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require('pino');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  delay,
  makeCacheableSignalKeyStore,
  Browsers
} = require('@whiskeysockets/baileys');

function removeFile(FilePath) {
  if (!fs.existsSync(FilePath)) return false;
  fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
  const id = makeid();
  let num = req.query.number;

  async function DAVE_MD_PAIR_CODE() {
    const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
    try {
      let sock = makeWASocket({
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }).child({ level: 'fatal' })),
        },
        printQRInTerminal: false,
        logger: pino({ level: 'fatal' }).child({ level: 'fatal' }),
        browser: Browsers.macOS('Chrome')
      });

      if (!sock.authState.creds.registered) {
        await delay(1500);
        num = num.replace(/[^0-9]/g, '');
        const code = await sock.requestPairingCode(num);
        if (!res.headersSent) {
          await res.send({ code });
        }
      }

      sock.ev.on('creds.update', saveCreds);

      sock.ev.on('connection.update', async (s) => {
        const { connection, lastDisconnect } = s;

        if (connection === 'open') {
          await delay(5000);
          let data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
          await delay(1000);
          let b64data = Buffer.from(data).toString('base64');

          const pasteUrl = await pastebin.createPaste({
            code: b64data,
            expireDate: '1D',
            format: 'text',
            name: `${sock.user.id} | DaveMdV1 Session`,
            publicity: 1
          });

          const sessionId = `gifteddave~${pasteUrl.split('/').pop()}`;
          const sessionMsg = await sock.sendMessage(sock.user.id, { text: sessionId });

          let DAVE_MD_TEXT = `
╔════ ❖  𝘿𝘼𝙑𝙀 𝙈𝘿 - 𝙎𝙀𝙎𝙎𝙄𝙊𝙉  ❖ ════╗
║ ✅ Session connected successfully
║ 🔐 *SESSION ID:* (Sent Above)
║ 🚫 Don't share this with anyone!
╚══════════════════════════╝

🔗 *Community & Support:*
📣 Channel: https://whatsapp.com/channel/0029VbApvFQ2Jl84lhONkc3k  
👥 Group: https://chat.whatsapp.com/CaPeB0sVRTrL3aG6asYeAC  
💻 Repo: https://github.com/gifteddaves/Dave-Md-V1  
📞 Owner: https://wa.me/254104260236

⭐️ Give a star on GitHub & share Dave-Md-V1 🙏`;

          await sock.sendMessage(sock.user.id, {
            text: DAVE_MD_TEXT,
            contextInfo: {
              externalAdReply: {
                title: "Dave-Md-V1 Session Linked",
                thumbnailUrl: "https://img1.pixhost.to/images/5863/601094475_skyzopedia.jpg",
                sourceUrl: "https://github.com/gifteddaves/Dave-Md-V1",
                mediaType: 1,
                renderLargerThumbnail: true
              }
            }
          }, { quoted: sessionMsg });

          await delay(200);
          await sock.ws.close();
          removeFile('./temp/' + id);
          console.log(`✅ ${sock.user.id} session connected & session ID sent`);
        } else if (connection === 'close' && lastDisconnect?.error?.output?.statusCode !== 401) {
          await delay(10000);
          DAVE_MD_PAIR_CODE();
        }
      });
    } catch (err) {
      console.log('🔄 Error or restart');
      removeFile('./temp/' + id);
      if (!res.headersSent) {
        await res.send({ code: 'Service Currently Unavailable' });
      }
    }
  }

  return await DAVE_MD_PAIR_CODE();
});

module.exports = router;
