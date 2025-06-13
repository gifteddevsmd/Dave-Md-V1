// db.js
const { Low, JSONFile } = require('lowdb');
const path = require('path');
const fs = require('fs');

const dbFile = path.join(__dirname, 'db.json');
if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, '{}');

const adapter = new JSONFile(dbFile);
const db = new Low(adapter);

module.exports = db;
