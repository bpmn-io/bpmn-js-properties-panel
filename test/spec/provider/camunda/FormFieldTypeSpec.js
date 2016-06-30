'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('../../../../lib'),
    propertiesProviderModule = require('../../../../lib/provider/camunda'),
    selectionModule = require('diagram-js/lib/features/selection'),
    modelingModule = require('bpmn-js/lib/features/modeling'),
    coreModule = require('bpmn-js/lib/core');

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda');

var domQuery = require('min-dom/lib/query'),
    domClasses = require('min-dom/lib/classes');


function getFormFieldType(element) {
  var bo = getBusinessObject(element);

  return bo.extensionElements.values[0].fields[0].type;
}


var getSelectBox = function(container) {
  return domQuery('[data-entry="form-field-type"] select', container);
};

var getInputField = function(container) {
  return domQuery('[data-entry="form-field-type"] input', container);
};

var getSelectedType = function(container) {
  var value = getSelectBox(container).value,
      type = { value: value };

  if (value === 'custom') {
    var customValue = getInputField(container).value;

    type.customValue = customValue;
  }

  return type;
};

var isCustomInputHidden = function(container) {
  return domClasses(getInputField(container).parentNode).has('bpp-hidden');
};

describe('form-field-type', function() {

  var diagramXML = require('./FormFieldType.bpmn');

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

  beforeEach(inject(function(propertiesPanel) {
    propertiesPanel.attachTo(container);
  }));

  describe('empty', function() {

    var shape;

    beforeEach(inject(function(elementRegistry, selection) {
      shape = elementRegistry.get('StartEvent_0');

      // assume
      expect(getFormFieldType(shape, container)).to.be.undefined;

      selection.select(shape);

      TestHelper.triggerFormFieldSelection(0, container);
    }));

    it('should show empty form type', function() {

      expect(getSelectedType(container).value).to.equal('');

    });

  });


  describe('built in', function() {

    var shape;

    beforeEach(inject(function(elementRegistry, selection) {
      shape = elementRegistry.get('StartEvent_1');

      // assume
      expect(getFormFieldType(shape)).to.equal('boolean');

      selection.select(shape);

      TestHelper.triggerFormFieldSelection(0, container);
    }));

    it('should show boolean', function() {

      expect(isCustomInputHidden(container)).to.be.true;
      expect(getSelectedType(container).value).to.equal('boolean');
    });

    describe('should change to custom type', function() {

      beforeEach(function() {
        var selectBox = getSelectBox(container);

        TestHelper.selectedByOption(selectBox, 'custom');
        TestHelper.triggerEvent(selectBox, 'change');
      });

      describe('in the DOM', function() {

        it('should execute', function() {

          var selectedType = getSelectedType(container);

          // then
          expect(selectedType.value).to.equal('custom');
          expect(selectedType.customValue).to.equal('');
          expect(isCustomInputHidden(container)).to.be.false;
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(getSelectedType(container).value).to.equal('boolean');
          expect(isCustomInputHidden(container)).to.be.true;
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          var selectedType = getSelectedType(container);

          // then
          expect(selectedType.value).to.equal('custom');
          expect(selectedType.customValue).to.equal('');
          expect(isCustomInputHidden(container)).to.be.false;
        }));

      });


      describe('on the business object', function() {

        it('should execute', function() {

          // then
          expect(getFormFieldType(shape)).to.equal('');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(getFormFieldType(shape)).to.equal('boolean');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(getFormFieldType(shape)).to.equal('');
        }));

      });

    });

  });

  describe('custom', function() {

    var shape;

    beforeEach(inject(function(elementRegistry, selection) {
      shape = elementRegistry.get('StartEvent_2');

      // assume
      expect(getFormFieldType(shape)).to.equal('MyCustomType');

      selection.select(shape);

      TestHelper.triggerFormFieldSelection(0, container);
    }));

    it('should show custom form type', function() {

      var selectedType = getSelectedType(container);

      expect(selectedType.value).to.equal('custom');
      expect(isCustomInputHidden(container)).to.be.false;
      expect(selectedType.customValue).to.equal('MyCustomType');

    });

    describe('should update type', function() {

      beforeEach(function() {
        var selectBox = getSelectBox(container);

        TestHelper.selectedByOption(selectBox, 'custom');

        TestHelper.triggerValue(getInputField(container), 'UpdatedType', 'change');
      });

      describe('in the DOM', function() {

        it('should execute', function() {

          var selectedType = getSelectedType(container);

          // then
          expect(selectedType.value).to.equal('custom');
          expect(selectedType.customValue).to.equal('UpdatedType');
          expect(isCustomInputHidden(container)).to.be.false;
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          var selectedType = getSelectedType(container);

          // then
          expect(selectedType.value).to.equal('custom');
          expect(selectedType.customValue).to.equal('MyCustomType');
          expect(isCustomInputHidden(container)).to.be.false;
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          var selectedType = getSelectedType(container);

          // then
          expect(selectedType.value).to.equal('custom');
          expect(selectedType.customValue).to.equal('UpdatedType');
          expect(isCustomInputHidden(container)).to.be.false;
        }));

      });


      describe('on the business object', function() {

        it('should execute', function() {

          // then
          expect(getFormFieldType(shape)).to.equal('UpdatedType');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(getFormFieldType(shape)).to.equal('MyCustomType');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(getFormFieldType(shape)).to.equal('UpdatedType');
        }));

      });

    });

  });

});
