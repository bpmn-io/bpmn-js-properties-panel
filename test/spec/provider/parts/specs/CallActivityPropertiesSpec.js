'use strict';

var TestHelper = require('../../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('../../../../../lib'),
  domQuery = require('min-dom/lib/query'),
  domAttr = require('min-dom/lib/attr'),
  coreModule = require('bpmn-js/lib/core'),
  selectionModule = require('diagram-js/lib/features/selection'),
  modelingModule = require('bpmn-js/lib/features/modeling'),
  propertiesProviderModule = require('../../../../../lib/provider/camunda'),
  camundaModdlePackage = require('../../../../../lib/provider/camunda/camunda-moddle'),
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  forEach = require('lodash/collection/forEach');

describe('call-activity-properties', function() {

  var diagramXML = require('../diagrams/CallActivtyPropertyTest.bpmn');

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

  it('should fetch a calledElement field', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('CallActivity_1');
    selection.select(shape);
    var inputField = domQuery('input[name=calledElement]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    expect(inputField.value).to.equal('asd');
    expect(inputField.value).to.equal(businessObject.get('calledElement'));
  }));

  it('should fill a calledElement property', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

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

  it('should remove a calledElement property', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

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
    expect(businessObject.get('calledElement')).to.be.defined;
  }));

  it('should fetch a calledElementBinding field', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('CallActivity_1'),
        elementSyntax = 'select[name=calledElementBinding]';
    selection.select(shape);
    var selectedOption = domQuery(elementSyntax, propertiesPanel._container);

    expect(selectedOption.value).to.equal('version');
  }));

  it('should fill a calledElementBinding field', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

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

  it('should remove a calledElementBinding property', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('CallActivity_1'),
        elementSyntax = 'select[name=calledElementBinding]';
    selection.select(shape);

    var selectField = domQuery(elementSyntax, propertiesPanel._container),
        options = domQuery.all(elementSyntax + ' > option', propertiesPanel._container);
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

  it('should fetch a calledElementVersion field', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('CallActivity_1'),
        elementSyntax = 'input[name=calledElementVersion]';
    selection.select(shape);

    var inputField = domQuery(elementSyntax, propertiesPanel._container);
    var businessObject = getBusinessObject(shape);

    expect(businessObject.get('calledElementVersion')).to.equal(parseInt(inputField.value));
    expect(parseInt(inputField.value)).to.equal(17);
  }));

  it('should fill a calledElementVersion field', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

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

  it('should remove a calledElementVersion field', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

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
    expect(businessObject.get('calledElementVersion')).to.be.defined;
  }));
});
