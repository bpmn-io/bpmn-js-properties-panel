'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('lib'),
    domQuery = require('min-dom').query,
    coreModule = require('bpmn-js/lib/core').default,
    selectionModule = require('diagram-js/lib/features/selection').default,
    modelingModule = require('bpmn-js/lib/features/modeling').default,
    propertiesProviderModule = require('lib/provider/bpmn'),
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;


describe('documentation-properties', function() {

  var diagramXML = require('./Documentation.bpmn');

  var testModules = [
    coreModule, selectionModule, modelingModule,
    propertiesPanelModule,
    propertiesProviderModule
  ];

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapModeler(diagramXML, {
    modules: testModules
  }));


  beforeEach(inject(function(commandStack, propertiesPanel) {

    var undoButton = document.createElement('button');
    undoButton.textContent = 'UNDO';

    undoButton.addEventListener('click', function() {
      commandStack.undo();
    });

    container.appendChild(undoButton);

    propertiesPanel.attachTo(container);
  }));


  describe('should fetch documentation', function() {

    it('basic', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('ServiceTask_1');
      selection.select(shape);
      var textField = domQuery('div[name=documentation]', propertiesPanel._container);

      expect(textField.textContent).to.equal('Task');
    }));


    it('documentation list', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('MULTIPLE_DOCS');
      selection.select(shape);
      var textField = domQuery('div[name=documentation]', propertiesPanel._container);

      expect(textField.textContent).to.equal('MULTIPLE_DOCS');
    }));


    it('ignoring typed documentation', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('TYPED_DOCS');
      selection.select(shape);
      var textField = domQuery('div[name=documentation]', propertiesPanel._container);

      expect(textField.textContent).to.equal('');
    }));


    it('picking up textFormat=text/plain', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('TEXT_PLAIN');
      selection.select(shape);
      var textField = domQuery('div[name=documentation]', propertiesPanel._container);

      expect(textField.textContent).to.equal('TEXT_PLAIN');
    }));

  });


  describe('should set the documentation', function() {

    it('basic', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('BoundaryEvent_1');
      selection.select(shape);
      var textField = domQuery('div[name=documentation]', propertiesPanel._container),
          businessObject = getBusinessObject(shape);

      // given
      expect(textField.textContent).to.be.empty;

      // when
      TestHelper.triggerValue(textField, 'foo', 'change');

      var documentation = businessObject.get('documentation');

      // then
      expect(textField.textContent).to.equal('foo');
      expect(documentation.length).to.be.at.least(0);
      expect(documentation[0].text).to.equal('foo');
      expect(documentation[0].$instanceOf('bpmn:Documentation')).to.be.true;
    }));


    it('documentation list', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('MULTIPLE_DOCS');
      selection.select(shape);
      var textField = domQuery('div[name=documentation]', propertiesPanel._container),
          businessObject = getBusinessObject(shape);

      // given
      expect(textField.textContent).to.eql('MULTIPLE_DOCS');

      // when
      TestHelper.triggerValue(textField, 'foo', 'change');

      var documentation = businessObject.get('documentation');

      // then
      expect(textField.textContent).to.equal('foo');
      expect(documentation.length).to.be.at.least(0);
      expect(documentation[1].text).to.equal('foo');
      expect(documentation[1].$instanceOf('bpmn:Documentation')).to.be.true;
    }));


    it('ignoring typed documentation', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('TYPED_DOCS');
      selection.select(shape);
      var textField = domQuery('div[name=documentation]', propertiesPanel._container),
          businessObject = getBusinessObject(shape);

      // given
      expect(textField.textContent).to.be.empty;

      // when
      TestHelper.triggerValue(textField, 'foo', 'change');

      var documentation = businessObject.get('documentation');

      // then
      expect(textField.textContent).to.equal('foo');
      expect(documentation.length).to.be.at.least(0);
      expect(documentation[1].text).to.equal('foo');
      expect(documentation[1].$instanceOf('bpmn:Documentation')).to.be.true;
    }));

  });


  describe('should remove the documentation', function() {

    it('basic', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('ServiceTask_1');
      selection.select(shape);
      var textField = domQuery('div[name=documentation]', propertiesPanel._container);
      var businessObject = getBusinessObject(shape);

      // given
      expect(textField.textContent).to.equal('Task');

      // when
      TestHelper.triggerValue(textField, '', 'change');

      // then
      expect(textField.textContent).to.equal('');
      expect(businessObject.get('documentation')).to.have.length(0);
    }));


    it('documentation list', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('MULTIPLE_DOCS');
      selection.select(shape);
      var textField = domQuery('div[name=documentation]', propertiesPanel._container);
      var businessObject = getBusinessObject(shape);

      // given
      expect(textField.textContent).to.equal('MULTIPLE_DOCS');

      // when
      TestHelper.triggerValue(textField, '', 'change');

      // then
      expect(textField.textContent).to.equal('');
      expect(businessObject.get('documentation')).to.have.length(1);
      expect(businessObject.get('documentation')[0].text).to.eql('VENDOR DOCS');
    }));

  });

});
