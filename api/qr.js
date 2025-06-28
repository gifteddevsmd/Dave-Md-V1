const PastebinAPI = require('pastebin-js'),
pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');
const { makeid } = require('./id');
const QRCode = require('qrcode');
const express = require('express');
const path = require('path');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const {
    default: DaveMd,
    useMultiFileAuthState,
    Browsers,
    delay,
} = require("@whiskeysockets/baileys");

function removeFile(filePath) {
    if (!fs.existsSync(filePath)) return false;
    fs.rmSync(filePath, { recursive: true, force: true });
};

router.get('/', async (req, res) => {
    const id = makeid();

    async function START_QR() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            let socket = DaveMd({
                auth: state,
                printQRInTerminal: false,
                logger: pino({ level: "silent" }),
                browser: Browsers.macOS("Desktop"),
            });

            socket.ev.on('creds.update', saveCreds);

            socket.ev.on("connection.update", async (update) => {
                const { connection, lastDisconnect, qr } = update;

                if (qr) {
                    return res.end(await QRCode.toBuffer(qr));
                }

                if (connection === "open") {
                    await delay(5000);
                    let data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                    await delay(800);
                    let b64data = Buffer.from(data).toString('base64');

                    let session = await socket.sendMessage(socket.user.id, {
                        text: 'gifteddave~' + b64data
                    });

                    let DAVE_MD_TEXT = `
╔════════════════════◇
║『 SESSION CONNECTED』
║ ✨Dave-Md-V1 🔷
║ ✨Gifted Dave 🔷
╚════════════════════╝

---

╔════════════════════◇
║『 YOU'VE CHOSEN Dave-Md-V1 』
║ - Set the session ID in Heroku or Railway:
║ - SESSION_ID: 
╚════════════════════╝

╔════════════════════◇
║ 『••• _VISIT FOR HELP •••』
║❍ YouTube: https://www.youtube.com/@davlidavlo19
║❍ Telegram: https://t.me/Digladoo
║❍ Owner: https://wa.me/254104260236
║❍ Repo: https://github.com/gifteddaves/Dave-Md-V1
║❍ WhatsApp Group: https://chat.whatsapp.com/CaPeB0sVRTrL3aG6asYeAC
║❍ WhatsApp Channel: https://whatsapp.com/channel/0029VbApvFQ2Jl84lhONkc3k
║❍ Instagram: https://www.instagram.com/_gifted_dave/profilecard/?igsh=MWFjZHdmcm4zMGkzNw==
╚═════════════════════╝

𒂀 Enjoy Dave-Md-V1!

---

Don't forget to star ⭐ the repo!
______________________________`;

                    await socket.sendMessage(socket.user.id, { text: DAVE_MD_TEXT }, { quoted: session });
                    await delay(100);
                    await socket.ws.close();
                    return removeFile("temp/" + id);
                } else if (
                    connection === "close" &&
                    lastDisconnect &&
                    lastDisconnect.error &&
                    lastDisconnect.error.output.statusCode !== 401
                ) {
                    await delay(10000);
                    START_QR();
                }
            });
        } catch (err) {
            if (!res.headersSent) {
                res.json({ code: "Service is Currently Unavailable" });
            }
            console.error(err);
            removeFile("temp/" + id);
        }
    }

    await START_QR();
});

module.exports = router;
