// ✅ index.js - WhatsApp Web Pairing Server (No QR, Phone Only)

const express = require("express"); const { Client, RemoteAuth } = require("whatsapp-web.js"); const { MongoStore } = require("wwebjs-mongo"); const { MongoClient } = require("mongodb"); const qrcode = require("qrcode-terminal"); const { v4: uuidv4 } = require("uuid");

const app = express(); app.use(express.urlencoded({ extended: true })); app.use(express.json());

// ✅ MongoDB connection (for session storage) const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://<your-cluster>.mongodb.net/session"; const mongoClient = new MongoClient(MONGO_URI);

// ✅ Memory store (or replace with MongoStore) let clients = {};

app.get("/", (req, res) => { res.send(`<!DOCTYPE html><html><head><title>Dave-Md-V1 Pair</title>

  <style>body{font-family:sans-serif;text-align:center;padding:40px;}input,button{padding:12px;width:90%;margin:10px auto;display:block;}button{background:#25D366;color:#fff;border:none;cursor:pointer;border-radius:8px;}</style>  </head><body>
  <h2>📲 Dave-Md-V1 WhatsApp Pairing</h2>
  <form method="POST" action="/pair">
  <input name="phone" placeholder="e.g. 254712345678" required />
  <button type="submit">Send Pairing Code</button>
  </form></body></html>`);
});app.post("/pair", async (req, res) => { const number = req.body.phone?.trim(); if (!number) return res.status(400).send("Phone number required");

const sessionId = uuidv4();

try { await mongoClient.connect(); const store = new MongoStore({ client: mongoClient, dbName: "session" });

const client = new Client({
  authStrategy: new RemoteAuth({ clientId: sessionId, store }),
  puppeteer: { headless: true, args: ["--no-sandbox"] },
});

client.initialize();

client.on("ready", async () => {
  const msg = `🎉 *Dave-Md-V1 Bot*

✅ Your session is ready! 🔐 Session ID: `gifteddave~${sessionId}` Paste this in your bot config.; await client.sendMessage(${number}@c.us`, msg); console.log("✅ Session sent to:", number); });

client.on("auth_failure", msg => console.error("❌ Auth failed:", msg));
clients[sessionId] = client;

setTimeout(() => {
  if (!client.info) {
    client.destroy();
    delete clients[sessionId];
    console.log("⚠️ Timed out session:", sessionId);
  }
}, 120000); // 2 min timeout

res.send(`<h3>✅ Code sent to WhatsApp: ${number}<br><br>Your Session ID: <code>gifteddave~${sessionId}</code><br><br>Use it in your dashboard config.</h3>`);

} catch (err) { console.error("❌ Error:", err); res.status(500).send("Something went wrong."); } });

const PORT = process.env.PORT || 5716; app.listen(PORT, () => console.log(🚀 Server running on http://localhost:${PORT}));

