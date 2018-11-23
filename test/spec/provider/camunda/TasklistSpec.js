'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('lib'),
    domQuery = require('min-dom').query,
    coreModule = require('bpmn-js/lib/core').default,
    selectionModule = require('diagram-js/lib/features/selection').default,
    modelingModule = require('bpmn-js/lib/features/modeling').default,
    propertiesProviderModule = require('lib/provider/camunda'),
    camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda'),
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;


describe('isStartableInTasklist', function() {

  var testModules = [
    coreModule, selectionModule, modelingModule,
    propertiesPanelModule,
    propertiesProviderModule
  ];

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  describe('process', function() {
    var diagramXML = require('./TasklistProcess.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules,
      moddleExtensions: { camunda: camundaModdlePackage }
    }));

    beforeEach(inject(function(commandStack, propertiesPanel) {
      propertiesPanel.attachTo(container);
    }));


    it('should get property of process', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('Process_1'),
          inputEl = 'input[name=isStartableInTasklist]';

      // when
      selection.select(shape);

      var bo = getBusinessObject(shape),
          checked = domQuery(inputEl, propertiesPanel._container).checked;

      // then
      // non-default false property is set
      expect(bo.get('camunda:isStartableInTasklist')).to.be.false;
      expect(checked).to.be.false;
    }));


    it('should set property of process', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('Process_1'),
          inputEl = 'input[name=isStartableInTasklist]';

      // given
      selection.select(shape);

      var inputElement = domQuery(inputEl, propertiesPanel._container),
          bo = getBusinessObject(shape);

      // when
      TestHelper.triggerEvent(inputElement, 'click');

      // then
      // default true property is set
      expect(bo.get('camunda:isStartableInTasklist')).to.be.true;
    }));

  });


  describe('Participant', function() {
    var diagramXML = require('./TasklistParticipant.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules,
      moddleExtensions: { camunda: camundaModdlePackage }
    }));

    beforeEach(inject(function(commandStack, propertiesPanel) {
      propertiesPanel.attachTo(container);
    }));


    describe('should get property of referenced process', function() {

      it('explicitly set to FALSE', inject(function(propertiesPanel, selection, elementRegistry) {

        // given
        var shape = elementRegistry.get('Participant_Not_Startable'),
            inputEl = 'input[name=isStartableInTasklist]';

        // when
        selection.select(shape);

        var bo = getBusinessObject(shape).get('processRef'),
            checked = domQuery(inputEl, propertiesPanel._container).checked;

        // then
        expect(bo.get('camunda:isStartableInTasklist')).to.be.false;
        expect(checked).to.be.false;
      }));


      it('default value present', inject(function(propertiesPanel, selection, elementRegistry) {

        // given
        var shape = elementRegistry.get('Participant_Startable'),
            inputEl = 'input[name=isStartableInTasklist]';

        // when
        selection.select(shape);

        var bo = getBusinessObject(shape).get('processRef'),
            checked = domQuery(inputEl, propertiesPanel._container).checked;

        // then
        expect(bo.get('camunda:isStartableInTasklist')).to.be.true;
        expect(checked).to.be.true;
      }));

    });


    describe('should set property of referenced process', function() {

      it('to FALSE', inject(function(propertiesPanel, selection, elementRegistry) {

        // given
        var shape = elementRegistry.get('Participant_Startable'),
            inputEl = 'input[name=isStartableInTasklist]';

        selection.select(shape);

        var bo = getBusinessObject(shape).get('processRef'),
            inputElement = domQuery(inputEl, propertiesPanel._container);

        // when
        TestHelper.triggerEvent(inputElement, 'click');

        // then
        expect(bo.get('camunda:isStartableInTasklist')).to.be.false;
      }));


      it('to default value (TRUE)', inject(function(propertiesPanel, selection, elementRegistry) {

        // given
        var shape = elementRegistry.get('Participant_Not_Startable'),
            inputEl = 'input[name=isStartableInTasklist]';

        selection.select(shape);

        var bo = getBusinessObject(shape).get('processRef'),
            inputElement = domQuery(inputEl, propertiesPanel._container);

        // when
        TestHelper.triggerEvent(inputElement, 'click');

        // then
        expect(bo.get('camunda:isStartableInTasklist')).to.be.true;
      }));

    });


    it('should hide editing controls on collapsed pool', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('Participant_Collapsed'),
          inputEl = 'input[name=isStartableInTasklist]';

      // when
      selection.select(shape);

      var el = domQuery(inputEl, propertiesPanel._container);

      // then
      expect(el).not.to.exist;
    }));

  });

});
