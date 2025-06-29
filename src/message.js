//══════════════════════════════════════════════════════════════════════════════════════//
//                             💠 DAVE-MD-V1 - MESSAGE HANDLER 💠                         //
//══════════════════════════════════════════════════════════════════════════════════════//

require('../settings')
const chalk = require('chalk')
const { getContentType } = require('@whiskeysockets/baileys')

// Group metadata updates
async function GroupUpdate(conn, update) {
  console.log(chalk.yellow('[GROUP UPDATE]:'), update)
}

// Group participant changes
async function GroupParticipantsUpdate(conn, update) {
  console.log(chalk.blue('[PARTICIPANT UPDATE]:'), update)
}

// Message Upsert Handler
async function MessagesUpsert(conn, m, store) {
  try {
    if (!m.type || m.type !== 'notify') return
    for (const msg of m.messages) {
      if (!msg.message || msg.key.remoteJid === 'status@broadcast') continue

      const contentType = getContentType(msg.message)
      const message = msg.message[contentType]
      const from = msg.key.remoteJid
      const isGroup = from.endsWith('@g.us')
      const sender = isGroup ? msg.key.participant : from

      const prefix = '.'
      const body =
        contentType === 'conversation'
          ? message
          : contentType === 'extendedTextMessage'
          ? message.text
          : ''
      const command = body.startsWith(prefix)
        ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase()
        : ''
      const args = body.trim().split(/ +/).slice(1)

      console.log(chalk.green('[MESSAGE RECEIVED]:'), from, contentType)

      // COMMAND HANDLERS
      switch (command) {
        case 'ping':
          const start = Date.now()
          const end = Date.now()
          await conn.sendMessage(
            from,
            { text: `🏓 Pong • ${end - start}ms\n💠 DAVE-MD-V1` },
            { quoted: msg }
          )
          break

        case 'ownermenu':
          await conn.sendMessage(from, { text: global.ownermenu(prefix) }, { quoted: msg })
          break

        case 'groupmenu':
          await conn.sendMessage(from, { text: global.groupmenu(prefix) }, { quoted: msg })
          break

        case 'downloadmenu':
          await conn.sendMessage(from, { text: global.downloadmenu(prefix) }, { quoted: msg })
          break

        case 'animemenu':
          await conn.sendMessage(from, { text: global.animemenu(prefix) }, { quoted: msg })
          break

        case 'othermenu':
          await conn.sendMessage(from, { text: global.othermenu(prefix) }, { quoted: msg })
          break

        default:
          // Unhandled
          break
      }
    }
  } catch (err) {
    console.error(chalk.red('[ERROR IN MESSAGE HANDLER]'), err)
  }
}

// Startup handler
async function Solving(conn, store) {
  console.log(chalk.green('[DAVE-MD] Bot is up and ready.'))
}

module.exports = {
  GroupUpdate,
  GroupParticipantsUpdate,
  MessagesUpsert,
  Solving
}

//══════════════════════════════════════════════════════════════════════════════════════//
//                              💠 DAVE-MD-V1 - GLOBAL MENUS 💠                            //
//══════════════════════════════════════════════════════════════════════════════════════//

global.ownermenu = (prefix) => `
╭─❖『 💠 DAVE-MD-V1 💠 』❖─╮
│ *Forwarded Many Times*
│ _“Your Ultimate WhatsApp Assistant”_
╰──────────────────────────╯

╭──❖ OWNER MENU ❖
│ ⿻ ${prefix}setppbot
│ ⿻ ${prefix}setprefix
│ ⿻ ${prefix}shutdown
│ ⿻ ${prefix}bc
│ ⿻ ${prefix}join
╰─────────────────╯`

global.groupmenu = (prefix) => `
╭──❖ GROUP MENU ❖
│ ⿻ ${prefix}add
│ ⿻ ${prefix}kick
│ ⿻ ${prefix}promote
│ ⿻ ${prefix}demote
│ ⿻ ${prefix}setname
│ ⿻ ${prefix}setdesc
╰─────────────────╯`

global.downloadmenu = (prefix) => `
╭──❖ DOWNLOAD MENU ❖
│ ⿻ ${prefix}ytmp3
│ ⿻ ${prefix}ytmp4
│ ⿻ ${prefix}tiktok
│ ⿻ ${prefix}instagram
╰─────────────────╯`

global.animemenu = (prefix) => `
╭──❖ ANIME MENU ❖
│ ⿻ ${prefix}anime
│ ⿻ ${prefix}manga
│ ⿻ ${prefix}neko
│ ⿻ ${prefix}waifu
╰─────────────────╯`

global.othermenu = (prefix) => `
╭──❖ OTHER MENU ❖
│ ⿻ ${prefix}ping
│ ⿻ ${prefix}owner
│ ⿻ ${prefix}report
│ ⿻ ${prefix}runtime
╰─────────────────╯

🔗 *Powered by: DAVE-MD-V1*
📞 Owner: wa.me/254104260236
🌐 GitHub: github.com/gifteddaves`
