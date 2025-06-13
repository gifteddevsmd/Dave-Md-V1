const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');

const adapter = new JSONFile('./data.json');
const db = new Low(adapter);

// Ensure database is initialized
db.data ||= { sessions: [], toggles: {} };

module.exports = db;
