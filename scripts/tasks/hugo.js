const cp = require('child_process');

const Spawn = require('../libs/Spawn');
const Spinner = require('../libs/Spinner');
const Shutdown = require('../libs/Shutdown');

const getServer = (resolve) => {
  let hugoErrored = false;

  // Set the initial state when starting the build process.
  Spinner.text('hugo', 'building site...');

  const hugo = cp.spawn('hugo', [ '-w' ]);

  hugo.stdout.on('data', (data) => {
    // We need to go through hugo's output to find out what it's doing
    // (if it's rebuilding, finished, or an error occurred).
    const str = data.toString();
    const lines = str.split('\n');

    // eslint-disable-next-line
    for (let line of lines) {
      // This first check may not be needed anymore in recent versions of hugo.
      if (line.indexOf('Started building sites') === 0) {
        // Errors during first build are shown before this message.
        if (!hugoErrored) {
          Spinner.restart('hugo');
          Spinner.text('hugo', 'building site...');
        }
      }
      else if (line.indexOf('Change detected, rebuilding site') === 0) {
        hugoErrored = false;
        Spinner.restart('hugo');
        Spinner.text('hugo', 'rebuilding site...');
      }
      else if (line.indexOf('ERROR') === 0) {
        hugoErrored = true;
        Spinner.error('hugo', line);
        resolve();
      }
      else if (line.indexOf('Watching for changes in ') === 0) {
        Spinner.success('hugo');
        resolve();
      }
      else if (line.toLowerCase().indexOf('total in ') === 0) {
        Spinner.success('hugo');
        resolve();
      }
    }
  });

  hugo.stderr.on('data', (data) => {
    hugoErrored = true;
    Spinner.error('hugo', data.toString());
  });

  Shutdown.set('hugo', () => {
    hugo.kill('SIGINT');
  });

  hugo.close = () => {
    hugo.kill();
  };

  return hugo;
};

module.exports = Spawn({
  spinner: 'hugo',
  restartText: 'building site...',
  watchFile: 'config.yml',
  getServer,
});
