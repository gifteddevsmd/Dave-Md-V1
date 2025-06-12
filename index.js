const { default: makeWASocket, DisconnectReason } = require("@whiskeysockets/baileys");
const P = require("pino");
const fs = require("fs");
const path = require("path");

const config = require("./config");
const handler = require("./handler");

async function startBot() {
  const sock = makeWASocket({
    printQRInTerminal: true,
    logger: P({ level: "silent" }),
  });

  // Pass socket to handler to handle events
  handler(sock);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      if (
        (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut
      ) {
        startBot();
      } else {
        console.log("Logged out, please re-authenticate.");
      }
    } else if (connection === "open") {
      console.log("Bot connected");
    }
  });
}

startBot();
