//══════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                                                                      //
//                                     𝗗𝗔𝗩𝗘-𝗠𝗗-𝗩𝟭  𝐁𝐎𝐓                                                  //
//                                                                                                      //
//                                          Ｖ：1.0                                                      //
//                                                                                                      //
//               ██╗  ██╗██╗     ██╗ ██████╗ ██████╗ ███╗   ██╗      ██╗   ██╗██╗  ██╗                  //
//                ██╗██╔╝██║     ██║██╔════╝██╔═══██╗████╗  ██║      ██║   ██║██║  ██║                  //
//                ╚███╔╝ ██║     ██║██║     ██║   ██║██╔██╗ ██║█████╗██║   ██║███████║                  //
//                ██╔██╗ ██║     ██║██║     ██║   ██║██║╚██╗██║╚════╝╚██╗ ██╔╝╚════██║                  //
//               ██╔╝ ██╗███████╗██║╚██████╗╚██████╔╝██║ ╚████║       ╚████╔╝      ██║                  //
//                ═╝  ╚═╝╚══════╝╚═╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝        ╚═══╝       ╚═╝                  //
//                                                                                                      //
//══════════════════════════════════════════════════════════════════════════════════════════════════════//

//*
//  * @project_name : Dave-Md-V1
//  * @author : gifteddaves
//  * @github : https://github.com/gifteddaves
//  * @whatsapp : https://wa.me/254104260236
//  * @telegram : https://t.me/Digladoo
//  * @instagram : https://www.instagram.com/_gifted_dave/profilecard/?igsh=MWFjZHdmcm4zMGkzNw==
//  * @description : Multi-functional WhatsApp User Bot based on Baileys & XLICON logic.
//*

require('../settings');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const moment = require('moment-timezone');
const { proto, getContentType, downloadContentFromMessage } = require('@whiskeysockets/baileys');
const PhoneNumber = require('awesome-phonenumber');
const { getBuffer, isUrl } = require('../lib/function');
const prem = require('./premium');

// Handler for group metadata changes
async function GroupUpdate(conn, update) {
  // Future support for group name/photo/description changes
  console.log(chalk.yellow('[GROUP UPDATE]:'), update);
}

// Handler for participant events (add, remove, promote, demote)
async function GroupParticipantsUpdate(conn, update) {
  console.log(chalk.blueBright('[PARTICIPANT UPDATE]:'), update);
  // You can customize messages for welcome, goodbye, promote, demote
}

// Handler for new incoming messages
async function MessagesUpsert(conn, m, store) {
  try {
    if (!m.type || m.type !== 'notify') return;
    for (const msg of m.messages) {
      if (!msg.message || msg.key && msg.key.remoteJid === 'status@broadcast') continue;

      msg.message = msg.message || {};
      const contentType = getContentType(msg.message);
      const message = msg.message[contentType];

      // Logging messages for debugging
      console.log(chalk.green('[MESSAGE RECEIVED]:'), msg.key.remoteJid, contentType);

      // Check for commands and process
      const from = msg.key.remoteJid;
      const isGroup = from.endsWith('@g.us');
      const sender = isGroup ? msg.key.participant : msg.key.remoteJid;

      // Example: simple ping command
      if (contentType === 'conversation' || contentType === 'extendedTextMessage') {
        const text = contentType === 'conversation' ? message : message.text;
        if (text.toLowerCase() === 'ping') {
          await conn.sendMessage(from, { text: '🏓 Pong! Dave-Md-V1 is alive.' }, { quoted: msg });
        }
      }
    }
  } catch (err) {
    console.error(chalk.red('[ERROR IN MESSAGE HANDLER]'), err);
  }
}

// Optional startup or scheduled logic
async function Solving(conn, store) {
  console.log(chalk.green('[DAVE-MD] Bot started and monitoring messages...'));
}

// Exporting all core handlers
module.exports = {
  GroupUpdate,
  GroupParticipantsUpdate,
  MessagesUpsert,
  Solving
};
