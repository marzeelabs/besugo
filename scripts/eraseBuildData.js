const chalk = require('chalk');
const fs = require('fs');
const glob = require('glob');
const path = require('path');

const Logger = require('./libs/Logger');
const Spinner = require('./libs/Spinner');

const error = err => (Spinner.initialized() ? Spinner.error('buildData', err) : Logger.error(err));

glob('scripts/buildData/**/!(_)*.js', {}, (err, files) => {
  if (err) {
    error(err);
    return;
  }

  files.forEach((file) => {
    const inFile = path.parse(file);
    const jsonFile = path.resolve('data', `${inFile.name}.json`);

    if (fs.existsSync(jsonFile)) {
      fs.unlink(jsonFile, (errr) => {
        if (errr) {
          error(chalk.red(errr));
        }
      });
    }
  });
});
