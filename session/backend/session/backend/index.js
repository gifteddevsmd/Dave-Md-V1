const express = require('express');
const { makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const SESSION_DIR = './sessions';
if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR);

app.post('/pair', async (req, res) => {
  const number = req.body.number;
  if (!number) return res.status(400).json({ error: 'Missing number' });

  const sessionFile = path.join(SESSION_DIR, `${number}.json`);
  const { state, saveState } = useSingleFileAuthState(sessionFile);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    getMessage: async () => ({ conversation: 'hello' })
  });

  sock.ev.once('connection.update', (update) => {
    const { connection, pairingCode, isNewLogin } = update;
    if (pairingCode) {
      res.json({ pairCode: pairingCode });
    }
    if (connection === 'open') {
      console.log('✅ Connected with:', sock.user.id);
      saveState();
    }
  });

  sock.ev.on('creds.update', saveState);
});

app.listen(3000, () => {
  console.log('✅ Backend running on http://localhost:3000');
});
