const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
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

let client = null;
let pairingInProgress = false;
let lastPairTime = {};

app.post('/pair', async (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const now = Date.now();

    if (!req.body.number) return res.status(400).json({ error: 'Phone number required' });

    // Throttle pairing per IP
    if (lastPairTime[ip] && now - lastPairTime[ip] < 60000) {
        return res.status(429).json({ error: 'Wait 1 minute before pairing again.' });
    }
    lastPairTime[ip] = now;

    if (pairingInProgress) {
        return res.status(409).json({ error: 'Pairing already in progress. Try again shortly.' });
    }

    pairingInProgress = true;

    const number = req.body.number;
    const sessionId = `gifteddave~${randomstring.generate(7).toLowerCase()}`;
    const sessionFile = path.join(sessionsPath, `${sessionId}.json`);

    // Clean up existing client
    if (client) {
        try {
            await client.destroy();
        } catch (e) {
            console.log('Could not destroy previous client.');
        }
    }

    try {
        client = new Client({
            authStrategy: new LocalAuth({ clientId: sessionId }),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            }
        });

        client.on('qr', qr => {
            console.log(`[QR for ${number}]`);
            qrcode.generate(qr, { small: true });
        });

        client.on('ready', () => {
            console.log(`[✅ Paired: ${number}]`);
            fs.writeFileSync(sessionFile, JSON.stringify({ number, sessionId }));
            pairingInProgress = false;
        });

        client.on('disconnected', reason => {
            console.log(`[❌ Disconnected: ${reason}]`);
            pairingInProgress = false;
        });

        await client.initialize();

        return res.json({
            message: '📲 Pairing started. Scan QR from server logs.',
            sessionId
        });
    } catch (error) {
        console.error('❌ Pairing Error:', error);
        pairingInProgress = false;
        return res.status(500).json({ error: 'Internal error during pairing. Check logs.' });
    }
});

// Web UI
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Dave-Md-V1 Pairing</title>
    <style>
        body { font-family: Arial; background: #e6f2ff; display: flex; justify-content: center; align-items: center; height: 100vh; }
        form { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 0 20px rgba(0,0,0,0.1); width: 300px; text-align: center; }
        input, button { padding: 12px; margin-top: 10px; width: 100%; border: 1px solid #ccc; border-radius: 6px; font-size: 16px; }
        button { background-color: #28a745; color: white; font-weight: bold; cursor: pointer; }
        button:hover { background-color: #218838; }
        p { margin-top: 15px; color: #555; }
    </style>
</head>
<body>
    <form onsubmit="submitForm(event)">
        <h2>Pair WhatsApp</h2>
        <input type="text" id="number" placeholder="Enter number e.g. 254712345678" required />
        <button type="submit">Start Pairing</button>
        <p id="status"></p>
    </form>

    <script>
        async function submitForm(e) {
            e.preventDefault();
            const number = document.getElementById('number').value;
            const status = document.getElementById('status');
            status.innerText = '⏳ Sending request...';
            try {
                const res = await fetch('/pair', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ number })
                });
                const data = await res.json();
                if (res.ok) {
                    status.innerText = '✅ Session started! Scan QR from server logs.';
                } else {
                    status.innerText = '❌ Error: ' + (data.error || 'Failed');
                }
            } catch (err) {
                status.innerText = '❌ Request failed. Try again.';
            }
        }
    </script>
</body>
</html>`);
});

// 404 fallback
app.use((req, res) => {
    res.status(404).send('🚫 Endpoint not found.');
});

app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
