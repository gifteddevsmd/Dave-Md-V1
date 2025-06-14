const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const randomstring = require('randomstring');
const path = require('path');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const sessionsPath = path.join(__dirname, 'sessions');

if (!fs.existsSync(sessionsPath)) {
    fs.mkdirSync(sessionsPath);
}

let lastPairTime = {};
let pairingInProgress = false;

app.post('/pair', async (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const now = Date.now();

    if (!req.body.number) return res.status(400).json({ error: 'Phone number required' });

    if (lastPairTime[ip] && now - lastPairTime[ip] < 10000) {
        return res.status(429).json({ error: 'Wait 10 seconds before pairing again.' });
    }
    lastPairTime[ip] = now;

    if (pairingInProgress) {
        return res.status(409).json({ error: 'Pairing already in progress. Try again shortly.' });
    }

    pairingInProgress = true;

    const number = req.body.number;
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    const sessionId = `gifteddave~${randomstring.generate(5).toLowerCase()}`;
    const sessionFile = path.join(sessionsPath, `${sessionId}.json`);

    const client = new Client({
        authStrategy: new LocalAuth({ clientId: sessionId }),
        puppeteer: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    });

    client.on('ready', async () => {
        console.log(`✅ Client ready for ${number}`);
        try {
            await client.sendMessage(`${number}@c.us`, `🧾 Your Dave-Md-V1 code is: *${code}*\nSession ID: \`${sessionId}\`\nUse this code to complete setup.`);
            fs.writeFileSync(sessionFile, JSON.stringify({ number, sessionId, code }));
            console.log(`✅ Code sent to ${number}: ${code}`);
        } catch (e) {
            console.error(`❌ Failed to send code to ${number}`, e);
        }
        pairingInProgress = false;
        await client.destroy(); // destroy session after sending
    });

    client.on('auth_failure', () => {
        console.error(`❌ Auth failure for ${number}`);
        pairingInProgress = false;
    });

    client.on('disconnected', () => {
        console.log(`⚠️ Client disconnected for ${number}`);
        pairingInProgress = false;
    });

    try {
        await client.initialize();
        return res.json({ message: '✅ Code is being sent to WhatsApp', sessionId });
    } catch (err) {
        console.error('❌ Pairing error:', err);
        pairingInProgress = false;
        return res.status(500).json({ error: 'Internal error during pairing.' });
    }
});

// Simple frontend
app.get('/', (req, res) => {
    res.send(`
    <html>
    <head><title>Dave-Md-V1 Pair</title></head>
    <body style="font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;background:#eef;">
    <form onsubmit="submitForm(event)" style="background:white;padding:30px;border-radius:8px;box-shadow:0 0 20px rgba(0,0,0,0.1);text-align:center;">
        <h2>Start WhatsApp Pairing</h2>
        <input id="number" placeholder="Enter phone number e.g. 254712345678" style="width:100%;padding:10px;margin:10px 0;" required />
        <button type="submit" style="padding:10px 20px;">Submit</button>
        <p id="status" style="margin-top:10px;"></p>
    </form>
    <script>
        async function submitForm(e) {
            e.preventDefault();
            const number = document.getElementById('number').value;
            const status = document.getElementById('status');
            status.innerText = '⏳ Sending...';
            try {
                const res = await fetch('/pair', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ number })
                });
                const data = await res.json();
                if (res.ok) {
                    status.innerText = '✅ Code is being sent to your WhatsApp.';
                } else {
                    status.innerText = '❌ ' + data.error;
                }
            } catch (e) {
                status.innerText = '❌ Request failed.';
            }
        }
    </script>
    </body>
    </html>`);
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
