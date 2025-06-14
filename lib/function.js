///══════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                                                                      //
//                                    𝗗𝗔𝗩𝗘-𝗠𝗗-𝗩𝟭  𝐁𝐎𝐓                                                  //
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
//                             ✦ Dave-Md-V1: A WhatsApp User Bot by Gifted Dave ✦                       //
//                                                                                                      //
//══════════════════════════════════════════════════════════════════════════════════════════════════════//

//  * @project_name : Dave-Md-V1
//  * @author : Gifted Dave
//  * @github : https://github.com/gifteddaves
//  * @instagram : https://www.instagram.com/_gifted_dave/profilecard/?igsh=MWFjZHdmcm4zMGkzNw==
//  * @telegram : https://t.me/Digladoo
//  * @whatsapp : https://wa.me/254104260236
//  * @whatsapp_group : https://chat.whatsapp.com/CaPeB0sVRTrL3aG6asYeAC
//  * @whatsapp_channel : https://whatsapp.com/channel/0029VbApvFQ2Jl84lhONkc3k

const fs = require("fs");
const chalk = require("chalk");

// Sleep function
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Get random value from array
const getRandom = (list) => list[Math.floor(Math.random() * list.length)];

// Fancy text generator
function fancytext(text) {
  const fancyfonts = {
    '1': '𝟙', '2': '𝟚', '3': '𝟛', '4': '𝟜', '5': '𝟝', '6': '𝟞',
    '7': '𝟟', '8': '𝟠', '9': '𝟡', '0': '𝟘',
    a: '𝓪', b: '𝓫', c: '𝓬', d: '𝓭', e: '𝓮', f: '𝓯', g: '𝓰',
    h: '𝓱', i: '𝓲', j: '𝓳', k: '𝓴', l: '𝓵', m: '𝓶', n: '𝓷',
    o: '𝓸', p: '𝓹', q: '𝓺', r: '𝓻', s: '𝓼', t: '𝓽', u: '𝓾',
    v: '𝓿', w: '𝔀', x: '𝔁', y: '𝔂', z: '𝔃'
  };
  return text.split('').map(c => fancyfonts[c.toLowerCase()] || c).join('');
}

// Remove emoji function
function removeEmojis(string) {
  return string.replace(
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF])+/g,
    ''
  );
}

// Exporting all functions
module.exports = {
  sleep,
  getRandom,
  fancytext,
  removeEmojis,
};

// File watcher for auto-reload
let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.greenBright(`Update '${__filename}'`));
  delete require.cache[file];
  require(file);
});