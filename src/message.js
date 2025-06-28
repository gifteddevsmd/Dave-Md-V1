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
const chalk = require('chalk');
const { getContentType } = require('@whiskeysockets/baileys');

// Handle group metadata events
async function GroupUpdate(conn, update) {
  console.log(chalk.yellow('[GROUP UPDATE]:'), update);
}

// Handle group participant changes
async function GroupParticipantsUpdate(conn, update) {
  console.log(chalk.blueBright('[PARTICIPANT UPDATE]:'), update);
}

// Message handling logic
async function MessagesUpsert(conn, m, store) {
  try {
    if (!m.type || m.type !== 'notify') return;
    for (const msg of m.messages) {
      if (!msg.message || (msg.key && msg.key.remoteJid === 'status@broadcast')) continue;

      const contentType = getContentType(msg.message);
      const message = msg.message[contentType];
      const from = msg.key.remoteJid;
      const isGroup = from.endsWith('@g.us');
      const sender = isGroup ? msg.key.participant : msg.key.remoteJid;

      console.log(chalk.green('[MESSAGE RECEIVED]:'), from, contentType);

      if (contentType === 'conversation' || contentType === 'extendedTextMessage') {
        const text = contentType === 'conversation' ? message : message.text;
        const prefix = '.';
        const cmd = text.trim().toLowerCase();

        if (cmd === 'ping' || cmd === `${prefix}ping`) {
          const start = Date.now();
          const end = Date.now();
          await conn.sendMessage(from, {
            text: `🏓 Pong • ${end - start}ms\n🧠 Dave-Md-V1`,
          }, { quoted: msg });
        }

        // Submenus
        if (cmd === `${prefix}ownermenu`) {
          await conn.sendMessage(from, { text: global.ownermenu(prefix) }, { quoted: msg });
        }
        if (cmd === `${prefix}groupmenu`) {
          await conn.sendMessage(from, { text: global.groupmenu(prefix) }, { quoted: msg });
        }
        if (cmd === `${prefix}downloadmenu`) {
          await conn.sendMessage(from, { text: global.downloadmenu(prefix) }, { quoted: msg });
        }
        if (cmd === `${prefix}animemenu`) {
          await conn.sendMessage(from, { text: global.animemenu(prefix) }, { quoted: msg });
        }
        if (cmd === `${prefix}othermenu`) {
          await conn.sendMessage(from, { text: global.othermenu(prefix) }, { quoted: msg });
        }
      }
    }
  } catch (err) {
    console.error(chalk.red('[ERROR IN MESSAGE HANDLER]'), err);
  }
}

// Startup logic
async function Solving(conn, store) {
  console.log(chalk.green('[DAVE-MD] Bot started and monitoring messages...'));
}

// Export all
module.exports = {
  GroupUpdate,
  GroupParticipantsUpdate,
  MessagesUpsert,
  Solving
};

//════════════════════════════════════════════════════════════════════════════//
// 🌟 SUBMENU TEMPLATES — Dave-Md-V1
//════════════════════════════════════════════════════════════════════════════//
global.ownermenu = (prefix) => `
┏━━❖ ᴏᴡɴᴇʀ ᴍᴇɴᴜ ❖━━┓
┃⿻ ${prefix}setppbot
┃⿻ ${prefix}setprefix
┃⿻ ${prefix}shutdown
┃⿻ ${prefix}bc
┃⿻ ${prefix}join
┗━━━━━━━━━━━━━━┛`;

global.groupmenu = (prefix) => `
┏━━❖ ɢʀᴏᴜᴘ ᴍᴇɴᴜ ❖━━┓
┃⿻ ${prefix}add
┃⿻ ${prefix}kick
┃⿻ ${prefix}promote
┃⿻ ${prefix}demote
┃⿻ ${prefix}setname
┃⿻ ${prefix}setdesc
┗━━━━━━━━━━━━━━┛`;

global.downloadmenu = (prefix) => `
┏━━❖ ᴅᴏᴡɴʟᴏᴀᴅ ᴍᴇɴᴜ ❖━━┓
┃⿻ ${prefix}ytmp3
┃⿻ ${prefix}ytmp4
┃⿻ ${prefix}tiktok
┃⿻ ${prefix}instagram
┗━━━━━━━━━━━━━━┛`;

global.animemenu = (prefix) => `
┏━━❖ ᴀɴɪᴍᴇ ᴍᴇɴᴜ ❖━━┓
┃⿻ ${prefix}anime
┃⿻ ${prefix}manga
┃⿻ ${prefix}neko
┃⿻ ${prefix}waifu
┗━━━━━━━━━━━━━━┛`;

global.othermenu = (prefix) => `
┏━━❖ ᴏᴛʜᴇʀ ᴍᴇɴᴜ ❖━━┓
┃⿻ ${prefix}ping
┃⿻ ${prefix}owner
┃⿻ ${prefix}report
┃⿻ ${prefix}runtime
┗━━━━━━━━━━━━━━┛`;
