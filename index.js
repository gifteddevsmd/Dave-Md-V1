require('./settings');
const fs = require('fs');
const pino = require('pino');
const { color } = require('./lib/color');
const path = require('path');
const axios = require('axios');
const chalk = require('chalk');
const readline = require('readline');
const { File } = require('megajs');
const FileType = require('file-type');
const { exec } = require('child_process');
const { Boom } = require('@hapi/boom');
const NodeCache = require('node-cache');
const PhoneNumber = require('awesome-phonenumber');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    Browsers,
    DisconnectReason,
    makeCacheableSignalKeyStore,
    proto,
    getAggregateVotesInPollMessage,
    jidNormalizedUser
} = require('@whiskeysockets/baileys');
const { makeInMemoryStore } = require('@rodrigogs/baileys-store');

let phoneNumber = "254104260236";
const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code");
const useMobile = process.argv.includes("--mobile");
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));
let owner = JSON.parse(fs.readFileSync('./src/owner.json'));

global.api = (name, path = '/', query = {}, apikeyqueryname) =>
    (name in global.APIs ? global.APIs[name] : name) +
    path +
    (query || apikeyqueryname
        ? '?' +
          new URLSearchParams(
              Object.entries({
                  ...query,
                  ...(apikeyqueryname
                      ? {
                            [apikeyqueryname]: global.APIKeys[
                                name in global.APIs ? global.APIs[name] : name
                            ]
                        }
                      : {})
              })
          )
        : '');

const DataBase = require('./src/database');
const database = new DataBase();

(async () => {
    const loadData = await database.read();
    if (loadData && Object.keys(loadData).length === 0) {
        global.db = {
            sticker: {},
            users: {},
            groups: {},
            database: {},
            settings: {},
            others: {},
            ...(loadData || {})
        };
        await database.write(global.db);
    } else {
        global.db = loadData;
    }

    setInterval(async () => {
        if (global.db) await database.write(global.db);
    }, 30000);
})();

const {
    GroupUpdate,
    GroupParticipantsUpdate,
    MessagesUpsert,
    Solving
} = require('./src/message');
const {
    imageToWebp,
    videoToWebp,
    writeExifImg,
    writeExifVid
} = require('./lib/exif');
const {
    isUrl,
    generateMessageTag,
    getBuffer,
    getSizeMedia,
    fetchJson,
    await,
    sleep
} = require('./lib/function');

const sessionDir = path.join(__dirname, 'session');
const credsPath = path.join(sessionDir, 'creds.json');

async function sessionLoader() {
    try {
        await fs.promises.mkdir(sessionDir, { recursive: true });

        if (!fs.existsSync(credsPath)) {
            if (!global.SESSION_ID) {
                return console.log(
                    color(`Session id and creds.json not found!!\n\nWait to enter your number`, 'red')
                );
            }

            const sessionData = global.SESSION_ID.split('gifteddave~')[1];
            const filer = File.fromURL(`https://mega.nz/file/${sessionData}`);

            await new Promise((resolve, reject) => {
                filer.download((err, data) => {
                    if (err) reject(err);
                    resolve(data);
                });
            }).then(async (data) => {
                await fs.promises.writeFile(credsPath, data);
                console.log(color(`Session downloaded successfully, proceeding to start...`, 'green'));
                await startDaveMd();
            });
        }
    } catch (error) {
        console.error('Error retrieving session:', error);
    }
}

console.log(
    chalk.cyan(`
██╗  ██╗██╗      ██████╗██╗ ██████╗ ███╗   ██╗
██╔╝ ██╔╝██║     ██╔════╝██║██╔═══██╗████╗  ██║
██║ ██║ ██║     ██║     ██║██║   ██║██╔██╗ ██║
██║ ██║ ██║     ██║     ██║██║   ██║██║╚██╗██║
╚██╗██╔╝╚════██║ ╚██████╗██║╚██████╔╝██║ ╚████║
 ╚═╝╚═╝      ╚═╝  ╚═════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝`)
);

console.log(
    chalk.white.bold(`${chalk.gray.bold("📃  Information :")}
✉️  Script : Dave-Md-V1
✉️  Author : Gifted Dave
✉️  Gmail : comradeanasafa@gmail.com
✉️  Instagram : https://www.instagram.com/_gifted_dave

${chalk.green.bold("Ｐｏｗｅｒｅｄ Ｂｙ ＤＡＶＥ ＭＤ ＢＯＴＺ")}\n`)
);

async function startDaveMd() {
    let version = [2, 3000, 1015901307];
    const { state, saveCreds } = await useMultiFileAuthState(`./session`);
    const msgRetryCounterCache = new NodeCache();

    const DaveMd = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: !pairingCode,
        browser: Browsers.windows('Firefox'),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }))
        },
        version,
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        getMessage: async (key) => {
            let jid = jidNormalizedUser(key.remoteJid);
            let msg = await store.loadMessage(jid, key.id);
            return msg?.message || '';
        },
        msgRetryCounterCache,
        defaultQueryTimeoutMs: undefined
    });

    store.bind(DaveMd.ev);

    if (pairingCode && !DaveMd.authState.creds.registered) {
        if (useMobile) throw new Error('Cannot use pairing code with mobile API');
        let phone = await question('Please enter your number starting with country code like 254:\n');
        phone = phone.trim();

        setTimeout(async () => {
            const code = await DaveMd.requestPairingCode(phone);
            console.log(chalk.green(`Pairing code sent to WhatsApp: ${code}`));
        }, 3000);
    }
}

// Boot decision: load session or start directly
if (fs.existsSync(credsPath)) {
    startDaveMd();
} else {
    sessionLoader();
}