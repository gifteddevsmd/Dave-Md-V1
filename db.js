const { Low, JSONFile } = require('lowdb');
const path = require('path');
const fs = require('fs');

// Path to your database file
const dbFile = path.join(__dirname, 'database.json');

// Ensure file exists
if (!fs.existsSync(dbFile)) {
  fs.writeFileSync(dbFile, JSON.stringify({ toggles: {} }, null, 2));
}

const adapter = new JSONFile(dbFile);
const db = new Low(adapter);

// Read data
async function init() {
  await db.read();
  db.data ||= { toggles: {} };
  await db.write();
}
init();

module.exports = db;
