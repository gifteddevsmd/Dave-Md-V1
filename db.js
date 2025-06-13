const { Low } = require('lowdb')
const { JSONFile } = require('lowdb/node')

const adapter = new JSONFile('./database.json')
const db = new Low(adapter)

async function init() {
  await db.read()
  db.data ||= {
    toggles: {},
    // your other default fields...
  }
  await db.write()
}

init()

module.exports = db
