const { makeid } = require('./gen-id');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    Browsers,
    makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');
const { upload } = require('./mega');

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
            var items = ["Safari"];
            function selectRandomItem(array) {
                var randomIndex = Math.floor(Math.random() * array.length);
                return array[randomIndex];
            }
            var randomItem = selectRandomItem(items);

            let sock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                generateHighQualityLinkPreview: true,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                syncFullHistory: false,
                browser: Browsers.macOS(randomItem)
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
            sock.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection == "open") {
                    await delay(5000);
                    let rf = __dirname + `/temp/${id}/creds.json`;
                    const mega_url = await upload(fs.createReadStream(rf), `${sock.user.id}.json`);
                    const sessionId = "gifteddave~" + mega_url.replace('https://mega.nz/file/', '');

                    let sessionCode = await sock.sendMessage(sock.user.id, { text: sessionId });

                    let welcomeMessage = `*Welcome to Dave-Md-V1 🤖*
                    
> Your WhatsApp bot session has been securely paired.

🔐 *Session ID: Hidden*  
💡 *Important:* Do **NOT** share this with anyone.

📢 *Join our community:*  
https://chat.whatsapp.com/CaPeB0sVRTrL3aG6asYeAC  
📺 *Channel:* https://whatsapp.com/channel/0029VbApvFQ2Jl84lhONkc3k  
🛠️ *Repo:* https://github.com/gifteddaves/Dave-Md-V1  
👑 *Owner:* https://wa.me/254104260236`;

                    await sock.sendMessage(sock.user.id, {
                        text: welcomeMessage,
                        contextInfo: {
                            externalAdReply: {
                                title: "Dave-Md-V1 by Gifted Dave",
                                thumbnailUrl: "https://img1.pixhost.to/images/5863/601094475_skyzopedia.jpg",
                                sourceUrl: "https://whatsapp.com/channel/0029VbApvFQ2Jl84lhONkc3k",
                                mediaType: 1,
                                renderLargerThumbnail: true
                            }
                        }
                    }, { quoted: sessionCode });

                    await delay(10);
                    await sock.ws.close();
                    removeFile('./temp/' + id);
                    console.log(`✅ Connected: ${sock.user.id} — Restarting...`);
                    await delay(10);
                    process.exit();
                } else if (connection === "close" && lastDisconnect?.error?.output?.statusCode != 401) {
                    await delay(10);
                    DAVE_MD_PAIR_CODE();
                }
            });

        } catch (err) {
            console.log("🔄 Restarting service...");
            removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: "❗ Service Unavailable" });
            }
        }
    }

    return await DAVE_MD_PAIR_CODE();
});

/*
// Optional Auto-Restart Every 30 Minutes
setInterval(() => {
    console.log("🌀 Auto-restarting service...");
    process.exit();
}, 1800000); // 30 minutes
*/

module.exports = router;
