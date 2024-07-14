const {
  MARKET2,
  BUY_ORDER,
  MARKET1,
  SELL_PERCENT,
  STOP_LOSS_GRID
} = require('../constants/variables');

class Market {
  constructor(store, colors, botLogger) {
    this.store = store;
    this.colors = colors;
    this.botLogger = botLogger;
  }

  get market2Balance() {
    return parseFloat(this.store.get(`${MARKET2.toLowerCase()}_balance`));
  }

  get orders() {
    return this.store.get('orders');
  }

  async buy(price, amount) {
    const currentBalance = this.market2Balance;

    try {
      if (currentBalance >= BUY_ORDER) {
        let orders = this.orders;
        let sellFactor = (SELL_PERCENT * price) / 100;
        let slFactor = (STOP_LOSS_GRID * price) / 100;

        const order = {
          id: 0,
          buy_price: price,
          sell_price: price + sellFactor,
          sl_price: price - slFactor,
          sold_price: 0,
          status: 'pending',
          profit: 0,
          buy_fee: 0,
          sell_fee: 0,
          amount: 0
        };

        this.botLogger.logBuying(price);

        const res = await marketBuy(amount, true);
        if (res && res.status === 'FILLED') {
          buySellSound();
          order.status = 'bought';
          order.id = res.orderId;
          order.buy_fee = parseFloat(await getFees(res.fills[0]));
          order.amount = res.executedQty - res.fills[0].commission;
          store.put('fees', parseFloat(store.get('fees')) + order.buy_fee);
          order.buy_price = parseFloat(res.fills[0].price);

          orders.push(order);
          store.put('start_price', order.buy_price);
          await _updateBalances();

          const totalCost = order.amount * order.buy_price;

          logColor(colors.green, '=============================');
          logColor(
            colors.green,
            `Bought ${order.amount} ${MARKET1} for ${parseFloat(
              BUY_ORDER.toFixed(2)
            )} ${MARKET2}, Price: ${order.buy_price}, Total Cost: ${totalCost.toFixed(
              2
            )} ${MARKET2}\n`
          );
          logColor(colors.green, '=============================');

          await _calculateProfits();

          _notifyTelegram(price, 'buy');
        } else _newPriceReset(2, BUY_ORDER, price);
      } else _newPriceReset(2, BUY_ORDER, price);
    } catch (error) {
      logColor(colors.red, JSON.parse(error.body).msg);
    }
  }

  async sell(price) {
    // Lógica adaptada de _sell
  }

  // Métodos auxiliares como _updateBalances, _calculateProfits, etc.
}

module.exports = Market;
