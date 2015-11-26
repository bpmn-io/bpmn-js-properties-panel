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

describe('start-event-form-key', function() {

  var diagramXML = require('./StartEventFormKey.bpmn');

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

  it('should fetch formKey of an element', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    // given
    var taskShape = elementRegistry.get('StartEvent_1');
    selection.select(taskShape);

    var formKeyInput = domQuery('input[name=formKey]', propertiesPanel._container),
        bo = getBusinessObject(taskShape);

    expect(formKeyInput.value).to.equal('myForm.html');
    expect(bo.get('camunda:formKey')).to.equal(formKeyInput.value);
  }));

  it('should change formKey of an element', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    // given
    var taskShape = elementRegistry.get('StartEvent_1');
    selection.select(taskShape);

    var formKeyInput = domQuery('input[name=formKey]', propertiesPanel._container),
        bo = getBusinessObject(taskShape);

    // given
    expect(formKeyInput.value).to.equal('myForm.html');
    expect(bo.get('camunda:formKey')).to.equal(formKeyInput.value);

    // when
    TestHelper.triggerValue(formKeyInput, 'newForm.html', 'change');

    // then
    expect(formKeyInput.value).to.equal('newForm.html');
    expect(bo.get('camunda:formKey')).to.equal(formKeyInput.value);

  }));

  it('should clear formKey of an element', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    // given
    var taskShape = elementRegistry.get('StartEvent_1');
    selection.select(taskShape);

    var formKeyInput = domQuery('input[name=formKey]', propertiesPanel._container),
        clearButton = domQuery('[data-entry=formKey] > .field-wrapper > button[data-action=clear]',
                                propertiesPanel._container),    
        bo = getBusinessObject(taskShape);

    // given
    expect(formKeyInput.value).to.equal('myForm.html');
    expect(bo.get('camunda:formKey')).to.equal(formKeyInput.value);

    // when
    TestHelper.triggerEvent(clearButton, 'click');

    // then
    expect(formKeyInput.value).to.be.empty;
    expect(bo.get('camunda:formKey')).to.be.undefined;

  }));

});
