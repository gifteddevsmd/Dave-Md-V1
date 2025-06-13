import { Boom } from '@hapi/boom'
import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, makeInMemoryStore } from '@whiskeysockets/baileys'
import pino from 'pino'
import { join } from 'path'
import { writeFileSync } from 'fs'
import { createRequire } from 'module'
import express from 'express'

const require = createRequire(import.meta.url)
const app = express()
app.use(express.json())

app.post('/gifted-session-backend/api/generate', async (req, res) => {
  const { number } = req.body
  if (!number || !number.startsWith('+')) {
    return res.status(400).json({ error: 'Invalid number. Include country code like +254...' })
  }

  const sessionFolder = `sessions/${number.replace(/\D/g, '')}`
  const { state, saveCreds } = await useMultiFileAuthState(sessionFolder)

  const { version } = await fetchLatestBaileysVersion()
  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    auth: state,
    browser: ['Gifted-Dave-MD', 'Safari', '1.0']
  })

  if (sock.authState.creds.registered) {
    return res.json({ message: 'Already paired!' })
  }

  sock.ev.on('connection.update', async (update) => {
    const { qr, connection, lastDisconnect } = update
    if (qr) {
      res.json({ pairCode: qr }) // show pair code
    }
    if (connection === 'open') {
      await saveCreds()

      // 🧠 Send session ID file to user via WhatsApp
      const jid = sock.user.id
      const filePath = join(sessionFolder, 'creds.json')
      const fileBuffer = require('fs').readFileSync(filePath)

      await sock.sendMessage(jid, {
        document: fileBuffer,
        fileName: 'session.json',
        mimetype: 'application/json',
        caption: '🎉 Here is your session file. Keep it safe!'
      })

      console.log('✅ Session file sent to user.')
      sock.end()
    }

    if (connection === 'close') {
      const shouldReconnect = new Boom(lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut
      console.log('connection closed, reconnecting:', shouldReconnect)
    }
  })
})
