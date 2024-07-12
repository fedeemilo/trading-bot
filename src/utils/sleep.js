const sleep = timeMs => new Promise(resolve => setTimeout(resolve, timeMs));

module.exports = { sleep };
