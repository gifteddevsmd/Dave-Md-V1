require('./settings'); const fs = require('fs'); const pino = require('pino'); const { color } = require('./lib/color'); const path = require('path'); const chalk = require('chalk'); const readline = require('readline'); const { Boom } = require('@hapi/boom'); const NodeCache = require('node-cache'); const { default: makeWASocket, useMultiFileAuthState, Browsers, DisconnectReason, makeCacheableSignalKeyStore, jidNormalizedUser } = require('@whiskeysockets/baileys'); const { makeInMemoryStore } = require('@rodrigogs/baileys-store');

let phoneNumber = "254104260236"; const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code"); const useMobile = process.argv.includes("--mobile"); const rl = readline.createInterface({ input: process.stdin, output: process.stdout }); const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) }); const question = (text) => new Promise((resolve) => rl.question(text, resolve)); let owner = JSON.parse(fs.readFileSync('./src/owner.json'));

const DataBase = require('./src/database'); const database = new DataBase();

(async () => { const loadData = await database.read(); if (!loadData || Object.keys(loadData).length === 0) { global.db = { sticker: {}, users: {}, groups: {}, database: {}, settings: {}, others: {} }; await database.write(global.db); } else { global.db = loadData; } setInterval(async () => { if (global.db) await database.write(global.db); }, 30000); })();

const { GroupUpdate, GroupParticipantsUpdate, MessagesUpsert, Solving } = require('./src/message');

const sessionDir = path.join(__dirname, 'session'); const credsPath = path.join(sessionDir, 'creds.json');

async function sessionLoader() { try { await fs.promises.mkdir(sessionDir, { recursive: true });

if (!fs.existsSync(credsPath)) {
  if (!global.SESSION_ID) {
    return console.log(color(`❌ SESSION_ID not found in environment!`, 'red'));
  }

  const raw = global.SESSION_ID;
  if (!raw.startsWith("Dave~")) return console.log(color("❌ SESSION_ID format invalid. Must start with Dave~", 'red'));
  const base64 = raw.split("Dave~")[1];

  try {
    const credsJson = Buffer.from(base64, 'base64');
    await fs.promises.writeFile(credsPath, credsJson);
    console.log(color(`✅ Session ID decoded and saved successfully.`, 'green'));
  } catch (err) {
    console.log(color(`❌ Failed to decode SESSION_ID: ${err.message}`, 'red'));
  }
}

} catch (error) { console.error('❌ Error retrieving session:', error); } }

console.log( chalk.cyan(██████╗  █████╗ ██╗   ██╗███████╗    ███╗   ███╗██████╗  ██╔══██╗██╔══██╗██║   ██║██╔════╝    ████╗ ████║██╔══██╗ ██████╔╝███████║██║   ██║█████╗      ██╔████╔██║██████╔╝ ██╔═══╝ ██╔══██║╚██╗ ██╔╝██╔══╝      ██║╚██╔╝██║██╔═══╝  ██║     ██║  ██║ ╚████╔╝ ███████╗    ██║ ╚═╝ ██║██║      ╚═╝     ╚═╝  ╚═╝  ╚═══╝  ╚══════╝    ╚═╝     ╚═╝╚═╝     ) );

console.log(chalk.white.bold(`${chalk.gray.bold("📃  Information :")}
✉️  Script : Dave-Md-V1 ✉️  Author : Gifted Dave ✉️  WhatsApp : https://wa.me/254104260236 ✉️  GitHub : https://github.com/gifteddaves

${chalk.green.bold("Ｐｏｗｅｒｅｄ Ｂｙ ＤＡＶＥ-ＭＤ-Ｖ１ ＢＯＴ")}\n`));

async function startXliconBot() { const { state, saveCreds } = await useMultiFileAuthState(./session); const msgRetryCounterCache = new NodeCache();

const XliconBotInc = makeWASocket({ logger: pino({ level: 'silent' }), printQRInTerminal: !pairingCode, browser: Browsers.windows('Firefox'), auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })), }, markOnlineOnConnect: true, generateHighQualityLinkPreview: true, getMessage: async (key) => { let jid = jidNormalizedUser(key.remoteJid); let msg = await store.loadMessage(jid, key.id); return msg?.message || ""; }, msgRetryCounterCache, defaultQueryTimeoutMs: undefined, });

store.bind(XliconBotInc.ev);

if (pairingCode && !XliconBotInc.authState.creds.registered) { if (useMobile) throw new Error('Cannot use pairing code with mobile API');

let phoneNumber;
phoneNumber = await question('Enter your number starting with country code (e.g., 254):\n');
phoneNumber = phoneNumber.trim();

setTimeout(async () => {
  const code = await XliconBotInc.requestPairingCode(phoneNumber);
  console.log(chalk.black(chalk.bgGreen(`🎁 Pairing Code : ${code}`)));
}, 3000);

}

await Solving(XliconBotInc, store); XliconBotInc.ev.on('creds.update', saveCreds); XliconBotInc.ev.on('connection.update', async (update) => { const { connection, lastDisconnect } = update; const reason = new Boom(lastDisconnect?.error)?.output.statusCode;

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

XliconBotInc.ev.on('contacts.update', (update) => { for (let contact of update) { let id = XliconBotInc.decodeJid(contact.id); if (store && store.contacts) store.contacts[id] = { id, name: contact.notify }; } });

XliconBotInc.ev.on('call', async (call) => { let botNumber = await XliconBotInc.decodeJid(XliconBotInc.user.id); let anticall = global.db.settings[botNumber]?.anticall; if (anticall) { for (let id of call) { if (id.status === 'offer') { let msg = await XliconBotInc.sendMessage(id.from, { text: 🚫 Calls are not allowed!\nPlease contact the owner @${id.from.split('@')[0]}., mentions: [id.from], }); await XliconBotInc.sendContact(id.from, global.owner, msg); await XliconBotInc.rejectCall(id.id, id.from); } } } });

XliconBotInc.ev.on('groups.update', async (update) => { await GroupUpdate(XliconBotInc, update, store); });

XliconBotInc.ev.on('group-participants.update', async (update) => { await GroupParticipantsUpdate(XliconBotInc, update); });

XliconBotInc.ev.on('messages.upsert', async (message) => { await MessagesUpsert(XliconBotInc, message, store); });

return XliconBotInc; }

async function initStart() { if (fs.existsSync(credsPath)) { console.log(color("✅ Creds.json found. Starting bot...", 'yellow')); await startXliconBot(); } else { await sessionLoader(); await startXliconBot(); } }

initStart();

let file = require.resolve(__filename); fs.watchFile(file, () => { fs.unwatchFile(file); console.log(chalk.redBright(🔁 Update detected in ${__filename})); delete require.cache[file]; require(file); });

  
