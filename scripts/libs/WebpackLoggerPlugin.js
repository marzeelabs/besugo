// Borrowed heavily from https://github.com/michaelgilley/webpack-logger-plugin/

const { ProgressPlugin } = require('webpack');
const Spinner = require('./Spinner');

const internal = {
  plugins: new Map(),

  set(plugin) {
    this.plugins.set(plugin, {
      status: 'running',
      text: '',
    });
  },

  delete(plugin) {
    this.plugins.delete(plugin);
  },

  restart(active) {
    const activePlugin = this.plugins.get(active);
    activePlugin.status = 'running';

    // eslint-disable-next-line
    for (let p of this.plugins.keys()) {
      // The current plugin has been restarted, we have no need to check its current status.
      if (active === p) {
        continue;
      }

      // If another task is still running, so is the spinner.
      const plugin = this.plugins.get(p);
      if (plugin.status === 'running') {
        return;
      }
    }

    // Spin it!
    Spinner.restart('webpack');
  },

  text(active, text) {
    const activePlugin = this.plugins.get(active);
    activePlugin.text = text;
    Spinner.text('webpack', text);
  },

  success(active) {
    const activePlugin = this.plugins.get(active);
    if (activePlugin.status !== 'error') {
      activePlugin.status = 'success';
    }

    // The spinner only stops if all webpack tasks have ended.
    // eslint-disable-next-line
    for (let plugin of this.plugins.values()) {
      if (plugin.status === 'error') {
        Spinner.error('webpack', true);
        return;
      }
      if (plugin.status === 'running') {
        Spinner.text('webpack', plugin.text);
        return;
      }
    }

    Spinner.success('webpack');
  },

  error(active, err) {
    if (Spinner.error('webpack', err)) {
      const activePlugin = this.plugins.get(active);
      activePlugin.status = 'error';
    }
  },
};

module.exports = class WebpackLoggerPlugin {
  constructor() {
    // Register this plugin (webpack task) with the spinner, so it knows
    // how many tasks there are active and running at any time.
    internal.set(this);
  }

  apply(compiler) {
    const getProgressMsg = (msg) => {
      if (!msg) {
        return null;
      }

      // I... forgot where I got these messages from... Some other webpack plugin that
      // did something similar, but now I can't find it. I'm sure it'll turn up if I
      // need it again and look really hard.
      if (msg === 'compile') {
        return 'scanning...';
      }
      if (msg.indexOf('build') >= 0) {
        return 'building modules...';
      }
      if (msg.indexOf('chunk asset') >= 0) {
        return 'optimizing...';
      }
      if (msg === 'asset optimization') {
        return 'packing up assets...';
      }
      if (msg === 'hashing') {
        return 'hashing modules...';
      }
      if (msg.indexOf('emit') >= 0) {
        return 'writing to disk...';
      }
      return msg;
    };

    const onProgress = (percent, msg) => {
      internal.text(this, getProgressMsg(msg));
    };

    const progress = new ProgressPlugin(onProgress);
    progress.apply(compiler);

    const plugin = { name: 'WebpackLoggerPlugin' };

    // Changes were made to source or static files.
    compiler.hooks.invalid.tap(plugin, () => {
      internal.restart(this);
      internal.text(this, 'compiling...');
    });

    // Webpack has finished bundling and processing the files.
    compiler.hooks.done.tap(plugin, (stats) => {
      if (!stats.hasErrors() && !stats.hasWarnings()) {
        internal.success(this);
        return;
      }

      // We don't need to show 50 times the same error if the script just happens
      // to run on 50 different pages.
      const messages = new Set(stats.toJson()[stats.hasErrors() ? 'errors' : 'warnings']);

      // eslint-disable-next-line
      for (let err of messages) {
        internal.error(this, err);
      }
    });

    // This webpack task is no longer active, don't hold the spinner for it.
    compiler.hooks.watchClose.tap(plugin, () => {
      internal.delete(this);
    });

    // An oops has happened.
    compiler.hooks.failed.tap(plugin, (err) => {
      internal.error(this, err);
    });
  }
};
