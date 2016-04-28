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
  camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda'),
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;


function isHiddenRow(id, container) {
  var entry = domQuery('[data-entry="' + id + '"]', container);

  var input = domQuery('select', entry) || domQuery('input', entry).parentNode;

  return domClasses(input).has('pp-hidden');
}

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
    moddleExtensions: {camunda: camundaModdlePackage}
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

    // assume
    expect(formKeyInput.value).to.equal('myForm.html');
    expect(bo.get('camunda:formKey')).to.equal(formKeyInput.value);

    // when
    TestHelper.triggerEvent(clearButton, 'click');

    // then
    expect(formKeyInput.value).to.be.empty;
    expect(bo.get('camunda:formKey')).to.be.undefined;

  }));


  it('should fill a form key property', inject(function(propertiesPanel) {

    // given
    var formKeyInput = domQuery('input[name=formKey]', propertiesPanel._container);

    // when
    TestHelper.triggerValue(formKeyInput, 'foo/bar');

    // then
    var taskBo = getBusinessObject(taskShape);
    expect(taskBo.get("formKey")).to.equal('foo/bar');
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


  describe('change from form key to form data', function() {

    it('should execute', inject(function(propertiesPanel) {

      var selectBox = domQuery('select[name=formType]', propertiesPanel._container);

      selectBox.options[1].selected = 'selected';

      TestHelper.triggerEvent(selectBox, 'change');

      var taskBo = getBusinessObject(taskShape);

      // then
      expect(taskBo.formKey).to.be.undefined;
      expect(taskBo).to.have.property('extensionElements');
      expect(taskBo.extensionElements.values[0].$type).to.equal('camunda:FormData');

      taskBo.$model.toXML(taskBo, { format:true }, function(err, xml) {
        expect(xml).not.to.contain('camunda:formKey');
        expect(xml).to.contain('camunda:formData');
      });

    }));


    it('should undo', inject(function(propertiesPanel, commandStack) {

      var selectBox = domQuery('select[name=formType]', propertiesPanel._container);

      selectBox.options[1].selected = 'selected';

      TestHelper.triggerEvent(selectBox, 'change');

      // when
      commandStack.undo();

      var taskBo = getBusinessObject(taskShape);

      // then
      expect(taskBo.formKey).to.equal('myForm.html');
      expect(taskBo.extensionElements).to.be.undefined;

      taskBo.$model.toXML(taskBo, { format:true }, function(err, xml) {
        expect(xml).to.contain('camunda:formKey');
        expect(xml).not.to.contain('camunda:formData');
      });
    }));


    it('should redo', inject(function(propertiesPanel, commandStack) {

      var selectBox = domQuery('select[name=formType]', propertiesPanel._container);

      selectBox.options[1].selected = 'selected';

      TestHelper.triggerEvent(selectBox, 'change');

      commandStack.undo();
      commandStack.redo();

      var taskBo = getBusinessObject(taskShape);

      // then
      expect(taskBo.formKey).to.be.undefined;
      expect(taskBo).to.have.property('extensionElements');
      expect(taskBo.extensionElements.values[0].$type).to.equal('camunda:FormData');

      taskBo.$model.toXML(taskBo, { format:true }, function(err, xml) {
        expect(xml).not.to.contain('camunda:formKey');
        expect(xml).to.contain('camunda:formData');
      });

    }));


    it('should hide form field inputs', inject(function(propertiesPanel) {

      // given
      var selectBox = domQuery('select[name=formType]', propertiesPanel._container);

      selectBox.options[1].selected = 'selected';

      // when
      TestHelper.triggerEvent(selectBox, 'change');

      var formFieldSelectBox = domQuery('select[id=cam-extensionElements-form-fields]', propertiesPanel._container);

      // then
      expect(isHiddenRow('form-field-id'), propertiesPanel._container).to.be.true;
      expect(isHiddenRow('form-field-label'), propertiesPanel._container).to.be.true;
      expect(isHiddenRow('form-field-type'), propertiesPanel._container).to.be.true;
      expect(isHiddenRow('form-field-defaultValue'), propertiesPanel._container).to.be.true;

      expect(formFieldSelectBox.options).to.have.length.of(0);

    }));

  });
});
