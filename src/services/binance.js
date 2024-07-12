const Binance = require('binance-api-node').default;

const client = Binance({
  apiKey: process.env.BINANCE_APIKEY,
  apiSecret: process.env.BINANCE_SECRET,
  getTime: () => Date.now()
});

module.exports = client;
