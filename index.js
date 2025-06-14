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

    // Clean up any existing client
    if (client) {
        try {
            await client.destroy();
        } catch (e) {
            console.log('Warning: Could not fully destroy previous client.');
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
            message: '📲 Pairing started. Scan QR on server logs (or web interface if supported).',
            sessionId
        });
    } catch (error) {
        console.error('❌ Pairing Error:', error);
        pairingInProgress = false;
        return res.status(500).json({ error: 'Internal error during pairing. Check logs.' });
    }
});

// Simple homepage
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Dave-Md-V1 Pairing</title>
                <style>
                    body { font-family: Arial; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f0f8ff; }
                    form { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); text-align: center; }
                    input, button { padding: 10px; margin: 10px 0; width: 100%; border: 1px solid #ccc; border-radius: 5px; }
                    button { background-color: #007bff; color: white; font-weight: bold; cursor: pointer; }
                    button:hover { background-color: #0056b3; }
                </style>
            </head>
            <body>
                <form method="POST" action="/pair" onsubmit="submitForm(event)">
                    <h2>Pair your WhatsApp Number</h2>
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
                        const res = await fetch('/pair', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ number })
                        });
                        const data = await res.json();
                        if (res.ok) {
                            status.innerText = '✅ Session started! Check server logs for QR.';
                        } else {
                            status.innerText = `❌ Error: ${data.error || 'Failed to pair'}`;
                        }
                    }
                </script>
            </body>
        </html>
    `);
});

// Fallback route
app.use((req, res) => {
    res.status(404).send('🚫 Endpoint not found.');
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
