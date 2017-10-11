'use strict';

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  /* global process */

  // project configuration
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    eslint: {
      check: {
        src: [
          '{lib,test}/**/*.js'
        ]
      },
      fix: {
        src: [
          '{lib,test}/**/*.js'
        ],
        options: {
          fix: true
        }
      }
    },

    karma: {
      options: {
        configFile: 'test/config/karma.unit.js'
      },
      single: {
        singleRun: true,
        autoWatch: false
      },
      unit: {

      }
    },

    release: {
      options: {
        tagName: 'v<%= version %>',
        commitMessage: 'chore(project): release v<%= version %>',
        tagMessage: 'chore(project): tag v<%= version %>'
      }
    }
  });


  // tasks

  grunt.registerTask('test', [ 'karma:single' ]);

  grunt.registerTask('auto-test', [ 'karma:unit' ]);

  grunt.registerTask('default', [ 'eslint:check', 'test' ]);

};