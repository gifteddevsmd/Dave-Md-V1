//~~~~~~~~~~~~~~~< SETTINGS >~~~~~~~~~~~~~~~\\
const fs = require('fs');
const chalk = require('chalk');

//~~~~~~~~< Owner Information >~~~~~~~~~~~~~\\
global.ytname = process.env.YT_NAME || "YT: Gifted Dave";

global.socialm = process.env.GITHUB_USERNAME || "GitHub: gifteddaves";

global.location = process.env.LOCATION || "Kenya, Nairobi";

//~~~~~~~~< Session and Bot Details >~~~~~~~~~~~~~\\
global.SESSION_ID = process.env.SESSION_ID || '';

global.botname = process.env.BOT_NAME || 'Dave-Md-V1';

global.ownernumber = [process.env.OWNER_NUMBER || '254104260236'];

global.ownername = process.env.OWNER_NAME || 'Gifted Dave';

//~~~~~~< Website and Social Links >~~~~~~~~~~\\
global.websitex = process.env.WEBSITE_URL || "https://youtube.com/@gifteddave";

global.wagc = process.env.WHATSAPP_CHANNEL || "https://whatsapp.com/channel/0029VbApvFQ2Jl84lhONkc3k";

//~~~~~~~~< Theme and Miscellaneous >~~~~~~~~~~\\
global.themeemoji = process.env.THEME_EMOJI || '⛩';

global.wm = process.env.WATERMARK || "Dave-Md Bot Inc.";

global.botscript = process.env.SCRIPT_LINK || 'https://github.com/gifteddaves/Dave-Md-V1';

global.packname = process.env.PACK_NAME || "𝙂𝙄𝙁𝙏𝙀𝘿 𝘿𝘼𝙑𝙀";

global.author = process.env.AUTHOR_NAME || "Made by Gifted Dave";

global.creator = process.env.CREATOR_NUMBER || "254104260236@s.whatsapp.net";

//~~~~~~~~~~~~~< Bot Settings >~~~~~~~~~~~~~~~\\
global.xprefix = process.env.XPREFIX || '.';

global.premium = [process.env.PREMIUM_NUMBER || '254104260236'];

global.typemenu = process.env.MENU_TYPE || 'v2';

global.typereply = process.env.REPLY_TYPE || 'v4';

global.autoblocknumber = process.env.AUTOBLOCK_COUNTRYCODE || '212';

global.antiforeignnumber = process.env.ANTIFOREIGN_COUNTRYCODE || '91';

global.antidelete = process.env.ANTI_DELETE || 'true';

global.listv = ['•','●','■','✿','▲','➩','➢','➣','➤','✦','✧','△','❀','○','□','♤','♡','◇','♧','々','〆'];

global.tempatDB = process.env.DB_FILE || 'database.json';

global.limit = {
  free: parseInt(process.env.FREE_LIMIT || 100),
  premium: parseInt(process.env.PREMIUM_LIMIT || 999),
  vip: process.env.VIP_LIMIT || 'VIP'
};

global.uang = {
  free: parseInt(process.env.FREE_UANG || 10000),
  premium: parseInt(process.env.PREMIUM_UANG || 1000000),
  vip: parseInt(process.env.VIP_UANG || 10000000)
};

global.mess = {
  error: process.env.ERROR_MESSAGE || 'Error!',
  nsfw: process.env.NSFW_MESSAGE || 'Nsfw is disabled in this group, Please tell the admin to enable',
  done: process.env.DONE_MESSAGE || 'Done'
};

global.bot = {
  limit: 0,
  uang: 0
};

global.game = {
  suit: {},
  menfes: {},
  tictactoe: {},
  kuismath: {},
  tebakbom: {},
};

//~~~~~~~~~~~~~~~< PROCESS >~~~~~~~~~~~~~~~\\
let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Updated ${__filename}`));
  delete require.cache[file];
  require(file);
});