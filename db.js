const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');
const fs = require('fs');

// Ensure ./data folder exists
const dataFolder = path.join(__dirname, 'data');
if (!fs.existsSync(dataFolder)) {
  fs.mkdirSync(dataFolder);
}

// Point to JSON file
const file = path.join(dataFolder, 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);

// Init data if empty
async function init() {
  await db.read();
  db.data ||= {
    sessions: [],
    toggles: {}
  };
  await db.write();
}

init();

module.exports = db;
