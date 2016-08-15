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
      getTextField,
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

    getTextField = function() {
      return domQuery('input[name=id]', propertiesPanel._container);
    };

    textField = getTextField();

    businessObject = getBusinessObject(shape);
  }));


  it('should fetch the id for an element', inject(function(propertiesPanel) {

    // when selecting element

    // then
    expect(textField.value).to.equal(businessObject.get('id'));
  }));


  it('should fetch the id for label target', inject(function(propertiesPanel, selection) {

    // when selecting an element's label
    selection.select(shape.label);

    // then
    expect(getTextField().value).to.equal(businessObject.get('id'));
  }));


  describe('set', function() {

    it('should set the id for an element', inject(function(propertiesPanel) {

      // assume
      expect(textField.value).to.equal('StartEvent_1');

      // when
      TestHelper.triggerValue(textField, 'foo', 'change');

      // then
      expect(getTextField().value).to.equal('foo');
      expect(businessObject.get('id')).to.equal('foo');
    }));


    it('should set the id for label target', inject(function(propertiesPanel, selection) {

      // given
      selection.select(shape.label);

      var textField = getTextField();

      // assume
      expect(textField.value).to.equal('StartEvent_1');

      // when
      TestHelper.triggerValue(textField, 'foo', 'change');

      // then
      expect(getTextField().value).to.equal('foo');
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


    it('should set the id with the expression at the beginning', function() {

      // assume
      expect(textField.value).to.equal('StartEvent_1');

      // when
      TestHelper.triggerValue(textField, '${VERSION_TAG}_foo', 'change');

      // then
      expect(getTextField().value).to.equal('${VERSION_TAG}_foo');
      expect(businessObject.get('id')).to.equal('${VERSION_TAG}_foo');
    });


    it('should set the id with the expression at the end', function() {

      // assume
      expect(textField.value).to.equal('StartEvent_1');

      // when
      TestHelper.triggerValue(textField, 'foo_${VERSION_TAG}', 'change');

      // then
      expect(getTextField().value).to.equal('foo_${VERSION_TAG}');
      expect(businessObject.get('id')).to.equal('foo_${VERSION_TAG}');
    });


    it('should set the id with the expression in the middle', function() {

      // assume
      expect(textField.value).to.equal('StartEvent_1');

      // when
      TestHelper.triggerValue(textField, 'foo_${VERSION_TAG}_bar', 'change');

      // then
      expect(getTextField().value).to.equal('foo_${VERSION_TAG}_bar');
      expect(businessObject.get('id')).to.equal('foo_${VERSION_TAG}_bar');
    });


    it('should set the id which is only an expression', function() {

      // assume
      expect(textField.value).to.equal('StartEvent_1');

      // when
      TestHelper.triggerValue(textField, '${VERSION_TAG}', 'change');

      // then
      expect(getTextField().value).to.equal('${VERSION_TAG}');
      expect(businessObject.get('id')).to.equal('${VERSION_TAG}');
    });


    it('should not set the id which have an invalid QName inside the expression', function() {

      // assume
      expect(textField.value).to.equal('StartEvent_1');

      // when
      TestHelper.triggerValue(textField, '${VERSION:TAG}', 'change');

      // then
      expect(businessObject.get('id')).to.equal('StartEvent_1');
    });


    it('should not set the id which have only numbers inside the expression', function() {

      // assume
      expect(textField.value).to.equal('StartEvent_1');

      // when
      TestHelper.triggerValue(textField, '${123}', 'change');

      // then
      expect(businessObject.get('id')).to.equal('StartEvent_1');
    });


    it('should not set the id which have no text inside the expression', function() {

      // assume
      expect(textField.value).to.equal('StartEvent_1');

      // when
      TestHelper.triggerValue(textField, '${}', 'change');

      // then
      expect(businessObject.get('id')).to.equal('StartEvent_1');
    });


  });


  describe('validation errors', function() {

    it('should not be shown if id is valid', function() {

      // when
      TestHelper.triggerValue(textField, 'foo', 'change');

      // then
      expect(domClasses(getTextField()).has('invalid')).to.be.false;
    });


    it('should be shown if id gets removed', function() {

      // when
      TestHelper.triggerValue(textField, '', 'change');

      // then
      expect(domClasses(getTextField()).has('invalid')).to.be.true;
    });


    it('should be shown if id contains space', function() {

      // when
      TestHelper.triggerValue(textField, 'foo bar', 'change');

      // then
      expect(domClasses(getTextField()).has('invalid')).to.be.true;
    });


    it('should be shown if id is invalid QName', function() {

      // when
      TestHelper.triggerValue(textField, '::FOO', 'change');

      // then
      expect(domClasses(getTextField()).has('invalid')).to.be.true;
    });


    it('should be shown if id contains HTML characters', function() {

      // when
      TestHelper.triggerValue(textField, '<hello>', 'change');

      // then
      expect(domClasses(getTextField()).has('invalid')).to.be.true;
    });

  });

});
