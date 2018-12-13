const chalk = require('chalk');
const chokidar = require('chokidar');
const { exec } = require('child_process');
const fs = require('fs');
const glob = require('glob');
const path = require('path');
const sharp = require('sharp');

const Logger = require('./libs/Logger');
const Spinner = require('./libs/Spinner');

const log = (msg) => {
  if (!Spinner.initialized()) {
    Logger.log(msg);
  }
};

const error = err => (Spinner.initialized() ? Spinner.error('sharp', err) : Logger.error(err));

let config;
let src;
let dest;
let sizes;
let types;
let quality;
let withoutEnlargement;

const verifySharpConfig = () => {
  const nextConfig = require('../package.json')['sharp-config'];
  if (!nextConfig) {
    throw new Error(chalk.red('No configuration found for sharp loader'));
  }
  if (!nextConfig.src || !nextConfig.dest) {
    throw new Error(chalk.red('Please specify both source and destination directories'));
  }

  // We only process all the images if:
  //  - this is the first time the script is run; or
  //  - if the configuration has changed.
  if (JSON.stringify(config) === JSON.stringify(nextConfig)) {
    return false;
  }

  config = nextConfig;
  src = config.src; // eslint-disable-line
  dest = config.dest; // eslint-disable-line
  sizes = config.sizes || [];
  types = new Set(config.types || [ 'jpg', 'jpeg', 'png', 'webp', 'tiff' ]);
  quality = parseInt(config.quality, 10) || 85;
  withoutEnlargement = ('withoutEnlargement' in config) ? config.withoutEnlargement : true;

  // We don't need to expose the whole package.json to the browser, but we will need the sizes
  // and file types recognized by sharp, in order to dynamically build srcset's.
  const exposeSharp = { sizes, types: [ ...types ] };
  fs.writeFileSync('temp/sharpConfig.js', `module.exports = ${JSON.stringify(exposeSharp)}`);

  return true;
};

// Sharp ref:
//  http://sharp.dimens.io/en/stable/api-resize/

const runSharp = (inFile) => {
  const imagePath = path.format(inFile);

  // Delete the .base entry in the inFile path object so that when constructing the outFile
  // path it buils with the correct suffix.
  const fileName = inFile.name;
  delete inFile.base;

  // Set up the output destination for created files, create the directory if it doesn't exist.
  inFile.dir = inFile.dir.replace(src, dest);
  if (!fs.existsSync(inFile.dir)) {
    // Zero-dependency solution to create full path found at
    // https://stackoverflow.com/questions/31645738/how-to-create-full-path-with-nodes-fs-mkdirsync
    const initDir = path.isAbsolute(inFile.dir) ? path.sep : '';
    inFile.dir.split(path.sep).reduce((parentDir, childDir) => {
      const curDir = path.resolve(parentDir, childDir);
      try {
        fs.mkdirSync(curDir);
      }
      catch (err) {
        if (err.code !== 'EEXIST') {
          throw err;
        }
      }
      return curDir;
    }, initDir);
  }

  const img = sharp(imagePath);
  const stats = fs.statSync(imagePath);

  const fileExt = inFile.ext.replace('.', '').toLowerCase();
  let method;
  switch (fileExt) {
    case 'png':
    case 'webp':
    case 'tiff':
    case 'jpeg':
      method = fileExt;
      break;

    case 'jpg':
    default:
      method = 'jpeg';
      break;
  }

  return img.metadata().then((metadata) => {
    const tasks = [];

    // We don't need to copy the original image into the destination folder,
    // images go in the static folder so hugo will take care of that.

    // Output an image for every specified file size.
    config.sizes.forEach((size) => {
      inFile.name = fileName + size.suffix;
      const outFile = path.format(inFile);

      // Upscaling is disabled by default.
      const width = (withoutEnlargement)
        ? Math.min(metadata.width, parseInt(size.width, 10))
        : parseInt(size.width, 10);

      tasks.push(new Promise((resolve, reject) => {
        img.clone()
          .resize({
            width,
            withoutEnlargement,
            fit: 'inside',
          })
          // eslint-disable-next-line no-unexpected-multiline
          [method]({ quality })
          .toFile(outFile, (err, data) => {
            if (err) {
              reject(err);
            }
            else {
              resolve({ outFile, data });
            }
          });
      }).catch(error));
    });

    return Promise.all(tasks)
      .then((infos) => {
        const logStrs = [
          'Sharp output:',
          `${imagePath.replace(src, '')} [${metadata.width}w ${metadata.height}h] [${Math.round(stats.size / 1024)}kb]`,
        ];
        infos.forEach((info) => {
          const { outFile, data } = info;
          const logName = `  ${outFile.replace(dest, '')}`;
          const logData = chalk.green(` [${data.width}w ${data.height}h] [${Math.round(data.size / 1024)}kb]`);
          const logNotResized = (data.width === metadata.width) ? chalk.cyan(' [upscaling disabled, used original]') : '';
          logStrs.push(logName + logData + logNotResized);
        });
        log(logStrs.join('\n'));
      })
      .catch(error);
  });
};

