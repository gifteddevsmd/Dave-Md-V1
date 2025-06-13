const express = require("express");
const fs = require("fs");
const pako = require("pako");
const base64js = require("base64-js");
const makeWASocket = require("@whiskeysockets/baileys").default;
const { useSingleFileAuthState } = require("@whiskeysockets/baileys");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post("/pair", async (req, res) => {
  const number = req.body.number;

  if (!number) {
    return res.status(400).json({ error: "Phone number is required" });
  }

  const sessionFile = `./sessions/${number}.json`;
  const { state, saveState } = useSingleFileAuthState(sessionFile);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
  });

  // Send pair code
  sock.ev.on("connection.update", async ({ connection, qr, pairingCode }) => {
    if (pairingCode) {
      console.log(`📲 Pairing code for ${number}:`, pairingCode);
      res.json({ pairCode: pairingCode });
    }

    if (connection === "open") {
      console.log("✅ Paired:", number);

      // Wait for auth to save
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const sessionData = fs.readFileSync(sessionFile);

      const compressed = pako.deflate(sessionData);
      const base64 = base64js.fromByteArray(compressed);
      const sessionId = `gifteddave:~${base64}`;

      await sock.sendMessage(`${number}@s.whatsapp.net`, {
        text: `✅ *Your Gifted-Dave session ID*\n\n\`\`\`\n${sessionId}\n\`\`\`\n\n⚠️ Keep this safe and paste in the frontend to login.`,
      });

      console.log("✅ Session ID sent to:", number);
    }
  });

  sock.ev.on("creds.update", saveState);
});

app.listen(PORT, () => {
  console.log(`🔥 Server started on http://localhost:${PORT}`);
});
