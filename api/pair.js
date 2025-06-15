import { writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import randomstring from 'randomstring';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  const { number } = req.body;
  if (!number) return res.status(400).json({ error: 'Phone number is required' });

  const cleanNumber = number.replace(/\D/g, '');
  const code = randomstring.generate({ length: 6, charset: 'alphanumeric' }).toUpperCase();

  const sessionsDir = path.join(process.cwd(), 'sessions');
  if (!existsSync(sessionsDir)) mkdirSync(sessionsDir);

  const sessionData = {
    number: cleanNumber,
    code: code,
    timestamp: Date.now(),
  };

  const filename = `${code}.json`;
  const filepath = path.join(sessionsDir, filename);
  writeFileSync(filepath, JSON.stringify(sessionData, null, 2));

  return res.status(200).json({ success: true, code });
}
