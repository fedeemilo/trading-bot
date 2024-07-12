const client = require('../services/binance');
const { store } = require('../services/store');
const {
  MARKET,
  MARKET1,
  MARKET2,
  BUY_ORDER,
  SLEEP_TIME,
  NOTIFY_TELEGRAM_ON,
  SELL_PERCENT,
  STOP_LOSS_GRID,
  DEFAULT_WITHDRAW_NETWORK,
  WITHDRAW_ADDRESS_BUSD,
  WITHDRAW_ADDRESS_USDT,
  STOP_LOSS_GRID_IS_FIFO,
  USE_STOP_LOSS_GRID,
  NOTIFY_TELEGRAM
} = require('../constants/variables');
const { log, logColor, colors } = require('./logger');
const { buySellSound } = require('./sound');
const { NotifyTelegram } = require('../services/TelegramNotify');
const moment = require('moment');
const { sleep } = require('./sleep');
const readline = require('readline');
const fs = require('fs');

function elapsedTime() {
  const diff = Date.now() - store.get('start_time');
  var diffDays = diff / 86400000;
  diffDays = diffDays < 1 ? 0 : diffDays;
  return diffDays + '' + moment.utc(diff).format('HH:mm:ss');
}

const _newPriceReset = (_market, balance, price) => {
  const market = _market === 1 ? MARKET1 : MARKET2;
  if (!(parseFloat(store.get(`${market.toLowerCase()}_balance`)) > balance))
    store.put('start_price', price);
};

const getBalances = async () => {
  const assets = [MARKET1, MARKET2];
  const { balances } = await client.accountInfo();
  const _balances = balances.filter(coin => assets.includes(coin.asset));
  let parsedBalances = {};
  assets.forEach(asset => {
    const coin = _balances.find(coin => coin.asset === asset);
    parsedBalances[asset] = coin ? parseFloat(coin.free) : 0;
  });
  return parsedBalances;
};

const getPrice = async symbol => {
  return parseFloat((await client.prices({ symbol }))[symbol]);
};

const getQuantity = async amount => {
  const { symbols } = await client.exchangeInfo({ symbol: MARKET });
  const { stepSize } = symbols[0].filters.find(
    filter => filter.filterType === 'LOT_SIZE'
  );
  let quantity = (amount / stepSize).toFixed(symbols[0].baseAssetPrecision);

  if (amount % stepSize !== 0) {
    quantity = (parseInt(quantity) * stepSize).toFixed(symbols[0].baseAssetPrecision);
  }

  return quantity;
};

async function getMinBuy() {
  const { symbols } = await client.exchangeInfo({ symbol: MARKET });
  const { minNotional } = symbols[0].filters.find(
    filter => filter.filterType === 'NOTIONAL'
  );

  return parseFloat(minNotional);
}

async function withdraw(profits, price) {
  await _sellAll();
  console.log('Procesando retiro...');
  await sleep(SLEEP_TIME * 2);

  await client.withdraw({
    coin: MARKET2,
    network: DEFAULT_WITHDRAW_NETWORK,
    address: MARKET2 === 'BUSD' ? WITHDRAW_ADDRESS_BUSD : WITHDRAW_ADDRESS_USDT,
    amount: profits
  });

  store.put('withdrawal_profits', parseFloat(store.get('withdrawal_profits')) + profits);
  console.log('Cerrando bot...');
  await sleep(SLEEP_TIME * 2);
  _notifyTelegram(price, 'withdraw');
}

const _updateBalances = async () => {
  const balances = await getBalances();
  store.put(`${MARKET1.toLowerCase()}_balance`, balances[MARKET1]);
  store.put(`${MARKET2.toLowerCase()}_balance`, balances[MARKET2]);
};

const _calculateProfits = async () => {
  const orders = store.get('orders');
  const sold = orders.filter(order => order.status === 'sold');

  const totalSoldProfits =
    sold.length > 0
      ? sold
          .map(order => order.profit)
          .reduce((prev, next) => parseFloat(prev) + parseFloat(next))
      : 0;

  store.put('profits', totalSoldProfits + parseFloat(store.get('profits')));
};

function getRealProfits(price) {
  const m1Balance = parseFloat(store.get(`${MARKET1.toLowerCase()}_balance`));
  const m2Balance = parseFloat(store.get(`${MARKET2.toLowerCase()}_balance`));

  const initialBalance1 = parseFloat(
    store.get(`initial_${MARKET1.toLowerCase()}_balance`)
  );
  const initialBalance2 = parseFloat(
    store.get(`initial_${MARKET2.toLowerCase()}_balance`)
  );

  return parseFloat(
    ((m1Balance - initialBalance1) * price + m2Balance - initialBalance2).toFixed(4)
  );
}

