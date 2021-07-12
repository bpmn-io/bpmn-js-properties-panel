const path = require('path');
const { DefinePlugin } = require('webpack');

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

module.exports = function(karma) {

  const config = {

    basePath,

    frameworks: [
      'webpack',
      'mocha',
      'sinon-chai'
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
            test: /\.m?js$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                plugins: [
                  [ '@babel/plugin-transform-react-jsx', {
                    'importSource': 'preact',
                    'runtime': 'automatic'
                  } ]
                ]
              }
            }
          },
          {
            test: /\.svg$/,
            use: [ 'react-svg-loader' ]
          }
        ].concat(coverage ?
          {
            test: /\.js$/,
            use: {
              loader: 'istanbul-instrumenter-loader',
              options: { esModules: true }
            },
            enforce: 'post',
            include: /src\.*/,
            exclude: /node_modules/
          } : []
        )
      },
      plugins: [
        new DefinePlugin({

          // @barmac: process.env has to be defined to make @testing-library/preact work
          'process.env': {}
        })
      ],
      resolve: {
        mainFields: [
          'browser',
          'module',
          'main'
        ],
        alias: {
          'react': 'preact/compat',
          'react-dom': 'preact/compat'
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
