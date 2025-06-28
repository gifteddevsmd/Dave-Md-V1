module.exports = {
  name: 'ping',
  alias: ['speed', 'speedtest', 'pong'],
  category: 'utility',
  desc: 'Check bot response time',
  use: '',

  async exec(m, sock) {
    const start = new Date().getTime();
    const msg = await m.reply('🏓 Testing speed...');
    const end = new Date().getTime();

    let ping = end - start;

    await sock.sendMessage(m.chat, {
      text: `🏓 *Pong!*\n⚡ *Dave-Md-V1 Speed:* ${ping}ms`,
      edit: msg.key
    });
  }
};
