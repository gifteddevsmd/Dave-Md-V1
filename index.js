// ============================ // 📦 Dave-Md-V1 Pairing Backend // ✅ Fixed for Heroku + Vercel/Render support // 🔁 Phone-number-based session pairing // ============================

const express = require('express'); const { makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys'); const fs = require('fs'); const path = require('path'); const randomstring = require('randomstring'); const app = express();

// Config const PORT = process.env.PORT || 3000; const sessionsPath = path.join(__dirname, 'sessions'); if (!fs.existsSync(sessionsPath)) fs.mkdirSync(sessionsPath);

let lastRequests = {};

// Middleware app.use(express.json()); app.use(express.urlencoded({ extended: true })); app.use('/sessions', express.static(sessionsPath));

// HTML Frontend app.get('/', (req, res) => { res.send(<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <title>Dave-Md-V1 Pairing</title> <style> body { margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #0f2027, #203a43, #2c5364); color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; } h1 { animation: slideIn 1.2s ease-in-out; margin-bottom: 20px; } form { background: rgba(255, 255, 255, 0.1); padding: 30px; border-radius: 10px; box-shadow: 0 0 15px rgba(0,0,0,0.3); } input { padding: 10px; border: none; border-radius: 5px; margin-right: 10px; width: 200px; } button { padding: 10px 15px; border: none; background: #00c6ff; color: white; font-weight: bold; border-radius: 5px; cursor: pointer; } #out { margin-top: 20px; font-size: 1.1em; } @keyframes slideIn { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } } </style> </head> <body> <h1>🔐 Dave-Md-V1 Pairing</h1> <form onsubmit="event.preventDefault(); pair();"> <input id="num" placeholder="254712345678" required /> <button type="submit">Get Code</button> <div id="out"></div> </form> <script> async function pair() { const num = document.getElementById('num').value; const res = await fetch('/pair', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ number: num }) }); const data = await res.json(); document.getElementById('out').innerText = res.ok ?✅ Your code: ${data.code}\n📂 Download session: ${window.location.origin + data.sessionFile}:❌ Error: ${data.error}; } </script> </body> </html> ); });

// Pair Endpoint app.post('/pair', async (req, res) => { const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress; if (!req.body.number) return res.status(400).json({ error: 'Phone number required' });

if (lastRequests[ip] && Date.now() - lastRequests[ip] < 10000) { return res.status(429).json({ error: 'Please wait 10 seconds before retrying.' }); } lastRequests[ip] = Date.now();

try { const number = req.body.number.replace(/\D/g, ''); const code = randomstring.generate({ length: 6, charset: 'alphanumeric' }).toUpperCase(); const filename = ${code}.json; const filepath = path.join(sessionsPath, filename);

const { state, saveState } = useSingleFileAuthState(filepath);
const sock = makeWASocket({ auth: state });

sock.ev.on('connection.update', (update) => {
  const { connection } = update;
  if (connection === 'open') console.log(`✅ Connected for ${number}`);
});

sock.ev.on('creds.update', saveState);

return res.json({ code, sessionFile: `/sessions/${filename}` });

} catch (err) { console.error('❌ Pairing failed:', err); return res.status(500).json({ error: 'Pairing failed. Please try again.' }); } });

// Start server app.listen(PORT, () => console.log(✅ Pairing server running on http://localhost:${PORT}));

  
