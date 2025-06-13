const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');
const fs = require('fs');

// Create 'data' folder if it doesn't exist
const folder = path.join(__dirname, 'data');
if (!fs.existsSync(folder)) fs.mkdirSync(folder);

// Setup db file
const file = path.join(folder, 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);

// Initialize db structure
async function initDB() {
  await db.read();
  db.data = db.data || {
    sessions: [],
    toggles: {}
  };
  await db.write();
}

initDB();

module.exports = db;
