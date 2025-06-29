//════════════════════════════════════════════════════//
//           DAVE-MD-V1 FETCH UTILS MODULE
//════════════════════════════════════════════════════//

const axios = require('axios');
const fetch = require('node-fetch');

/**
 * Fetches and returns JSON data from a given URL.
 * @param {string} url - URL to fetch JSON from.
 * @param {object} options - Axios options (headers, etc.)
 * @returns {Promise<Object|null>}
 */
const fetchJson = async (url, options = {}) => {
  try {
    const { data } = await axios.get(url, options);
    return data;
  } catch (err) {
    console.error('[❌ fetchJson Error]', err.message);
    return null;
  }
};

/**
 * Fetches and returns a raw buffer from a URL.
 * @param {string} url - Media or file URL.
 * @param {object} options - Request options.
 * @returns {Promise<Buffer|null>}
 */
const fetchBuffer = async (url, options = {}) => {
  try {
    const res = await fetch(url, options);
    return await res.buffer();
  } catch (err) {
    console.error('[❌ fetchBuffer Error]', err.message);
    return null;
  }
};

/**
 * Fetches and returns plain text from a URL.
 * @param {string} url
 * @param {object} options
 * @returns {Promise<string|null>}
 */
const fetchText = async (url, options = {}) => {
  try {
    const res = await fetch(url, options);
    return await res.text();
  } catch (err) {
    console.error('[❌ fetchText Error]', err.message);
    return null;
  }
};

// Global API base
global.api = 'https://api.maher-zubair.xyz/';
global.id = '30ad0d748059aee58dd';

// Auto reload
const fs = require('fs');
const chalk = require('chalk');
let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`🔄 '${__filename}' updated.`));
  delete require.cache[file];
  require(file);
});

module.exports = {
  fetchJson,
  fetchBuffer,
  fetchText
};
