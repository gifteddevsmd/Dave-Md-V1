const express = require('express'); const fs = require('fs'); const randomstring = require('randomstring'); const path = require('path');

const app = express(); app.use(express.json());

const PORT = process.env.PORT || 3000; const sessionsPath = path.join(__dirname, 'sessions');

if (!fs.existsSync(sessionsPath)) { fs.mkdirSync(sessionsPath); }

// Store in-memory retry tracking let lastPairTime = {};

// Step 1: User starts pairing by entering phone number app.post('/start-pairing', async (req, res) => { const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress; const now = Date.now();

if (!req.body.number) return res.status(400).json({ error: 'Phone number is required.' });

// Anti-spam: 10 seconds per IP
if (lastPairTime[ip] && now - lastPairTime[ip] < 10000) {
    return res.status(429).json({ error: 'Wait 10 seconds before trying again.' });
}
lastPairTime[ip] = now;

const number = req.body.number;
const code = Math.floor(100000 + Math.random() * 900000); // 6-digit code
const sessionId = `gifteddave~${randomstring.generate(6).toLowerCase()}`;

// Save pairing info
fs.writeFileSync(path.join(sessionsPath, `${number}.json`), JSON.stringify({ code, sessionId }));

// Simulate code delivery - you should replace with actual bot/WhatsApp sender
console.log(`📨 Simulated sending code ${code} to WhatsApp number ${number}`);

res.json({ message: '✅ Code sent to WhatsApp.' });

});

// Step 2: User enters received code to confirm pairing app.post('/verify-code', (req, res) => { const { number, code } = req.body; if (!number || !code) return res.status(400).json({ error: 'Number and code are required.' });

const sessionFile = path.join(sessionsPath, `${number}.json`);
if (!fs.existsSync(sessionFile)) return res.status(404).json({ error: 'Pairing not found.' });

const data = JSON.parse(fs.readFileSync(sessionFile));
if (String(data.code) !== String(code)) {
    return res.status(401).json({ error: 'Incorrect code. Try again.' });
}

res.json({ message: '✅ Verified!', sessionId: data.sessionId });

});

// Pairing UI page app.get('/', (req, res) => { res.send(`<!DOCTYPE html>

<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Dave-Md-V1 Pairing</title>
    <style>
        body { font-family: Arial; background: #e6f2ff; display: flex; justify-content: center; align-items: center; height: 100vh; }
        form { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 0 20px rgba(0,0,0,0.1); width: 320px; text-align: center; }
        input, button { padding: 12px; margin-top: 10px; width: 100%; border: 1px solid #ccc; border-radius: 6px; font-size: 16px; }
        button { background-color: #28a745; color: white; font-weight: bold; cursor: pointer; }
        button:hover { background-color: #218838; }
        p { margin-top: 15px; color: #555; }
    </style>
</head>
<body>
    <form onsubmit="handleSubmit(event)">
        <h2>Pair WhatsApp</h2>
        <input type="text" id="number" placeholder="Enter number e.g. 254712345678" required />
        <button type="button" onclick="sendCode()">Send Code</button>
        <input type="text" id="code" placeholder="Enter received code" style="display:none" />
        <button type="submit" id="verifyBtn" style="display:none">Verify</button>
        <p id="status"></p>
    </form>
    <script>
        let phoneNumber = '';async function sendCode() {
        phoneNumber = document.getElementById('number').value;
        const status = document.getElementById('status');
        status.innerText = '⏳ Sending code...';
        try {
            const res = await fetch('/start-pairing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ number: phoneNumber })
            });
            const data = await res.json();
            if (res.ok) {
                status.innerText = '✅ Code sent. Check your WhatsApp.';
                document.getElementById('code').style.display = 'block';
                document.getElementById('verifyBtn').style.display = 'block';
            } else {
                status.innerText = '❌ ' + (data.error || 'Failed to send code');
            }
        } catch (err) {
            status.innerText = '❌ Failed to contact server';
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const code = document.getElementById('code').value;
        const status = document.getElementById('status');
        status.innerText = '⏳ Verifying...';
        try {
            const res = await fetch('/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ number: phoneNumber, code })
            });
            const data = await res.json();
            if (res.ok) {
                status.innerText = '✅ Verified! Your Session ID is: ' + data.sessionId;
            } else {
                status.innerText = '❌ ' + (data.error || 'Failed');
            }
        } catch (err) {
            status.innerText = '❌ Verification failed.';
        }
    }
</script>

</body>
</html>`);
});app.use((req, res) => { res.status(404).send('🚫 Endpoint not found.'); });

app.listen(PORT, () => console.log(✅ Server running at http://localhost:${PORT}));

                                
