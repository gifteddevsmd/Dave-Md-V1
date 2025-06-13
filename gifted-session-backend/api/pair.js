const { default: makeWASocket, useSingleFileAuthState } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");
const pako = require("pako");
const base64js = require("base64-js");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const number = req.body.number;
  if (!number) {
    return res.status(400).json({ error: "Phone number is required" });
  }

  const sessionsPath = path.join(__dirname, "..", "..", "sessions");
  const sessionFile = path.join(sessionsPath, `${number}.json`);
  fs.mkdirSync(sessionsPath, { recursive: true });

  const { state, saveState } = useSingleFileAuthState(sessionFile);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
  });

  sock.ev.on("connection.update", async ({ connection, pairingCode }) => {
    if (pairingCode) {
      console.log(`Pair code for ${number}:`, pairingCode);
      return res.json({ pairCode: pairingCode });
    }

    if (connection === "open") {
      await new Promise(r => setTimeout(r, 2000));
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
};
