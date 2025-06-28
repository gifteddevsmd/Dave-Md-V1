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
const { default: makeWASocket, useMultiFileAuthState, Browsers, DisconnectReason, makeCacheableSignalKeyStore, proto, getAggregateVotesInPollMessage, jidNormalizedUser } = require('@whiskeysockets/baileys');
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
            ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] }
            : {}),
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
      ...(loadData || {}),
    };
    await database.write(global.db);
  } else {
    global.db = loadData;
  }

  setInterval(async () => {
    if (global.db) await database.write(global.db);
  }, 30000);
})();

const { GroupUpdate, GroupParticipantsUpdate, MessagesUpsert, Solving } = require('./src/message');
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif');
const { isUrl, generateMessageTag, getBuffer, getSizeMedia, fetchJson, await, sleep } = require('./lib/function');

const sessionDir = path.join(__dirname, 'session');
const credsPath = path.join(sessionDir, 'creds.json');

async function sessionLoader() {
  try {
    await fs.promises.mkdir(sessionDir, { recursive: true });

    if (!fs.existsSync(credsPath)) {
      if (!global.SESSION_ID) {
        return console.log(color(`Session ID and creds.json not found!\n\nPlease wait to enter your number.`, 'red'));
      }

      const sessionData = global.SESSION_ID.split("Dave~")[1];
      const filer = File.fromURL(`https://mega.nz/file/${sessionData}`);

      const data = await new Promise((resolve, reject) => {
        filer.download((err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });

      await fs.promises.writeFile(credsPath, data);
      console.log(color(`✅ Session downloaded successfully. Starting bot...`, 'green'));
      await startXliconBot();
    }
  } catch (error) {
    console.error('❌ Error retrieving session:', error);
  }
}

console.log(
  chalk.cyan(`
██████╗  █████╗ ██╗   ██╗███████╗    ███╗   ███╗██████╗ 
██╔══██╗██╔══██╗██║   ██║██╔════╝    ████╗ ████║██╔══██╗
██████╔╝███████║██║   ██║█████╗      ██╔████╔██║██████╔╝
██╔═══╝ ██╔══██║╚██╗ ██╔╝██╔══╝      ██║╚██╔╝██║██╔═══╝ 
██║     ██║  ██║ ╚████╔╝ ███████╗    ██║ ╚═╝ ██║██║     
╚═╝     ╚═╝  ╚═╝  ╚═══╝  ╚══════╝    ╚═╝     ╚═╝╚═╝     
  `)
);

console.log(chalk.white.bold(`${chalk.gray.bold("📃  Information :")}         
✉️  Script : Dave-Md-V1
✉️  Author : Gifted Dave
✉️  WhatsApp : https://wa.me/254104260236
✉️  GitHub : https://github.com/gifteddaves

${chalk.green.bold("Ｐｏｗｅｒｅｄ Ｂｙ ＤＡＶＥ-ＭＤ-Ｖ１ ＢＯＴ")}\n`));

async function startXliconBot() {
  let version = [2, 3000, 1015901307];

  const { state, saveCreds } = await useMultiFileAuthState(`./session`);
  const msgRetryCounterCache = new NodeCache();

  const XliconBotInc = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: !pairingCode,
    browser: Browsers.windows('Firefox'),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
    },
    version,
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
    getMessage: async (key) => {
      let jid = jidNormalizedUser(key.remoteJid);
      let msg = await store.loadMessage(jid, key.id);
      return msg?.message || "";
    },
    msgRetryCounterCache,
    defaultQueryTimeoutMs: undefined,
  });

  store.bind(XliconBotInc.ev);

  if (pairingCode && !XliconBotInc.authState.creds.registered) {
    if (useMobile) throw new Error('Cannot use pairing code with mobile API');

    let phoneNumber;
    phoneNumber = await question('Enter your number starting with country code (e.g., 254):\n');
    phoneNumber = phoneNumber.trim();

    setTimeout(async () => {
      const code = await XliconBotInc.requestPairingCode(phoneNumber);
      console.log(chalk.black(chalk.bgGreen(`🎁 Pairing Code : ${code}`)));
    }, 3000);
  }

  store.bind(XliconBotInc.ev);
  await Solving(XliconBotInc, store);

  XliconBotInc.ev.on('creds.update', saveCreds);
  XliconBotInc.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    const reason = new Boom(lastDisconnect?.error)?.output.statusCode;

    if (connection === 'close') {
      switch (reason) {
        case DisconnectReason.connectionLost:
        case DisconnectReason.connectionClosed:
        case DisconnectReason.restartRequired:
        case DisconnectReason.timedOut:
          console.log('Reconnecting...');
          return startXliconBot();
        case DisconnectReason.badSession:
        case DisconnectReason.loggedOut:
          console.log('Session error. Please delete session and re-link.');
          process.exit(1);
        case DisconnectReason.connectionReplaced:
          console.log('Another session replaced this one. Logging out...');
          XliconBotInc.logout();
          break;
        default:
          console.log('Unknown disconnect reason:', reason);
      }
    }

    if (connection === 'open') {
      console.log('✅ Connected as: ' + JSON.stringify(XliconBotInc.user, null, 2));
    }
  });

  XliconBotInc.ev.on('contacts.update', (update) => {
    for (let contact of update) {
      let id = XliconBotInc.decodeJid(contact.id);
      if (store && store.contacts) store.contacts[id] = { id, name: contact.notify };
    }
  });

  XliconBotInc.ev.on('call', async (call) => {
    let botNumber = await XliconBotInc.decodeJid(XliconBotInc.user.id);
    let anticall = global.db.settings[botNumber]?.anticall;
    if (anticall) {
      for (let id of call) {
        if (id.status === 'offer') {
          let msg = await XliconBotInc.sendMessage(id.from, {
            text: `🚫 Calls are not allowed!\nPlease contact the owner @${id.from.split('@')[0]}.`,
            mentions: [id.from],
          });
          await XliconBotInc.sendContact(id.from, global.owner, msg);
          await XliconBotInc.rejectCall(id.id, id.from);
        }
      }
    }
  });

  XliconBotInc.ev.on('groups.update', async (update) => {
    await GroupUpdate(XliconBotInc, update, store);
  });

  XliconBotInc.ev.on('group-participants.update', async (update) => {
    await GroupParticipantsUpdate(XliconBotInc, update);
  });

  XliconBotInc.ev.on('messages.upsert', async (message) => {
    await MessagesUpsert(XliconBotInc, message, store);
  });

  return XliconBotInc;
}

async function initStart() {
  if (fs.existsSync(credsPath)) {
    console.log(color("✅ Creds.json found. Starting bot...", 'yellow'));
    await startXliconBot();
  } else {
    const sessionCheck = await sessionLoader();
    if (sessionCheck) {
      console.log("✅ Session downloaded. Starting bot...");
      await startXliconBot();
    } else {
      if (!global.SESSION_ID) {
        console.log(color("❌ SESSION_ID missing! Please provide one or wait to enter your number.", 'red'));
        await startXliconBot();
      }
    }
  }
}
initStart();

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`🔁 Update detected in ${__filename}`));
  delete require.cache[file];
  require(file);
});
