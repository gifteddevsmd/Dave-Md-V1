module.exports = {
  name: 'anticall',
  description: 'Blocks users who call the bot',
  event: 'CB:call',
  execute: async (sock, msg) => {
    const callerId = msg.content[0]?.attrs?.from || 'Unknown';
    await sock.sendMessage(callerId, {
      text: '🚫 Please don’t call the bot. You will be blocked if you continue.',
    });
    // Optionally block user
    await sock.updateBlockStatus(callerId, 'block');
  }
};
