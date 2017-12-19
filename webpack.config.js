const glob = require("glob");
const path = require("path");

// webpack config reference:
//  https://webpack.js.org/configuration/
const webpack = require("webpack");
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const StaticSiteGeneratorPlugin = require('static-site-generator-webpack-plugin');

// Utils needed for building the static webpages, instead of requiring them in each individual script,
// and thus bundling them in the final app.min.js, we're much better off just passing them through
// webpack's server if they are only needed for the markup rendering.
const fs = require("fs");
const parser = require('parse5');
const parserUtils = require('parse5-utils');
const { renderToString } = require('react-dom/server');
const jsdom = require("jsdom").JSDOM;

// configurations
require('toml-require').install();
const netlifyToml = require("./netlify.toml");
const packageJson = require("./package.json");

module.exports = [
  {
    // Here the application starts executing and webpack starts bundling
    entry: {
      js: glob.sync("./js/site/**/*.js"),
      admin: glob.sync("./js/admin/**/*.js")
    },

    // options related to how webpack emits results
    output: {
      // the target directory for all output files
      // must be an absolute path (use the Node.js path module)
      path: path.resolve(__dirname, netlifyToml.build.publish),

      // the filename template for entry chunks
      filename: "[name]/main.min.js"
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
              presets: [ "env" ]
            }
          }
        }
      ]
    },

    // additional plugins
    plugins: [
      // babel-minify seems to have trouble with nested $'s, something in babel-plugin-minify-mangle-names
      // for example the following jQuery would parse error when minifying with it:
      // $a.b(function() { $('foo'); })
      //new webpack.optimize.UglifyJsPlugin()
      new UglifyJSPlugin()
    ],

    // This is not specific to building the js files,
    // it's just that webpack-dev-server fetches these configs from the first exports entry.
    devServer: {
      contentBase: netlifyToml.build.publish,
      compress: true,
      historyApiFallback: {
        rewrites: [
          {
            // Without this rule, if we typed "/admin" we would end up in "/admin#/" instead of "/admin/#/",
            // making it impossible to use the CMS interface in localhost.
            from: /\/admin$/,
            to: '/admin/'
          }
        ]
      },
      port: packageJson.config.port,
      watchContentBase: true
    }
  },

  {
    entry: "./components/App.jsx",

    output: {
      path: path.resolve(__dirname, netlifyToml.build.publish),
      filename: "js/app.min.js",
      // Required for static-site-generator-webpack-plugin,
      libraryTarget: 'umd'
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
              presets: [ "env", "react" ]
            }
          }
        }
      ]
    },

    resolve: {
      modules: [ "node_modules", path.resolve(__dirname, "components") ],
      extensions: [ ".js", ".json", ".jsx" ]
    },

    // additional plugins
    plugins: [
      new UglifyJSPlugin(),

      // Serve all hugo-generated files, including static files, except for html files (see below).
      new CopyWebpackPlugin([
        {
          from: 'temp/hugo',
          to: path.resolve(__dirname, netlifyToml.build.publish),
          ignore: [ '*.html' ]
        }
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
            { from: 'temp/hugo/', to: '' }
          ]
        },

        // Simulate a window object inside our generator environment;
        // many different dependencies can expect different global properties,
        // even webpack itself, in particular its hot reload module, requires a minimally "real" environment.
        // Ref: https://github.com/tmpvar/jsdom
        globals: new jsdom(`...`).window
      })
    ]
  }
];
