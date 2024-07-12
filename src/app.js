const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const { getMinBuy, getPrice, getBalances, clearStart } = require('./utils/market');
const {
  MARKET1,
  MARKET2,
  MARKET,
  FIRST_OPERATION,
  BUY_ORDER,
  SELL_ALL_ON_START
} = require('./constants/variables');
const { store } = require('./services/store');
const broadcast = require('./utils/broadcast');
const { log } = require('./utils/logger');

async function init() {
  const minBuy = await getMinBuy();
  if (minBuy > BUY_ORDER) {
    console.log(`El lote mínimo de compra es: ${minBuy} ${MARKET2}`);
    return;
  }

  if (FIRST_OPERATION) {
    try {
      log('Iniciando bot...');
      if (SELL_ALL_ON_START) await clearStart();
      const startTime = Date.now();
      store.put('start_time', startTime);
      const price = await getPrice(MARKET);
      store.put('start_price', price);
      store.put('orders', []);
      store.put('profits', 0);
      store.put('sl_losses', 0);
      store.put('withdrawal_profits', 0);
      store.put('fees', 0);
      const balances = await getBalances();
      store.put('entry_price', price);
      store.put(`${MARKET1.toLowerCase()}_balance`, balances[MARKET1]);
      store.put(`${MARKET2.toLowerCase()}_balance`, balances[MARKET2]);
      store.put(
        `initial_${MARKET1.toLowerCase()}_balance`,
        store.get(`${MARKET1.toLowerCase()}_balance`)
      );
      store.put(
        `initial_${MARKET2.toLowerCase()}_balance`,
        store.get(`${MARKET2.toLowerCase()}_balance`)
      );
    } catch (error) {
      console.error('Se ha producido un error:', error.message);
    }
  }

  broadcast();
}

init();
