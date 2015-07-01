'use strict';

var TestHelper = require('../../../../TestHelper');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('../../../../../lib'),
  domQuery = require('min-dom/lib/query'),
  domClasses = require('min-dom/lib/classes'),
  coreModule = require('bpmn-js/lib/core'),
  selectionModule = require('diagram-js/lib/features/selection'),
  modelingModule = require('bpmn-js/lib/features/modeling'),
  propertiesProviderModule = require('../../../../../lib/provider/camunda'),
  camundaModdlePackage = require('../../../../../lib/provider/camunda/camunda-moddle'),
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;



describe('properties-entry-fields', function() {

  var diagramXML = require('../diagrams/PropertyEntryFields.bpmn');

  var testModules = [
    coreModule, selectionModule, modelingModule,
    propertiesPanelModule,
    propertiesProviderModule
  ];

  var container;

  beforeEach(function() {
    container = jasmine.getEnv().getTestContainer();
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


  it('should create a text input field with a clear button', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var userTaskShape = elementRegistry.get('UserTask');

    propertiesPanel.attachTo(container);

    // when
    selection.select(userTaskShape);

    var input     = domQuery('input[name=assignee]', propertiesPanel._container),
        clearButton      = domQuery('button[data-show=canClear]', propertiesPanel._container),
        buttonClassArray  = domClasses(clearButton).array();

    // starting check to verify that we have the correct text input field
    expect(input.value).toBe('');
    expect(buttonClassArray.length).toBeGreaterThan(0);

    // trigger a change on the text input field
    TestHelper.triggerValue(input, 'foo', 'change');

    // now the input field should have a new value and the clear button should be visible
    input = domQuery('input[name=assignee]', propertiesPanel._container);
    buttonClassArray  = domClasses(clearButton).array();

    expect(buttonClassArray.length).toBe(0);
    expect(input.value).toBe('foo');

    // trigger the clear button
    TestHelper.triggerEvent(clearButton, 'click');

    // the text input field should now be empty and the button should be hidden again
    input = domQuery('input[name=assignee]', propertiesPanel._container);
    buttonClassArray  = domClasses(clearButton).array();

    expect(buttonClassArray.length).toBeGreaterThan(0);
    expect(input.value).toBe('');


  }));

  it('should create a checkbox field', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var inputEl = 'input[name=asyncBefore]';
    var userTaskShape = elementRegistry.get('UserTask');

    propertiesPanel.attachTo(container);

    // when
    selection.select(userTaskShape);

    var checkBoxList  = domQuery.all(inputEl + ':checked', propertiesPanel._container),
        input         = domQuery(inputEl, propertiesPanel._container);

    // at the start there should no checkbox be selected
    expect(checkBoxList.length).toBe(0);

    // trigger click on the checkbox
    TestHelper.triggerEvent(input, 'click');

    // the checkbox is now selected and the business object is set to true
    checkBoxList     = domQuery.all(inputEl +':checked', propertiesPanel._container);
    expect(checkBoxList.length).toBe(1);
  }));

  it('should create a combobox', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var inputEl = 'input[name=messageRef]',
      shape = elementRegistry.get('StartEvent');

    propertiesPanel.attachTo(container);

    // when
    selection.select(shape);

    var inputField = domQuery(inputEl, propertiesPanel._container),
        optionsButton = domQuery('button > span[data-show=canShowOptions]', propertiesPanel._container),
        createButton = domQuery('button[data-action=createNew]', propertiesPanel._container),
        clearButton = domQuery('button[data-action=clear]', propertiesPanel._container);

    // then
    expect(inputField).not.toBeNull();
    expect(optionsButton).not.toBeNull();
    expect(createButton).not.toBeNull();
    expect(clearButton).not.toBeNull();
  }));

  it('should clear a combobox field with clear button', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var inputEl = 'input[name=messageRef]',
        shape = elementRegistry.get('StartEvent');

    propertiesPanel.attachTo(container);

    // when
    selection.select(shape);

    var inputField = domQuery(inputEl, propertiesPanel._container);

    TestHelper.triggerInput(inputField, 'foo');
    inputField = domQuery(inputEl, propertiesPanel._container);

    var clearButton = domQuery('button[data-action=clear]', propertiesPanel._container),
        clearClasses = domClasses(clearButton).array();

    // then
    expect(inputField.value).toBe('foo');
    expect(clearClasses.length).toBe(0);

    // and
    TestHelper.triggerEvent(clearButton, 'click');
    inputField = domQuery(inputEl, propertiesPanel._container);
    expect(inputField.value).toBe('');

  }));

  it('should create a new entry for the combobox field with a create button', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var inputEl = 'input[name=messageRef]',
        shape = elementRegistry.get('StartEvent');

    propertiesPanel.attachTo(container);

    // when
    selection.select(shape);

    var inputField = domQuery(inputEl, propertiesPanel._container);

    TestHelper.triggerInput(inputField, 'foo');
    inputField = domQuery(inputEl, propertiesPanel._container);

    var createButton = domQuery('button[data-action=createNew]', propertiesPanel._container),
        createClasses = domClasses(createButton).array();

    // then
    expect(createClasses.length).toBe(0);

    // and
    TestHelper.triggerEvent(createButton, 'click');

    // Workaround: I have to simulate a click on the input field to trigger the change
    TestHelper.triggerEvent(inputField, 'click');

    var optionsList = domQuery.all('ul[data-show=isOptionsAvailable] > li', propertiesPanel._container);

    expect(optionsList.length).toBe(2);
  }));

  it('should create a new entry for the combobox field', inject(function(propertiesPanel, selection, elementRegistry) {
    // given
    var inputEl = 'input[name=messageRef]',
      shape = elementRegistry.get('StartEvent');

    propertiesPanel.attachTo(container);

    // when
    selection.select(shape);

    var inputField = domQuery(inputEl, propertiesPanel._container);

    TestHelper.triggerValue(inputField, 'foo', 'change');
    // TODO: need to simulate a click on the input field to trigger the update of the options list
    TestHelper.triggerEvent(inputField, 'click');
    inputField = domQuery(inputEl, propertiesPanel._container);

    // then
    var optionsList = domQuery.all('ul[data-show=isOptionsAvailable] > li', propertiesPanel._container);

    expect(optionsList.length).toBe(2);
    expect(inputField.value.substr(0,8)).toBe('foo (id=');
  }));

  it('should show options when clicking on combobox show button', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('StartEvent');

    propertiesPanel.attachTo(container);

    // when
    selection.select(shape);

    var showButton = domQuery('button > span[data-show=canShowOptions]', propertiesPanel._container);

    TestHelper.triggerEvent(showButton, 'click');
    var optionsList = domQuery('ul[data-show=isOptionsAvailable]', propertiesPanel._container),
        optionsChildren = optionsList.children,
        optionsClasses = domClasses(optionsList.parentElement).array();

    // then
    expect(optionsChildren.length).toBe(1);
    expect(optionsClasses.length).toBe(0);
  }));
});
