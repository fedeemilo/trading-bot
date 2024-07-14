const { MARKET1, MARKET2, BUY_ORDER } = require('../constants/variables');
const { log } = require('../utils/logger');

class BotLogger {
  logBuying(price) {
    log(`
            Buying ${MARKET1}
            ==================
            amountIn: ${parseFloat(BUY_ORDER.toFixed(2))} ${MARKET2}
            amountOut: ${BUY_ORDER / price} ${MARKET1}
        `);
  }
}

module.exports = BotLogger;
