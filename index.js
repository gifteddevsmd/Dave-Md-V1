const express = require('express');
const { Client } = require('whatsapp-web.js');
const { generate } = require('randomstring');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let clients = {};

function generateSessionID() {
  return `gifteddave~${generate({ length: 10, charset: 'alphanumeric' })}`;
}

app.get('/', (req, res) => {
  res.send(`
    <html><body style="font-family:sans-serif;text-align:center;padding:40px;">
    <h2>📲 Dave-Md-V1</h2>
    <form method="POST" action="/pair">
      <input name="number" placeholder="e.g. 254712345678" style="padding:10px;font-size:16px;width:250px;" required />
      <br><br>
      <button type="submit" style="padding:10px 20px;font-size:16px;">Send Pair Code</button>
    </form>
    </body></html>
  `);
});

app.post('/pair', async (req, res) => {
  const number = req.body.number?.replace(/\D/g, '');
  if (!number) return res.send('Invalid number');

  const sessionId = generateSessionID();
  const client = new Client({
    authStrategy: new (require('whatsapp-web.js').NoAuth)(),
    puppeteer: { headless: true, args: ['--no-sandbox'] },
  });

  clients[number] = { client, sessionId };

  client.on('ready', async () => {
    console.log(`✅ Client ready for ${number}`);
    await client.sendMessage(`${number}@c.us`, `✅ *Dave-Md-V1 Linked!*\n\n🔐 Session ID:\n\`${sessionId}\`\n\nUse this in your dashboard.`);
  });

  client.on('disconnected', () => {
    console.log(`❌ Disconnected: ${number}`);
    delete clients[number];
  });

  client.on('qr', async (qr) => {
    res.send(`
      <html><body style="text-align:center;">
      <h3>Scan this on WhatsApp Web > Link with phone number</h3>
      <pre>${qr}</pre>
      </body></html>
    `);
  });

  await client.initialize();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server started at http://localhost:${PORT}`));
