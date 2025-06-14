const express = require('express');
const pino = require('pino');
const readline = require('readline');
const fs = require('fs');
const chalk = require('chalk');
const { makeWASocket, useMultiFileAuthState, Browsers, jidNormalizedUser } = require('@whiskeysockets/baileys');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const SESSION_DIR = './session';
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

const sendSessionId = async (sock, phone) => {
  try {
    const credsPath = `${SESSION_DIR}/creds.json`;
    if (!fs.existsSync(credsPath)) return;

    const sessionId = fs.readFileSync(credsPath).toString('base64');
    const msg = `🎉 *Dave-Md-V1*\n\n✅ Your bot is now paired successfully!\n\n🔐 *Session ID:*\n\`gifteddave~${sessionId}\`\n\nUse this in your bot dashboard.`;

    const jid = jidNormalizedUser(phone);
    await sock.sendMessage(jid, { text: msg });
    console.log(chalk.green(`✅ Session ID sent to ${phone}`));
  } catch (err) {
    console.error(`❌ Failed to send session ID to ${phone}:`, err);
  }
};

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Dave-Md-V1 Pairing</title></head>
      <body>
        <h2>🔗 Enter your phone number to receive WhatsApp pairing code:</h2>
        <form action="/pair" method="POST">
          <input name="phone" placeholder="e.g., 254712345678" required/>
          <button type="submit">Send Pair Code</button>
        </form>
      </body>
    </html>
  `);
});

app.post('/pair', async (req, res) => {
  const number = req.body.phone?.trim();
  if (!number) return res.status(400).send('❌ Phone number is required.');

  console.log('📱 Pairing request for:', number);

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    auth: state,
    printQRInTerminal: false,
    browser: Browsers.macOS('Safari'),
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection } = update;
    if (connection === 'open') {
      console.log('✅ Connected! Sending session ID...');
      await sendSessionId(sock, number);
    }
  });

  try {
    // Wait 2 seconds to ensure socket is ready
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const code = await sock.requestPairingCode(number);
    console.log('📨 Pairing code sent:', code);

    res.send(`
      <html>
        <body>
          <h3>✅ Pairing code sent to <strong>${number}</strong> via WhatsApp!</h3>
          <code>${code}</code>
          <p>Open WhatsApp > Linked Devices > Use Code</p>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('❌ Failed to send pairing code:', err.message || err);
    res.status(500).send(`
      <html>
        <body>
          <h3>❌ Failed to send pairing code.</h3>
          <p>Reason: ${err.message || 'Unknown error'}.</p>
          <p>Please ensure the number is valid and try again.</p>
        </body>
      </html>
    `);
  }
});

const PORT = process.env.PORT || 5716;
app.listen(PORT, () => {
  console.log(`🚀 Dave-Md-V1 Pairing Server running at http://localhost:${PORT}`);
});
