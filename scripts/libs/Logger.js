const chalk = require('chalk');
const { format } = require('util');

const MOVE_LEFT = Buffer.from('1b5b3130303044', 'hex').toString();
const MOVE_UP = Buffer.from('1b5b3141', 'hex').toString();
const CLEAR_LINE = Buffer.from('1b5b304b', 'hex').toString();

const cError = console.error;

const internal = {
  tasks: [],
  logged: false,
  spinned: false,

  checkMs() {
    if (this.spinned) {
      const clearMsLines = [];

      // Tasks lines, plus space lines in between
      for (let i = 0; i < this.tasks.length + 1; i++) {
        clearMsLines.push(MOVE_LEFT + CLEAR_LINE);
      }
      console.log(clearMsLines.join(MOVE_UP) + MOVE_UP);

      this.spinned = false;
    }
  },

  log(msg) {
    this.checkMs();

    console.log(msg);

    this.logged = true;
  },

  error(err, spinner) {
    if (!err) {
      return false;
    }

    this.checkMs();

    console.log('');
    if (this.spinners && spinner) {
      const time = (new Date()).toLocaleString();
      console.log(`${chalk.white.bold.bgRed(`ERROR in the ${spinner} runner`)} | ${time}`);
    }
    cError(err);
    console.log('');

    this.logged = true;
    return true;
  },
};

// We need to capture any calls to console.error from outside of the available
// hooks and events.
console.error = (...args) => {
  // Unfortunately we can't know exactly what called this (stack traces are too broad)
  // so we can't assign this to a particular spinner.
  internal.error(format(...args), 'global process');
};

module.exports = {
  initialize(tasks) {
    internal.tasks = tasks;
    internal.spinners = process.env.SERVER_MODE === 'simple';
  },

  log(msg) {
    internal.log(msg);
  },

  error(err, spinner) {
    return internal.error(err, spinner);
  },

  logged(logged) {
    if (logged !== undefined) {
      internal.logged = logged;
    }

    return internal.logged;
  },

  spinned(spinned) {
    if (spinned !== undefined) {
      internal.spinned = spinned;
    }

    return internal && internal.spinned;
  },
};
