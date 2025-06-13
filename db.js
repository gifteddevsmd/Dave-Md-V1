const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const fs = require('fs');

const adapter = new JSONFile('./database.json');
const db = new Low(adapter);

async function initializeDB() {
  if (!fs.existsSync('./database.json')) {
    fs.writeFileSync('./database.json', JSON.stringify({ toggles: {}, sessions: [] }, null, 2));
  }

  await db.read();
  db.data ||= { toggles: {}, sessions: [] };
  await db.write();
}

initializeDB(); // run setup but don't export promise

module.exports = db;
