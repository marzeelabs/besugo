const chalk = require('chalk');
const cp = require('child_process');

const Logger = require('../libs/Logger');

module.exports = new Promise((resolve) => {
  console.log(chalk.grey(' Erasing public and temp directories for a clean start...'));

  cp.exec('npm-run-all -p erase:*', (err, stdout) => {
    if (err) {
      throw new Error(err);
    }

    resolve(stdout);
  });
}).catch(Logger.error);
