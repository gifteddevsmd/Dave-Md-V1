// server.js
import express from 'express'
import { Boom } from '@hapi/boom'
import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} from '@whiskeysockets/baileys'
import pino from 'pino'
import { join } from 'path'
import { readFileSync } from 'fs'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.post('/api/pair', async (req, res) => {
  const { number } = req.body

  if (!number || !number.startsWith('+')) {
    return res.status(400).json({ error: 'Invalid number. Include country code like +254...' })
  }

  const cleaned = number.replace(/\D/g, '')
  const sessionFolder = `sessions/${cleaned}`
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
      res.json({ pairCode: qr })
    }

    if (connection === 'open') {
      await saveCreds()
      const jid = sock.user.id
      const filePath = join(sessionFolder, 'creds.json')
      const fileBuffer = readFileSync(filePath)

      await sock.sendMessage(jid, {
        document: fileBuffer,
        fileName: 'session.json',
        mimetype: 'application/json',
        caption: '🎉 Here is your session file. Keep it safe!'
      })

      const admin = '254104260236
