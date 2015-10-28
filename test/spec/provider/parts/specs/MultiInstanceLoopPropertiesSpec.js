'use strict';

var TestHelper = require('../../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('../../../../../lib'),
  domQuery = require('min-dom/lib/query'),
  coreModule = require('bpmn-js/lib/core'),
  selectionModule = require('diagram-js/lib/features/selection'),
  modelingModule = require('bpmn-js/lib/features/modeling'),
  propertiesProviderModule = require('../../../../../lib/provider/camunda'),
  camundaModdlePackage = require('../../../../../lib/provider/camunda/camunda-moddle'),
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

describe('multi-instance-loop-properties', function() {

  var diagramXML = require('../diagrams/MultiInstanceLoopPropertyTest.bpmn');

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
    modules: testModules,
    moddleExtensions: {camunda: camundaModdlePackage}
  }));


  beforeEach(inject(function(commandStack) {

    var undoButton = document.createElement('button');
    undoButton.textContent = 'UNDO';

    undoButton.addEventListener('click', function() {
      commandStack.undo();
    });

    container.appendChild(undoButton);
  }));

  it('should fetch the loopCardinality for an element', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('ServiceTask');
    selection.select(shape);

    var businessObject = getBusinessObject(shape).get('loopCharacteristics');
    var textField = domQuery('input[name=multiInstance]', propertiesPanel._container);

    expect(textField.value).to.equal(businessObject.get('loopCardinality').get('body'));
    expect(domQuery.all('input[name=multiInstanceLoopType]:checked', propertiesPanel._container)[0].value).to.equal('loopCardinality');
  }));

  it('should set the loopCardinality for an element', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('ServiceTask');
    selection.select(shape);

    var textField = domQuery('input[name=multiInstance]', propertiesPanel._container);
    var businessObject = getBusinessObject(shape).get('loopCharacteristics');

    // given
    expect(textField.value).to.equal('card');
    expect(domQuery.all('input[name=multiInstanceLoopType]:checked', propertiesPanel._container)[0].value).to.equal('loopCardinality');

    // when
    TestHelper.triggerValue(textField, 'foo', 'change');

    // then
    expect(textField.value).to.equal('foo');
    expect(businessObject.get('loopCardinality').get('body')).to.equal('foo');
  }));

  it('should remove the loopCardinality value for an element', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('ServiceTask');
    selection.select(shape);

    var textField = domQuery('input[name=multiInstance]', propertiesPanel._container);
    var loopRadio = domQuery.all('input[name=multiInstanceLoopType]:checked', propertiesPanel._container)[0];

    // given
    expect(textField.value).to.equal('card');
    expect(loopRadio.value).to.equal('loopCardinality');

    // when
    TestHelper.triggerValue(textField, '', 'change');

    // then
    var businessObject = getBusinessObject(shape).get('loopCharacteristics');

    expect(textField.value).to.equal('');
    expect(businessObject.get('loopCardinality')).to.exist;
  }));

  it('should fetch the completionCondition for an element', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('ServiceTask');
    selection.select(shape);

    var textField = domQuery('input[name=completionCondition]', propertiesPanel._container);
    var businessObject = getBusinessObject(shape).get('loopCharacteristics');

    expect(textField.value).to.equal(businessObject.get('completionCondition').get('body'));
  }));

  it('should set the completionCondition for an element', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('ServiceTask');
    selection.select(shape);

    var businessObject = getBusinessObject(shape).get('loopCharacteristics');
    var textField = domQuery('input[name=completionCondition]', propertiesPanel._container);

    // given
    expect(businessObject.get('completionCondition').get('body')).to.equal('cond');
    expect(textField.value).to.equal('cond');

    // when
    TestHelper.triggerValue(textField, 'foo', 'change');

    // then
    expect(textField.value).to.equal('foo');
    expect(businessObject.get('completionCondition').get('body')).to.equal('foo');
  }));

  it('should remove the completionCondition for an element', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('ServiceTask');
    selection.select(shape);

    var textField = domQuery('input[name=completionCondition]', propertiesPanel._container);
    var businessObject = getBusinessObject(shape).get('loopCharacteristics');

    // given
    expect(textField.value).to.equal('cond');

    // when
    TestHelper.triggerValue(textField, '', 'change');

    // then
    expect(textField.value).to.equal('');
    expect(businessObject.get('completionCondition')).to.be.undefined;
  }));

  it('should fetch the collection for an element', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('ServiceTask3');
    selection.select(shape);

    var textField = domQuery('input[name=multiInstance]', propertiesPanel._container),
        elementVarInput = domQuery('input[name=elementVariable]', propertiesPanel._container),
        businessObject = getBusinessObject(shape).get('loopCharacteristics');

    expect(elementVarInput.value).to.equal(businessObject.get('camunda:elementVariable'));
    expect(textField.value).to.equal(businessObject.get('collection'));
  }));

  it('should set the collection for an element', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('ServiceTask3');
    selection.select(shape);

    var textField = domQuery('input[name=multiInstance]', propertiesPanel._container);
    var businessObject = getBusinessObject(shape).get('loopCharacteristics');

    // given
    expect(textField.value).to.equal('coll');
    expect(domQuery.all('input[name=multiInstanceLoopType]:checked', propertiesPanel._container)[0].value).to.equal('collection');

    // when
    TestHelper.triggerValue(textField, 'foo', 'change');

    // then
    expect(textField.value).to.equal('foo');
    expect(businessObject.get('collection')).to.equal('foo');
  }));

  it('should remove the collection value for an element', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('ServiceTask3');
    selection.select(shape);

    var textField = domQuery('input[name=multiInstance]', propertiesPanel._container);
    var loopRadio = domQuery.all('input[name=multiInstanceLoopType]:checked', propertiesPanel._container)[0];
    var businessObject = getBusinessObject(shape).get('loopCharacteristics');

    // given
    expect(textField.value).to.equal('coll');
    expect(loopRadio.value).to.equal('collection');

    // when
    TestHelper.triggerValue(textField, '', 'change');

    // then
    expect(textField.value).to.equal('');
    expect(businessObject.get('collection')).to.be.defined;
  }));

  it('should set the collection element variable for an element', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('ServiceTask3');
    selection.select(shape);

    var textField = domQuery('input[name=multiInstance]', propertiesPanel._container),
        elementVarInput = domQuery('input[name=elementVariable]', propertiesPanel._container),
        businessObject = getBusinessObject(shape).get('loopCharacteristics');

    // given
    expect(textField.value).to.equal('coll');
    expect(elementVarInput.value).to.equal('collVal');
    expect(domQuery.all('input[name=multiInstanceLoopType]:checked', propertiesPanel._container)[0].value).to.equal('collection');

    // when
    TestHelper.triggerValue(elementVarInput, 'myVar', 'change');

    // then
    expect(elementVarInput.value).to.equal('myVar');
    expect(businessObject.get('camunda:elementVariable')).to.equal('myVar');
  }));

  it('should remove the collection element variable for an element', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('ServiceTask3');
    selection.select(shape);

    var textField = domQuery('input[name=multiInstance]', propertiesPanel._container),
        elementVarInput = domQuery('input[name=elementVariable]', propertiesPanel._container),
        businessObject = getBusinessObject(shape).get('loopCharacteristics');

    // given
    expect(textField.value).to.equal('coll');
    expect(elementVarInput.value).to.equal('collVal');
    expect(domQuery.all('input[name=multiInstanceLoopType]:checked', propertiesPanel._container)[0].value).to.equal('collection');

    // when
    TestHelper.triggerValue(elementVarInput, '', 'change');

    // then
    expect(elementVarInput.value).to.be.empty;
    expect(businessObject.get('camunda:elementVariable')).to.be.undefined;
  }));

  it('should change multi instance collection to loop cardinality for an element', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('ServiceTask3');
    selection.select(shape);

    var textField = domQuery('input[name=multiInstance]', propertiesPanel._container),
        elementVarInput = domQuery('input[name=elementVariable]', propertiesPanel._container),
        radioButton = domQuery('input[value=loopCardinality]', propertiesPanel._container);
    var businessObject = getBusinessObject(shape).get('loopCharacteristics');

    // given
    expect(radioButton.checked).to.be.false;
    expect(textField.value).to.equal('coll');
    expect(elementVarInput.value).to.equal('collVal');
    expect(domQuery.all('input[name=multiInstanceLoopType]:checked', propertiesPanel._container)[0].value).to.equal('collection');

    // when
    TestHelper.triggerEvent(radioButton, 'click');

    expect(radioButton.checked).to.be.true;
    expect(businessObject.get('camunda:elementVariable')).to.be.undefined;
    expect(businessObject.get('collection')).to.be.undefined;
    expect(businessObject.get('loopCardinality')).to.be.ok;

  }));

  it('should fetch the multi instance async before property for an element', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('ServiceTask');
    selection.select(shape);

    var input = domQuery('input[name=loopAsyncBefore]', propertiesPanel._container),
        businessObject = getBusinessObject(shape).get('loopCharacteristics');

    expect(input.checked).to.equal(!!businessObject.get('asyncBefore'));
    expect(input.checked).to.be.ok;
  }));

  it('should set the multi instance async before property for an element', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    // given
    var shape = elementRegistry.get('ServiceTask');
    selection.select(shape);

    var input = domQuery('input[name=loopAsyncBefore]', propertiesPanel._container);

    // given
    expect(input.checked).to.be.ok;

    // when
    TestHelper.triggerEvent(input, 'click');

    var businessObject = getBusinessObject(shape).get('loopCharacteristics');

    // then
    expect(businessObject.get('asyncBefore')).to.not.be.ok;
    expect(input.checked).to.not.be.ok;
  }));

  it('should fetch the multi instance async after property for an element', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('ServiceTask');
    selection.select(shape);

    var input = domQuery('input[name=loopAsyncAfter]', propertiesPanel._container),
        businessObject = getBusinessObject(shape).get('loopCharacteristics');

    expect(input.checked).to.equal(!!businessObject.get('asyncAfter'));
    expect(input.checked).to.not.be.ok;
  }));

  it('should set the multi instance async after property for an element', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('ServiceTask');
    selection.select(shape);

    var businessObject = getBusinessObject(shape).get('loopCharacteristics');
    var input = domQuery('input[name=loopAsyncAfter]', propertiesPanel._container);

    // given
    expect(input.checked).to.not.be.ok;

    // when
    TestHelper.triggerEvent(input, 'click');

    // then
    expect(businessObject.get('asyncBefore')).to.be.ok;
    expect(input.checked).to.be.ok;
  }));

  it('should fetch the multi instance exclusive property for an element', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('ServiceTask');
    selection.select(shape);

    var input = domQuery('input[name=loopExclusive]', propertiesPanel._container),
        businessObject = getBusinessObject(shape).get('loopCharacteristics');

    expect(input.checked).to.equal(businessObject.get('exclusive'));
  }));

  it('should set the multi instance exclusive property for an element', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('ServiceTask');
    selection.select(shape);

    var input = domQuery('input[name=loopExclusive]', propertiesPanel._container);
    var  businessObject = getBusinessObject(shape).get('loopCharacteristics');

    // given
    expect(input.checked).to.be.ok;

    // when
    TestHelper.triggerEvent(input, 'click');

    // then
    expect(input.checked).to.equal(businessObject.get('exclusive'));
    expect(businessObject.get('exclusive')).to.not.be.ok;
  }));

  it('should reset the multi instance exclusive property for an element', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('ServiceTask');
    selection.select(shape);

    var exclusiveInput = domQuery('input[name=loopExclusive]', propertiesPanel._container),
        asyncBeforeInput = domQuery('input[name=loopAsyncBefore]', propertiesPanel._container);
    var businessObject = getBusinessObject(shape).get('loopCharacteristics');

    // given
    expect(exclusiveInput.checked).to.be.ok;
    expect(asyncBeforeInput.checked).to.be.ok;

    // when
    TestHelper.triggerEvent(exclusiveInput, 'click'); // change the value of the exclusive field
    TestHelper.triggerEvent(asyncBeforeInput, 'click'); // reset the exclusive field


    // then
    expect(exclusiveInput.checked).to.equal(businessObject.get('exclusive'));
    expect(businessObject.get('exclusive')).to.be.ok;
  }));

});
