// plugins/toggle.js
import fs from 'fs'

const toggleableFeatures = [
  'anticall', 'antidelete', 'antiviewonce', 'antiban', 'antilink', 'antifake', 'antibot', 'antitoxic',
  'askgpt', 'imagine', 'chatbot', 'summarize',
  'autoreactmessages', 'autoreactstatus', 'autoviewstatus', 'autosavestatus', 'autobio', 'autolike', 'autosavecontacts', 'autoread',
  'faketyping', 'fakerecording', 'alwaysonline',
  'ytmp3', 'ytmp4', 'tiktok', 'ig', 'fb', 'twitter', 'mediafire', 'song',
  'welcome', 'goodbye', 'tagall', 'groupinfo', 'promote', 'demote', 'modtools', 'detect',
  'translate', 'shortlink', 'calc', 'weather', 'qrcode', 'toimage', 'tovideo', 'tomp3', 'tovn',
  'truth', 'dare', 'tictactoe', 'guessnumber', 'joke', 'meme', 'fact', 'quote', 'ship', 'dice', 'coin',
  'profile', 'rank', 'register', 'unregister', 'mycmds', 'uptime', 'ping',
  'broadcast', 'eval', 'exec', 'ban', 'unban', 'block', 'unblock', 'shutdown', 'restart', 'update', 'backup', 'restore'
]

let handler = async (m, { conn, args, isAdmin, isOwner, isGroup }) => {
  const chatId = m.chat
  if (!db.data.toggles) db.data.toggles = {}
  if (!db.data.toggles[chatId]) db.data.toggles[chatId] = {}

  if (!args[0]) {
    const current = db.data.toggles[chatId]
    let msg = '🧠 *Toggleable Features in This Chat:*\n\n'
    for (let feature of toggleableFeatures) {
      const status = current[feature] ? '✅ ON' : '❌ OFF'
      msg += `• *${feature}*: ${status}\n`
    }
    return m.reply(msg)
  }

  let feature = args[0].toLowerCase()
  let action = args[1]?.toLowerCase()

  if (!toggleableFeatures.includes(feature)) {
    return m.reply(`❌ *Invalid feature!*\n\nAvailable:\n${toggleableFeatures.join(', ')}`)
  }

  if (isGroup && !isAdmin && !isOwner)
    return m.reply('❌ Only *group admins* or *bot owner* can toggle features.')

  if (!['on', 'off', undefined].includes(action)) {
    return m.reply('❌ Use:\n.toggle <feature> on\n.toggle <feature> off')
  }

  if (action === 'on') {
    db.data.toggles[chatId][feature] = true
    return m.reply(`✅ *${feature}* turned ON.`)
  } else if (action === 'off') {
    db.data.toggles[chatId][feature] = false
    return m.reply(`❌ *${feature}* turned OFF.`)
  } else {
    db.data.toggles[chatId][feature] = !db.data.toggles[chatId][feature]
    let status = db.data.toggles[chatId][feature] ? 'ON' : 'OFF'
    return m.reply(`🔁 *${feature}* toggled to ${status}.`)
  }
}

handler.command = /^\.?toggle$/i
handler.group = true
handler.private = true
handler.category = 'settings'
handler.description = 'Enable/disable per-chat features.'

export default handler

// ✅ Automatic logic before message
export async function before(m, { conn }) {
  const chatId = m.chat
  const toggles = db.data.toggles?.[chatId] || {}

  // 🛡️ Anti-delete
  if (m.messageStubType === 0x13 && toggles.antidelete) {
    try {
      let user = m.sender
      let originalMsg = m.msg
      if (!originalMsg) return
      let type = Object.keys(originalMsg.message || {})[0]
      await conn.sendMessage(chatId, {
        text: `🛡️ *Anti-Delete*\n@${user.split('@')[0]} deleted a ${type}:`,
        mentions: [user]
      })
      m.copyNForward(chatId, originalMsg, true)
    } catch (e) { console.error('Antidelete error:', e) }
  }

  // 🛡️ Anticall
  if (m.isGroup === false && m.msg?.key?.id?.includes('call') && toggles.anticall) {
    await conn.sendMessage(m.chat, { text: '🚫 *Calls are not allowed!* Blocking you now...' })
    await conn.updateBlockStatus(m.chat, 'block')
  }

  // 🎭 Fake typing
  if (toggles.faketyping) {
    await conn.sendPresenceUpdate('composing', chatId)
  }

  // 🎭 Fake recording
  if (toggles.fakerecording) {
    await conn.sendPresenceUpdate('recording', chatId)
  }

  // 🎭 Always online
  if (toggles.alwaysonline) {
    await conn.sendPresenceUpdate('available', chatId)
  }

  // 🔄 Autoreact to messages
  if (toggles.autoreactmessages && m.text) {
    await conn.sendMessage(chatId, { react: { text: '👍', key: m.key } })
  }

  // 🔄 Autoreact to status (on receiving broadcast status)
  if (toggles.autoreactstatus && m.chat === 'status@broadcast') {
    await conn.sendMessage(m.chat, { react: { text: '🔥', key: m.key } })
  }

  // 🔄 Autosave status (forward statuses to chat)
  if (toggles.autosavestatus && m.chat === 'status@broadcast') {
    await conn.copyNForward(conn.user.id, m, true)
  }

  // 🔄 Autoview status
  if (toggles.autoviewstatus && m.chat === 'status@broadcast') {
    await conn.readMessages([m.key])
  }
  }
