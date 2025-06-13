const express = require('express');
const { default: makeWASocket, useSingleFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, makeInMemoryStore, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// In-memory session tracking
const sessions = {};

app.post('/pair', async (req, res) => {
  const { phone_number } = req.body;

  if (!phone_number) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  const sessionId = phone_number.replace(/\D/g, ''); // Clean number to use as ID
  const sessionFolder = path.join(__dirname, 'sessions', sessionId);
  fs.mkdirSync(sessionFolder, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: ['Gifted-Dave-MD', 'Safari', '1.0'],
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, pairingCode } = update;

    if (pairingCode) {
      console.log(`Generated code for ${phone_number}: ${pairingCode}`);
      sessions[sessionId] = { code: pairingCode, sent: false };
      return res.json({
        message: 'Pair code generated',
        pair_code: pairingCode,
        wa_link: `https://wa.me/pair/${pairingCode}`,
      });
    }

    if (connection === 'open' && !sessions[sessionId].sent) {
      const jid = sock.user.id;
      await sock.sendMessage(jid, {
        text: `✅ Your session ID is ready.\n\n🆔 Session: ${sessionId}\n\nThanks for using Gifted-Dave-MD!`,
      });
      sessions[sessionId].sent = true;
      console.log(`Session for ${phone_number} is now active.`);
    }
  });

  sock.ev.on('creds.update', saveCreds);
});

app.get('/', (req, res) => {
  res.send('✅ Gifted-Dave-MD Pair Code Backend Running');
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
