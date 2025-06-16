// api/pair.js

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import randomstring from 'randomstring';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { number } = req.body;

    if (!number || !/^\d+$/.test(number)) {
      return res.status(400).json({ error: 'Invalid or missing phone number' });
    }

    const code = randomstring.generate({ length: 6, charset: 'numeric' });
    const sessionId = `gifteddave~${number}~${code}`;
    const sessionData = { number, code, sessionId, created: Date.now() };

    const sessionDir = join(process.cwd(), 'sessions');
    if (!existsSync(sessionDir)) mkdirSync(sessionDir);

    writeFileSync(join(sessionDir, `${sessionId}.json`), JSON.stringify(sessionData, null, 2));
    return res.status(200).json({ code, sessionId });
  }

  res.status(405).json({ error: 'Method Not Allowed' });
}
