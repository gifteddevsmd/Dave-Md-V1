// db.js
const { Low, JSONFile } = require('lowdb');
const path = require('path');
const fs = require('fs');

// Ensure db.json exists
const dbFile = path.join(__dirname, 'db.json');
if (!fs.existsSync(dbFile)) {
  fs.writeFileSync(dbFile, JSON.stringify({
    sessions: [],
    toggles: {}
  }, null, 2));
}

// Set up lowdb
const adapter = new JSONFile(dbFile);
const db = new Low(adapter);

// Auto-load and initialize default structure
async function initDB() {
  await db.read();
  db.data ||= {};
  db.data.sessions ||= [];
  db.data.toggles ||= {};
  await db.write();
}

initDB();

module.exports = db;
