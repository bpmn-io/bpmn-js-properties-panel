'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('../../../../lib'),
  domQuery = require('min-dom/lib/query'),
  domClasses = require('min-dom/lib/classes'),
  coreModule = require('bpmn-js/lib/core'),
  selectionModule = require('diagram-js/lib/features/selection'),
  modelingModule = require('bpmn-js/lib/features/modeling'),
  propertiesProviderModule = require('../../../../lib/provider/bpmn'),
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

describe('id-properties', function() {

  var diagramXML = require('./Id.bpmn');

  var testModules = [
    coreModule, selectionModule, modelingModule,
    propertiesPanelModule,
    propertiesProviderModule
  ];

  var container,
      shape,
      textField,
      businessObject;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapModeler(diagramXML, {
    modules: testModules
  }));


  beforeEach(inject(function(commandStack, propertiesPanel, selection, elementRegistry) {

    var undoButton = document.createElement('button');
    undoButton.textContent = 'UNDO';

    undoButton.addEventListener('click', function() {
      commandStack.undo();
    });

    container.appendChild(undoButton);

    propertiesPanel.attachTo(container);

    shape = elementRegistry.get('StartEvent_1');
    selection.select(shape);

    textField = domQuery('input[name=id]', propertiesPanel._container);
    businessObject = getBusinessObject(shape);
  }));


  it('should fetch the id for an element', inject(function(propertiesPanel) {

    // when selecting element

    // then
    expect(textField.value).to.equal(businessObject.get('id'));
  }));


  describe('set', function() {

    it('should set the id for an element', inject(function(propertiesPanel) {

      // assume
      expect(textField.value).to.equal('StartEvent_1');

      // when
      TestHelper.triggerValue(textField, 'foo', 'change');

      // then
      expect(textField.value).to.equal('foo');
      expect(businessObject.get('id')).to.equal('foo');
    }));


    it('should not remove the id for an element', inject(function(propertiesPanel) {

      // assume
      expect(textField.value).to.equal('StartEvent_1');

      // when
      TestHelper.triggerValue(textField, '', 'change');

      // then
      expect(businessObject.get('id')).to.equal('StartEvent_1');
    }));


    it('should not set the id with a space for an element', inject(function(propertiesPanel) {

      // assume
      expect(textField.value).to.equal('StartEvent_1');

      // when
      TestHelper.triggerValue(textField, 'foo bar', 'change');

      // then
      expect(businessObject.get('id')).to.equal('StartEvent_1');
    }));

    it('should not set invalid QName id for an element', inject(function(propertiesPanel) {

      // assume
      expect(textField.value).to.equal('StartEvent_1');

      // when
      TestHelper.triggerValue(textField, '::FOO', 'change');

      // then
      expect(businessObject.get('id')).to.equal('StartEvent_1');
    }));

    it('should not set invalid HTML characters id for an element', inject(function(propertiesPanel) {

      // assume
      expect(textField.value).to.equal('StartEvent_1');

      // when
      TestHelper.triggerValue(textField, '<hello>', 'change');

      // then
      expect(businessObject.get('id')).to.equal('StartEvent_1');
    }));

  });


  describe('validation errors', function() {

    it('should not be shown if id is valid', function() {

      // when
      TestHelper.triggerValue(textField, 'foo', 'change');

      // then
      expect(domClasses(textField).has('invalid')).to.be.false;
    });


    it('should be shown if id gets removed', function() {

      // when
      TestHelper.triggerValue(textField, '', 'change');

      // then
      expect(domClasses(textField).has('invalid')).to.be.true;
    });


    it('should be shown if id contains space', function() {

      // when
      TestHelper.triggerValue(textField, 'foo bar', 'change');

      // then
      expect(domClasses(textField).has('invalid')).to.be.true;
    });


    it('should be shown if id is invalid QName', function() {

      // when
      TestHelper.triggerValue(textField, '::FOO', 'change');

      // then
      expect(domClasses(textField).has('invalid')).to.be.true;
    });


    it('should be shown if id contains HTML characters', function() {

      // when
      TestHelper.triggerValue(textField, '<hello>', 'change');

      // then
      expect(domClasses(textField).has('invalid')).to.be.true;
    });

  });

});
