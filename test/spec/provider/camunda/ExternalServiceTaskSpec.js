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
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    eventDefinitionHelper = require('../../../../lib/helper/EventDefinitionHelper');

var find = require('lodash/collection/find');

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
    moddleExtensions: { camunda: camundaModdlePackage }
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


  it('should fetch properties of an external service task', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('ServiceTask_external');
    selection.select(shape);

    var topicField = domQuery('input[name=externalTopic]', propertiesPanel._container),
        implType = TestHelper.selectedByIndex(domQuery('select[name=implType]', propertiesPanel._container)),
        businessObject = getBusinessObject(shape);

    expect(implType.value).to.equal('external');
    expect(topicField.value).to.equal('ShipmentProcessing');
    expect(topicField.value).to.equal(businessObject.get('camunda:topic'));
    expect(businessObject.get('camunda:type')).to.equal('external');
  }));


  it('should fill topic property of an external service task', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('ServiceTask_external');
    selection.select(shape);

    var topicField = domQuery('input[name=externalTopic]', propertiesPanel._container),
        implType = TestHelper.selectedByIndex(domQuery('select[name=implType]', propertiesPanel._container)),
        businessObject = getBusinessObject(shape);

    // given
    expect(implType.value).to.equal('external');
    expect(topicField.value).to.equal('ShipmentProcessing');
    expect(topicField.value).to.equal(businessObject.get('camunda:topic'));

    // when
    TestHelper.triggerValue(topicField, 'OrderProcessing');

    // then
    expect(implType.value).to.equal('external');
    expect(topicField.value).to.equal('OrderProcessing');
    expect(topicField.value).to.equal(businessObject.get('camunda:topic'));
  }));


  it('should delete topic property of an external service task', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('ServiceTask_external');
    selection.select(shape);

    var topicField = domQuery('input[name=externalTopic]', propertiesPanel._container),
        implType = TestHelper.selectedByIndex(domQuery('select[name=implType]', propertiesPanel._container)),
        businessObject = getBusinessObject(shape);

    // given
    expect(implType.value).to.equal('external');
    expect(topicField.value).to.equal('ShipmentProcessing');
    expect(topicField.value).to.equal(businessObject.get('camunda:topic'));

    // when
    TestHelper.triggerValue(topicField, '');

    // then
    expect(implType.value).to.equal('external');
    expect(topicField.className).to.equal('invalid');
    expect(businessObject.get('camunda:topic')).to.equal('');
  }));


  it('should change implementation type from external service task to java class', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('ServiceTask_external');
    selection.select(shape);

    var topicField = domQuery('input[name=externalTopic]', propertiesPanel._container),
        implType = domQuery('select[name=implType]', propertiesPanel._container),
        classField = domQuery('input[name=delegate]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(implType.value).to.equal('external');
    expect(topicField.value).to.equal('ShipmentProcessing');
    expect(topicField.value).to.equal(businessObject.get('camunda:topic'));
    expect(classField.parentElement.className).to.contain('bpp-hidden');

    // when
    // select 'class'
    implType.options[0].selected = 'selected';
    TestHelper.triggerEvent(implType, 'change');
    TestHelper.triggerValue(classField, 'myClass');

    // then
    expect(implType.value).to.equal('class');
    expect(topicField.parentElement.className).to.contain('bpp-hidden');
    expect(classField.value).to.equal('myClass');
    expect(businessObject.get('camunda:class')).to.equal(classField.value);
    expect(businessObject).to.have.property('class');
    expect(businessObject.get('camunda:type')).to.be.undefined;
    expect(businessObject.get('camunda:topic')).to.be.undefined;
  }));


  it('should change implementation type from expression to external service task', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('ServiceTask_1');
    selection.select(shape);

    var topicField = domQuery('input[name=externalTopic]', propertiesPanel._container),
        implType = domQuery('select[name=implType]', propertiesPanel._container),
        expressionField = domQuery('input[name=delegate]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(implType.value).to.equal('expression');
    expect(expressionField.value).to.equal('BAR');
    expect(topicField.parentElement.className).to.contain('bpp-hidden');
    expect(businessObject.get('camunda:expression')).to.equal(expressionField.value);

    // when
    // select 'external'
    implType.options[3].selected = 'selected';
    TestHelper.triggerEvent(implType, 'change');
    TestHelper.triggerValue(topicField, 'OrderProcessing');

    // then
    expect(implType.value).to.equal('external');
    expect(expressionField.parentElement.className).to.contain('bpp-hidden');
    expect(topicField.value).to.equal('OrderProcessing');
    expect(businessObject.get('camunda:topic')).to.equal(topicField.value);
    expect(businessObject.get('camunda:type')).to.equal('external');
    expect(businessObject.get('camunda:expression')).to.be.undefined;
    expect(businessObject.get('camunda:resultVariable')).to.be.undefined;
  }));


  it('should not fetch external task properties for a service task with type not equal "external"', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('ServiceTask_2');
    selection.select(shape);

    var topicField = domQuery('input[name=externalTopic]', propertiesPanel._container),
        implType = TestHelper.selectedByIndex(domQuery('select[name=implType]', propertiesPanel._container)),
        businessObject = getBusinessObject(shape);

    expect(implType.value).to.equal('');
    expect(topicField.value).to.be.empty;
    expect(businessObject.get('type')).to.be.equal('mail');
  }));


  it('should exist a camunda:topic element in the business object when changing expression to external service task', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('ServiceTask_1');
    selection.select(shape);

    var topicField = domQuery('input[name=externalTopic]', propertiesPanel._container),
        implType = domQuery('select[name=implType]', propertiesPanel._container),
        expressionField = domQuery('input[name=delegate]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(implType.value).to.equal('expression');
    expect(topicField.parentElement.className).to.contain('bpp-hidden');
    expect(businessObject.get('camunda:expression')).to.equal(expressionField.value);

    // when
    // select 'external'
    implType.options[3].selected = 'selected';
    TestHelper.triggerEvent(implType, 'change');

    // then
    expect(implType.value).to.equal('external');
    expect(expressionField.parentElement.className).to.contain('bpp-hidden');

    expect(topicField.value).to.be.empty;
    expect(topicField.className).to.equal('invalid');

    expect(businessObject.get('camunda:topic')).to.equal('');
    expect(businessObject.get('camunda:type')).to.equal('external');
    expect(businessObject.get('camunda:expression')).to.be.undefined;
    expect(businessObject.get('camunda:resultVariable')).to.be.undefined;
  }));


  describe('support', function() {

    var isContainedIn = function(selectBox, value) {
      return !!find(selectBox, function(node) {
        return node.value === value;
      });
    };

    function getImplementionTypeSelect(container) {
      return domQuery('div[data-entry="implementation"] select[name="implType"]', container);
    }

    function getTopicInput(container) {
      return domQuery('div[data-entry="externalTopic"] input[name="externalTopic"]', container);
    }

    it('should offer external as implementation type for an intermediate message event', inject(function(propertiesPanel, elementRegistry, selection) {

      // given
      var container = propertiesPanel._container;
      var shape = elementRegistry.get('INTERMEDIATE_MESSAGE');

      // when
      selection.select(shape);

      // then
      expect(isContainedIn(getImplementionTypeSelect(container), 'external')).to.be.true;
    }));


    it('should offer external as implementation type for an end message event', inject(function(propertiesPanel, elementRegistry, selection) {

      // given
      var container = propertiesPanel._container;
      var shape = elementRegistry.get('END_MESSAGE');

      // when
      selection.select(shape);

      // then
      expect(isContainedIn(getImplementionTypeSelect(container), 'external')).to.be.true;
    }));


    it('should set topic on message event definition', inject(function(propertiesPanel, elementRegistry, selection) {

      // given
      var container = propertiesPanel._container;
      var shape = elementRegistry.get('END_MESSAGE');
      selection.select(shape);

      var bo = getBusinessObject(shape);
      var messageDefinition = eventDefinitionHelper.getMessageEventDefinition(bo);

      var input = getTopicInput(container);

      // when
      TestHelper.triggerValue(input, 'foo', 'change');

      // then
      expect(messageDefinition.get('camunda:topic')).to.equal('foo');
    }));


    it('should offer external as implementation type for a business rule task', inject(function(propertiesPanel, elementRegistry, selection) {

      // given
      var container = propertiesPanel._container;
      var shape = elementRegistry.get('BUSINESS_RULE_TASK');

      // when
      selection.select(shape);

      // then
      expect(isContainedIn(getImplementionTypeSelect(container), 'external')).to.be.true;
    }));


    it('should offer external as implementation type for a service task', inject(function(propertiesPanel, elementRegistry, selection) {

      // given
      var container = propertiesPanel._container;
      var shape = elementRegistry.get('ServiceTask_external');

      // when
      selection.select(shape);

      // then
      expect(isContainedIn(getImplementionTypeSelect(container), 'external')).to.be.true;
    }));

  });

});
