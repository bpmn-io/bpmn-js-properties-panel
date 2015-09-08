'use strict';

var TestHelper = require('../../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('../../../../../lib'),
  domQuery = require('min-dom/lib/query'),
  domAttr = require('min-dom/lib/attr'),
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


  it('should create a text input field with a clear button', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var userTaskShape = elementRegistry.get('UserTask');

    propertiesPanel.attachTo(container);

    // when
    selection.select(userTaskShape);

    var input = domQuery('input[name=assignee]', propertiesPanel._container),
        clearButton = domQuery('[data-entry=assignee] > .field-wrapper > button[data-show=canClear]', propertiesPanel._container),
        buttonClassArray = domClasses(clearButton).array();

    // starting check to verify that we have the correct text input field
    expect(input.value).to.equal('');
    expect(buttonClassArray.length).to.be.at.least(0);

    // trigger a change on the text input field
    TestHelper.triggerValue(input, 'foo', 'change');

    // now the input field should have a new value and the clear button should be visible
    input = domQuery('input[name=assignee]', propertiesPanel._container);
    buttonClassArray  = domClasses(clearButton).array();

    expect(buttonClassArray.length).to.equal(0);
    expect(input.value).to.equal('foo');

    // trigger the clear button
    TestHelper.triggerEvent(clearButton, 'click');

    // the text input field should now be empty and the button should be hidden again
    input = domQuery('input[name=assignee]', propertiesPanel._container);
    buttonClassArray  = domClasses(clearButton).array();

    expect(buttonClassArray.length).to.be.at.least(0);
    expect(input.value).to.equal('');


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
    expect(checkBoxList.length).to.equal(0);

    // trigger click on the checkbox
    TestHelper.triggerEvent(input, 'click');

    // the checkbox is now selected and the business object is set to true
    checkBoxList     = domQuery.all(inputEl +':checked', propertiesPanel._container);
    expect(checkBoxList.length).to.equal(1);
  }));

  it('should create a combobox', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var inputEl = 'input[name=messageRef]',
      shape = elementRegistry.get('StartEvent');

    propertiesPanel.attachTo(container);

    // when
    selection.select(shape);

    var inputField = domQuery(inputEl, propertiesPanel._container),
        optionsButton = domQuery('button[data-action=toggleOptions]', propertiesPanel._container),
        createButton = domQuery('button[data-action=createNew]', propertiesPanel._container),
        clearButton = domQuery('button[data-action=clear]', propertiesPanel._container);

    // then
    expect(inputField).not.to.be.null;
    expect(optionsButton).not.to.be.null;
    expect(createButton).not.to.be.null;
    expect(clearButton).not.to.be.null;
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
    expect(inputField.value).to.equal('foo');
    expect(clearClasses.length).to.equal(0);

    // and
    TestHelper.triggerEvent(clearButton, 'click');
    inputField = domQuery(inputEl, propertiesPanel._container);
    expect(inputField.value).to.equal('');

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
    expect(createClasses.length).to.equal(0);

    // and
    TestHelper.triggerEvent(createButton, 'click');

    // Workaround: I have to simulate a click on the input field to trigger the change
    TestHelper.triggerEvent(inputField, 'click');

    var optionsList = domQuery.all('ul > li', propertiesPanel._container);

    expect(optionsList.length).to.equal(2);
  }));

  it('should create a new entry for the combobox field', inject(function(propertiesPanel, selection, elementRegistry) {

    var inputEl = 'input[name=messageRef]',
      shape = elementRegistry.get('StartEvent');
    propertiesPanel.attachTo(container);
    selection.select(shape);

    var inputField = domQuery(inputEl, propertiesPanel._container);
    var options = domQuery('div.options > ul', propertiesPanel._container);

    // given
    // initially, a single option exisits
    TestHelper.triggerEvent(inputField, 'click'); // click updates the options
    expect(domQuery.all('li', options).length).to.equal(1);

    // when
    // we set a new value to the input field
    TestHelper.triggerValue(inputField, 'foo', 'change');

    // then
    TestHelper.triggerEvent(inputField, 'click'); // click updates the options
    // two options exist
    expect(domQuery.all('li', options).length).to.equal(2);
    // and the new option is selected
    expect(inputField.value.substr(0,8)).to.equal('foo (id=');
  }));

  it('should toogle options', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('StartEvent');
    propertiesPanel.attachTo(container);
    selection.select(shape);

    var combobox = domQuery("div.combobox", propertiesPanel._container);
    var toggleButton = domQuery('button[data-action=toggleOptions]', propertiesPanel._container);


    // given
    // options are closed
    expect(domClasses(combobox).has('open')).to.equal(false);

    // when
    // we click the options button
    TestHelper.triggerEvent(toggleButton, 'click');

    // then
    // options are open
    expect(domClasses(combobox).has('open')).to.equal(true);

    // when
    // we click the options button again
    TestHelper.triggerEvent(toggleButton, 'click');

    // then
    // options are closed again
    expect(domClasses(combobox).has('open')).to.equal(false);
  }));

  it('should create a select field', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('CallActivity');

    propertiesPanel.attachTo(container);

    // when
    selection.select(shape);

    var options = domQuery.all('select > option', propertiesPanel._container),
        defaultOption = domQuery('select > option:checked', propertiesPanel._container);

    // then
    expect(options.length).to.equal(4);
    expect(defaultOption.value).to.equal('');
  }));

  it('should create a conditional visible field', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('CallActivity');

    propertiesPanel.attachTo(container);

    selection.select(shape);

    // when
    var conditionField = domQuery('#condition-calledElementVersion', propertiesPanel._container),
        selectField = domQuery('select[name=calledElementBinding]', propertiesPanel._container),
        selectOption = domQuery('option[value=version]', propertiesPanel._container),
        conditionClasses = domClasses(conditionField).array();

    // then
    expect(conditionClasses.length).to.be.at.least(0);

    // and after
    domAttr(selectOption, 'selected', 'selected');
    TestHelper.triggerEvent(selectField, 'change');

    conditionClasses = domClasses(conditionField).array();

    // then
    expect(conditionClasses.length).to.equal(0)
  }));

  it('should create a textarea field', inject(function(propertiesPanel, selection, elementRegistry) {
    // given
    var userTaskShape = elementRegistry.get('UserTask'),
      inputEl = 'textarea[name=documentation]';

    propertiesPanel.attachTo(container);

    // when
    selection.select(userTaskShape);

    var input = domQuery(inputEl, propertiesPanel._container),
      clearButton = domQuery('button[data-show=canClear]', input.parentElement),
      buttonClassArray = domClasses(clearButton).array();

    // starting check to verify that we have the correct text input field
    expect(input.value).to.equal('');
    expect(buttonClassArray.length).to.be.at.least(0);

    // trigger a change on the text input field
    TestHelper.triggerValue(input, 'foo', 'change');

    // now the input field should have a new value and the clear button should be visible
    input = domQuery(inputEl, propertiesPanel._container);
    buttonClassArray  = domClasses(clearButton).array();

    expect(buttonClassArray.length).to.equal(0);
    expect(input.value).to.equal('foo');

    // trigger the clear button
    TestHelper.triggerEvent(clearButton, 'click');

    // the text input field should now be empty and the button should be hidden again
    input = domQuery(inputEl, propertiesPanel._container);
    buttonClassArray  = domClasses(clearButton).array();

    expect(buttonClassArray.length).to.be.at.least(0);
    expect(input.value).to.equal('');

  }));
});
