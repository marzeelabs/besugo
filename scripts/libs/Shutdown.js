const chalk = require('chalk');

const Logger = require('./Logger');
const Spinner = require('./Spinner');

// configurations
// eslint-disable-next-line
const hugoConfig = require('node-yaml').readSync('../../configs/hugo.yml');

const internal = {
  tasks: new Map(),

  initialize() {
    process.once('SIGINT', () => {
      this.shutdown();

      Logger.log(chalk.gray(` No longer serving ${hugoConfig.title}. See you soon! 🙃`));
    });

    process.once('SIGUSR2', () => {
      this.shutdown();

      // Erase existing Multispinner lines and show a friendly goodbye.
      Logger.log(chalk.grey(' Server is restarting...'));

      process.kill(process.pid, 'SIGUSR2');
    });
  },

  shutdown() {
    Spinner.terminate();

    // We can't use async promises to wait for these tasks to finish because
    // the process itself doesn't wait for us to end the terminal process.
    // But remaining hanging tasks can still print to the console, so we need
    // to prevent the Multispinner from reprinting useless spinners.
    // Yes, this is weird, something is wrong here, but this works well enough.
    // eslint-disable-next-line
    for (let run of this.tasks.values()) {
      try {
        run();
      }
      catch (ex) {
        Logger.error(ex);
      }
    }
  },
};

module.exports = {
  initialize() {
    internal.initialize();
  },

  set(name, task) {
    internal.tasks.set(name, task);
  },

  delete(name) {
    internal.tasks.delete(name);
  },
};
