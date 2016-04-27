'use strict';

var TestHelper = require('../../../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('../../../../../../lib'),
    domQuery = require('min-dom/lib/query'),
    is = require('bpmn-js/lib/util/ModelUtil').is,
    forEach = require('lodash/collection/forEach'),
    coreModule = require('bpmn-js/lib/core'),
    selectionModule = require('diagram-js/lib/features/selection'),
    modelingModule = require('bpmn-js/lib/features/modeling'),
    propertiesProviderModule = require('../../../../../../lib/provider/camunda'),
    camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda'),
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;


var testModules = [
  coreModule,
  selectionModule,
  modelingModule,
  propertiesPanelModule,
  propertiesProviderModule
];


function bootstrap(diagramXML, elementTemplates) {

  return function(done) {
    bootstrapModeler(diagramXML, {
      modules: testModules,
      elementTemplates: elementTemplates,
      moddleExtensions: {
        camunda: camundaModdlePackage
      },
      propertiesPanel: {
        parent: document.querySelector('body')
      }
    })(done);
  };
}


describe('element-templates/parts - Chooser', function() {

  describe('activation', function() {

    var diagramXML = require('./ChooserProps.bpmn'),
        elementTemplates = require('./ChooserProps.json');

    beforeEach(bootstrap(diagramXML, elementTemplates));


    it('should boostrap with bpmn-js', inject(function() {

    }));

  });


  describe('task handling', function() {

    var diagramXML = require('./ChooserProps.bpmn'),
        elementTemplates = [
          require('../cmd/mail-task'),
          require('../cmd/vip-path'),
          require('../cmd/serviceTask-delegateExpression'),
          require('../cmd/better-async-task')
        ];

    beforeEach(bootstrap(diagramXML, elementTemplates));


    it('should boostrap with bpmn-js', inject(function() {

    }));

  });

});