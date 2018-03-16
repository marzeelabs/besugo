const chokidar = require('chokidar');
const cp = require('child_process');

const Logger = require('./Logger');
const Spinner = require('./Spinner');
const Shutdown = require('./Shutdown');

// Some tasks, such as cms or sass, make changes to static files (static === for webpack).
// Webpack only watches for changes in a static folder at the top-most level, so for it
// to follow changes in deeper levels, we trigger a dummy change in a file it can watch.
const dummyRefresh = (spinner) => {
  return new Promise((resolve, reject) => {
    cp.exec('yarn dummy:refresh', (err, stdout, stderr) => {
      Spinner.error(spinner, err);
      resolve();
    });
  }).catch((err) => {
    Spinner.error(spinner, err);
  });
};

// For simple build tasks that re-create full output each time they run.
module.exports = (options) => {
  return new Promise((resolve, reject) => {
    const { spinner, files, tasks, onError } = options;

    // Start watching the files.
    const task = chokidar.watch(files, {
      ignoreInitial: true
    });

    const handler = (ev, path) => {
      let queue = [].concat(tasks);

      const end = function() {
        dummyRefresh(spinner)
          .then(resolve)
          .catch(resolve);

        Spinner.success(spinner);
      };

      const step = function() {
        let task = queue.shift();
        if (!task) {
          end();
          return;
        }

        Spinner.text(spinner, task.text);

        cp.exec(task.command, (err, stdout, stderr) => {
          if (onError) {
            err = onError(err);
          }

          if (Spinner.error(spinner, err)) {
            resolve();
            return;
          }

          // There may still be tasks to run after this one.
          setTimeout(() => {
            step();
          });
        });
      };

      Spinner.restart(spinner);

      step();
    };

    // 'all' runs the handler on every event chokidar brings us.
    // 'error' runs the handler once after all files have been read and are being watched.
    task.on('all', handler);
    task.on('ready', handler);
    task.on('error', Logger.error);

    // Clean-terminate this chokidar task on shutdown.
    Shutdown.set(spinner, () => {
      task.close();
    });
  });
};
