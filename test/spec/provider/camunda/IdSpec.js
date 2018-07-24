'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('lib'),
    domQuery = require('min-dom').query,
    coreModule = require('bpmn-js/lib/core').default,
    selectionModule = require('diagram-js/lib/features/selection').default,
    modelingModule = require('bpmn-js/lib/features/modeling').default,
    propertiesProviderModule = require('lib/provider/camunda');

describe('id-properties', function() {

  var testModules = [
    coreModule,
    selectionModule,
    modelingModule,
    propertiesPanelModule,
    propertiesProviderModule
  ];

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  function hintVisible(elementId, fieldName) {

    fieldName = fieldName || 'id';

    return TestHelper.getBpmnJS().invoke(function(elementRegistry, selection) {

      var element = elementRegistry.get(elementId);

      expect(element).to.exist;

      selection.select(element);

      var descriptionNode = domQuery(
        '[data-entry=' + fieldName + '] .bpp-field-description'
      );

      return !!descriptionNode;
    });
  }


  describe('key hint in process diagram', function() {

    var diagramXML = require('./Id.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));

    beforeEach(inject(function(propertiesPanel) {
      propertiesPanel.attachTo(container);
    }));


    it('should show for Process', function() {
      expect(hintVisible('Process_1')).to.be.true;
    });


    it('should hide for StartEvent', function() {
      expect(hintVisible('StartEvent_1')).to.be.false;
    });

  });


  describe('key hint in collaboration diagram', function() {

    var diagramXML = require('./Id-collaboration.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));

    beforeEach(inject(function(propertiesPanel) {
      propertiesPanel.attachTo(container);
    }));


    it('should show for Participant', function() {
      expect(hintVisible('Participant_1')).to.be.false;

      expect(hintVisible('Participant_1', 'process-id')).to.be.true;
    });


    it('should hide for StartEvent', function() {
      expect(hintVisible('StartEvent_1')).to.be.false;
    });

  });


});
