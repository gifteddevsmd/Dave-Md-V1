const express = require('express');
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const randomstring = require('randomstring');
const app = express();

app.use(express.json());

let client;
let sessions = {};

app.post('/pair', async (req, res) => {
    const { number } = req.body;

    if (!number) return res.status(400).json({ error: 'Number is required' });

    const sessionId = `gifteddave~${randomstring.generate(7).toLowerCase()}`;
    const sessionFile = `./sessions/${sessionId}.json`;

    if (!fs.existsSync('./sessions')) fs.mkdirSync('./sessions');

    client = new Client({
        puppeteer: { headless: true, args: ['--no-sandbox'] },
        authStrategy: undefined
    });

    client.on('qr', qr => {
        console.log('Scan this QR (for debugging only):', qr);
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
        console.log('Client is ready!');
        fs.writeFileSync(sessionFile, JSON.stringify({ number, sessionId }));
    });

    client.initialize();

    res.json({ message: 'Pairing started, complete it on WhatsApp', sessionId });
});

app.get('/', (req, res) => {
    res.send('✅ Dave-Md-V1 WhatsApp Number Pairing Backend is Running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
