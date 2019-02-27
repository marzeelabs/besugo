const glob = require('glob');
const path = require('path');

// webpack config reference:
//  https://webpack.js.org/configuration/
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin'); // eslint-disable-line
const StaticSiteGeneratorPlugin = require('./scripts/libs/StaticSiteGeneratorWebpack4Plugin.js'); // eslint-disable-line

// Utils needed for building the static webpages, instead of requiring them in each
// individual script, and thus bundling them in the final app.min.js, we're much better
// off just passing them through webpack's server if they are only needed for the
// markup rendering.
const fs = require('fs');
const { JSDOM } = require('jsdom');
const parser = require('parse5');
const parserUtils = require('parse5-utils');
const { renderToString } = require('react-dom/server');

// configurations
require('toml-require').install();
const netlifyToml = require('./netlify.toml');
const packageJson = require('./package.json');

const allExports = {
  mode: process.env.NODE_ENV,

  devtool: process.env.NODE_ENV === 'development' ? 'source-map' : false,

  performance: {
    // maxEntrypointSize: 1048576,
    // maxAssetSize: 1048576,
    hints: false,

    assetFilter: (assetFilename) => {
      const check = new RegExp(`.(${packageJson['sharp-config'].types.join('|')})$`, 'gi');
      return !check.test(assetFilename);
    },
  },
};

const allPlugins = [];
if (process.env.NODE_ENV !== 'development') {
  allPlugins.push(new TerserPlugin());
}

// A small custom plugin to instruct webpack to (recursively) watch for changes within a directory.
class WatchDirectoriesPlugin {
  constructor(directories) {
    this.directories = (Array.isArray(directories)) ? directories : [ directories ];
  }

  apply(compiler) {
    const plugin = { name: 'WatchDirectoriesPlugin' };

    compiler.hooks.afterCompile.tapAsync(plugin, (compilation, callback) => {
      this.directories.forEach((dir) => {
        compilation.contextDependencies.add(path.resolve(__dirname, dir));
      });
      callback();
    });
  }
}

// Returns a simulated window for use in Node during SSR.
const buildGlobals = () => {
  const globals = new JSDOM('...', {
    beforeParse(window) {
      // Some package somewhere tries calling window.location.reload, which
      // triggers a notice in the console by jsdom that we don't care about.
      // (Haven't figured out what causes this, started after doing some
      // updates to dependencies, maybe React?)
      Object.defineProperty(window, 'location', {
        enumerable: true,
        configurable: true,

        value: Object.getOwnPropertyNames(window.location)
          .reduce((res, key) => {
            switch (key) {
              case 'reload':
                res[key] = () => {};
                break;

              default: {
                // Defining properties from descriptors triggers illegal invocations at
                // /node_modules/jsdom/lib/jsdom/living/generated/Location.js:242
                // For our use-case, we can live without the rest of the functionality
                // from the location object.
                res[key] = window.location[key];
                break;
              }
            }

            return res;
          }, {}),
      });

      // We don't want any console output at this stage.
      window.console = {
        log() {},
        warn() {},
        error() {},
      };

      // Avoid throwing compile errors because these are not available in
      // this context.
      delete window.localStorage;
      delete window.sessionStorage;
    },
  });

  return { ...(globals.window) };
};

module.exports = [
  {
    ...allExports,

    // Here the application starts executing and webpack starts bundling
    entry: {
      js: [
        // './scripts/webpack/polyfills.js',
        // './scripts/webpack/identity.js',
        './scripts/webpack/site.js',
      ],
      admin: [
        // './scripts/webpack/polyfills.js',
        // './scripts/webpack/identity.js',
        './scripts/webpack/admin.js',
      ],
    },

    // options related to how webpack emits results
    output: {
      // the target directory for all output files
      // must be an absolute path (use the Node.js path module)
      path: path.resolve(__dirname, netlifyToml.build.publish),

      // the filename template for entry chunks
      filename: '[name]/main.min.js',
    },

    // configuration regarding modules
    module: {
      // rules for modules (configure loaders, parser options, etc.)
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              babelrc: false,
              presets: [
                '@babel/preset-env',
              ],
            },
          },
        },
      ],
    },

    // additional plugins
    plugins: allPlugins.concat([
      // Make sure newly added files (even within subfolders) trigger a recompile.
      new WatchDirectoriesPlugin([
        './js/site',
        './js/admin',
      ]),
    ]),

    // This is not specific to building the js files,
    // it's just that webpack-dev-server fetches these configs from the first exports entry.
    // Note that currently (as specified in the package.json scripts) webpack is run twice when
    // serving locally, once for webpack itself to build the files into the public directory,
    // and again for webpack-server itself to serve the files from memory.
    devServer: {
      contentBase: path.resolve(__dirname, netlifyToml.build.publish),
      compress: true,
      historyApiFallback: {
        rewrites: [
          {
            // Without this rule, if we typed "/admin" we would end up in "/admin#/"
            // instead of "/admin/#/", making it impossible to use the CMS interface
            // in localhost.
            from: /\/admin$/,
            to: '/admin/',
          },
        ],
      },
      port: packageJson.config.port,
      watchContentBase: true,
    },
  },

  {
    ...allExports,

    entry: [
      './scripts/webpack/polyfills.js',
      './components/App.jsx',
    ],

    output: {
      path: path.resolve(__dirname, netlifyToml.build.publish),
      filename: 'js/app.min.js',
      // Required for static-site-generator-webpack-plugin,
      libraryTarget: 'umd',
    },

    // configuration regarding modules
    module: {
      // rules for modules (configure loaders, parser options, etc.)
      rules: [
        {
          test: /\.jsx$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              babelrc: false,
              presets: [
                '@babel/preset-env',
                '@babel/preset-react',
              ],
              plugins: [
                '@babel/plugin-proposal-class-properties',
              ],
            },
          },
        },
        {
          test: /\.css$/,
          use: {
            loader: 'ignore-loader',
          },
        },
      ],
    },

    resolve: {
      modules: [ 'node_modules', path.resolve(__dirname, 'components') ],
      extensions: [ '.js', '.json', '.jsx' ],
    },

    // additional plugins
    plugins: allPlugins.concat([
      // Serve all hugo-generated files, including static files, except for html files (see below).
      new CopyWebpackPlugin([
        {
          from: 'temp/hugo',
          to: path.resolve(__dirname, netlifyToml.build.publish),
          ignore: [ '*.html' ],
        },
      ]),

      // Hugo-generated html files go through a react server-side rendering process,
      // so that we serve full markup pages. This way we're obeying a JAM stack architecture,
      // while still allowing for any needed extra JS/React dynamics that should fail gracefully,
      // that is fail without compromising access to the basic/critical information on the pages.
      new StaticSiteGeneratorPlugin({
        paths: glob.sync('./temp/hugo/**/*.html'),

        locals: {
          fs,
          parser,
          parserUtils,
          renderToString,
          pathsReplace: [
            { from: 'temp/hugo/', to: '' },
          ],
        },

        // Simulate a window object inside our generator environment;
        // many different dependencies can expect different global properties,
        // even webpack itself, in particular its hot reload module, requires a
        // minimally "real" environment.
        // Ref: https://github.com/tmpvar/jsdom
        globals: buildGlobals(),
      }),
    ]),
  },
];
