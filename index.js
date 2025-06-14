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
    const msg = `🎉 *Dave-Md-V1 Bot Linked!*\n\n✅ Your bot is now paired successfully.\n\n🔐 *Session ID:*\n\`gifteddave~${sessionId}\`\n\nPaste this ID into your bot to activate it.`;
    const jid = jidNormalizedUser(phone);
    await sock.sendMessage(jid, { text: msg });
    console.log(chalk.green(`✅ Session ID sent to ${phone}`));
  } catch (err) {
    console.error(`❌ Failed to send session ID to ${phone}:`, err);
  }
};

app.get('/', (req, res) => {
  res.send(`
  <!DOCTYPE html><html><head><title>Dave-Md-V1 Pairing</title>
  <style>
  body { font-family: Poppins, sans-serif; background: #f0fdf4; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
  .box { background: white; border: 3px solid #25D366; padding: 30px; border-radius: 12px; box-shadow: 0 5px 20px rgba(0,0,0,0.1); text-align: center; width: 350px; }
  input, button { padding: 12px; margin-top: 10px; width: 100%; font-size: 16px; border-radius: 8px; border: 1px solid #ccc; }
  button { background: #25D366; color: white; border: none; cursor: pointer; }
  button:hover { background: #1ebe5d; }
  </style></head><body>
  <div class="box">
    <h2>📲 Dave-Md-V1 | WhatsApp Pairing</h2>
    <form method="POST" action="/pair">
      <input type="text" name="phone" placeholder="e.g., 254712345678" required />
      <button type="submit">Send Pair Code</button>
    </form>
  </div></body></html>
  `);
});

app.post('/pair', async (req, res) => {
  const number = req.body.phone?.trim();
  if (!number) return res.status(400).send('Phone number is required.');

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    auth: state,
    printQRInTerminal: false,
    browser: Browsers.macOS('Safari'),
  });

  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', async (u) => {
    if (u.connection === 'open') await sendSessionId(sock, number);
  });

  try {
    await new Promise(r => setTimeout(r, 2000));
    const code = await sock.requestPairingCode(number);
    res.send(`
    <!DOCTYPE html><html><head><title>Pair Code</title>
    <style>
    body { font-family: Poppins, sans-serif; background: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; }
    .box { background: #f9f9f9; border: 3px solid #25D366; padding: 30px; border-radius: 12px; text-align: center; width: 90%; max-width: 500px; }
    .code { font-size: 18px; background: #eee; padding: 15px; border: 2px dashed #25D366; border-radius: 8px; margin-top: 20px; }
    .copy-btn { background: #333; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; margin-top: 10px; }
    .copy-btn:hover { background: #555; }
    </style></head><body>
    <div class="box">
      <h2>✅ Pair code sent to <strong>${number}</strong></h2>
      <div class="code" id="pairCode">${code}</div>
      <button class="copy-btn" onclick="copyCode()">Copy Code</button>
      <p>Go to WhatsApp > Linked Devices > Use Code</p>
    </div>
    <script>
      function copyCode() {
        const text = document.getElementById('pairCode').innerText;
        navigator.clipboard.writeText(text).then(() => alert('✅ Code copied to clipboard!'));
      }
    </script>
    </body></html>`);
  } catch (err) {
    console.error('Pair error:', err);
    res.send(`<h3>❌ Failed to send pairing code.<br>Reason: ${err.message}</h3>`);
  }
});

const PORT = process.env.PORT || 5716;
app.listen(PORT, () => console.log(`🚀 Dave-Md-V1 Pairing running on http://localhost:${PORT}`));
