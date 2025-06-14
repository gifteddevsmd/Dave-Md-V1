const express = require('express');
const randomstring = require('randomstring');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
const codesPath = path.join(__dirname, 'codes');

if (!fs.existsSync(codesPath)) {
    fs.mkdirSync(codesPath);
}

let lastPairTime = {};

app.post('/pair', async (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const now = Date.now();

    if (!req.body.number) {
        return res.status(400).json({ error: 'Phone number required' });
    }

    if (lastPairTime[ip] && now - lastPairTime[ip] < 10000) {
        return res.status(429).json({ error: 'Please wait 10 seconds before trying again.' });
    }
    lastPairTime[ip] = now;

    const number = req.body.number;
    const code = `gifteddave~${randomstring.generate(6).toLowerCase()}`;
    const filepath = path.join(codesPath, `${number}.json`);

    fs.writeFileSync(filepath, JSON.stringify({ number, code }));

    return res.json({ code });
});

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Pair with Dave-Md-V1</title>
    <style>
        body { font-family: Arial; background: #f0f8ff; display: flex; justify-content: center; align-items: center; height: 100vh; }
        form, .result { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 0 20px rgba(0,0,0,0.1); width: 320px; text-align: center; }
        input, button { padding: 12px; margin-top: 10px; width: 100%; border: 1px solid #ccc; border-radius: 6px; font-size: 16px; }
        button { background-color: #28a745; color: white; font-weight: bold; cursor: pointer; }
        button:hover { background-color: #218838; }
        #pairCode { margin-top: 20px; font-size: 18px; color: #333; word-break: break-all; }
    </style>
</head>
<body>
    <form id="pairForm" onsubmit="submitForm(event)">
        <h2>Pair Your Number</h2>
        <input type="text" id="number" placeholder="e.g. 254712345678" required />
        <button type="submit">Get Code</button>
        <p id="status"></p>
        <div id="pairCode"></div>
    </form>

    <script>
        async function submitForm(e) {
            e.preventDefault();
            const number = document.getElementById('number').value;
            const status = document.getElementById('status');
            const pairCode = document.getElementById('pairCode');
            status.innerText = '⏳ Generating code...';
            pairCode.innerText = '';
            try {
                const res = await fetch('/pair', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ number })
                });
                const data = await res.json();
                if (res.ok) {
                    status.innerText = '✅ Code generated successfully!';
                    pairCode.innerText = 'Your Pairing Code: ' + data.code;
                } else {
                    status.innerText = '❌ Error: ' + (data.error || 'Unknown error.');
                }
            } catch (err) {
                status.innerText = '❌ Request failed.';
            }
        }
    </script>
</body>
</html>`);
});

// Fallback for other routes
app.use((req, res) => {
    res.status(404).send('❌ Endpoint not found.');
});

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
