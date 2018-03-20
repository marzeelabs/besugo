// If we're serving we're in dev mode, everything should know about this.
process.env.NODE_ENV = 'development';
process.env.SERVER_MODE = 'simple';

const chalk = require('chalk');

const MOVE_UP = new Buffer('1b5b3141', 'hex').toString();
console.log(MOVE_UP + chalk.grey('\n Initializing development server...'));

const chokidar = require('chokidar');
const cp = require('child_process');
const fs = require('fs');
const glob = require('glob');
const nodemon = require('nodemon');
const path = require('path');
const sharp = require('sharp');

const Logger = require('./libs/Logger');
const Shutdown = require('./libs/Shutdown');
const Spinner = require('./libs/Spinner');
const Watch = require('./libs/Watch');

const tasks = [
  [ 'serve', '' ],
  [ 'cms', 'netlify-cms' ],
  [ 'sass', 'sass/post-css' ],
  [ 'sharp', 'sharp' ],
  [ 'hugo', 'hugo' ],
  [ 'webpack', 'webpack' ]
];

Logger.initialize(tasks);
Spinner.initialize(tasks);
Shutdown.initialize();

// First step is always to clean up the public and temp directories, to make sure
// we're on a clean build.
const clean = require('./tasks/clean');

// Only start the spinners after emptying the public and temp directories.
clean.then(() => {
  Spinner.start();

  const ready = [
    require('./tasks/cms'),
    require('./tasks/sass'),
    require('./tasks/sharp'),
    require('./tasks/hugo'),
  ];

  // During first init, webpack only runs after everything else, even if those tasks
  // fail with errors, as it's the most CPU intensive process and it can slow down
  // the rest of the processes, as well as the console output itself.
  Spinner.text('webpack', 'waiting...');

  Promise.all(ready).then(() => {
    require('./tasks/webpack');
  });
});
