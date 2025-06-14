const express = require('express');
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const randomstring = require('randomstring');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let client;
let sessions = {};

app.post('/pair', async (req, res) => {
    const { number } = req.body;

    console.log('Pair request received with number:', number);

    if (!number) {
        return res.status(400).json({ error: 'Number is required' });
    }

    const sessionId = `gifteddave~${randomstring.generate(7).toLowerCase()}`;
    const sessionFile = `./sessions/${sessionId}.json`;

    if (!fs.existsSync('./sessions')) fs.mkdirSync('./sessions');

    client = new Client({
        puppeteer: { headless: true, args: ['--no-sandbox'] },
        authStrategy: undefined
    });

    client.on('qr', qr => {
        console.log('QR (debug):', qr);
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
        console.log('Client is ready!');
        fs.writeFileSync(sessionFile, JSON.stringify({ number, sessionId }));
    });

    client.initialize();

    res.json({ message: 'Pairing started, complete it on WhatsApp', sessionId });
});

// 🎨 Frontend for number input
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Dave-Md-V1 Pairing</title>
  <style>
    body {
      background: linear-gradient(135deg, #2e86de, #00c6ff);
      font-family: Arial, sans-serif;
      color: #fff;
      text-align: center;
      padding-top: 100px;
    }

    h1 {
      font-size: 32px;
      margin-bottom: 20px;
    }

    input[type="text"] {
      padding: 10px;
      font-size: 18px;
      border: none;
      border-radius: 8px;
      width: 260px;
      outline: none;
    }

    button {
      padding: 10px 20px;
      margin-top: 15px;
      font-size: 18px;
      background-color: #1abc9c;
      border: none;
      border-radius: 8px;
      color: white;
      cursor: pointer;
    }

    #result {
      margin-top: 30px;
      font-size: 18px;
      background: rgba(0,0,0,0.3);
      padding: 15px;
      border-radius: 8px;
      display: inline-block;
    }
  </style>
</head>
<body>
  <h1>🔗 Pair Your WhatsApp Number</h1>
  <input type="text" id="number" placeholder="Enter phone number e.g. 254712345678" />
  <br/>
  <button onclick="pair()">Start Pairing</button>
  <div id="result"></div>

  <script>
    function pair() {
      const number = document.getElementById('number').value;
      const resultBox = document.getElementById('result');

      fetch('/pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number })
      })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          resultBox.innerHTML = '❌ Error: ' + data.error;
        } else {
          resultBox.innerHTML = '✅ Session ID: <b>' + data.sessionId + '</b><br>Complete pairing in WhatsApp.';
        }
      })
      .catch(err => {
        resultBox.innerHTML = '❌ Failed to connect to server';
      });
    }
  </script>
</body>
</html>
`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