const _logProfits = async price => {
  const profits = parseFloat(store.get('profits'));
  const isGainerProfit = profits > 0 ? 1 : profits < 0 ? 2 : 0;

  logColor(
    isGainerProfit == 1 ? colors.green : isGainerProfit == 2 ? colors.red : colors.gray,
    `Grid Profits (Incl. fees): ${parseFloat(store.get('profits')).toFixed(4)} ${MARKET2}`
  );

  const m1Balance = parseFloat(store.get(`${MARKET1.toLowerCase()}_balance`));
  const m2Balance = parseFloat(store.get(`${MARKET2.toLowerCase()}_balance`));

  const initialBalance = parseFloat(
    store.get(`initial_${MARKET2.toLowerCase()}_balance`)
  );

  logColor(
    colors.gray,
    `Balance: ${m1Balance} ${MARKET1}, ${m2Balance.toFixed(2)} ${MARKET2}`
  );
  logColor(
    colors.gray,
    `Current: ${parseFloat(
      (m1Balance * price + m2Balance).toFixed(2)
    )} ${MARKET2}, Initial: ${initialBalance.toFixed(2)} ${MARKET2}`
  );
};

async function getFees({ commission, commissionAsset }) {
  if (commissionAsset === MARKET2) return commission;
  const price = await getPrice(MARKET);
  return price * commission;
}

async function marketOrder(side, amount, quoted) {
  const orderObject = {
    symbol: MARKET,
    side: side,
    type: 'MARKET'
  };

  if (quoted) orderObject['quoteOrderQty'] = amount;
  else orderObject['quantity'] = amount;

  return await client.order(orderObject);
}

async function marketBuy(amount, quoted) {
  return await marketOrder('BUY', amount, quoted);
}

async function marketSell(amount) {
  return await marketOrder('SELL', amount);
}

async function clearStart() {
  await _closeBot();
  const balances = await getBalances();
  const totalAmount = balances[MARKET1];
  const price = await getPrice(MARKET);
  const minSell = (await getMinBuy()) / price;
  if (totalAmount >= parseFloat(minSell)) {
    try {
      const lotQuantity = await getQuantity(totalAmount);
      const res = await marketSell(lotQuantity);
      if (res && res.status === 'FILLED') {
        logColor(colors.green, 'Iniciando en modo limpio...');
        await sleep(3000);
      } else {
        logFail();
      }
    } catch (err) {
      logFail();
    }
  }
}

async function _sellAll() {
  await sleep(3000);
  const balances = await getBalances();
  const totalAmount = balances[MARKET1];
  if (totalAmount > 0) {
    try {
      const lotQuantity = await getQuantity(totalAmount);
      const res = await marketSell(lotQuantity);
      if (res && res.status === 'FILLED') {
        logColor(colors.green, 'Bot detenido correctamente: Todo vendido');
      } else {
        logFail();
      }
    } catch (err) {}
  }
}

function logFail() {
  logColor(colors.red, 'No se ha podido vender el saldo inicial.');
  logColor(colors.red, 'Debes venderlo manualmente en Binance.');
  process.exit();
}

async function _closeBot() {
  try {
    fs.unlinkSync(`./data/${MARKET}.json`);
  } catch (ee) {}
}

function getOrderId() {
  const fifoStrategy = STOP_LOSS_GRID_IS_FIFO;
  const orders = store.get('orders');
  const index = fifoStrategy ? 0 : orders.length - 1;

  return store.get('orders')[index].id;
}

function getToSold(price, changeStatus) {
  const orders = store.get('orders');
  const toSold = [];

  for (var i = 0; i < orders.length; i++) {
    let order = orders[i];
    if (
      price >= order.sell_price ||
      (USE_STOP_LOSS_GRID &&
        getOrderId() === order.id &&
        store.get(`${MARKET2.toLowerCase()}_balance`) < BUY_ORDER &&
        price < order.sl_price)
    ) {
      if (changeStatus) {
        order.sold_price = price;
        order.status = 'selling';
      }
      toSold.push(order);
    }
  }

  return toSold;
}

function canNotifyTelegram(from) {
  return NOTIFY_TELEGRAM_ON.includes(from);
}

