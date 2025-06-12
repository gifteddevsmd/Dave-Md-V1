const fs = require("fs");
const path = require("path");

const SESSION_PATH = path.join(__dirname, "..", "session", "creds.json");

function saveAuthState(state) {
  fs.mkdirSync(path.dirname(SESSION_PATH), { recursive: true });
  fs.writeFileSync(SESSION_PATH, JSON.stringify(state, null, 2));
}

function loadAuthState() {
  if (fs.existsSync(SESSION_PATH)) {
    const state = JSON.parse(fs.readFileSync(SESSION_PATH, "utf-8"));
    return state;
  }
  return null;
}

module.exports = { saveAuthState, loadAuthState };
