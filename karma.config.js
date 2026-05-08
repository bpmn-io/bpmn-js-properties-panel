const path = require('path');
const {
  DefinePlugin,
} = require('webpack');

const basePath = '.';

// configures browsers to run test against
// any of [ 'ChromeHeadless', 'Chrome', 'Firefox', 'IE', 'PhantomJS' ]
const browsers = (process.env.TEST_BROWSERS || 'ChromeHeadless').split(',');

const singleStart = process.env.SINGLE_START;

const coverage = process.env.COVERAGE;

const absoluteBasePath = path.resolve(path.join(__dirname, basePath));

// use puppeteer provided Chrome for testing
process.env.CHROME_BIN = require('puppeteer').executablePath();

const suite = coverage ? 'test/coverageBundle.js' : 'test/testBundle.js';

// use stable timezone
process.env.TZ = 'Europe/Berlin';

module.exports = function(karma) {

  const config = {

    basePath,

    frameworks: [
      'webpack',
      'mocha'
    ],

    files: [
      suite
    ],

    preprocessors: {
      [ suite ]: [ 'webpack', 'env' ]
    },

    reporters: [ 'progress' ].concat(coverage ? 'coverage' : []),

    coverageReporter: {
      reporters: [
        { type: 'lcov', subdir: '.' },
      ]
    },

    browsers,

    singleRun: true,
    autoWatch: false,

    webpack: {
      mode: 'development',
      module: {
        rules: [
          {
            test: /\.(css|bpmn)$/,
            use: 'raw-loader'
          },
          {
            test: /test\/globals\.js$/,
            sideEffects: true
          },
          {
            test: /\.m?js$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                plugins: [
                  [ '@babel/plugin-transform-react-jsx', {
                    'importSource': '@bpmn-io/properties-panel/preact',
                    'runtime': 'automatic'
                  } ]
                ].concat(coverage ? [
                  [ 'istanbul', {
                    exclude: [
                      'test/**/*'
                    ]
                  } ]
                ] : [])
              }
            }
          },
          {
            test: /\.svg$/,
            use: [ 'react-svg-loader' ]
          }
        ]
      },
      plugins: [
        new DefinePlugin({

          // @barmac: process.env has to be defined to make @testing-library/preact work
          'process.env': {}
        }),
      ],
      resolve: {
        symlinks: false,
        mainFields: [
          'browser',
          'module',
          'main'
        ],
        alias: {
          'preact$': path.resolve('node_modules/preact'),
          'preact/hooks$': path.resolve('node_modules/preact/hooks'),
          'preact/compat$': path.resolve('node_modules/preact/compat'),
          'preact/jsx-runtime$': path.resolve('node_modules/preact/jsx-runtime'),
          'react$': path.resolve('node_modules/preact/compat'),
          'react-dom$': path.resolve('node_modules/preact/compat')
        },
        modules: [
          'node_modules',
          absoluteBasePath
        ]
      },
      devtool: 'eval-source-map'
    }
  };

  if (singleStart) {
    config.browsers = [].concat(config.browsers, 'Debug');
    config.envPreprocessor = [].concat(config.envPreprocessor || [], 'SINGLE_START');
  }

  karma.set(config);
};