const processImages = (images) => {
  if (!Array.isArray(images)) {
    images = [ images ];
  }

  const startTime = new Date().getTime();
  const promises = [];

  images.forEach((imagePath) => {
    const inFile = path.parse(imagePath);

    if (types.has(inFile.ext.replace('.', '').toLowerCase())) {
      promises.push(runSharp(inFile));
    }
  });

  return Promise.all(promises)
    .then(() => {
      // If nothing was processed, this output is useless.
      if (!promises.length) {
        return;
      }

      const endTime = new Date().getTime();
      const doneStr = `Sharp: ${images.length} images processed in ${(Math.round((endTime - startTime) / 10) / 100)}s.`;
      log(doneStr);
    });
};

const deleteProcessedImages = imagePath => new Promise((resolve) => {
  const inFile = path.parse(imagePath);

  if (!types.has(inFile.ext.replace('.', '').toLowerCase())) {
    resolve();
    return;
  }

  // Delete the .base entry in the inFile path object so that when constructing
  // the outFile path it buils with the correct suffix.
  const fileName = inFile.name;
  delete inFile.base;

  // Set up the output destination for created files, create the directory if it doesn't exist.
  inFile.dir = inFile.dir.replace(src, dest);

  const logStrs = [
    `${imagePath.replace(src, '')} has been unlinked`,
  ];

  const promises = config.sizes.map(size => new Promise((res) => {
    inFile.name = fileName + size.suffix;
    const outFile = path.format(inFile);

    if (!fs.existsSync(outFile)) {
      log(logStrs.join('\n'));
      res();
      return;
    }

    fs.unlink(outFile, () => {
      logStrs.push(`  ${outFile.replace(dest, '')}${chalk.magenta(' [unlinked]')}`);
      res();
    });
  }));

  resolve(Promise.all(promises).then(() => {
    log(logStrs.join('\n'));
  }));
});

const processAllImages = () => new Promise((resolve, reject) => {
  const pattern = `${src}/**/*.+(${[ ...types ].join('|')})`;
  const options = {
    nocase: true,
  };

  glob(pattern, options, (err, images) => {
    if (err) {
      reject(err);
      return;
    }

    processImages(images).then(() => {
      resolve();
    });
  });
});

// Get our initial configuration.
verifySharpConfig();

let watcher;
let callback;

// Watch for changes to pictures and reprocess them as necessary.
// This also builds every image when first run, so there's no need to call processImages
// from the glob below.
if (process.env.NODE_ENV === 'development') {
  watcher = chokidar.watch([ src, './package.json' ], {
    ignoreInitial: true,
  });

  const currentTasks = new Set();

  const chokidarWatcher = (method, action, text) => (arg) => {
    if (Spinner.initialized()) {
      if (!currentTasks.size) {
        Spinner.restart('sharp');
      }

      // Make sure our spinner knows we're sharp'ing something.
      currentTasks.add(`${action}:${arg}`);

      Spinner.text('sharp', text);
    }

    method(arg)
      .then(() => {
        exec('yarn dummy:refresh');

        if (Spinner.initialized()) {
          // This sharp task has finished.
          currentTasks.delete(`${action}:${arg}`);

          // If there are no sharp tasks active, we can stop the spinner.
          if (!currentTasks.size) {
            Spinner.success('sharp');
          }

          callback();
        }
      })
      .catch(error);
  };

  setTimeout(() => {
    watcher
      .on('add', chokidarWatcher(processImages, 'add', 'processing changed responsive images...'))
      .on('change', (arg) => {
        // A change in package.json could mean a change in our configuration.
        if (arg === 'package.json') {
          delete require.cache[require.resolve('../package.json')];

          if (verifySharpConfig()) {
            chokidarWatcher(processAllImages, 'change', 'processing all responsive images...')();
          }

          return;
        }

        chokidarWatcher(processImages)(arg, 'change', 'processing changed responsive images...');
      })
      .on('unlink', chokidarWatcher(deleteProcessedImages, 'unlink', 'processing changed responsive images...'))
      .on('ready', chokidarWatcher(processAllImages, 'ready', 'processing all responsive images...'))
      .on('error', error);
  });

  module.exports = {
    setCallback(cb) {
      callback = cb;
    },

    close() {
      watcher.close();
    },
  };
}
else {
  processAllImages()
    .catch(error);
}
