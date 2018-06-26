const chokidar = require('chokidar');

const Spinner = require('./Spinner');
const Shutdown = require('./Shutdown');

module.exports = (options) => {
  const {
    spinner,
    restartText,
    watchFile,
    getServer,
  } = options;

  return new Promise((resolve) => {
    let server;
    let task;

    const start = () => {
      if (server) {
        server.close();
        server = null;
        Shutdown.delete(spinner);
      }

      try {
        server = getServer(resolve);
      }
      catch (ex) {
        resolve();
        Spinner.error(spinner, ex);
      }

      Shutdown.set(spinner, () => {
        task.close();
        if (server) {
          server.close();
        }
      });
    };

    task = chokidar.watch(watchFile)
      .on('change', () => {
        Spinner.restart(spinner);
        Spinner.text(spinner, restartText);

        start();
      })
      .on('ready', start)
      .on('error', (err) => {
        if (err) {
          resolve();
        }
        Spinner.error(spinner, err);
      });
  });
};
