require('./settings')
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, Browsers, fetchLatestBaileysVersion, jidNormalizedUser, makeInMemoryStore } = require('@whiskeysockets/baileys')
const fs = require('fs')
const pino = require('pino')
const chalk = require('chalk')
const readline = require('readline')
const { Boom } = require('@hapi/boom')
const NodeCache = require("node-cache")
const { File } = require('megajs')
const { Low, JSONFile } = require('./lib/lowdb')
const _ = require('lodash')
const path = require('path')
const { color } = require('./lib/color')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif')
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetchJson, await, sleep } = require('./lib/function')
const { GroupUpdate, GroupParticipantsUpdate, MessagesUpsert, Solving } = require('./src/message')

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise(resolve => rl.question(text, resolve))

const phoneNumber = "254104260236"
const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code")
const useMobile = process.argv.includes("--mobile")
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })

global.db = new Low(new JSONFile('src/database.json'))
global.DATABASE = global.db

async function loadDatabase() {
  if (global.db.READ)
    return new Promise(resolve =>
      setInterval(() =>
        (!global.db.READ ? (clearInterval(this), resolve(global.db.data == null ? loadDatabase() : global.db.data)) : null), 1000))
  if (global.db.data !== null) return
  global.db.READ = true
  await global.db.read()
  global.db.READ = false
  global.db.data = {
    users: {},
    database: {},
    chats: {},
    game: {},
    settings: {},
    ...(global.db.data || {})
  }
  global.db.chain = _.chain(global.db.data)
}
loadDatabase()
setInterval(async () => {
  if (global.db.data) await global.db.write()
}, 30 * 1000)

const sessionDir = path.join(__dirname, 'session')
const credsPath = path.join(sessionDir, 'creds.json')
const owner = JSON.parse(fs.readFileSync('./src/owner.json'))

async function downloadSessionData() {
  try {
    await fs.promises.mkdir(sessionDir, { recursive: true })
    if (!fs.existsSync(credsPath)) {
      if (!global.SESSION_ID) return console.log(color(`Session ID not found. Wait to enter your number.`, 'red'))
      const sessdata = global.SESSION_ID.split("DaveMd-V1~")[1]
      const filer = File.fromURL(`https://mega.nz/file/${sessdata}`)
      const data = await new Promise((resolve, reject) => {
        filer.download((err, data) => err ? reject(err) : resolve(data))
      })
      await fs.promises.writeFile(credsPath, data)
      console.log(color(`Session saved. Booting...`, 'green'))
    }
  } catch (err) {
    console.error('Error downloading session:', err)
  }
}

async function startDaveMdBot() {
  let { version } = await fetchLatestBaileysVersion()
  const { state, saveCreds } = await useMultiFileAuthState('./session')
  const msgRetryCounterCache = new NodeCache()

  const DaveMdBot = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: !pairingCode,
    browser: Browsers.macOS('Safari'),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }))
    },
    version,
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
    getMessage: async key => {
      const jid = jidNormalizedUser(key.remoteJid)
      const msg = await store.loadMessage(jid, key.id)
      return msg?.message || ""
    },
    msgRetryCounterCache
  })

  store.bind(DaveMdBot.ev)

  if (pairingCode && !DaveMdBot.authState.creds.registered) {
    let phone = await question(color(`Enter your WhatsApp number starting with country code (e.g., 254): `, 'green'))
    phone = phone.replace(/[^0-9]/g, '')
    const code = await DaveMdBot.requestPairingCode(phone)
    console.log(chalk.black(chalk.bgGreen(`✅ Pairing Code : ${code}`)))
  }

  DaveMdBot.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update
    const reason = new Boom(lastDisconnect?.error)?.output.statusCode

    if (connection === 'close') {
      switch (reason) {
        case DisconnectReason.badSession:
        case DisconnectReason.connectionClosed:
        case DisconnectReason.connectionLost:
        case DisconnectReason.restartRequired:
        case DisconnectReason.timedOut:
          console.log('Reconnecting...')
          return startDaveMdBot()
        case DisconnectReason.loggedOut:
          console.log('Logged out. Please delete session and scan again.')
          process.exit(1)
        default:
          console.log('Unknown disconnect reason:', reason)
          process.exit(1)
      }
    }
    if (connection === 'open') {
      console.log(color(`✅ Connected as ${DaveMdBot.user.name || DaveMdBot.user.id}`, 'green'))
    }
  })

  DaveMdBot.ev.on('creds.update', saveCreds)
  DaveMdBot.ev.on('messages.upsert', async (msg) => await MessagesUpsert(DaveMdBot, msg, store))
  DaveMdBot.ev.on('group-participants.update', async (update) => await GroupParticipantsUpdate(DaveMdBot, update))
  DaveMdBot.ev.on('groups.update', async (update) => await GroupUpdate(DaveMdBot, update, store))

  return DaveMdBot
}

async function initStart() {
  if (!fs.existsSync(credsPath)) await downloadSessionData()
  await startDaveMdBot()
}
initStart()

let file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log(chalk.redBright(`Update ${__filename}`))
  delete require.cache[file]
  require(file)
})
