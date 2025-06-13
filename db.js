const { Low } = require('lowdb')
const { JSONFile } = require('lowdb/node')
const fs = require('fs')

const adapter = new JSONFile('./database.json')
const db = new Low(adapter)

async function init() {
  // If database.json does not exist, create it with default content
  if (!fs.existsSync('./database.json')) {
    fs.writeFileSync('./database.json', JSON.stringify({ toggles: {} }, null, 2))
  }

  await db.read()
  db.data ||= { toggles: {} }
  await db.write()
}

init()

module.exports = db
