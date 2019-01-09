const chalk = require('chalk');
const fs = require('fs');
const glob = require('glob');
const path = require('path');

const Logger = require('./libs/Logger');
const Spinner = require('./libs/Spinner');

const log = (msg) => {
  if (!Spinner.initialized()) {
    Logger.log(msg);
  }
};
const error = err => (Spinner.initialized() ? Spinner.error('buildData', err) : Logger.error(err));

glob('scripts/buildData/**/!(_)*.js', {}, (err, files) => {
  if (err) {
    error(err);
    return;
  }

  files.forEach((file) => {
    const inFile = path.parse(file);
    log(`Processing build data - ${inFile.name}...`);

    // eslint-disable-next-line
    require(file.replace('scripts/', './'))
      .then((data) => {
        fs.writeFile(path.resolve('data', `${inFile.name}.json`), JSON.stringify(data), (errr) => {
          if (errr) {
            error(chalk.red(errr));
          }
        });
      });
  });
});
