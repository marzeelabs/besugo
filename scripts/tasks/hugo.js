const cp = require('child_process');

const Spinner = require('../libs/Spinner');
const Shutdown = require('../libs/Shutdown');

module.exports = new Promise((resolve, reject) => {
  let hugoErrored = false;

  // Set the initial state when starting the build process.
  Spinner.text('hugo', 'building site...');

  const hugo = cp.spawn('hugo', ['-w']);

  hugo.stdout.on('data', (data) => {
    // We need to go through hugo's output to find out what it's doing
    // (if it's rebuilding, finished, or an error occurred).
    let str = data.toString();
    let lines = str.split('\n');
    for(let line of lines) {
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
      else if (line.indexOf('total in ') === 0) {
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
});
