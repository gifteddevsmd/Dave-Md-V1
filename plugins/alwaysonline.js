module.exports = {
  name: "alwaysonline",
  description: "Keeps bot always online",
  type: "presence",
  enabled: true,
  execute: async (sock) => {
    setInterval(() => {
      sock.sendPresenceUpdate('available');
    }, 10000); // Update every 10 seconds
  }
};
