const { default: makeWASocket } = require("@whiskeysockets/baileys");
const { DisconnectReason } = require("@whiskeysockets/baileys");
const P = require("pino");

async function startBot() {
  const sock = makeWASocket({
    printQRInTerminal: true,
    logger: P({ level: "silent" }),
    auth: undefined,
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      if (
        (lastDisconnect?.error)?.output?.statusCode !==
        DisconnectReason.loggedOut
      ) {
        startBot(); // reconnect if not logged out
      } else {
        console.log("🛑 Logged out, please re-authenticate.");
      }
    } else if (connection === "open") {
      console.log("✅ Bot connected!");
    }
  });
}

startBot();
