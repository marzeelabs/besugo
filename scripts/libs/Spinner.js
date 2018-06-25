const chalk = require('chalk');
const Multispinner = require('multispinner');
const Spinners = require('multispinner/lib/spinners');
const spinners = require('cli-spinners');

const Logger = require('./Logger');

// configurations
// eslint-disable-next-line
const hugoConfig = require('node-yaml').readSync('../../configs/hugo.yml');
const packageJson = require('../../package.json');

let internal = null;

class ConstantSpinner extends Multispinner {
  constructor(tasks) {
    // Initialize a Multispinner instance.
    super(tasks.reduce((acc, cur) => {
      // eslint-disable-next-line
      acc[cur[0]] = cur[1];
      return acc;
    }, {}), {
      autoStart: false,
      color: {
        incomplete: 'yellow',
        success: 'green',
        error: 'red',
      },
      frames: spinners.dots.frames,
      indent: 1,
      interval: spinners.dots.interval,
    });

    this.symbol.success = chalk.bold(this.symbol.success);
    this.symbol.error = chalk.bold(this.symbol.error);

    this._loop = this.loop;
    this.loop = function loop() {
      // No need to do anything in any remaining tasks if we're terminating the process.
      if (this.terminated) {
        return;
      }

      if (Logger.logged()) {
        // Make sure what we're printing is always visible by adding as many
        // new lines as many active spinners we have, otherwise these spinners would
        // cover the last printed lines.
        tasks.forEach(() => {
          console.log('');
        });

        Logger.logged(false);
      }

      Logger.spinned(true);
      this._loop();
    };

    // Multispinner doesn't support restarting a spinner once it's complete,
    // or even setting its text after initializing. Let's add those abilities.
    this._spinners = new Spinners(spinners, this.preText, this.postText);

    // Don't let Multispinner add a newline when all tasks are done, since we can restart them.
    this.update.done = () => {};

    // Keep an error state if a later task tries to change the spinner status without restarting it.
    this._success = this.success;
    this.success = function success(spinner) {
      if (this.spinners[spinner].state === 'error') {
        return;
      }

      this._success(spinner);
      this.text(spinner, chalk.bold('ready!'));
    };

    // Show a custom message when an error occurs on a spinner.
    this._error = this.error;
    this.error = function error(spinner, err) {
      if (err === true || Logger.error(err, spinner)) {
        this.text(spinner, chalk.bold('an error occurred, look for more details in the console above!'));
        this._error(spinner);
        return true;
      }

      return false;
    };

    // First Multispinner is not actually a spinner, it's just a message
    // for from where the project is served.
    Object.defineProperty(this.spinners.serve, 'current', {
      configurable: true,
      enumerable: true,

      get() {
        const str = chalk.bold(`${hugoConfig.title} served from ${chalk.cyan(`http://localhost:${packageJson.config.port}/`)}`);
        return ` ${str}`;
      },

      set() {
        return this.current;
      },
    });
    this.success('serve');
  }

  text(spinner, text) {
    // Keep an error state if a later task tries to change the spinner text.
    if (this.spinners[spinner].state === 'error') {
      return;
    }

    if (!this.spinners[spinner].originalText) {
      this.spinners[spinner].originalText = this.spinners[spinner].text;
    }

    let newText = chalk.white(this.spinners[spinner].originalText);
    if (text) {
      newText += chalk.white(': ') + text;
    }

    this.spinners[spinner].text = this._spinners.spinnerText(newText);
  }

  restart(spinner) {
    // We only need to restart looping if it's currently stopped, otherwise
    // we'll have multiple looping tasks and it will speed up and cause "lost frame" effects.
    const allCompleted = this.allCompleted();

    this.complete(spinner, 'incomplete');

    if (allCompleted) {
      this.start();
    }
  }
}

module.exports = {
  initialize(tasks) {
    internal = new ConstantSpinner(tasks);
  },

  initialized() {
    return !!internal;
  },

  start() {
    internal.start();
  },

  success(spinner) {
    internal.success(spinner);
  },

  text(spinner, text) {
    internal.text(spinner, text);
  },

  restart(spinner) {
    internal.restart(spinner);
  },

  error(spinner, error) {
    return internal.error(spinner, error);
  },

  terminate() {
    internal.terminated = true;
  },
};
