// 📁 api/pair.js
import fs from 'fs'
import path from 'path'
import { randomBytes } from 'crypto'

const sessionsDir = path.resolve('./session-codes')
if (!fs.existsSync(sessionsDir)) fs.mkdirSync(sessionsDir)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { number } = req.body
  if (!number || !/^\d+$/.test(number)) {
    return res.status(400).json({ error: 'Valid number is required' })
  }

  const code = randomBytes(3).toString('hex')
  const sessionId = `gifteddave~${code}`
  const sessionPath = path.join(sessionsDir, `${number}.json`)

  fs.writeFileSync(sessionPath, JSON.stringify({ number, sessionId, created: Date.now() }, null, 2))

  return res.status(200).json({
    message: 'Session generated successfully',
    code,
    sessionId,
    instructions: `Use session ID ${sessionId} in your bot environment variables`
  })
}
