'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('../../../../lib'),
    propertiesProviderModule = require('../../../../lib/provider/camunda'),
    selectionModule = require('diagram-js/lib/features/selection'),
    modelingModule = require('bpmn-js/lib/features/modeling'),
    coreModule = require('bpmn-js/lib/core');

var domQuery = require('min-dom/lib/query'),
    domClasses = require('min-dom/lib/classes'),
    find = require('lodash/collection/find');

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    is = require('bpmn-js/lib/util/ModelUtil').is;

var camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda');

describe('form-data', function() {

  var diagramXML = require('./FormData.bpmn');

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

  var shape,
      getInputField,
      triggerFormFieldSelection;

  beforeEach(inject(function(commandStack, propertiesPanel, elementRegistry, selection) {

    var undoButton = document.createElement('button');
    undoButton.textContent = 'UNDO';

    undoButton.addEventListener('click', function() {
      commandStack.undo();
    });

    container.appendChild(undoButton);

    propertiesPanel.attachTo(container);

    shape = elementRegistry.get('StartEvent_1');

    selection.select(shape);

    getInputField = function(id) {
      return domQuery('input[id=camunda-'+id+']', propertiesPanel._container);
    };

    triggerFormFieldSelection = function(index) {
      var formFieldSelectBox = domQuery('select[name=selectedExtensionElement]', propertiesPanel._container);
      formFieldSelectBox.options[index].selected = 'selected';
      TestHelper.triggerEvent(formFieldSelectBox, 'change');

    };

  }));

  it('should fetch form fields of an element', inject(function(propertiesPanel) {

    // when
    var formFieldSelectBox = domQuery('select[name=selectedExtensionElement]', propertiesPanel._container);

    // then
    expect(formFieldSelectBox.options).to.have.length(3);
    expect(formFieldSelectBox.options[0].value).to.equal('firstname');
    expect(formFieldSelectBox.options[1].value).to.equal('lastname');
    expect(formFieldSelectBox.options[2].value).to.equal('dateOfBirth');
  }));


  it('should fetch the properties of the first form field of an element', inject(function(propertiesPanel) {

    // when selecting the first form field
    triggerFormFieldSelection(0);

    // then
    expect(getInputField('form-field-id').value).to.equal('firstname');
    expect(getInputField('form-field-label').value).to.equal('Firstname');
    expect(getInputField('form-field-type').value).to.equal('string');
    expect(getInputField('form-field-defaultValue').value).is.empty;
    expect(domClasses(getInputField('form-field-id')).has('invalid')).to.be.false;
  }));


  it('should fetch the properties of the third form field of an element', inject(function(propertiesPanel) {

    // when selecting the first form field
    triggerFormFieldSelection(2);

    // then
    expect(getInputField('form-field-id').value).to.equal('dateOfBirth');
    expect(getInputField('form-field-label').value).to.equal('Date of Birth');
    expect(getInputField('form-field-type').value).to.equal('date');
    expect(getInputField('form-field-defaultValue').value).is.empty;
  }));


  describe('change properties on first form field of an element', function() {

    var label,
        formFields;

    beforeEach(function(){
      // select first form field
      triggerFormFieldSelection(0);

      label = getInputField('form-field-label');
      formFields = getBusinessObject(shape).extensionElements.values[0].fields;

      // when
      TestHelper.triggerValue(label, 'newLabel', 'change');
    });

    describe('in the DOM', function() {

      it('should execute', function() {
        // then
        expect(label.value).to.equal('newLabel');
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(label.value).to.equal('Firstname');
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(getInputField('form-field-label').value).to.equal('newLabel');
      }));
    });

    describe('on the business object', function() {

      it('should execute', function() {
        // then
        expect(formFields[0].label).to.equal('newLabel');
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(formFields[0].label).to.equal('Firstname');
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(formFields[0].label).to.equal('newLabel');
      }));
    });
  });


  describe('set the invalid form field id', function(propertiesPanel) {

    var id,
        formFields;

    beforeEach(function() {
      // select first form field
      triggerFormFieldSelection(0);

      id = getInputField('form-field-id');
      formFields = getBusinessObject(shape).extensionElements.values[0].fields;

      TestHelper.triggerValue(id, 'invalid id', 'change');
    });

    describe('in the DOM', function() {

      it('should execute', function() {

        // then
        // should show the invalid id in the text field
        expect(id.value).to.equal('invalid id');
        // should show an invalid error
        expect(domClasses(id).has('invalid')).to.be.true;
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        // should show the previous id in the text field
        expect(id.value).to.equal('firstname');
        // should not show an invalid error
        expect(domClasses(id).has('invalid')).to.be.false;
      }));


      it.skip('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        // should show the invalid id in the text field
        expect(id.value).to.equal('invalid id');
        // should show a validation error
        expect(domClasses(id).has('invalid')).to.be.true;
      }));
    });

    describe('on the business object', function() {

      it('should not execute', function() {

        // then
        // should not set an invalid id on the business object
        expect(formFields[0].id).to.equal('firstname');
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        // should not set an invalid id on the business object
        expect(formFields[0].id).to.equal('firstname');
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        // should not set an invalid id on the business object
        expect(formFields[0].id).to.equal('firstname');
      }));

    });

  });


  describe('delete form field', function() {

    beforeEach(inject(function(propertiesPanel) {

      // select the third form field 'dateOfBirth'
      triggerFormFieldSelection(2);

      var removeButton = domQuery('button[id=cam-extension-elements-remove-form-fields]', propertiesPanel._container);

      TestHelper.triggerEvent(removeButton, 'click');
    }));


    describe('on the business object', function() {

      var getFormFields;

      var isContainedIn = function(fields, value) {
        return find(fields, function(field) {
          return field.id === value;
        });
      };

      beforeEach(function() {
        getFormFields = function() {
          return getBusinessObject(shape).extensionElements.values[0].fields;
        };
      });


      it('should execute', function() {
        // after removing 'dateOfBirth' form field

        // then
        expect(isContainedIn(getFormFields(), 'firstname')).to.be.ok;
        expect(isContainedIn(getFormFields(), 'lastname')).to.be.ok;
        expect(isContainedIn(getFormFields(), 'dateOfBirth')).not.to.be.ok;

      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(isContainedIn(getFormFields(), 'firstname')).to.be.ok;
        expect(isContainedIn(getFormFields(), 'lastname')).to.be.ok;
        expect(isContainedIn(getFormFields(), 'dateOfBirth')).to.be.ok;
      }));


      it('should redo', inject(function(commandStack) {
        // when

        commandStack.undo();
        commandStack.redo();

        // then
        expect(isContainedIn(getFormFields(), 'firstname')).to.be.ok;
        expect(isContainedIn(getFormFields(), 'lastname')).to.be.ok;
        expect(isContainedIn(getFormFields(), 'dateOfBirth')).not.to.be.ok;
      }));

    });


    describe('in the DOM', function() {

      var formFieldSelectBox;

      var isContainedIn = function(selectBox, value) {
        return find(selectBox, function(node) {
          return node.value === value;
        });
      };

      beforeEach(inject(function(propertiesPanel) {
        formFieldSelectBox = domQuery('select[name=selectedExtensionElement]', propertiesPanel._container);
      }));


      it('should execute', function() {
        // after removing 'dateOfBirth' form field

        // then
        expect(isContainedIn(formFieldSelectBox, 'firstname')).to.be.ok;
        expect(isContainedIn(formFieldSelectBox, 'lastname')).to.be.ok;
        expect(isContainedIn(formFieldSelectBox, 'dateOfBirth')).not.to.be.ok;
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(isContainedIn(formFieldSelectBox, 'firstname')).to.be.ok;
        expect(isContainedIn(formFieldSelectBox, 'lastname')).to.be.ok;
        expect(isContainedIn(formFieldSelectBox, 'dateOfBirth')).to.be.ok;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(isContainedIn(formFieldSelectBox, 'firstname')).to.be.ok;
        expect(isContainedIn(formFieldSelectBox, 'lastname')).to.be.ok;
        expect(isContainedIn(formFieldSelectBox, 'dateOfBirth')).not.to.be.ok;
      }));

    });

  });


  describe('change from form data to form key', function() {

    var taskBo;

    beforeEach(inject(function(propertiesPanel) {
      // given
      var selectBox = domQuery('select[name=formType]', propertiesPanel._container);

      selectBox.options[0].selected = 'selected';

      // when
      TestHelper.triggerEvent(selectBox, 'change');

      taskBo = getBusinessObject(shape);
    }));

    it('should execute', inject(function(propertiesPanel) {
      // then
      expect(taskBo.extensionElements).to.be.undefined;
      expect(taskBo.formKey).to.be.undefined;

      taskBo.$model.toXML(taskBo, { format:true }, function(err, xml) {
        expect(xml).not.to.contain('camunda:formKey');
        expect(xml).not.to.contain('camunda:formData');
      });
    }));


    it('should undo', inject(function(propertiesPanel, commandStack) {
      // when
      commandStack.undo();

      // then
      expect(taskBo.formKey).to.be.undefined;
      expect(taskBo).to.have.property('extensionElements');
      expect(taskBo.extensionElements.values[0].$type).to.equal('camunda:FormData');

      taskBo.$model.toXML(taskBo, { format:true }, function(err, xml) {
        expect(xml).not.to.contain('camunda:formKey');
        expect(xml).to.contain('camunda:formData');
      });
    }));


    it('should redo', inject(function(propertiesPanel) {
      // then
      expect(taskBo.extensionElements).to.be.undefined;
      expect(taskBo.formKey).to.be.undefined;

      taskBo.$model.toXML(taskBo, { format:true }, function(err, xml) {
        expect(xml).not.to.contain('camunda:formKey');
        expect(xml).not.to.contain('camunda:formData');
      });
    }));

  });


  it('should retain other extension elements when switching to formKey',
    inject(function(propertiesPanel, elementRegistry, selection) {

    shape = elementRegistry.get('UserTask_2');

    selection.select(shape);

    var selectBox = domQuery('select[name=formType]', propertiesPanel._container);

    selectBox.options[0].selected = 'selected';

    // when
    TestHelper.triggerEvent(selectBox, 'change');

    var taskBo = getBusinessObject(shape);

    expect(taskBo.extensionElements).to.exist;
    expect(is(taskBo.extensionElements.values[0], 'camunda:TaskListener')).to.be.true;
    expect(taskBo.formKey).to.be.undefined;

    taskBo.$model.toXML(taskBo, { format:true }, function(err, xml) {
      expect(xml).not.to.contain('camunda:formKey');
      expect(xml).not.to.contain('camunda:formData');
      expect(xml).to.contain('camunda:taskListener');
    });

  }));

});
