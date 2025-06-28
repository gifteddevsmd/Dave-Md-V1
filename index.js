require('./settings');
const fs = require('fs');
const pino = require('pino');
const { color } = require('./lib/color');
const path = require('path');
const chalk = require('chalk');
const readline = require('readline');
const { Boom } = require('@hapi/boom');
const NodeCache = require('node-cache');
const { default: makeWASocket, useMultiFileAuthState, Browsers, DisconnectReason, makeCacheableSignalKeyStore, jidNormalizedUser } = require('@whiskeysockets/baileys');
const { makeInMemoryStore } = require('@rodrigogs/baileys-store');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });

const pairingCode = process.argv.includes("--pairing-code");
const useMobile = process.argv.includes("--mobile");

let owner = JSON.parse(fs.readFileSync('./src/owner.json'));

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
  }, 30_000);
})();

const { GroupUpdate, GroupParticipantsUpdate, MessagesUpsert, Solving } = require('./src/message');

const sessionDir = path.join(__dirname, 'session');
const credsPath = path.join(sessionDir, 'creds.json');

async function sessionLoader() {
  try {
    await fs.promises.mkdir(sessionDir, { recursive: true });

    if (!fs.existsSync(credsPath)) {
      if (!global.SESSION_ID) {
        return console.log(color(`❌ SESSION_ID and creds.json not found!\nPlease enter your number to pair.`, 'red'));
      }

      const raw = global.SESSION_ID.split('Dave~')[1];
      const buffer = Buffer.from(raw, 'base64');

      await fs.promises.writeFile(credsPath, buffer);
      console.log(color(`✅ Session restored from SESSION_ID!`, 'green'));
    }
  } catch (err) {
    console.error('❌ Failed to load session:', err);
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

async function startDaveMdBot() {
  const { state, saveCreds } = await useMultiFileAuthState(`./session`);
  const msgRetryCounterCache = new NodeCache();

  const conn = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: !pairingCode,
    browser: Browsers.macOS('Safari'),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' })),
    },
    markOnlineOnConnect: true,
    msgRetryCounterCache,
    generateHighQualityLinkPreview: true,
    getMessage: async (key) => {
      let jid = jidNormalizedUser(key.remoteJid);
      let msg = await store.loadMessage(jid, key.id);
      return msg?.message || '';
    },
  });

  store.bind(conn.ev);

  if (pairingCode && !conn.authState.creds.registered) {
    if (useMobile) throw new Error('❌ Mobile mode is not supported with pairing code.');
    let phone = await question('📲 Enter your number (e.g., 2547...): ');
    phone = phone.trim();
    const code = await conn.requestPairingCode(phone);
    console.log(chalk.greenBright(`🎁 Pairing Code: ${code}`));
  }

  await Solving(conn, store);

  conn.ev.on('creds.update', saveCreds);
  conn.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;

    if (connection === 'close') {
      switch (reason) {
        case DisconnectReason.badSession:
        case DisconnectReason.loggedOut:
          console.log('❌ Invalid session. Please delete and re-link.');
          process.exit();
        case DisconnectReason.connectionReplaced:
          console.log('⚠️ Connection Replaced.');
          conn.logout();
          break;
        default:
          console.log('🔁 Reconnecting...');
          await startDaveMdBot();
      }
    }

    if (connection === 'open') {
      console.log(color(`✅ Connected as: ${conn.user.name || conn.user.id}`, 'cyan'));
    }
  });

  conn.ev.on('contacts.update', (update) => {
    for (let contact of update) {
      let id = conn.decodeJid(contact.id);
      if (store && store.contacts) store.contacts[id] = { id, name: contact.notify };
    }
  });

  conn.ev.on('groups.update', async (update) => await GroupUpdate(conn, update, store));
  conn.ev.on('group-participants.update', async (update) => await GroupParticipantsUpdate(conn, update));
  conn.ev.on('messages.upsert', async (message) => await MessagesUpsert(conn, message, store));

  return conn;
}

async function initStart() {
  await sessionLoader();
  await startDaveMdBot();
}

initStart();

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`🔁 ${__filename} updated.`));
  delete require.cache[file];
  require(file);
});
