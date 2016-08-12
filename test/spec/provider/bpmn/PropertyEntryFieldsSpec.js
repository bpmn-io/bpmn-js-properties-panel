'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('../../../../lib'),
    domQuery = require('min-dom/lib/query'),
    domClasses = require('min-dom/lib/classes'),
    coreModule = require('bpmn-js/lib/core'),
    selectionModule = require('diagram-js/lib/features/selection'),
    modelingModule = require('bpmn-js/lib/features/modeling'),
    propertiesProviderModule = require('../../../../lib/provider/camunda'),
    camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda');


describe('properties-entry-fields', function() {

  var diagramXML = require('./PropertyEntryFields.bpmn');

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


  it('should create a text input field with a clear button', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var userTaskShape = elementRegistry.get('UserTask');

    // when
    selection.select(userTaskShape);

    var input = domQuery('input[name=assignee]', propertiesPanel._container),
        clearButton = domQuery('[data-entry=assignee] > .bpp-field-wrapper > button[data-show=canClear]', propertiesPanel._container),
        buttonClassArray = domClasses(clearButton).array();

    // starting check to verify that we have the correct text input field
    expect(input.value).to.equal('');
    expect(buttonClassArray.length).to.be.at.least(1);

    // trigger a change on the text input field
    TestHelper.triggerValue(input, 'foo', 'change');

    // now the input field should have a new value and the clear button should be visible
    input = domQuery('input[name=assignee]', propertiesPanel._container);
    buttonClassArray  = domClasses(clearButton).array();

    expect(buttonClassArray.length).to.equal(1);
    expect(input.value).to.equal('foo');

    // trigger the clear button
    TestHelper.triggerEvent(clearButton, 'click');

    // the text input field should now be empty and the button should be hidden again
    input = domQuery('input[name=assignee]', propertiesPanel._container);
    buttonClassArray  = domClasses(clearButton).array();

    expect(buttonClassArray.length).to.be.at.least(1);
    expect(input.value).to.equal('');
  }));


  it('should create a checkbox field', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var inputEl = 'input[name=asyncBefore]';
    var userTaskShape = elementRegistry.get('UserTask');

    // when
    selection.select(userTaskShape);

    var checkBoxList  = domQuery.all(inputEl + ':checked', propertiesPanel._container),
        input         = domQuery(inputEl, propertiesPanel._container);

    // at the start there should no checkbox be selected
    expect(checkBoxList.length).to.equal(0);

    // trigger click on the checkbox
    TestHelper.triggerEvent(input, 'click');

    // the checkbox is now selected and the business object is set to true
    checkBoxList     = domQuery.all(inputEl +':checked', propertiesPanel._container);
    expect(checkBoxList.length).to.equal(1);
  }));


  it('should create a select field', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('CallActivity');

    // when
    selection.select(shape);

    var options = domQuery.all('select[name=callableBinding] > option', propertiesPanel._container);

    // then
    expect(options.length).to.equal(3);
  }));


  it('should create a textbox field', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var userTaskShape = elementRegistry.get('UserTask'),
        inputEl = 'div[name=documentation]';

    // when
    selection.select(userTaskShape);

    var input = domQuery(inputEl, propertiesPanel._container);

    // starting check to verify that we have the correct text input field
    expect(input.textContent).to.equal('');

    // trigger a change on the text input field
    TestHelper.triggerValue(input, 'foo', 'change');

    // now the input field should have a new value and the clear button should be visible
    input = domQuery(inputEl, propertiesPanel._container);

    expect(input.textContent).to.equal('foo');
  }));
});
