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

describe('call-activity-properties', function() {

  var diagramXML = require('./CallActivty.bpmn');

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


  it('should fetch a calledElement field',
      inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('CallActivity_1');

    // when
    selection.select(shape);

    var inputField = domQuery('input[name=calledElement]', propertiesPanel._container),
        callActivityTypeSelect = domQuery('select[name=callActivityType]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // when
    expect(callActivityTypeSelect.value).to.equal('bpmn');
    expect(inputField.value).to.equal('asd');
    expect(inputField.value).to.equal(businessObject.get('calledElement'));
  }));


  it('should fill a calledElement property',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_1');
    selection.select(shape);

    var inputField = domQuery('input[name=calledElement]', propertiesPanel._container);
    var businessObject = getBusinessObject(shape);

    // given
    expect(inputField.value).to.equal('asd');

    // when
    TestHelper.triggerValue(inputField, 'foo', 'change');

    // then
    expect(inputField.value).to.equal('foo');
    expect(businessObject.get('calledElement')).to.equal('foo');
  }));


  it('should remove a calledElement property',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_1');
    selection.select(shape);

    var inputField = domQuery('input[name=calledElement]', propertiesPanel._container);
    var businessObject = getBusinessObject(shape);

    // given
    expect(inputField.value).to.equal('asd');

    // when
    TestHelper.triggerValue(inputField, '', 'change');

    // then
    expect(inputField.className).to.equal('invalid');
    expect(businessObject.get('calledElement')).to.be.empty;
  }));


  it('should fetch a calledElementBinding field',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_1'),
        elementSyntax = 'select[name=calledElementBinding]';
    selection.select(shape);
    var selectedOption = domQuery(elementSyntax, propertiesPanel._container);

    expect(selectedOption.value).to.equal('version');
  }));


  it('should fill a calledElementBinding field',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_1'),
        elementSyntax = 'select[name=calledElementBinding]';
    selection.select(shape);

    var selectField = domQuery(elementSyntax, propertiesPanel._container),
      businessObject = getBusinessObject(shape);

    // given
    expect(businessObject.get('calledElementBinding')).to.equal('version');

    // when
    selectField.options[0].selected  = 'selected';
    TestHelper.triggerEvent(selectField, 'change');

    // then
    expect(businessObject.get('calledElementBinding')).to.equal('latest');
  }));


  it('should remove a calledElementBinding property',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_1'),
        elementSyntax = 'select[name=calledElementBinding]';

    selection.select(shape);

    var selectField = domQuery(elementSyntax, propertiesPanel._container);
    var businessObject = getBusinessObject(shape);

    // given
    expect(businessObject.get('calledElementBinding')).to.equal('version');
    expect(selectField.value).to.equal(businessObject.get('calledElementBinding'));

    // when
    // select 'latest'
    selectField.options[0].selected  = 'selected';
    TestHelper.triggerEvent(selectField, 'change');

    // then
    expect(selectField.value).to.equal('latest');
    expect(businessObject.get('calledElementBinding')).to.equal(selectField.value);
  }));


  it('should fetch a calledElementVersion field',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_1'),
        elementSyntax = 'input[name=calledElementVersion]';
    selection.select(shape);

    var inputField = domQuery(elementSyntax, propertiesPanel._container);
    var businessObject = getBusinessObject(shape);

    expect(businessObject.get('calledElementVersion')).to.equal(parseInt(inputField.value));
    expect(parseInt(inputField.value)).to.equal(17);
  }));


  it('should fill a calledElementVersion field',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_1'),
        elementSyntax = 'input[name=calledElementVersion]';
    selection.select(shape);

    var inputField = domQuery(elementSyntax, propertiesPanel._container);
    var businessObject = getBusinessObject(shape);

    // given
    expect(businessObject.get('calledElementVersion')).to.equal(17);

    // when
    TestHelper.triggerValue(inputField, 42, 'change');

    // then
    expect(businessObject.get('calledElementVersion')).to.equal('42');
  }));


  it('should remove a calledElementVersion field',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_1');

    selection.select(shape);

    var inputField = domQuery('input[name=calledElementVersion]', propertiesPanel._container),
      businessObject = getBusinessObject(shape);

    // given
    expect(businessObject.get('calledElementVersion')).to.equal(17);

    // when
    TestHelper.triggerValue(inputField, '', 'change');

    // then
    expect(inputField.className).to.equal('invalid');
    expect(businessObject.get('calledElementVersion')).to.be.empty;
  }));


  it('should fetch a calledElementBinding field with default value "latest"',
      inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('CallActivity_2');

    // when
    selection.select(shape);

    var businessObject = getBusinessObject(shape),
        elementSyntax = 'select[name=calledElementBinding]';

    var selectedOption = domQuery(elementSyntax, propertiesPanel._container);

    // then
    expect(selectedOption.value).to.equal('latest');
    expect(businessObject.get('camunda:calledElementBinding')).to.equal('latest');
  }));


  it('should fetch CMMN call activity property fields',
      inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('CallActivity_3');

    // when
    selection.select(shape);

    // then
    var caseRefInput = domQuery('input[name=caseRef]', propertiesPanel._container),
        caseBindingSelect = domQuery('select[name=caseBinding]', propertiesPanel._container),
        versionInput = domQuery('input[name=caseVersion]', propertiesPanel._container),
        callActivityTypeSelect = domQuery('select[name=callActivityType]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    expect(callActivityTypeSelect.value).to.equal('cmmn');
    expect(caseRefInput.value).to.equal('checkCreditCase');
    expect(caseBindingSelect.value).to.equal('latest');
    expect(versionInput.parentElement.parentElement.className).to.contains('pp-hidden');
    expect(businessObject.get('camunda:caseRef')).to.equal(caseRefInput.value);
    expect(businessObject.get('camunda:caseBinding')).not.to.exist;
    expect(businessObject.get('camunda:caseVersion')).not.to.exist;

  }));


  it('should change caseRef property field for an element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_3');
    selection.select(shape);

    var caseRefInput = domQuery('input[name=caseRef]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(caseRefInput.value).to.equal('checkCreditCase');
    expect(businessObject.get('camunda:caseRef')).to.equal(caseRefInput.value);
    expect(businessObject.get('camunda:caseBinding')).not.to.exist;
    expect(businessObject.get('camunda:caseVersion')).not.to.exist;

    // when
    TestHelper.triggerValue(caseRefInput, 'myCase', 'change');

    // then
    expect(caseRefInput.value).to.equal('myCase');
    expect(businessObject.get('camunda:caseRef')).to.equal(caseRefInput.value);
    expect(businessObject.get('camunda:caseBinding')).to.equal('latest'); // default value
    expect(businessObject.get('camunda:caseVersion')).not.to.exist;

  }));


  it('should set caseVersion property field for an element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_3');
    selection.select(shape);

    var caseRefInput = domQuery('input[name=caseRef]', propertiesPanel._container),
        caseBindingSelect = domQuery('select[name=caseBinding]', propertiesPanel._container),
        versionInput = domQuery('input[name=caseVersion]', propertiesPanel._container),
        callActivityTypeSelect = domQuery('select[name=callActivityType]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(callActivityTypeSelect.value).to.equal('cmmn');
    expect(caseRefInput.value).to.equal('checkCreditCase');
    expect(businessObject.get('camunda:caseRef')).to.equal(caseRefInput.value);
    expect(businessObject.get('camunda:caseBinding')).not.to.exist;
    expect(businessObject.get('camunda:caseVersion')).not.to.exist;

    // when
    // select 'version'
    caseBindingSelect.options[2].selected = 'selected';
    TestHelper.triggerEvent(caseBindingSelect, 'change');

    TestHelper.triggerValue(versionInput, '24', 'change');

    // then
    expect(callActivityTypeSelect.value).to.equal('cmmn');
    expect(caseRefInput.value).to.equal('checkCreditCase');
    expect(caseBindingSelect.value).to.equal('version');
    expect(versionInput.value).to.equal('24');
    expect(businessObject.get('camunda:caseRef')).to.equal(caseRefInput.value);
    expect(businessObject.get('camunda:caseBinding')).to.equal(caseBindingSelect.value);
    expect(businessObject.get('camunda:caseVersion')).to.equal(versionInput.value);

  }));


  it('should clear caseVersion property field for an element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_4');

    selection.select(shape);

    var caseRefInput = domQuery('input[name=caseRef]', propertiesPanel._container),
        caseBindingSelect = domQuery('select[name=caseBinding]', propertiesPanel._container),
        versionInput = domQuery('input[name=caseVersion]', propertiesPanel._container),
        callActivityTypeSelect = domQuery('select[name=callActivityType]', propertiesPanel._container),
        clearButton = domQuery(
          '[data-entry=callActivity] > div > .pp-row > .pp-field-wrapper > button[data-action=caseRef\\.clearVersion]',
          propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(callActivityTypeSelect.value).to.equal('cmmn');
    expect(caseRefInput.value).to.equal('checkCreditCase');
    expect(caseBindingSelect.value).to.equal('version');
    expect(versionInput.value).to.equal('17');
    expect(businessObject.get('camunda:caseRef')).to.equal(caseRefInput.value);
    expect(businessObject.get('camunda:caseBinding')).to.equal(caseBindingSelect.value);
    expect(businessObject.get('camunda:caseVersion')).to.equal(parseInt(versionInput.value));

    // when
    TestHelper.triggerEvent(clearButton, 'click');

    // then
    expect(callActivityTypeSelect.value).to.equal('cmmn');
    expect(caseRefInput.value).to.equal('checkCreditCase');
    expect(caseBindingSelect.value).to.equal('version');
    expect(versionInput.value).to.be.empty;
    expect(versionInput.className).to.equal('invalid');
    expect(businessObject.get('camunda:caseRef')).to.equal(caseRefInput.value);
    expect(businessObject.get('camunda:caseBinding')).to.equal(caseBindingSelect.value);
    expect(businessObject.get('camunda:caseVersion')).to.be.empty;
  }));


  it('should change callActivityType from BPMN to CMMN for an element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_1');

    selection.select(shape);

    var caseRefInput = domQuery('input[name=caseRef]', propertiesPanel._container),
        caseBindingSelect = domQuery('select[name=caseBinding]', propertiesPanel._container),
        caseVersionInput = domQuery('input[name=caseVersion]', propertiesPanel._container),
        calledElementInput = domQuery('input[name=calledElement]', propertiesPanel._container),
        calledElementBindingSelect = domQuery('select[name=calledElementBinding]', propertiesPanel._container),
        calledElementVersionInput = domQuery('input[name=calledElementVersion]', propertiesPanel._container),
        callActivityTypeSelect = domQuery('select[name=callActivityType]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(callActivityTypeSelect.value).to.equal('bpmn');
    expect(calledElementInput.value).to.equal('asd');
    expect(calledElementBindingSelect.value).to.equal('version');
    expect(calledElementVersionInput.value).to.equal('17');
    expect(businessObject.get('calledElement')).to.equal(calledElementInput.value);
    expect(businessObject.get('camunda:calledElementBinding')).to.equal(calledElementBindingSelect.value);
    expect(businessObject.get('camunda:calledElementVersion')).to.equal(parseInt(calledElementVersionInput.value));
    expect(businessObject.get('camunda:caseRef')).not.to.exist;
    expect(businessObject.get('camunda:caseBinding')).not.to.exist;
    expect(businessObject.get('camunda:caseVersion')).not.to.exist;

    // when
    // select 'cmmn'
    callActivityTypeSelect.options[1].selected = 'selected';
    TestHelper.triggerEvent(callActivityTypeSelect, 'change');

    TestHelper.triggerValue(caseRefInput, 'myCase', 'change');

    // then
    expect(callActivityTypeSelect.value).to.equal('cmmn');
    expect(caseRefInput.value).to.equal('myCase');
    expect(caseBindingSelect.value).to.equal('latest');
    expect(caseVersionInput.parentElement.parentElement.className).to.contains('pp-hidden');
    expect(businessObject.get('camunda:caseRef')).to.equal(caseRefInput.value);
    expect(businessObject.get('camunda:caseBinding')).to.equal(caseBindingSelect.value);
    expect(businessObject.get('camunda:caseVersion')).not.to.exist;
    expect(businessObject.get('calledElement')).not.to.exist;
    expect(businessObject.get('camunda:calledElementBinding')).not.to.exist;
    expect(businessObject.get('camunda:calledElementVersion')).not.to.exist;

  }));


  it('should not fetch something for an empty call activity element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_5');

    selection.select(shape);

    var bpmnArea = domQuery('[data-show=isBPMN]', propertiesPanel._container),
        cmmnArea = domQuery('[data-show=isCMMN]', propertiesPanel._container),
        callActivityTypeSelect = domQuery('select[name=callActivityType]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    expect(callActivityTypeSelect.value).to.equal('');
    expect(bpmnArea.className).to.contains('pp-hidden');
    expect(cmmnArea.className).to.contains('pp-hidden');
    expect(businessObject.get('calledElement')).not.to.exist;
    expect(businessObject.get('camunda:calledElementBinding')).to.equal('latest'); // default value
    expect(businessObject.get('camunda:calledElementVersion')).not.to.exist;
    expect(businessObject.get('camunda:caseRef')).not.to.exist;
    expect(businessObject.get('camunda:caseBinding')).not.to.exist;
    expect(businessObject.get('camunda:caseVersion')).not.to.exist;
  }));

  it('should not show version field when changing callActivityType from BPMN to CMMN and back for an element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_2');

    selection.select(shape);

    var caseBindingSelect = domQuery('select[name=caseBinding]', propertiesPanel._container),
        caseVersionInput = domQuery('input[name=caseVersion]', propertiesPanel._container),
        calledElementBindingSelect = domQuery('select[name=calledElementBinding]', propertiesPanel._container),
        calledElementVersionInput = domQuery('input[name=calledElementVersion]', propertiesPanel._container),
        callActivityTypeSelect = domQuery('select[name=callActivityType]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(callActivityTypeSelect.value).to.equal('bpmn');

    expect(calledElementBindingSelect.value).to.equal('latest');

    expect(businessObject.get('camunda:calledElementBinding')).to.equal('latest'); // default value in camunda-moddle

    expect(businessObject.get('camunda:caseRef')).not.to.exist;
    expect(businessObject.get('camunda:caseBinding')).not.to.exist;
    expect(businessObject.get('camunda:caseVersion')).not.to.exist;

    // when change called element binding to 'version'
    calledElementBindingSelect.options[2].selected = 'selected';
    TestHelper.triggerEvent(calledElementBindingSelect, 'change');

    // and when change call activity type to 'cmmn'
    callActivityTypeSelect.options[1].selected = 'selected';
    TestHelper.triggerEvent(callActivityTypeSelect, 'change');

    // then
    expect(callActivityTypeSelect.value).to.equal('cmmn');

    expect(caseBindingSelect.value).to.equal('latest');
    expect(caseVersionInput.parentElement.parentElement.className).to.contains('pp-hidden');

    // when change back to 'bpmn'
    callActivityTypeSelect.options[0].selected = 'selected';
    TestHelper.triggerEvent(callActivityTypeSelect, 'change');

    // then
    expect(callActivityTypeSelect.value).to.equal('bpmn');

    expect(calledElementBindingSelect.value).to.equal('latest');
    expect(calledElementVersionInput.parentElement.parentElement.className).to.contains('pp-hidden');

    // property 'camunda:calledElementBinding' should not exist in the business object,
    // because there is the default value 'latest'
    expect(businessObject.get('camunda:calledElementBinding')).not.to.exist;
    expect(businessObject.get('camunda:calledElementVersion')).not.to.exist;

    expect(businessObject.get('camunda:caseBinding')).not.to.exist;
    expect(businessObject.get('camunda:caseVersion')).not.to.exist;

  }));

  it('should not show version field when changing callActivityType from CMMN to BPMN and back for an element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_3');

    selection.select(shape);

    var caseBindingSelect = domQuery('select[name=caseBinding]', propertiesPanel._container),
        caseVersionInput = domQuery('input[name=caseVersion]', propertiesPanel._container),
        calledElementBindingSelect = domQuery('select[name=calledElementBinding]', propertiesPanel._container),
        calledElementVersionInput = domQuery('input[name=calledElementVersion]', propertiesPanel._container),
        callActivityTypeSelect = domQuery('select[name=callActivityType]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(callActivityTypeSelect.value).to.equal('cmmn');

    expect(caseBindingSelect.value).to.equal('latest');

    expect(businessObject.get('camunda:caseBinding')).to.not.exist;

    expect(businessObject.get('camunda:calledElement')).not.to.exist;
    expect(businessObject.get('camunda:calledElementBinding')).to.equal('latest'); // default value in the camunda-moddle
    expect(businessObject.get('camunda:calledElementVersion')).not.to.exist;

    // when change case binding to 'version'
    caseBindingSelect.options[2].selected = 'selected';
    TestHelper.triggerEvent(caseBindingSelect, 'change');

    // and when change call activity type to 'bpmn'
    callActivityTypeSelect.options[0].selected = 'selected';
    TestHelper.triggerEvent(callActivityTypeSelect, 'change');

    // then
    expect(callActivityTypeSelect.value).to.equal('bpmn');

    expect(calledElementBindingSelect.value).to.equal('latest');
    expect(calledElementVersionInput.parentElement.parentElement.className).to.contains('pp-hidden');

    // when change back to 'cmmn'
    callActivityTypeSelect.options[1].selected = 'selected';
    TestHelper.triggerEvent(callActivityTypeSelect, 'change');

    // then
    expect(callActivityTypeSelect.value).to.equal('cmmn');

    expect(caseBindingSelect.value).to.equal('latest');
    expect(caseVersionInput.parentElement.parentElement.className).to.contains('pp-hidden');

    expect(businessObject.get('camunda:calledElementBinding')).not.to.exist;
    expect(businessObject.get('camunda:calledElementVersion')).not.to.exist;

    expect(businessObject.get('camunda:caseRef')).to.be.empty;
    expect(businessObject.get('camunda:caseBinding')).not.to.exist;
    expect(businessObject.get('camunda:caseVersion')).not.to.exist;

  }));

});
