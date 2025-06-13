import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'

const adapter = new JSONFile('sessions.json')
const db = new Low(adapter)

await db.read()
db.data ||= { sessions: [] }
await db.write()

export default db
