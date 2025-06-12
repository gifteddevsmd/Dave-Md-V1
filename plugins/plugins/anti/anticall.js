module.exports = {
  name: "anticall",
  description: "Block users who call the bot",
  type: "anti",
  onCall: async (sock, callInfo) => {
    const jid = callInfo.from;
    await sock.sendMessage(jid, {
      text: `🚫 Please do not call this bot. You will be blocked.`,
    });
    await sock.updateBlockStatus(jid, "block");
  },
};
