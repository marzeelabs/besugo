// If we're serving we're in dev mode, everything should know about this.
process.env.NODE_ENV = 'development';
process.env.SERVER_MODE = 'simple';

const chalk = require('chalk');

const MOVE_UP = Buffer.from('1b5b3141', 'hex').toString();
console.log(MOVE_UP + chalk.grey('\n Initializing development server...'));

const Logger = require('./libs/Logger');
const Shutdown = require('./libs/Shutdown');
const Spinner = require('./libs/Spinner');

const tasks = [
  [ 'serve', '' ],
  [ 'configs', 'configurations' ],
  [ 'buildData', 'data' ],
  [ 'sass', 'sass/post-css' ],
  [ 'sharp', 'sharp' ],
  [ 'hugo', 'hugo' ],
  [ 'webpack', 'webpack' ],
];

Logger.initialize(tasks);
Spinner.initialize(tasks);
Shutdown.initialize();

// First step is always to clean up the public and temp directories, to make sure
// we're on a clean build. Only start the spinners after emptying the public and
// temp directories.
require('./tasks/clean').then(() => {
  Spinner.start();

  tasks.forEach((task) => {
    Spinner.text(task[0], 'waiting...');
  });

  // Before anything we need to ensure the configuration files are finished.
  Promise.all([
    require('./tasks/configs'),
    require('./tasks/buildData'),
  ])
    .then(() => {
      // During first init, webpack only runs after everything else, even if those tasks
      // fail with errors, as it's the most CPU intensive process and it can slow down
      // the rest of the processes, as well as the console output itself.
      Promise.all([
        require('./tasks/sass'),
        require('./tasks/sharp'),
        require('./tasks/hugo'),
      ])
        .then(() => {
          require('./tasks/webpack');
        });
    });
});
