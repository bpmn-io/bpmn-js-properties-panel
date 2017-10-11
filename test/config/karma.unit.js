'use strict';

// configures browsers to run test against
// any of [ 'ChromeHeadless', 'Chrome', 'Firefox', 'IE' ]
var TEST_BROWSERS = ((process.env.TEST_BROWSERS || '').replace(/^\s+|\s+$/, '') || 'ChromeHeadless').split(/\s*,\s*/g);

process.env.CHROME_BIN = require('puppeteer').executablePath();

// workaround https://github.com/GoogleChrome/puppeteer/issues/290
if (process.platform === 'linux') {
  TEST_BROWSERS = TEST_BROWSERS.map(function(browser) {
    if (browser === 'ChromeHeadless') {
      return 'ChromeHeadless_Linux';
    } else {
      return browser;
    }
  });

}

module.exports = function(karma) {
  karma.set({

    basePath: '../../',

    frameworks: [
      'browserify',
      'mocha',
      'sinon-chai'
    ],

    files: [
      'test/spec/**/*Spec.js'
    ],

    reporters: [ 'spec' ],

    preprocessors: {
      'test/spec/**/*Spec.js': [ 'browserify' ]
    },

    browsers: TEST_BROWSERS,

    customLaunchers: {
      ChromeHeadless_Linux: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-setuid-sandbox'
        ],
        debug: true
      }
    },

    client: {
      mocha: {
        timeout: 10000
      }
    },

    browserNoActivityTimeout: 30000,

    singleRun: false,
    autoWatch: true,

    // browserify configuration
    browserify: {
      debug: true,
      transform: [
        [ 'stringify', { global: true, extensions: [ '.bpmn', '.xml', '.css' ] } ]
      ]
    }
  });
};
