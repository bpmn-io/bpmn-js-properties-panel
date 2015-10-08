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

describe('result-variable', function() {

  var diagramXML = require('../diagrams/ResultVariableTest.bpmn');

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

  it('should fetch a resultVariable field for a service task', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('ServiceTask_1'),
        elementSyntax = 'input[name=resultVariable]';

    selection.select(shape);

    var inputField = domQuery(elementSyntax, propertiesPanel._container),
        delegateResolution = domQuery('input[name="delegateResolution"]:checked', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    expect(delegateResolution.value).to.equal('expression');
    expect(businessObject.get('camunda:resultVariable')).to.equal('resVar');
    expect(inputField.value).to.equal(businessObject.get('camunda:resultVariable'));
  }));

  it('should fill a resultVariable field for a service task', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('ServiceTask_1'),
        elementSyntax = 'input[name=resultVariable]';

    selection.select(shape);

    var inputField = domQuery(elementSyntax, propertiesPanel._container),
        delegateResolution = domQuery('input[name="delegateResolution"]:checked', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(delegateResolution.value).to.equal('expression');
    expect(businessObject.get('camunda:resultVariable')).to.equal('resVar');

    // when
    TestHelper.triggerValue(inputField, 'foo', 'change');

    // then
    expect(inputField.value).to.equal('foo');
    expect(businessObject.get('camunda:resultVariable')).to.equal('foo');
  }));

  it('should remove a resultVariable field for a service task', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('ServiceTask_1'),
        elementSyntax = 'input[name=resultVariable]';

    selection.select(shape);

    var inputField = domQuery(elementSyntax, propertiesPanel._container),
        delegateResolution = domQuery('input[name="delegateResolution"]:checked', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(delegateResolution.value).to.equal('expression');
    expect(businessObject.get('camunda:resultVariable')).to.equal('resVar');

    // when
    TestHelper.triggerValue(inputField, '', 'change');

    // then
    expect(inputField.value).to.be.empty;
    expect(businessObject.get('camunda:resultVariable')).to.be.undefined;
  }));

  it('should do not exist a resultVariable field for a service task', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('ServiceTask_1'),
        businessObject = getBusinessObject(shape);

    selection.select(shape);

    var inputField = domQuery('input[name="resultVariable"]', propertiesPanel._container),
        expressionRadio = domQuery('input[value="expression"]', propertiesPanel._container),
        classRadio = domQuery('input[value="class"]', propertiesPanel._container);


    // given
    expect(inputField.value).to.equal('resVar');
    expect(businessObject.get('camunda:resultVariable')).to.equal(inputField.value);
    expect(expressionRadio.checked).to.be.true;

    // when
    TestHelper.triggerEvent(classRadio,'click');

    // then
    expect(expressionRadio.checked).to.be.false;
    expect(classRadio.checked).to.be.true;
    expect(businessObject.get('camunda:resultVariable')).to.be.undefined;
  }));

  it('should fetch a resultVariable field for a throwing message event', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('EndEvent_1'),
        elementSyntax = 'input[name=resultVariable]';

    selection.select(shape);

    var inputField = domQuery(elementSyntax, propertiesPanel._container),
        delegateResolution = domQuery('input[name="delegateResolution"]:checked', propertiesPanel._container),
        businessObject = getBusinessObject(shape).get('eventDefinitions')[0];

    expect(delegateResolution.value).to.equal('expression');
    expect(businessObject.get('camunda:resultVariable')).to.equal('EndVar');
    expect(inputField.value).to.equal(businessObject.get('camunda:resultVariable'));
  }));

  it('should not fetch a resultVariable field for a catching message event', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('StartEvent_1'),
        elementSyntax = 'input[name=resultVariable]';

    selection.select(shape);

    var inputField = domQuery(elementSyntax, propertiesPanel._container),
        delegateResolution = domQuery('input[name="delegateResolution"]:checked', propertiesPanel._container),
        businessObject = getBusinessObject(shape).get('eventDefinitions')[0];

    expect(inputField).to.be.null;
    expect(delegateResolution).to.be.null;
    expect(businessObject.get('camunda:resultVariable')).to.be.undefined;
  }));

});
