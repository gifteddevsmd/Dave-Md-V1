const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const { delay } = require('@whiskeysockets/baileys/lib/Utils');
const P = require('pino');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Pair Code Page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.post('/pair', async (req, res) => {
  const number = req.body.number?.trim();

  if (!number || !number.startsWith('+')) {
    return res.send('Invalid number. Use international format (e.g. +254712345678)');
  }

  const sessionId = Date.now().toString();
  const sessionPath = path.join(__dirname, 'sessions', sessionId);
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    printQRInTerminal: false,
    auth: state,
    logger: P({ level: 'silent' }),
    browser: ['GiftedDaveMD', 'Chrome', '1.0'],
  });

  const code = await sock.requestPairingCode(number);
  console.log('Pairing code:', code);

  res.send(`
    <h2>🔐 Pairing Code for ${number}</h2>
    <p><strong style="font-size: 24px; color: green;">${code}</strong></p>
    <p>Open WhatsApp on your phone > Link a device > Enter this code.</p>
    <p>Session will be sent to your WhatsApp automatically.</p>
  `);

  sock.ev.on('connection.update', async ({ connection }) => {
    if (connection === 'open') {
      await delay(3000);

      const jid = sock.user.id;
      const sessionFilePath = sessionPath + '.zip';

      // Zip the session folder
      const archiver = require('archiver');
      const output = fs.createWriteStream(sessionFilePath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.directory(sessionPath, false);
      archive.pipe(output);
      await archive.finalize();

      await sock.sendMessage(jid, {
        document: { url: sessionFilePath },
        mimetype: 'application/zip',
        fileName: 'gifted-session.zip'
      }, { quoted: null });

      console.log(`✅ Session sent to ${jid}`);
    }
  });

  sock.ev.on('creds.update', saveCreds);
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
