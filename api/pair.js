// api/pair.js
import { makeWASocket, useSingleFileAuthState } from '@whiskeysockets/baileys';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import randomstring from 'randomstring';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sessionsPath = path.join(__dirname, 'sessions');
if (!fs.existsSync(sessionsPath)) fs.mkdirSync(sessionsPath);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const number = req.body?.number?.replace(/\D/g, '');
  if (!number) return res.status(400).json({ error: 'Phone number is required' });

  const code = randomstring.generate({ length: 6, charset: 'alphanumeric' }).toUpperCase();
  const filename = `${code}.json`;
  const filepath = path.join(sessionsPath, filename);

  const { state, saveState } = useSingleFileAuthState(filepath);
  const sock = makeWASocket({ auth: state });

  sock.ev.on('creds.update', saveState);

  return res.status(200).json({
    code,
    sessionFile: `/api/sessions/${filename}`
  });
}
