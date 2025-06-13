import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'

const adapter = new JSONFile('./database.json')
const db = new Low(adapter)
await db.read()

db.data ||= {
  users: {},
  chats: {},
  settings: {},
  sessions: {},
  statistic: {},
  game: {},
  others: {},
  sticker: {},
  dashboard: {},
  message: {},
  jadibot: {},
  tos: {},
  anonymous: {},
  blockcmd: [],
  cmdmedia: {},
  queque: {},
  premium: {},
  name: {},
  autobio: {},
  ban: {},
  badword: [],
  viewOnce: [],
  expired: [],
  audio: {},
  public: true,
  restrict: false,
  self: false,
  autoreadsw: false,
  autoblockcmd: false,
  autoblok212: false,
  gamewaktu: 60,
  jadibotwaktu: 60,
  debug: false,
  auto: {
    autoreactstatus: true,
    autoreactmessages: true,
    autosavestatus: true,
    autoviewstatus: true
  },
  anti: {
    antideletestatus: true
  },
  toggles: {}
}

await db.write()

export default db
