const packageJson = require('../package.json');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const chalk = require('chalk');
const chokidar = require('chokidar');

if(!packageJson["sharp-config"]) {
  throw new Error(chalk.red('No configuration found for sass loader'));
}

function handleError(err) {
  console.log(chalk.red(err));
}

const config = packageJson["sharp-config"];

const src = config.src;
const dest = config.dest;
if(!src || !dest) {
  throw new Error(chalk.red('Please specify both source and destination directories'));
}

const sizes = config.sizes || [];
const types = new Set(config.types || [ "jpg", "jpeg", "png", "webp", "tiff" ]);
const quality = parseInt(config.quality, 10) || 85;
const withoutEnlargement = ('withoutEnlargment' in config) ? config.withoutEnlargement : true;

// We don't need to expose the whole package.json to the browser, but we will need the sizes
// and file types recognized by sass, in order to dynamically build srcset's.
const exposeSass = { sizes, types: [...types] };
fs.writeFile("temp/sassConfig.js", "module.exports = " + JSON.stringify(exposeSass), function(err) {
  if(err) { return console.log(err); }
});

// Sharp ref:
//  http://sharp.dimens.io/en/stable/api-resize/

function runSharp(inFile) {
  const imagePath = path.format(inFile);

  // Delete the .base entry in the inFile path object so that when constructing the outFile path it buils with the correct suffix.
  const fileName = inFile.name;
  delete inFile.base;

  // Set up the output destination for created files, create the directory if it doesn't exist.
  inFile.dir = inFile.dir.replace(src, dest);
  if(!fs.existsSync(inFile.dir)) {
    // Zero-dependency solution to create full path found at
    // https://stackoverflow.com/questions/31645738/how-to-create-full-path-with-nodes-fs-mkdirsync
    const initDir = path.isAbsolute(inFile.dir) ? path.sep : '';
    inFile.dir.split(path.sep).reduce((parentDir, childDir) => {
      const curDir = path.resolve(parentDir, childDir);
      try {
        fs.mkdirSync(curDir);
      } catch (err) {
        if (err.code !== 'EEXIST') {
          throw err;
        }
      }
      return curDir;
    }, initDir);
  }

  const img = sharp(imagePath);
  const stats = fs.statSync(imagePath);

  let fileExt = inFile.ext.replace('.', '').toLowerCase();
  let method;
  switch(fileExt) {
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

  return img.metadata().then(function(metadata) {
    const tasks = [];

    // We don't need to copy the original image into the destination folder, images go in the static folder so hugo will take care of that.

    // Output an image for every specified file size.
    config.sizes.forEach(function(size) {
      inFile.name = fileName + size.suffix;
      const outFile = path.format(inFile);

      // Upscaling is disabled by default.
      const width = (withoutEnlargement) ? Math.min(metadata.width, parseInt(size.width, 10)) : parseInt(size.width, 10);

      tasks.push(new Promise(function(resolve, reject) {
        img.clone()
          .resize(width, null)
          .withoutEnlargement(withoutEnlargement)
          [method]({ quality })
          .toFile(outFile, function(err, data) {
            if(err) {
              reject(err);
            } else {
              resolve({ outFile, data });
            }
          });
      }));
    });

    return Promise.all(tasks)
      .then(function(infos) {
        // TODO: Switch to disable this pretty output?
        const logStrs = [
          "Sharp output:",
          imagePath.replace(src, "") + " [" + metadata.width + "w " + metadata.height + "h] [" + Math.round(stats.size / 1024) + "kb]"
        ];
        infos.forEach(function(info) {
          const { outFile, data } = info;
          const logName = "  " + outFile.replace(dest, "");
          const logData = chalk.green(" [" + data.width + "w " + data.height + "h] [" + Math.round(data.size / 1024) + "kb]");
          const logNotResized = (data.width === metadata.width) ? chalk.cyan(" [upscaling disabled, used original]") : "";
          logStrs.push(logName + logData + logNotResized);
        });
        console.log(logStrs.join("\n"));
      });
  })
    .catch(handleError);
}

function processImages(images) {
  if(!Array.isArray(images)) {
    images = [ images ];
  }

  const startTime = new Date().getTime();
  const promises = [];

  images.forEach(function(imagePath) {
    const inFile = path.parse(imagePath);

    if(types.has(inFile.ext.replace('.', '').toLowerCase())) {
      promises.push(runSharp(inFile));
    }
  });

  return Promise.all(promises)
    .then(function() {
      if(!promises.length) {
        return;
      }

      const endTime = new Date().getTime();
      const doneStr = "Sharp: " + images.length + " images processed in " + (Math.round((endTime - startTime) /10) /100) + "s.";
      console.log(doneStr);
    })
    .catch(handleError);
}

function deleteProcessedImages(imagePath) {
  const inFile = path.parse(imagePath);

  if(types.has(inFile.ext.replace('.', '').toLowerCase())) {
    // Delete the .base entry in the inFile path object so that when constructing the outFile path it buils with the correct suffix.
    const fileName = inFile.name;
    delete inFile.base;

    // Set up the output destination for created files, create the directory if it doesn't exist.
    inFile.dir = inFile.dir.replace(src, dest);

    const logStrs = [
      imagePath.replace(src, "") + " has been unlinked"
    ];

    config.sizes.forEach(function(size) {
      inFile.name = fileName + size.suffix;
      const outFile = path.format(inFile);

      if(fs.existsSync(outFile)) {
        fs.unlinkSync(outFile);
        logStrs.push("  " + outFile.replace(dest, "") + chalk.magenta(" [unlinked]"));
      }
    });

    console.log(logStrs.join("\n"));
  }
}

// Watch for changes to pictures and reprocess them as necessary.
// This also builds every image when first run, so there's no need to call processImages from the glob below.
if(process.env.NODE_ENV === 'development') {
  chokidar.watch(src)
    .on('add', processImages)
    .on('change', processImages)
    .on('unlink', deleteProcessedImages)
    .on('error', handleError);
}
else {
  glob(src + "/**/*.+(" + [...types].join('|') + ")", {}, function(err, images) {
    if(err) {
      throw new Error(err);
    }

    processImages(images);
  });
}
