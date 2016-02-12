'use strict';

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  /* global process */

  // configures browsers to run test against
  // any of [ 'PhantomJS', 'Chrome', 'Firefox', 'IE']
  var TEST_BROWSERS = ((process.env.TEST_BROWSERS || '').replace(/^\s+|\s+$/, '') || 'Firefox').split(/\s*,\s*/g);

  // project configuration
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    config: {
      sources: 'lib',
      tests: 'test',
      dist: 'dist'
    },

    jshint: {
      src: ['<%=config.sources %>'],
      options: {
        jshintrc: true
      }
    },

    karma: {
      options: {
        configFile: '<%= config.tests %>/config/karma.unit.js'
      },
      single: {
        singleRun: true,
        autoWatch: false,

        browsers: TEST_BROWSERS
      },
      unit: {
        browsers: TEST_BROWSERS
      }
    },

    release: {
      options: {
        tagName: 'v<%= version %>',
        commitMessage: 'chore(project): release v<%= version %>',
        tagMessage: 'chore(project): tag v<%= version %>'
      }
    },

    bundle: {
      properties_panel: {
        modName: 'BpmnJSPropertiesPanel',
        name: 'bpmn-js-properties-panel',
        src: '<%= config.sources %>/index.js',
        dest: '<%= config.dist %>'
      },
      bpmn_provider: {
        modName: 'BpmnJSPropPanel_BPMNProvider',
        name: 'bpmn-provider',
        src: '<%= config.sources %>/provider/bpmn/index.js',
        dest: '<%= config.dist %>/providers'
      },
      camunda_provider: {
        modName: 'BpmnJSPropPanel_CamundaProvider',
        name: 'camunda-provider',
        src: '<%= config.sources %>/provider/camunda/index.js',
        dest: '<%= config.dist %>/providers'
      }
    }

  });

  // tasks
  grunt.loadTasks('tasks');

  grunt.registerTask('test', [ 'karma:single' ]);

  grunt.registerTask('auto-test', [ 'karma:unit' ]);

  grunt.registerTask('default', [ 'jshint', 'test', 'bundle' ]);

};
