//══════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                                                                      //
//                                      𝗗𝗔𝗩𝗘-𝗠𝗗-𝗩𝟭  𝐁𝐎𝐓                                                 //
//                                                                                                      //
//                                         Ｖ：1.0                                                       //
//                                                                                                      //
//               ██╗  ██╗██╗     ██╗ ██████╗ ██████╗ ███╗   ██╗      ██╗   ██╗██╗  ██╗                  //              
//                ██╗██╔╝██║     ██║██╔════╝██╔═══██╗████╗  ██║      ██║   ██║██║  ██║                  //
//                ╚███╔╝ ██║     ██║██║     ██║   ██║██╔██╗ ██║█████╗██║   ██║███████║                  // 
//                ██╔██╗ ██║     ██║██║     ██║   ██║██║╚██╗██║╚════╝╚██╗ ██╔╝╚════██║                  // 
//               ██╔╝ ██╗███████╗██║╚██████╗╚██████╔╝██║ ╚████║       ╚████╔╝      ██║                  //
//                ═╝  ╚═╝╚══════╝╚═╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝        ╚═══╝       ╚═╝                  // 
//                                                                                                      //
//                                                                                                      //
//══════════════════════════════════════════════════════════════════════════════════════════════════════//
//*
//  * @project_name : Dave-Md-V1
//  * @author : gifteddaves
//  * @github : https://github.com/gifteddaves
//  * @whatsapp : https://wa.me/254104260236
//  * @telegram : https://t.me/Digladoo
//  * @instagram : https://www.instagram.com/_gifted_dave/profilecard/?igsh=MWFjZHdmcm4zMGkzNw==
//  * @description : Dave-Md-V1, A Multi-functional WhatsApp User Bot based on XLICON logic.
//*
//*
//base by DGXeon, original logic by salmanytofficial (XLICON)
//reupload? recode? copy code? Give credit!
//*

// Import required modules and settings
require('../settings');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const chalk = require('chalk');
const FileType = require('file-type');
const moment = require('moment-timezone');
const PhoneNumber = require('awesome-phonenumber');
const prem = require('./premium');

const {
  writeExif,
  imageToWebp,
  videoToWebp,
  writeExifImg,
  writeExifVid
} = require('../lib/exif');

const {
  isUrl,
  getGroupAdmins,
  generateMessageTag,
  getBuffer,
  getSizeMedia,
  fetchJson,
  sleep,
  getTypeUrlMedia
} = require('../lib/function');

const {
  jidNormalizedUser,
  proto,
  getBinaryNodeChildren,
  generateWAMessageContent,
  generateForwardMessageContent,
  prepareWAMessageMedia,
  delay,
  areJidsSameUser,
  extractMessageContent,
  generateMessageID,
  downloadContentFromMessage,
  generateWAMessageFromContent,
  jidDecode,
  generateWAMessage,
  toBuffer,
  getContentType,
  getDevice
} = require('@whiskeysockets/baileys');

// Core functions for group and message event handling
async function GroupUpdate(DaveBot, update) {
  // ... (unchanged logic)
}

async function GroupParticipantsUpdate(DaveBot, update) {
  // ... (unchanged logic)
}

async function MessagesUpsert(DaveBot, message, store) {
  // ... (unchanged logic)
}

async function Solving(DaveBot, store) {
  // ... (unchanged logic)
}

// Export core functions
module.exports = {
  GroupUpdate,
  GroupParticipantsUpdate,
  MessagesUpsert,
  Solving
};