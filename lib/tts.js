//══════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                                                                      //
//                                    𝗗𝗔𝗩𝗘-𝗠𝗗-𝗩𝟭  𝐁𝐎𝐓                                                   //
//                                                                                                      //
//                                        Ｖ：1.0                                                        //
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
//  * @author : GiftedDave
//  * @github : https://github.com/gifteddaves
//  * @description : Dave-Md-V1, A Multi-functional WhatsApp user bot.
//*
//*
//base by DGXeon / XLICON
//Re-upload? Recode? Copy code? Give credit ya! ✌️
//Instagram: https://www.instagram.com/_gifted_dave
//Telegram: https://t.me/Digladoo
//WhatsApp: https://wa.me/254104260236
//Want support or updates? Join the WhatsApp group: https://chat.whatsapp.com/CaPeB0sVRTrL3aG6asYeAC
//   * Originally created by GitHub: DGXeon.
//   * Credits to Xeon & SalmanYTOfficial
//   * © 2025 Dave-Md-V1
// ⛥┌┤
// */

const { join } = require('path');
const gtts = require('node-gtts');
const { readFileSync, unlinkSync } = require('fs');

function tts(text, lang = 'id') {
  return new Promise((resolve, reject) => {
    try {
      let tts = gtts(lang)
      let filePath = join(__dirname, '..XliconMedia/trash', (1 * new Date) + '.wav')
      tts.save(filePath, text, () => {
        resolve(readFileSync(filePath))
        unlinkSync(filePath)
      })
    } catch (e) { reject(e) }
  })
}

module.exports = { tts }