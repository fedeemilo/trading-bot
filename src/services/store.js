const Storage = require('node-storage');
const { MARKET } = require('../constants/variables');

const store = new Storage(`./data/${MARKET}.json`);

module.exports = { store };
