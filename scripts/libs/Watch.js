const chokidar = require('chokidar');
const cp = require('child_process');

const Logger = require('./Logger');
const Spinner = require('./Spinner');
const Shutdown = require('./Shutdown');

// Some tasks, such as cms or sass, make changes to static files (static === for webpack).
// Webpack only watches for changes in a static folder at the top-most level, so for it
// to follow changes in deeper levels, we trigger a dummy change in a file it can watch.
const dummyRefresh = spinner => new Promise((resolve) => {
  cp.exec('yarn dummy:refresh', (err) => {
    Spinner.error(spinner, err);
    resolve();
  });
}).catch((err) => {
  Spinner.error(spinner, err);
});

// For simple build tasks that re-create full output each time they run.
module.exports = options => new Promise((resolve) => {
  const {
    spinner,
    files,
    tasks,
    onError,
  } = options;

  // Start watching the files.
  const task = chokidar.watch(files, {
    ignoreInitial: true,
  });

  const handler = () => {
    const queue = [].concat(tasks);

    const end = () => {
      dummyRefresh(spinner)
        .then(resolve)
        .catch(resolve);

      Spinner.success(spinner);
    };

    const step = () => {
      const queued = queue.shift();
      if (!queued) {
        end();
        return;
      }

      Spinner.text(spinner, queued.text);

      cp.exec(queued.command, (err) => {
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
