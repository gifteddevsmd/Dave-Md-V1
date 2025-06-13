const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');

const adapter = new JSONFile('./db.json');
const db = new Low(adapter);

async function initDB() {
  await db.read();
  db.data ||= { toggles: {}, sessions: [] };
  await db.write();
}

initDB();

module.exports = db;
