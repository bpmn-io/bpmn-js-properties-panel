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
    getExtensionElements = require('../../../../lib/helper/ExtensionElementsHelper').getExtensionElements;


describe('form-key', function() {

  var diagramXML = require('./FormKey.bpmn');

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

  var taskShape;

  beforeEach(inject(function(commandStack, propertiesPanel, selection, elementRegistry) {

    var undoButton = document.createElement('button');
    undoButton.textContent = 'UNDO';

    undoButton.addEventListener('click', function() {
      commandStack.undo();
    });

    container.appendChild(undoButton);

    propertiesPanel.attachTo(container);

    taskShape = elementRegistry.get('StartEvent_1');

    selection.select(taskShape);
  }));


  it('should fetch formKey of an element', inject(function(propertiesPanel) {

    var formKeyInput = domQuery('input[name=formKey]', propertiesPanel._container),
        bo = getBusinessObject(taskShape);

    expect(formKeyInput.value).to.equal('myForm.html');
    expect(bo.get('camunda:formKey')).to.equal(formKeyInput.value);
  }));


  it('should change formKey of an element', inject(function(propertiesPanel) {

    var formKeyInput = domQuery('input[name=formKey]', propertiesPanel._container),
        bo = getBusinessObject(taskShape);

    // assume
    expect(formKeyInput.value).to.equal('myForm.html');
    expect(bo.get('camunda:formKey')).to.equal(formKeyInput.value);

    // when
    TestHelper.triggerValue(formKeyInput, 'newForm.html', 'change');

    // then
    expect(formKeyInput.value).to.equal('newForm.html');
    expect(bo.get('camunda:formKey')).to.equal(formKeyInput.value);

  }));

  it('should clear formKey of an element', inject(function(propertiesPanel) {

    var formKeyInput = domQuery('input[name=formKey]', propertiesPanel._container),
        clearButton = domQuery('button[data-action=clear]', formKeyInput.parentNode),
        bo = getBusinessObject(taskShape);

    var properties = getExtensionElements(bo, 'camunda:FormData')[0].fields[0].properties;

    // assume
    expect(formKeyInput.value).to.equal('myForm.html');
    expect(bo.get('camunda:formKey')).to.equal(formKeyInput.value);
    expect(properties.values).to.exist;
    expect(properties.values[0].id).to.contain('foo');

    // when
    TestHelper.triggerEvent(clearButton, 'click');

    // then
    expect(formKeyInput.value).to.be.empty;
    expect(bo.get('camunda:formKey')).to.be.undefined;
    expect(properties.values).to.exist;
    expect(properties.values[0].id).to.contain('foo');

  }));


  it('should fill a form key property', inject(function(propertiesPanel) {

    // given
    var formKeyInput = domQuery('input[name=formKey]', propertiesPanel._container);

    // when
    TestHelper.triggerValue(formKeyInput, 'foo/bar');

    // then
    var taskBo = getBusinessObject(taskShape);
    expect(taskBo.get('formKey')).to.equal('foo/bar');
  }));


  it('should not fill an empty form key property', inject(function(propertiesPanel) {

    // given
    var formKeyInput = domQuery('input[name=formKey]', propertiesPanel._container);

    // when
    TestHelper.triggerValue(formKeyInput, '');

    // then
    var taskBo = getBusinessObject(taskShape);

    expect(taskBo.formKey).to.be.undefined;
  }));
});
