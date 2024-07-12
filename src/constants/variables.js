const MARKET1 = process.argv[2];
const MARKET2 = process.argv[3];
const MARKET = `${MARKET1}${MARKET2}`;
const BUY_ORDER = Number(process.argv[4]);
const FIRST_OPERATION = process.argv[5] !== 'resume' ? true : false;
const SLEEP_TIME = Number(process.env.SLEEP_TIME || 5000);
const BOT_ID = process.argv[6];
const TAKE_PROFIT_BOT = process.env.TAKE_PROFIT_BOT || '3';
const MIN_WITHDRAW_AMOUNT = process.env.MIN_WITHDRAW_AMOUNT || '10';
const STOP_LOSS_BOT = Number(process.env.STOP_LOSS_BOT || 10);
const BUY_PERCENT = Number(process.env.BUY_PERCENT || 0.1);
const NOTIFY_TELEGRAM = process.env.NOTIFY_TELEGRAM || 0;
const NOTIFY_TELEGRAM_ON = process.env.NOTIFY_TELEGRAM_ON || 'sell,buy';
const SELL_PERCENT = Number(process.env.SELL_PERCENT || 0.3);
const STOP_LOSS_GRID = Number(process.env.STOP_LOSS_GRID || 0.6);
const WITHDRAW_PROFITS = process.env.WITHDRAW_PROFITS || 0;
const SELL_ALL_ON_CLOSE = process.env.SELL_ALL_ON_CLOSE || false;
const SELL_ALL_ON_START = process.env.SELL_ALL_ON_START || true;
const STOP_LOSS_GRID_IS_FIFO = process.env.STOP_LOSS_GRID_IS_FIFO || false;
const USE_STOP_LOSS_GRID = process.env.USE_STOP_LOSS_GRID || false;
const START_AGAIN = process.env.START_AGAIN || 0;
const DEFAULT_WITHDRAW_NETWORK = process.env.DEFAULT_WITHDRAW_NETWORK || 'BSC';
const WITHDRAW_ADDRESS_BUSD = process.env.WITHDRAW_ADDRESS_BUSD;
const WITHDRAW_ADDRESS_USDT = process.env.WITHDRAW_ADDRESS_USDT;

module.exports = {
  MARKET1,
  MARKET2,
  MARKET,
  BUY_ORDER,
  FIRST_OPERATION,
  SLEEP_TIME,
  BOT_ID,
  TAKE_PROFIT_BOT,
  MIN_WITHDRAW_AMOUNT,
  STOP_LOSS_BOT,
  BUY_PERCENT,
  NOTIFY_TELEGRAM,
  NOTIFY_TELEGRAM_ON,
  SELL_PERCENT,
  STOP_LOSS_GRID,
  WITHDRAW_PROFITS,
  SELL_ALL_ON_CLOSE,
  SELL_ALL_ON_START,
  STOP_LOSS_GRID_IS_FIFO,
  USE_STOP_LOSS_GRID,
  START_AGAIN,
  DEFAULT_WITHDRAW_NETWORK,
  WITHDRAW_ADDRESS_USDT,
  WITHDRAW_ADDRESS_BUSD
};
