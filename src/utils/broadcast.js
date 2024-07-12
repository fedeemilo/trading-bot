const {
  BUY_PERCENT,
  MIN_WITHDRAW_AMOUNT,
  SELL_ALL_ON_CLOSE,
  START_AGAIN,
  STOP_LOSS_BOT,
  STOP_LOSS_GRID,
  STOP_LOSS_GRID_IS_FIFO,
  TAKE_PROFIT_BOT,
  USE_STOP_LOSS_GRID,
  WITHDRAW_PROFITS,
  SLEEP_TIME,
  MARKET,
  BUY_ORDER,
  MARKET2,
  MARKET1
} = require('../constants/variables');

const { store } = require('../services/store');
const { colors, log, logColor } = require('./logger');
const {
  _logProfits,
  _sell,
  _buy,
  _updateBalances,
  getPrice,
  getRealProfits,
  withdraw,
  _closeBot,
  _sellAll,
  elapsedTime,
  getToSold
} = require('./market');

const { sleep } = require('./sleep');
const { increaseProfitsSound } = require('./sound');

const broadcast = async () => {
  while (true) {
    try {
      _updateBalances();
      const mPrice = await getPrice(MARKET);
      if (mPrice) {
        const startPrice = store.get('start_price');
        const marketPrice = mPrice;

        console.clear();
        logColor(colors.yellow, MARKET1);
        log(`Running Time: ${elapsedTime()}`);
        log('===========================================================');
        const totalProfits = getRealProfits(marketPrice);

        if (!isNaN(totalProfits)) {
          const totalProfitsPercent = parseFloat(
            (
              (100 * totalProfits) /
              store.get(`initial_${MARKET2.toLowerCase()}_balance`)
            ).toFixed(3)
          );
          log(
            `Withdrawal profits: ${parseFloat(store.get('withdrawal_profits')).toFixed(
              2
            )} ${MARKET2}`
          );
          logColor(
            totalProfits < 0
              ? colors.red
              : totalProfits == 0
              ? colors.gray
              : colors.green,
            `Real Profits [SL = ${STOP_LOSS_BOT}%, TP = ${TAKE_PROFIT_BOT}%]: ${totalProfitsPercent}% ==> ${
              totalProfits <= 0 ? '' : '+'
            }${parseFloat(totalProfits.toFixed(3))} ${MARKET2}`
          );

          if (totalProfitsPercent >= parseFloat(TAKE_PROFIT_BOT)) {
            logColor(colors.green, 'Cerrando bot en ganancias....');
            increaseProfitsSound();
            if (SELL_ALL_ON_CLOSE) {
              if (WITHDRAW_PROFITS && totalProfits >= parseFloat(MIN_WITHDRAW_AMOUNT)) {
                await withdraw(totalProfits, marketPrice);
                if (START_AGAIN) {
                  await sleep(5000);
                  await _updateBalances();
                } else {
                  await _closeBot();
                  return;
                }
              } else {
                await _sellAll();
                await _closeBot();

                return;
              }
            } else {
              return;
            }
          } else if (totalProfitsPercent <= -1 * STOP_LOSS_BOT) {
            logColor(colors.red, 'Cerrando bot en pérdidas....');
            if (SELL_ALL_ON_CLOSE) await _sellAll();

            await _closeBot();
            return;
          }
        }

        _logProfits(marketPrice);
        const entryPrice = store.get('entry_price');
        const entryFactor = marketPrice - entryPrice;
        const entryPercent = parseFloat(((100 * entryFactor) / entryPrice).toFixed(2));
        log(
          `Entry price: ${store.get('entry_price')} ${MARKET2} (${
            entryPercent <= 0 ? '' : '+'
          }${entryPercent}%)`
        );
        log('===========================================================');

        log(`Prev price: ${startPrice} ${MARKET2}`);

        if (marketPrice < startPrice) {
          let factor = startPrice - marketPrice;
          let percent = parseFloat(((100 * factor) / startPrice).toFixed(2));

          logColor(
            colors.red,
            `New price: ${marketPrice} ${MARKET2} ==> -${parseFloat(percent.toFixed(3))}%`
          );
          store.put('percent', `-${parseFloat(percent.toFixed(3))}`);

          if (percent >= BUY_PERCENT) await _buy(marketPrice, BUY_ORDER);
        } else {
          const factor = marketPrice - startPrice;
          const percent = (100 * factor) / marketPrice;

          logColor(
            colors.green,
            `New price: ${marketPrice} ${MARKET2} ==> +${parseFloat(percent.toFixed(3))}%`
          );
          store.put('percent', `+${parseFloat(percent.toFixed(3))}`);

          const toSold = getToSold(marketPrice);
          if (toSold.length === 0) store.put('start_price', marketPrice);
        }

        await _sell(marketPrice);

        const orders = store.get('orders');
        if (orders.length > 0) {
          const bOrder = orders[orders.length - 1];
          console.log();
          log('Last buy order');
          console.log('==========================');
          log(`Buy price: ${bOrder.buy_price} ${MARKET2}`);
          log(`Sell price: ${bOrder.sell_price} ${MARKET2}`);

          if (USE_STOP_LOSS_GRID) {
            const slStrategy = STOP_LOSS_GRID_IS_FIFO ? 'FIFO' : 'LIFO';
            log(`SL price: ${bOrder.sl_price} ${MARKET2}, Strategy: ${slStrategy}`);
            log(
              `SL losses: ${parseFloat(store.get('sl_losses')).toFixed(
                3
              )}, Trigger price down: ${STOP_LOSS_GRID}%`
            );
          }

          log(`Order amount: ${BUY_ORDER} ${MARKET2} ==> ${bOrder.amount} ${MARKET1}`);

          const expectedProfits = parseFloat(
            (
              bOrder.amount * bOrder.sell_price -
              bOrder.amount * bOrder.buy_price -
              bOrder.buy_fee
            ).toFixed(3)
          );
          if (expectedProfits >= 0)
            logColor(colors.green, `Expected profit: +${expectedProfits} ${MARKET2}`);
          else logColor(colors.red, `Expected profit: ${expectedProfits} ${MARKET2}`);

          console.log('==========================');
        }
      }
    } catch (error) {
      console.log(error);
    }
    await sleep(SLEEP_TIME);
  }
};

module.exports = broadcast;
