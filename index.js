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

// Homepage - Form UI
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Dave-Md-V1 Pairing</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: #f4f4f4;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
          }
          .box {
            background: #fff;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            text-align: center;
          }
          input {
            padding: 10px;
            width: 250px;
            margin-bottom: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
          }
          button {
            padding: 10px 20px;
            background-color: #27ae60;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
          }
          h2 {
            color: #2c3e50;
          }
        </style>
      </head>
      <body>
        <div class="box">
          <h2>🔗 Pair Dave-Md-V1 with your WhatsApp</h2>
          <form action="/pair" method="POST">
            <input name="phone" placeholder="e.g., 254712345678" required />
            <br>
            <button type="submit">Send Pairing Code</button>
          </form>
        </div>
      </body>
    </html>
  `);
});

// Handle pairing
app.post('/pair', async (req, res) => {
  const number = req.body.phone?.trim();
  if (!number) return res.status(400).send('❌ Phone number is required.');

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
      console.log(chalk.green('✅ Paired! Sending session ID...'));
      await sendSessionId(sock, number);
    }
  });

  try {
    const code = await sock.requestPairingCode(number);
    res.send(`
      <html>
        <head><title>Pairing Code Sent</title></head>
        <body style="font-family:sans-serif;text-align:center;margin-top:100px;">
          <h2>✅ Pairing code sent to <strong>${number}</strong>:</h2>
          <p style="font-size:20px;color:green;"><code>${code}</code></p>
          <p>Check your WhatsApp and wait to receive your Session ID shortly.</p>
          <a href="/" style="display:inline-block;margin-top:20px;">⬅ Back</a>
        </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to send pairing code.');
  }
});

const PORT = process.env.PORT || 5716;
app.listen(PORT, () => {
  console.log(`🚀 Dave-Md-V1 Pairing Server running at http://localhost:${PORT}`);
});
