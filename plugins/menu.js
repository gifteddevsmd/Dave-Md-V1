module.exports = {
  name: "menu",
  description: "Show love-themed menu",
  execute: async (sock, msg) => {
    const jid = msg.key.remoteJid;

    const menu = `
╭───────❀🌹❀───────╮
        *💌 GIFTED-DAVE-MD 💌*
╰───────❀🌹❀───────╯
*┃🤖 Prefix:*  \`. \`
*┃👑 Owner:*  wa.me/254104260236
*┃📁 Plugins:*  Custom Menu
╭────────────────────╯

🌺 *ANTI FEATURES*
╰───────────────➤
• .antidelete  
• .anticall  
• .antiban  
• .toggle antideletestatus  

💘 *DOWNLOADER TOOLS*
╰───────────────➤
• .ytmp3  
• .ytmp4  
• .play  
• .tiktok  
• .insta  
• .pindl  
• .viewonce  
• .dlstatus  

💞 *FAKE ACTIVITY*
╰───────────────➤
• .fakerecord  
• .faketyping  
• .alwaysonline  

💬 *AI & CHAT FEATURES*
╰───────────────➤
• .ai  
• .chatgpt  
• .chatbot on  
• .chatbot off  

🔄 *AUTOMATION TOOLS*
╰───────────────➤
• .autobio  
• .autoreact  
• .autoreactstatus  
• .autoviewstatus  
• .autosavestatus  
• .autolike  
• .autocontactsave  

👥 *GROUP MODERATION*
╰───────────────➤
• .antilink  
• .welcome on / off  
• .goodbye on / off  
• .tagall  
• .promote  
• .demote  
• .groupinfo  
• .kick  
• .add  

🧠 *OTHER FEATURES*
╰───────────────➤
• .ping  
• .owner  
• .menu  
• .help  

╭───────❀🌸❀───────╮
   💖 *GIFTED-DAVE-MD TEAM* 💖
╰───────❀🌸❀───────╯
📸 Instagram:  
https://www.instagram.com/_gifted_dave/profilecard/?igsh=MWFjZHdmcm4zMGkzNw==  
📘 Facebook:  
https://www.facebook.com/Davlodavlo19  
📢 WhatsApp Channel:  
https://whatsapp.com/channel/0029VbApvFQ2Jl84lhONkc3k  
👥 WhatsApp Group:  
https://chat.whatsapp.com/CaPeB0sVRTrL3aG6asYeAC
    `.trim();

    await sock.sendMessage(jid, { text: menu });
  },
};
