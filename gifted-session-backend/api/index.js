const express = require("express");
const fs = require("fs");
const path = require("path");
const pako = require("pako");
const base64js = require("base64-js");
const makeWASocket = require("@whiskeysockets/baileys").default;
const { useSingleFileAuthState } = require("@whiskeysockets/baileys");

const app = express();
app.use(express.json());

// Serve frontend files from ../frontend folder
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

const PORT = process.env.PORT || 3000;

app.post("/pair", async (req, res) => {
  const number = req.body.number;
  if (!number) return res.status(400).json({ error: "Phone number is required" });

  const sessionsDir = path.join(__dirname, "sessions");
  if (!fs.existsSync(sessionsDir)) fs.mkdirSync(sessionsDir);

  const sessionFile = path.join(sessionsDir, `${number}.json`);
  const { state, saveState } = useSingleFileAuthState(sessionFile);

  const sock = makeWASocket({ auth: state, printQRInTerminal: false });

  sock.ev.on("connection.update", async ({ connection, pairingCode }) => {
    if (pairingCode) return res.json({ pairCode: pairingCode });
    if (connection === "open") {
      await new Promise((r) => setTimeout(r, 2000));
      const sessionData = fs.readFileSync(sessionFile);
      const compressed = pako.deflate(sessionData);
      const base64 = base64js.fromByteArray(compressed);
      const sessionId = `gifteddave:~${base64}`;

      await sock.sendMessage(`${number}@s.whatsapp.net`, {
        text: `✅ Your session ID:\n\n${sessionId}\n\nKeep it safe!`,
      });
    }
  });

  sock.ev.on("creds.update", saveState);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
