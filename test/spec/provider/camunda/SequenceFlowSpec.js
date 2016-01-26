'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('../../../../lib'),
  domQuery = require('min-dom/lib/query'),
  coreModule = require('bpmn-js/lib/core'),
  selectionModule = require('diagram-js/lib/features/selection'),
  modelingModule = require('bpmn-js/lib/features/modeling'),
  propertiesProviderModule = require('../../../../lib/provider/camunda'),
  camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda'),
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

describe('sequence-flow-properties', function() {

  var diagramXML = require('./SequenceFlow.bpmn');

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


  beforeEach(inject(function(commandStack, propertiesPanel) {

    var undoButton = document.createElement('button');
    undoButton.textContent = 'UNDO';

    undoButton.addEventListener('click', function() {
      commandStack.undo();
    });

    container.appendChild(undoButton);

    propertiesPanel.attachTo(container);
  }));


  it('should fetch the condition of a sequence flow',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('SequenceFlow_2');
    selection.select(shape);

    var conditionType = TestHelper.selectedByIndex(domQuery('select[name=conditionType]', propertiesPanel._container)),
        conditionInput = domQuery('input[name="condition"]', propertiesPanel._container);

    expect(conditionType.value).to.equal('expression');
    expect(conditionInput.value).to.equal('${foo.id()}');

  }));


  it('should change the condition of a sequence flow',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('SequenceFlow_2');
    selection.select(shape);

    var businessObject = getBusinessObject(shape),
      conditionType = TestHelper.selectedByIndex(domQuery('select[name=conditionType]', propertiesPanel._container)),
      conditionInput = domQuery('input[name="condition"]', propertiesPanel._container);

    // given
    expect(conditionType.value).to.equal('expression');
    expect(conditionInput.value).to.equal('${foo.id()}');
    expect(businessObject.conditionExpression.get('body')).to.equal(conditionInput.value);

    // when
    TestHelper.triggerValue(conditionInput, 'test');

    // then
    expect(conditionInput.value).to.equal('test');
    expect(businessObject.conditionExpression.get('body')).to.equal(conditionInput.value);

  }));


  it('should remove the condition of a condition expression sequence flow',
    inject(function(propertiesPanel, selection, elementRegistry) {


    var shape = elementRegistry.get('SequenceFlow_2');
    selection.select(shape);

    var businessObject = getBusinessObject(shape),
      conditionType = TestHelper.selectedByIndex(domQuery('select[name=conditionType]', propertiesPanel._container)),
      conditionInput = domQuery('input[name="condition"]', propertiesPanel._container);

    // given
    expect(conditionType.value).to.equal('expression');
    expect(conditionInput.value).to.equal('${foo.id()}');
    expect(businessObject.conditionExpression.get('body')).to.equal(conditionInput.value);

    // when
    TestHelper.triggerValue(conditionInput, '');

    // then
    expect(conditionInput.value).to.be.empty;
    expect(conditionInput.className).to.equal('invalid');
    expect(businessObject.conditionExpression.get('body')).to.equal('');

  }));


  it('should change condition type from expression to ""',
    inject(function(propertiesPanel, selection, elementRegistry) {


    var shape = elementRegistry.get('SequenceFlow_2');
    selection.select(shape);

    var businessObject = getBusinessObject(shape),
      conditionType = domQuery('select[name=conditionType]', propertiesPanel._container),
      conditionInput = domQuery('input[name="condition"]', propertiesPanel._container);

    // given
    expect(conditionType.value).to.equal('expression');
    expect(conditionInput.value).to.equal('${foo.id()}');
    expect(businessObject.conditionExpression.get('body')).to.equal(conditionInput.value);

    // when
    // select ''
    conditionType.options[2].selected = 'selected';
    TestHelper.triggerEvent(conditionType, 'change');

    // then
    expect(conditionType.value).to.equal('');
    expect(conditionInput.parentElement.className).to.contain('pp-hidden');
    expect(businessObject.conditionExpression).to.be.undefined;

  }));


});
