'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('../../../../lib'),
  domQuery = require('min-dom/lib/query'),
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


  it('should fetch the id for an element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('ServiceTask_1');
    selection.select(shape);

    var textField = domQuery('input[name=id]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    expect(textField.value).to.equal(businessObject.get('id'));
  }));


  it('should set the id for an element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('StartEvent_1');
    selection.select(shape);

    var textField = domQuery('input[name=id]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(textField.value).to.equal('StartEvent_1');

    // when
    TestHelper.triggerValue(textField, 'foo', 'change');

    // then
    expect(textField.value).to.equal('foo');
    expect(businessObject.get('id')).to.equal('foo');
  }));


  it('should not remove the id for an element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('ServiceTask_1');
    selection.select(shape);

    var textField = domQuery('input[name=id]', propertiesPanel._container);
    var businessObject = getBusinessObject(shape);

    // given
    expect(textField.value).to.equal('ServiceTask_1');

    // when
    TestHelper.triggerValue(textField, '', 'change');

    // then
    var errorMessages = domQuery.all('.pp-error-message', propertiesPanel._container);

    expect(textField.value).to.equal('');
    expect(textField.getAttribute('class')).to.equal('invalid');
    expect(errorMessages).to.have.length(1);
    expect(errorMessages[0].textContent).to.equal('Element must have an unique id.');
    expect(businessObject.get('id')).to.equal('ServiceTask_1');
  }));


  it('should not set the id with a space for an element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('StartEvent_1');
    selection.select(shape);

    var textField = domQuery('input[name=id]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(textField.value).to.equal('StartEvent_1');

    // when
    TestHelper.triggerValue(textField, 'foo bar', 'change');

    // then
    expect(textField.className).to.equal('invalid');
    expect(textField.value).to.equal('foo bar');
    expect(businessObject.get('id')).to.equal('StartEvent_1');
  }));

  it('should not set invalid QName id for an element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('StartEvent_1');
    selection.select(shape);

    var textField = domQuery('input[name=id]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(textField.value).to.equal('StartEvent_1');

    // when
    TestHelper.triggerValue(textField, '::FOO', 'change');

    // then
    expect(textField.className).to.equal('invalid');
    expect(textField.value).to.equal('::FOO');
    expect(businessObject.get('id')).to.equal('StartEvent_1');
  }));

  it('should not set invalid HTML characters id for an element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('StartEvent_1');
    selection.select(shape);

    var textField = domQuery('input[name=id]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(textField.value).to.equal('StartEvent_1');

    // when
    TestHelper.triggerValue(textField, '<hello>', 'change');

    // then
    expect(textField.className).to.equal('invalid');
    expect(textField.value).to.equal('<hello>');
    expect(businessObject.get('id')).to.equal('StartEvent_1');
  }));

});
