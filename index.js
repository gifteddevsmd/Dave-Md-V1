const express = require('express');
const fs = require('fs');
const path = require('path');
const pino = require('pino');
const chalk = require('chalk');
const { makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore, Browsers } = require('@whiskeysockets/baileys');
const readline = require('readline');

const app = express();
const port = process.env.PORT || 3000;
const sessionDir = path.join(__dirname, 'session');
fs.mkdirSync(sessionDir, { recursive: true });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
    <h2>Dave-Md-V1 WhatsApp Pairing</h2>
    <form method="POST" action="/pair">
      <label>Enter WhatsApp number with country code (e.g., 254712345678):</label><br>
      <input type="text" name="number" required />
      <br><br>
      <button type="submit">Generate Pairing Code</button>
    </form>
  `);
});

app.post('/pair', async (req, res) => {
  const phoneNumber = req.body.number?.replace(/[^0-9]/g, '');
  if (!phoneNumber || phoneNumber.length < 10) {
    return res.send('❌ Invalid phone number. Please include country code.');
  }

  try {
    const { state, saveCreds } = await useMultiFileAuthState(`./session/${phoneNumber}`);
    const sock = makeWASocket({
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
      },
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      browser: Browsers.macOS('Safari'),
    });

    if (!sock.authState.creds.registered) {
      const code = await sock.requestPairingCode(phoneNumber);
      const sessionId = `gifteddave~${Buffer.from(phoneNumber).toString('base64')}`;
      
      console.log(chalk.green(`✅ Sent pairing code to ${phoneNumber}`));
      res.send(`
        <h3>✅ Pairing code sent to WhatsApp: ${phoneNumber}</h3>
        <p>👉 Go to your WhatsApp and enter the code that appears.</p>
        <p>📩 Once linked, you'll receive your session ID via WhatsApp.</p>
      `);

      setTimeout(async () => {
        const message = `✅ Welcome to Dave-Md-V1 Bot!\n\nHere is your session ID:\n\n${sessionId}\n\nSave this ID securely.`;
        await sock.sendMessage(`${phoneNumber}@s.whatsapp.net`, { text: message });
        console.log(`✅ Session ID sent to ${phoneNumber}`);
        await saveCreds();
      }, 10000); // wait 10 seconds for user to pair

    } else {
      res.send('⚠️ This number is already registered!');
    }

  } catch (err) {
    console.error('Error:', err);
    res.send('❌ Error generating pairing code. Make sure your number is correct and try again.');
  }
});

app.listen(port, () => {
  console.log(chalk.cyan(`🚀 Dave-Md-V1 Pairing Server running at http://localhost:${port}`));
});
