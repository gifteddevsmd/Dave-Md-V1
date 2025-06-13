const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');

// Define the path to your database file
const dbFile = path.join(__dirname, 'data.json');

// Setup adapter and database
const adapter = new JSONFile(dbFile);
const db = new Low(adapter);

// Initialize the DB with default structure if empty
async function initDB() {
  await db.read();
  db.data ||= {
    toggles: {},     // Toggle features per chat/user
    sessions: []     // Stores session data: [{ number, pairCode }]
  };
  await db.write();
}

initDB();

module.exports = db;
