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
  camundaModdlePackage = require('../../../../lib/provider/camunda/camunda-moddle'),
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

describe('external-service-task-properties', function() {

  var diagramXML = require('./ExternalServiceTask.bpmn');

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

  it('should fetch properties of an external service task',
    inject(function(propertiesPanel, selection, elementRegistry) {

    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('ServiceTask_external');
    selection.select(shape);

    var topicField = domQuery('input[name=externalTopic]', propertiesPanel._container),
    	implType = domQuery('select[name=implType] > option:checked', propertiesPanel._container),
      businessObject = getBusinessObject(shape);

    expect(implType.value).to.equal('type');
    expect(topicField.value).to.equal('ShipmentProcessing');
    expect(topicField.value).to.equal(businessObject.get('camunda:topic'));
    expect(businessObject.get('camunda:type')).to.equal('external');
  }));

  it('should not fetch external task properties of a business rule task',
    inject(function(propertiesPanel, selection, elementRegistry) {

    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('BusinessRuleTask_1');
    selection.select(shape);

    var topicField = domQuery('input[name=externalTopic]', propertiesPanel._container),
        implType = domQuery('select[name=implType] > option:checked', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    expect(implType.value).to.not.equal('type');
    expect(topicField).to.be.null;
    expect(implType.value).to.equal('decisionRef');
    expect(businessObject).to.not.have.property('topic');
    expect(businessObject).to.not.have.property('type');
  }));

  it('should fill topic property of an external service task',
    inject(function(propertiesPanel, selection, elementRegistry) {

    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('ServiceTask_external');
    selection.select(shape);

    var topicField = domQuery('input[name=externalTopic]', propertiesPanel._container),
        implType = domQuery('select[name=implType] > option:checked', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(implType.value).to.equal('type');
    expect(topicField.value).to.equal('ShipmentProcessing');
    expect(topicField.value).to.equal(businessObject.get('camunda:topic'));

    // when
    TestHelper.triggerValue(topicField, 'OrderProcessing');

    // then
    expect(implType.value).to.equal('type');
    expect(topicField.value).to.equal('OrderProcessing');
    expect(topicField.value).to.equal(businessObject.get('camunda:topic'));
  }));

  it('should delete topic property of an external service task',
    inject(function(propertiesPanel, selection, elementRegistry) {

    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('ServiceTask_external');
    selection.select(shape);

    var topicField = domQuery('input[name=externalTopic]', propertiesPanel._container),
        implType = domQuery('select[name=implType] > option:checked', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(implType.value).to.equal('type');
    expect(topicField.value).to.equal('ShipmentProcessing');
    expect(topicField.value).to.equal(businessObject.get('camunda:topic'));

    // when
    TestHelper.triggerValue(topicField, '');

    // then
    expect(implType.value).to.equal('type');
    expect(topicField.className).to.equal('invalid');
    expect(businessObject.get('camunda:topic')).to.equal('ShipmentProcessing');
  }));

  it('should change implementation type from external service task to java class',
    inject(function(propertiesPanel, selection, elementRegistry) {

    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('ServiceTask_external');
    selection.select(shape);

    var topicField = domQuery('input[name=externalTopic]', propertiesPanel._container),
        implType = domQuery('select[name=implType]', propertiesPanel._container),
        classField = domQuery('input[name=delegate]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(implType.value).to.equal('type');
    expect(topicField.value).to.equal('ShipmentProcessing');
    expect(topicField.value).to.equal(businessObject.get('camunda:topic'));
    expect(classField.parentElement.className).to.contain('djs-properties-hide');

    // when
    // select 'class'
    implType.options[0].selected = 'selected';
    TestHelper.triggerEvent(implType, 'change');
    TestHelper.triggerValue(classField, 'myClass');

    // then
    expect(implType.value).to.equal('class');
    expect(topicField.parentElement.className).to.contain('djs-properties-hide');
    expect(classField.value).to.equal('myClass');
    expect(businessObject.get('camunda:class')).to.equal(classField.value);
    expect(businessObject).to.have.property('class');
    expect(businessObject.get('camunda:type')).to.be.undefined;
    expect(businessObject.get('camunda:topic')).to.be.undefined;
  }));

  it('should change implementation type from expression to external service task',
    inject(function(propertiesPanel, selection, elementRegistry) {

    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('ServiceTask_1');
    selection.select(shape);

    var topicField = domQuery('input[name=externalTopic]', propertiesPanel._container),
        implType = domQuery('select[name=implType]', propertiesPanel._container),
        expressionField = domQuery('input[name=delegate]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(implType.value).to.equal('expression');
    expect(expressionField.value).to.equal('BAR');
    expect(topicField.parentElement.className).to.contain('djs-properties-hide');
    expect(businessObject.get('camunda:expression')).to.equal(expressionField.value);

    // when
    // select 'external'
    implType.options[3].selected = 'selected';
    TestHelper.triggerEvent(implType, 'change');
    TestHelper.triggerValue(topicField, 'OrderProcessing');

    // then
    expect(implType.value).to.equal('type');
    expect(expressionField.parentElement.className).to.contain('djs-properties-hide');
    expect(topicField.value).to.equal('OrderProcessing');
    expect(businessObject.get('camunda:topic')).to.equal(topicField.value);
    expect(businessObject.get('camunda:type')).to.equal('external');
    expect(businessObject.get('camunda:expression')).to.be.undefined;
    expect(businessObject.get('camunda:resultVariable')).to.be.undefined;
  }));

});
