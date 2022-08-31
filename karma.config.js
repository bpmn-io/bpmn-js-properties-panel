const path = require('path');
const {
  DefinePlugin,
  NormalModuleReplacementPlugin
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
                    'importSource': '@bpmn-io/properties-panel/preact',
                    'runtime': 'automatic'
                  } ]
                ].concat(coverage ? [
                  [ 'istanbul', {
                    include: [
                      'lib/**'
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
        new NormalModuleReplacementPlugin(
          /^preact(\/[^/]+)?$/,
          function(resource) {

            const replMap = {
              'preact/hooks': path.resolve('node_modules/@bpmn-io/properties-panel/preact/hooks/dist/hooks.module.js'),
              'preact/jsx-runtime': path.resolve('node_modules/@bpmn-io/properties-panel/preact/jsx-runtime/dist/jsxRuntime.module.js'),
              'preact': path.resolve('node_modules/@bpmn-io/properties-panel/preact/dist/preact.module.js')
            };

            const replacement = replMap[resource.request];

            if (!replacement) {
              return;
            }

            resource.request = replacement;
          }
        ),
        new NormalModuleReplacementPlugin(
          /^preact\/hooks/,
          path.resolve('node_modules/@bpmn-io/properties-panel/preact/hooks/dist/hooks.module.js')
        )
      ],
      resolve: {
        mainFields: [
          'browser',
          'module',
          'main'
        ],
        alias: {
          'preact': '@bpmn-io/properties-panel/preact',
          'react': '@bpmn-io/properties-panel/preact/compat',
          'react-dom': '@bpmn-io/properties-panel/preact/compat'
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
