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


describe('decision-business-rule-task-properties', function() {

  var diagramXML = require('./DecisionBusinessRuleTask.bpmn');

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


  it('should fetch properties of decision business rule task', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('BusinessRuleTask_1');
    selection.select(shape);

    var decisionRefField = domQuery('input[name=callableElementRef]', propertiesPanel._container),
        resultVariable = domQuery('div[data-entry=dmn-resultVariable] input[name=resultVariable]', propertiesPanel._container),
        implType = TestHelper.selectedByIndex(domQuery('select[name=implType]', propertiesPanel._container)),
        businessObject = getBusinessObject(shape);

    expect(implType.value).to.equal('dmn');
    expect(decisionRefField.value).to.equal('Bar');
    expect(decisionRefField.value).to.equal(businessObject.get('camunda:decisionRef'));
    expect(resultVariable.value).to.equal('resVar');
    expect(resultVariable.value).to.equal(businessObject.get('camunda:resultVariable'));
  }));


  it('should fill decisionRef field for an element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('BusinessRuleTask_Empty');
    selection.select(shape);

    var decisionRefField = domQuery('input[name=callableElementRef]', propertiesPanel._container),
        implType = domQuery('select[name=implType]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(implType.value).to.equal('');
    expect(businessObject).not.to.have.property('camunda:decisionRef');

    // when
    // select option 'dmn'
    implType.options[3].selected  = 'selected';
    TestHelper.triggerEvent(implType, 'change');

    TestHelper.triggerValue(decisionRefField, 'foo');

    // then
    expect(implType.value).to.equal('dmn');
    expect(decisionRefField.value).to.equal('foo');
    expect(decisionRefField.value).to.equal(businessObject.get('camunda:decisionRef'));
  }));


  it('remove decisionRef field is not necessary for an element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('BusinessRuleTask_1');
    selection.select(shape);

    var decisionRefField = domQuery('input[name=callableElementRef]', propertiesPanel._container),
        implType = domQuery('select[name=implType]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(businessObject.get('camunda:decisionRef')).to.equal('Bar');

    // when
    TestHelper.triggerValue(decisionRefField, '');

    // then
    expect(implType.value).to.equal('dmn');
    expect(decisionRefField.value).to.equal('');
    expect(decisionRefField.className).to.equal('invalid');
    expect(businessObject.get('camunda:decisionRef')).to.equal('');
  }));


  it('should exist default value "latest" for decision ref binding for an element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('BusinessRuleTask_Empty');
    selection.select(shape);

    var implType = domQuery('select[name=implType]', propertiesPanel._container),
        decisionRefBinding = domQuery('select[name="callableBinding"]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(implType.value).to.equal('');
    expect(businessObject).not.to.have.property('camunda:decisionRefBinding');

    // when
    // select option 'dmn'
    implType.options[3].selected  = 'selected';
    TestHelper.triggerEvent(implType, 'change');

    // then
    expect(implType.value).to.equal('dmn');
    expect(decisionRefBinding.value).to.equal('latest');
    // 'latest' is the default value for decisionRefBinding
    expect(businessObject).not.to.have.property('camunda:decisionRefBinding');
  }));


  it('should change decision ref binding for an element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('BusinessRuleTask_Deployment');
    selection.select(shape);

    var implType = domQuery('select[name=implType]', propertiesPanel._container),
        decisionRefBinding = domQuery('select[name="callableBinding"]', propertiesPanel._container),
        decisionRefVersion = domQuery('input[name=callableVersion]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(implType.value).to.equal('dmn');
    expect(decisionRefBinding.value).to.equal('deployment');
    expect(businessObject.get('camunda:decisionRefBinding')).to.equal(decisionRefBinding.value);
    expect(businessObject).not.to.have.property('camunda:decisionRefVersion');

    // when
    // select option 'version'
    decisionRefBinding.options[2].selected  = 'selected';
    TestHelper.triggerEvent(decisionRefBinding, 'change');

    TestHelper.triggerValue(decisionRefVersion, '14');

    // then
    expect(decisionRefBinding.value).to.equal('version');
    expect(businessObject.get('camunda:decisionRefBinding')).to.equal(decisionRefBinding.value);
    expect(decisionRefVersion.value).to.equal('14');
    expect(businessObject.get('camunda:decisionRefVersion')).to.equal(decisionRefVersion.value);
  }));


  it('remove decision ref version is not necessary for an element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('BusinessRuleTask_Version');
    selection.select(shape);

    var implType = domQuery('select[name=implType]', propertiesPanel._container),
        decisionRefBinding = domQuery('select[name="callableBinding"]', propertiesPanel._container),
        decisionRefVersion = domQuery('input[name=callableVersion]', propertiesPanel._container),
        decisionRefValue = domQuery('input[name=callableElementRef]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(implType.value).to.equal('dmn');
    expect(decisionRefBinding.value).to.equal('version');
    expect(businessObject.get('camunda:decisionRefBinding')).to.equal(decisionRefBinding.value);
    expect(decisionRefValue.value).to.equal('Bar');
    expect(businessObject.get('camunda:decisionRef')).to.equal(decisionRefValue.value);
    expect(decisionRefVersion.value).to.equal('12');
    expect(businessObject.get('camunda:decisionRefVersion')).to.equal(decisionRefVersion.value);

    // when
    TestHelper.triggerValue(decisionRefVersion, '');

    // then
    expect(decisionRefVersion.className).to.equal('invalid');
    expect(businessObject.get('camunda:decisionRefVersion')).to.be.undefined;
  }));


  it('should change implementation type from DMN to Java Class for an element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('BusinessRuleTask_Version');
    selection.select(shape);

    var implType = domQuery('select[name=implType]', propertiesPanel._container),
        decisionRefBinding = domQuery('select[name="callableBinding"]', propertiesPanel._container),
        decisionRefVersion = domQuery('input[name=callableVersion]', propertiesPanel._container),
        decisionRefValue = domQuery('input[name=callableElementRef]', propertiesPanel._container),
        delegateField = domQuery('input[name=delegate]', propertiesPanel._container),
        tenantField = domQuery('input[name=tenantId]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(implType.value).to.equal('dmn');
    expect(decisionRefBinding.value).to.equal('version');
    expect(businessObject.get('camunda:decisionRefBinding')).to.equal(decisionRefBinding.value);
    expect(decisionRefValue.value).to.equal('Bar');
    expect(businessObject.get('camunda:decisionRef')).to.equal(decisionRefValue.value);
    expect(decisionRefVersion.value).to.equal('12');
    expect(businessObject.get('camunda:decisionRefVersion')).to.equal(decisionRefVersion.value);
    expect(delegateField.value).to.be.empty;
    expect(tenantField.value).to.be.empty;

    // when
    // select option 'class'
    implType.options[0].selected = 'selected';
    TestHelper.triggerEvent(implType, 'change');
    TestHelper.triggerValue(delegateField,'foo');

    // then
    expect(implType.value).to.equal('class');
    expect(businessObject).not.to.have.property('camunda:decisionRef');
    expect(businessObject).not.to.have.property('camunda:decisionRefBinding');
    expect(businessObject).not.to.have.property('camunda:decisionRefVersion');
    expect(businessObject.get('camunda:class')).to.be.exist;
    expect(delegateField.value).to.equal('foo');
    expect(businessObject.get('camunda:class')).to.equal(delegateField.value);
    expect(businessObject).not.to.have.property('camunda:mapDecisionResult');
    expect(tenantField.parentElement.className).to.be.contain('bpp-hidden');
  }));


  it('should not fetch decision ref properties for a non decision business rule task element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('ServiceTask_1');
    selection.select(shape);

    var implType = domQuery('select[name=implType]', propertiesPanel._container),
        resultVariable = domQuery('div[data-entry=resultVariable] input[name=resultVariable]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    expect(implType.value).to.not.equal('decisionRef');
    expect(businessObject).not.to.have.property('camunda:decisionRefBinding');
    expect(businessObject).not.to.have.property('camunda:decisionRefVersion');
    expect(businessObject).not.to.have.property('camunda:mapDecisionResult');
    expect(resultVariable.value).to.equal(businessObject.get('camunda:resultVariable'));
  }));


  it('should remove result variable value for an element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('BusinessRuleTask_1');
    selection.select(shape);

    var implType = domQuery('select[name=implType]', propertiesPanel._container),
        resultVariable = domQuery('div[data-entry=dmn-resultVariable] input[name=resultVariable]', propertiesPanel._container),
        clearButton = domQuery('[data-entry=dmn-resultVariable] button[data-action=clear]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(implType.value).to.equal('dmn');
    expect(resultVariable.value).to.equal('resVar');
    expect(resultVariable.value).to.equal(businessObject.get('camunda:resultVariable'));

    // when
    TestHelper.triggerEvent(clearButton, 'click');

    // then
    expect(resultVariable.value).to.be.empty;
    expect(businessObject).not.to.have.property('camunda:resultVariable');
  }));


  it('should remove decision ref value field for an element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('BusinessRuleTask_1');
    selection.select(shape);

    var implType = domQuery('select[name=implType]', propertiesPanel._container),
        decisionRefField = domQuery('input[name="callableElementRef"]', propertiesPanel._container),
        clearButton = domQuery('[data-entry=callable-element-ref] button[data-action=clear]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(implType.value).to.equal('dmn');
    expect(decisionRefField.value).to.equal('Bar');
    expect(businessObject.get('camunda:decisionRef')).to.equal(decisionRefField.value);

    // when
    TestHelper.triggerEvent(clearButton, 'click');

    // then
    expect(implType.value).to.equal('dmn');
    expect(businessObject).to.have.property('decisionRef');
    expect(decisionRefField.className).to.equal('invalid');
  }));


  it('should remove decision ref version value field for an element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('BusinessRuleTask_Version');
    selection.select(shape);

    var implType = domQuery('select[name=implType]', propertiesPanel._container),
        decisionRefBinding = domQuery('select[name=callableBinding]', propertiesPanel._container),
        decisionRefField = domQuery('input[name="callableElementRef"]', propertiesPanel._container),
        decisionRefVersionField = domQuery('input[name="callableVersion"]', propertiesPanel._container),
        clearButton = domQuery('[data-entry=callable-version] button[data-action=clear]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(implType.value).to.equal('dmn');
    expect(decisionRefField.value).to.equal('Bar');
    expect(decisionRefBinding.value).to.equal('version');
    expect(decisionRefVersionField.value).to.equal('12');
    expect(businessObject.get('camunda:decisionRef')).to.equal(decisionRefField.value);
    expect(businessObject.get('camunda:decisionRefBinding')).to.equal(decisionRefBinding.value);
    expect(businessObject.get('camunda:decisionRefVersion')).to.equal(decisionRefVersionField.value);

    // when
    TestHelper.triggerEvent(clearButton, 'click');

    // then
    expect(implType.value).to.equal('dmn');
    expect(businessObject.get('camunda:decisionRef')).to.equal(decisionRefField.value);
    expect(businessObject.get('camunda:decisionRefBinding')).to.equal(decisionRefBinding.value);
    expect(decisionRefVersionField.className).to.equal('invalid');
  }));


  it('should not fetch map decision result for a business rule task without a result variable', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('BusinessRuleTask_Version');
    selection.select(shape);

    var mapDecisionResult = domQuery('select[name=mapDecisionResult]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(mapDecisionResult.className).to.contain('bpp-hidden');
    expect(businessObject).to.have.property('mapDecisionResult');
    expect(businessObject).not.to.have.property('resultVariable');
  }));


  it('should fetch map decision result for a business rule task with setting result variable', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('BusinessRuleTask_1');
    selection.select(shape);

    var mapDecisionResult = domQuery('select[name=mapDecisionResult]', propertiesPanel._container),
        dmnResultVariableInput = domQuery('div[data-entry=dmn-resultVariable] input[name=resultVariable]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(mapDecisionResult.value).to.equal('singleEntry');
    expect(dmnResultVariableInput.value).to.equal('resVar');
    expect(businessObject.get('mapDecisionResult')).to.equal(mapDecisionResult.value);
    expect(businessObject.get('resultVariable')).to.equal(dmnResultVariableInput.value);
  }));


  it('should set map decision result with default value "resultList" when fill result variable', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('BusinessRuleTask_Version');
    selection.select(shape);

    var mapDecisionResult = domQuery('select[name=mapDecisionResult]', propertiesPanel._container),
        dmnResultVariableInput = domQuery('div[data-entry=dmn-resultVariable] input[name=resultVariable]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(mapDecisionResult.className).to.contain('bpp-hidden');
    expect(dmnResultVariableInput.value).to.be.empty;
    expect(businessObject).not.to.have.property('camunda:mapDecisionResult');
    expect(businessObject).not.to.have.property('camunda:resultVariable');

    // when
    TestHelper.triggerValue(dmnResultVariableInput, 'myResVar');

    // then
    expect(mapDecisionResult.value).to.equal('resultList');
    expect(dmnResultVariableInput.value).to.equal('myResVar');
    expect(businessObject.get('camunda:mapDecisionResult')).to.equal(mapDecisionResult.value);
    expect(businessObject.get('camunda:resultVariable')).to.equal(dmnResultVariableInput.value);
  }));


  it('should set map decision result to default value when removing result variable', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('BusinessRuleTask_1');
    selection.select(shape);

    var mapDecisionResult = domQuery('select[name=mapDecisionResult]', propertiesPanel._container),
        dmnResultVariableInput = domQuery('div[data-entry=dmn-resultVariable] input[name=resultVariable]', propertiesPanel._container),
        clearButton = domQuery('[data-entry=dmn-resultVariable] button[data-action=clear]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(mapDecisionResult.value).to.equal('singleEntry');
    expect(dmnResultVariableInput.value).to.equal('resVar');
    expect(businessObject.get('mapDecisionResult')).to.equal(mapDecisionResult.value);
    expect(businessObject.get('resultVariable')).to.equal(dmnResultVariableInput.value);

    // when
    TestHelper.triggerEvent(clearButton, 'click');

    // then
    expect(mapDecisionResult.className).to.contain('bpp-hidden');
    expect(dmnResultVariableInput.value).to.be.empty;
    expect(businessObject.get('camunda:mapDecisionResult')).to.equal('resultList');
    expect(businessObject.get('camunda:resultVariable')).to.be.undefined;
  }));


  it('should change map decision result value for a business rule task', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('BusinessRuleTask_1');
    selection.select(shape);

    var mapDecisionResult = domQuery('select[name=mapDecisionResult]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(mapDecisionResult.value).to.equal('singleEntry');
    expect(businessObject.get('mapDecisionResult')).to.equal(mapDecisionResult.value);

    // when
    mapDecisionResult.options[2].selected = 'selected';
    TestHelper.triggerEvent(mapDecisionResult, 'change');

    // then
    expect(mapDecisionResult.value).to.equal('collectEntries');
    expect(businessObject.get('camunda:mapDecisionResult')).to.equal(mapDecisionResult.value);
  }));


  it('should hidden map decision result select box when change implementation type from DMN to Expression for an element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('BusinessRuleTask_1');
    selection.select(shape);

    var implType = domQuery('select[name=implType]', propertiesPanel._container),
        decisionRefBinding = domQuery('select[name="callableBinding"]', propertiesPanel._container),
        decisionRefValue = domQuery('input[name=callableElementRef]', propertiesPanel._container),
        dmnResultVariable = domQuery('div[data-entry=dmn-resultVariable] input[name=resultVariable]', propertiesPanel._container),
        mapDecisionResult = domQuery('select[name=mapDecisionResult]', propertiesPanel._container),
        delegateField = domQuery('input[name=delegate]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(implType.value).to.equal('dmn');
    expect(decisionRefValue.value).to.equal('Bar');
    expect(decisionRefBinding.value).to.equal('latest');
    expect(dmnResultVariable.value).to.equal('resVar');
    expect(mapDecisionResult.value).to.equal('singleEntry');
    expect(businessObject.get('camunda:decisionRef')).to.equal(decisionRefValue.value);
    expect(businessObject.get('camunda:decisionRefBinding')).to.equal(decisionRefBinding.value);
    expect(businessObject.get('camunda:resultVariable')).to.equal(dmnResultVariable.value);
    expect(businessObject.get('camunda:mapDecisionResult')).to.equal(mapDecisionResult.value);
    expect(delegateField.value).to.be.empty;
    expect(businessObject).not.to.have.property('camunda:expression');

    // when
    // select option 'expression'
    implType.options[1].selected = 'selected';
    TestHelper.triggerEvent(implType, 'change');

    // then
    expect(implType.value).to.equal('expression');
    expect(delegateField.className).to.equal('invalid');
    expect(dmnResultVariable.parentElement.className).to.contain('bpp-hidden');
    expect(mapDecisionResult.className).to.contain('bpp-hidden');
  }));


  it('should fetch decisionRefTenantId for an element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('BusinessRuleTask_TenantId');
    selection.select(shape);

    var inputField = domQuery('input[name=tenantId]', propertiesPanel._container),
        implType = TestHelper.selectedByIndex(domQuery('select[name=implType]', propertiesPanel._container)),
        businessObject = getBusinessObject(shape);

    expect(implType.value).to.equal('dmn');
    expect(inputField.value).to.equal('tenant1');
    expect(inputField.value).to.equal(businessObject.get('camunda:decisionRefTenantId'));
  }));


  it('should fill decisionRefTenantId field for an element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('BusinessRuleTask_TenantId');
    selection.select(shape);

    var inputField = domQuery('input[name=tenantId]', propertiesPanel._container),
        implType = domQuery('select[name=implType]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(implType.value).to.equal('dmn');
    expect(inputField.value).to.equal('tenant1');

    // when
    TestHelper.triggerValue(inputField, 'tenant2', 'change');

    // then
    expect(inputField.value).to.equal('tenant2');
    expect(inputField.value).to.equal(businessObject.get('camunda:decisionRefTenantId'));
  }));


  it('should remove decisionRefTenantId field for an element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('BusinessRuleTask_TenantId');
    selection.select(shape);

    var inputField = domQuery('input[name=tenantId]', propertiesPanel._container),
        implType = domQuery('select[name=implType]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(implType.value).to.equal('dmn');
    expect(inputField.value).to.equal('tenant1');

    // when
    TestHelper.triggerValue(inputField, '', 'change');

    // then
    expect(inputField.value).to.equal('');
    expect(businessObject.get('camunda:decisionRefTenantId')).to.be.undefined;
  }));


  it('should undo to change decisionRefTenantId field for an element', inject(function(propertiesPanel, selection, elementRegistry, commandStack) {

    var shape = elementRegistry.get('BusinessRuleTask_TenantId');
    selection.select(shape);

    var inputField = domQuery('input[name=tenantId]', propertiesPanel._container),
        implType = domQuery('select[name=implType]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(implType.value).to.equal('dmn');
    expect(inputField.value).to.equal('tenant1');

    // when
    TestHelper.triggerValue(inputField, 'tenant2', 'change');

    // then
    expect(inputField.value).to.equal('tenant2');
    expect(inputField.value).to.equal(businessObject.get('camunda:decisionRefTenantId'));

    // undo
    commandStack.undo();

    // then
    expect(inputField.value).to.equal('tenant1');
    expect(inputField.value).to.equal(businessObject.get('camunda:decisionRefTenantId'));
  }));


  it('should redo to change decisionRefTenantId field for an element', inject(function(propertiesPanel, selection, elementRegistry, commandStack) {

    var shape = elementRegistry.get('BusinessRuleTask_TenantId');
    selection.select(shape);

    var inputField = domQuery('input[name=tenantId]', propertiesPanel._container),
        implType = domQuery('select[name=implType]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(implType.value).to.equal('dmn');
    expect(inputField.value).to.equal('tenant1');

    // when
    TestHelper.triggerValue(inputField, 'tenant2', 'change');

    // then
    expect(inputField.value).to.equal('tenant2');
    expect(inputField.value).to.equal(businessObject.get('camunda:decisionRefTenantId'));

    // redo
    commandStack.undo();
    commandStack.redo();

    // then
    expect(inputField.value).to.equal('tenant2');
    expect(inputField.value).to.equal(businessObject.get('camunda:decisionRefTenantId'));
  }));
});
