var gulp = require('gulp'),
  autoprefixer = require('gulp-autoprefixer'),
  concat = require('gulp-concat'),
  sass = require('gulp-sass'),
  nano = require('gulp-cssnano'),
  runSequence = require('run-sequence'),
  exec = require('child_process').exec,
  uglify = require('gulp-uglify'),
  jimp = require('gulp-jimp');
  replace = require('gulp-replace');


/**
 * Compile assets
 */

gulp.task('sass', function() {
  return gulp.src("./scss/**/*.scss") // Gets all files ending with .scss
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('app.css'))
    .pipe(autoprefixer({
      browsers: ['last 2 versions','last 4 ios_saf versions'],
      cascade: false
    }))
    .pipe(nano())
    .pipe(gulp.dest('./static/css'));
});


gulp.task('sass-cms', function() {
  return gulp.src("./scss_cms/**/*.scss") // Gets all files ending with .scss
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('cms-override.css'))
    .pipe(autoprefixer({
      browsers: ['last 2 versions','last 4 ios_saf versions'],
      cascade: false
    }))
    .pipe(nano())
    .pipe(gulp.dest('./static/css'));
});


gulp.task('scripts', function() {
  return gulp.src("./scripts/**/*.js") // Gets all files ending with .scss
    .pipe(concat('site.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./static/js'));
});

gulp.task('cms', function() {
  var replaceBranch = function(gitBranch) {
    // console.log("CMS BRANCH: " + gitBranch);
    return gulp.src("./static/admin/config.yml")
      .pipe(replace("<% CURRENT_BRANCH %>", gitBranch))
      .pipe(gulp.dest("./public/admin"));
  };

  return exec('printf $(git symbolic-ref --short -q HEAD)', function (err, stdout) {
    if (!err && stdout) {
      return replaceBranch(stdout);
    } else {
      // If we're deploying on Netlify, use $HEAD env var
      // Fallback to develop
      exec('printf $HEAD', function(err, stdout) {
        if (!err && stdout) {
          return replaceBranch(stdout);
        } else {
          return replaceBranch("develop");
        }
      });
    }
  });
});

// Jimp variables
var imgSrc          = './static/images/**/*.jpg',
    imgDest         = './public/images/',
    imgQuality      = 80,
    largeWidth      = 1400,
    regularWidth    = 820,
    mediumWidth     = 680,
    smallWidth      = 460;

// Clean the image folder
gulp.task('jimp-clean', function() {
  return exec('rm ' + imgDest + '*', {stdio: 'inherit'});
});

// Copy original image
gulp.task('jimp-original', function() {
  return gulp.src(imgSrc).pipe(gulp.dest(imgDest));
});

// Create large image
gulp.task('jimp-large', function() {
  return gulp.src(imgSrc).pipe(jimp({
    '-large': {
      resize: { width: largeWidth, height: jimp.AUTO },
      quality: imgQuality
    }
  })).pipe(gulp.dest(imgDest));
});

// Create Regular image
gulp.task('jimp-regular', function() {
  // Regular image
  return gulp.src(imgSrc).pipe(jimp({
    '-regular': {
      resize: { width: regularWidth, height: jimp.AUTO },
      quality: imgQuality
    }
  })).pipe(gulp.dest(imgDest));
});

// Create Medium image
gulp.task('jimp-medium', function() {
  return gulp.src(imgSrc).pipe(jimp({
    '-medium': {
      resize: { width: mediumWidth, height: jimp.AUTO },
      quality: imgQuality
    }
  })).pipe(gulp.dest(imgDest));
});

// Create Small image
gulp.task('jimp-small', function() {
  return gulp.src(imgSrc).pipe(jimp({
    '-small': {
      resize: { width: smallWidth, height: jimp.AUTO },
      quality: imgQuality
    }
  })).pipe(gulp.dest(imgDest));
});

/**
 * Create responsive images with JIMP
 *
 * We divide this into several tasks so we can have a callback
 * and make sure 'build' runs after it's finished.
 */
gulp.task('jimp', function (callback) {
  runSequence(
    'jimp-clean',
    ['jimp-original','jimp-large', 'jimp-regular', 'jimp-medium', 'jimp-small'],
    callback
  );
});

/**
 * Watch / Serve
 */

gulp.task('watch', function(){
  gulp.watch('./scss/**/*.scss', ['sass']);
  gulp.watch('./scss_cms/**/*.scss', ['sass-cms']);
  gulp.watch('./scripts/**/*.js', ['scripts']);
  gulp.watch('./static/images/*', ['jimp']);
});

gulp.task('serve', function(callback){
  exec('rm -Rf ./public && hugo serve --renderToDisk', function (err) {
    if (err) {
      console.log("Hugo exited with error: ", err);
      return process.exit(2);
    }
    else {
      callback();
    }
  })
  .stdout.on('data', function(data) {
    runSequence('cms');
  })
  .pipe(process.stdout);
});

gulp.task('compile', function(callback){
  exec('rm -Rf ./public && hugo', function (err) {
    if (err) {
      console.log("Hugo exited with error: ", err);
      return process.exit(2);
    }
    else {
      callback();
    }
  }).stdout.pipe(process.stdout);
});

/**
 * Aggregator Tasks
 */

gulp.task('build', function(callback) {
  runSequence(
    ['sass', 'sass-cms', 'scripts'],
    'compile',
    'cms',
    'jimp',
    function(err) {
      if (err) {
        console.log('[ERROR] gulp build task failed', err);
        return process.exit(2);
      }
      else {
        return callback();
      }
    }
  );
});

gulp.task('default', function(callback){
  runSequence(
    ['sass', 'sass-cms', 'scripts'],
    ['serve','watch', 'cms', 'jimp'],
    function(err) {
      if (err) {
        console.log('[ERROR] gulp task failed', err);
        return process.exit(2);
      }
      else {
        return callback();
      }
    }
  );
});
