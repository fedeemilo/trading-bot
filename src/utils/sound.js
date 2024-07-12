const { exec } = require('child_process');
const path = require('path');

const buySellPath = path.join(__dirname, '../sounds/buy_sell_sound.mp3');
const increaseProfitsPath = path.join(__dirname, '../sounds/increase_profits_sound.mp3');
const decreaseProfitsPath = path.join(__dirname, '../sounds/decrease_profits_sound.mp3');
const clousePath = path.join(__dirname, '../sounds/close_sound.mp3');

const playSound = path => {
  exec(`afplay ${path}`, err => {
    if (err) {
      console.error('Error al reproducir el sonido de venta:', err);
    }
  });
};

module.exports = {
  buySellSound: () => playSound(buySellPath),
  increaseProfitsSound: () => playSound(increaseProfitsPath),
  decreaseProfitsSound: () => playSound(decreaseProfitsPath),
  clouseSound: () => playSound(clousePath)
};
