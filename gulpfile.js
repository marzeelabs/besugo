var gulp = require('gulp'),
  autoprefixer = require('gulp-autoprefixer'),
  concat = require('gulp-concat'),
  sass = require('gulp-sass'),
  nano = require('gulp-cssnano'),
  runSequence = require('run-sequence'),
  exec = require('child_process').exec,
  babel = require("gulp-babel"),
  webpack = require("webpack-stream"),
  responsive = require('gulp-responsive'),
  replace = require('gulp-replace');

// Option objects for the tools used below

var sassOptions = {
  includePaths: [ "node_modules" ]
};

var autoprefixerOptions = {
  browsers: ['last 2 versions','last 4 ios_saf versions'],
  cascade: false
};

/**
 * Compile assets
 */

gulp.task('sass', function() {
  return gulp.src("./scss/**/*.scss") // Gets all files ending with .scss
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(concat('app.css'))
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(nano())
    .pipe(gulp.dest('./static/css'));
});


gulp.task('sass-cms', function() {
  return gulp.src("./scss_cms/**/*.scss") // Gets all files ending with .scss
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(concat('cms-override.css'))
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(nano())
    .pipe(gulp.dest('./static/css'));
});

gulp.task('scripts', function() {
  return gulp.src("./scripts/site/**/*.js") // Gets all files ending with .js
    .pipe(webpack({
      output: {
        filename: "site.min.js"
      }
    }))
    .pipe(babel())
    .pipe(gulp.dest('./static/js'));
});

gulp.task('scripts-admin', function() {
  return gulp.src("./scripts/admin/**/*.js") // Gets all files ending with .js
    .pipe(webpack({
      output: {
        filename: "admin.min.js"
      }
    }))
    .pipe(babel())
    .pipe(gulp.dest('./static/admin'));
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

// Image manipulation variables
// gulp-responsive docs:
//    https://github.com/mahnunchik/gulp-responsive/tree/master/examples
var imgSrc          = './static/images/**/*.jpg',
    imgDest         = './public/images/',
    imgQuality      = 80,
    largeWidth      = 1400,
    regularWidth    = 820,
    mediumWidth     = 680,
    smallWidth      = 460,
    // Do not enlarge the output image if the input image is already smaller than the desired dimensions.
    withoutEnlargement = true;

// Clean the image folder
gulp.task('images-clean', function() {
  return exec('rm ' + imgDest + '*', {stdio: 'inherit'});
});

// Copy original image
gulp.task('images-original', function() {
  return gulp.src(imgSrc).pipe(gulp.dest(imgDest));
});

gulp.task('images-responsive', function() {
  return gulp.src(imgSrc).pipe(responsive(
    {
      '**/*.jpg': [
        {
          // Create small image
          width: smallWidth,
          rename: { suffix: '-small' },
          withoutEnlargement
        },
        {
          // Create medium image
          width: mediumWidth,
          rename: { suffix: '-medium' },
          withoutEnlargement
        },
        {
          // Create regular image
          width: regularWidth,
          rename: { suffix: '-regular' },
          withoutEnlargement
        },
        {
          // Create large image
          width: largeWidth,
          rename: { suffix: '-large' },
          withoutEnlargement
        }
      ]
    },
    {
      // Options for all images
      silent: true,
      quality: imgQuality,
      errorOnEnlargement: false
    }
  )).pipe(gulp.dest(imgDest));
});

/**
 * Create responsive images with gulp-responsive
 *
 * We divide this into several tasks so we can have a callback
 * and make sure 'build' runs after it's finished.
 */
gulp.task('images', function (callback) {
  runSequence(
    'images-clean',
    ['images-original', 'images-responsive'],
    callback
  );
});

/**
 * Watch / Serve
 */

gulp.task('watch', function(){
  gulp.watch('./scss/**/*.scss', ['sass']);
  gulp.watch('./scss_cms/**/*.scss', ['sass-cms']);
  gulp.watch('./scripts/site/**/*.js', ['scripts']);
  gulp.watch('./scripts/admin/**/*.js', ['scripts-admin']);
  gulp.watch('./static/images/*', ['images']);
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
    ['sass', 'sass-cms', 'scripts', 'scripts-admin'],
    'compile',
    'cms',
    'images',
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
    ['sass', 'sass-cms', 'scripts', 'scripts-admin'],
    ['serve', 'watch', 'cms', 'images'],
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