function _notifyTelegram(price, from) {
  moment.locale('es');
  if (NOTIFY_TELEGRAM && canNotifyTelegram(from))
    NotifyTelegram({
      runningTime: elapsedTime(),
      market: MARKET,
      market1: MARKET1,
      market2: MARKET2,
      price,
      balance1: store.get(`${MARKET1.toLowerCase()}_balance`),
      balance2: store.get(`${MARKET2.toLowerCase()}_balance`),
      gridProfits: parseFloat(store.get('profits')).toFixed(4),
      realProfits: getRealProfits(price),
      start: moment(store.get('start_time')).format('DD/MM/YYYY HH:mm'),
      from
    });
}

const _buy = async (price, amount) => {
  const currentBalance = parseFloat(store.get(`${MARKET2.toLowerCase()}_balance`));

  try {
    if (currentBalance >= BUY_ORDER) {
      let orders = store.get('orders');
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

      log(`
      Buying ${MARKET1}
      ==================
      amountIn: ${parseFloat(BUY_ORDER.toFixed(2))} ${MARKET2}
      amountOut: ${BUY_ORDER / price} ${MARKET1}
  `);

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
};

const _sell = async price => {
  const orders = store.get('orders');
  const toSold = getToSold(price, true);

  if (toSold.length > 0) {
    let totalAmount = parseFloat(
      toSold
        .map(order => order.amount)
        .reduce((prev, next) => parseFloat(prev) + parseFloat(next))
    );

    const balance = parseFloat(store.get(`${MARKET1.toLowerCase()}_balance`));
    totalAmount = totalAmount > balance ? balance : totalAmount;

    try {
      if (totalAmount > 0) {
        log(`Selling ${MARKET1}
                ==================
                amountIn: ${totalAmount.toFixed(2)} ${MARKET1}
                amountOut: ${parseFloat((totalAmount * price).toFixed(2))} ${MARKET2}`);

        const lotQuantity = await getQuantity(totalAmount);
        const res = await marketSell(Number(lotQuantity));
        if (res && res.status === 'FILLED') {
          buySellSound();
          const _price = parseFloat(res.fills[0].price);

          for (let i = 0; i < orders.length; i++) {
            let order = orders[i];
            for (let j = 0; j < toSold.length; j++) {
              if (order.id === toSold[j].id) {
                toSold[j].profit =
                  parseFloat(toSold[j].amount) * _price -
                  parseFloat(toSold[j].amount) * parseFloat(toSold[j].buy_price);

                toSold[j].profit -= order.sell_fee + order.buy_fee;
                toSold[j].sell_fee = parseFloat(await getFees(res.fills[0]));
                toSold[j].status = 'sold';
                orders[i] = toSold[j];
                store.put('fees', parseFloat(store.get('fees')) + orders[i].sell_fee);
                store.put(
                  'sl_losses',
                  parseFloat(store.get('sl_losses')) + orders[i].profit
                );
              }
            }
          }

          store.put('start_price', _price);
          await _updateBalances();

          logColor(colors.red, '=============================');
          log(
            `Sold ${totalAmount} ${MARKET1} for ${parseFloat(
              (totalAmount * _price).toFixed(2)
            )} ${MARKET2}, Price: ${_price}\n`
          );
          logColor(colors.red, '=============================');

          await _calculateProfits();

          let i = orders.length;

          while (i--)
            if (orders[i].status === 'sold') {
              orders.splice(i, 1);
            }
          _notifyTelegram(price, 'sell');
        } else store.put('start_price', price);
      } else store.put('start_price', price);
    } catch (error) {
      console.log({ error });
      // logColor(colors.red, error.message);
    }
  }

  return toSold.length > 0;
};

const askToCloseBot = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const userResponse = new Promise(resolve => {
    rl.question('¿Desea terminar el bot? (s/n): ', respuesta => {
      rl.close();
      resolve(respuesta.trim().toLowerCase() === 's');
    });
  });

  const timeout = new Promise(resolve => {
    setTimeout(() => {
      console.log('\nNo se recibió respuesta. Continuando...');
      resolve(false);
    }, 10000);
  });

  return Promise.race([userResponse, timeout]);
};

module.exports = {
  _logProfits,
  _buy,
  _sell,
  _updateBalances,
  elapsedTime,
  getPrice,
  getRealProfits,
  _closeBot,
  _sellAll,
  getToSold,
  clearStart,
  withdraw,
  getMinBuy,
  getBalances,
  askToCloseBot
};
