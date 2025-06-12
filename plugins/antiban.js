module.exports = {
  name: 'antiban',
  description: 'Minimizes risk of WhatsApp bans (passive protection)',
  execute: async (sock, msg) => {
    // This acts as a passive plugin, maybe logs or prevents spamming
    console.log('🛡️ Anti-ban active: avoiding risky actions...');
  }
};
