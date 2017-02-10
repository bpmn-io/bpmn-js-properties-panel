'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('../../../../lib'),
    propertiesProviderModule = require('../../../../lib/provider/camunda'),
    selectionModule = require('diagram-js/lib/features/selection'),
    modelingModule = require('bpmn-js/lib/features/modeling'),
    coreModule = require('bpmn-js/lib/core');

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    getExtensionElements = require('../../../../lib/helper/ExtensionElementsHelper').getExtensionElements;

var camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda');

var domQuery = require('min-dom/lib/query'),
    domClasses = require('min-dom/lib/classes');

var getProperties = function(shape) {
  var properties = getExtensionElements(getBusinessObject(shape), 'camunda:FormData')[0].fields[0].properties;

  if (properties) {
    return properties.values;
  }
};

describe('form-data-properties', function() {

  var diagramXML = require('./FormDataProperties.bpmn');

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

  describe('form field without existing properties', function() {

    var startEvent_2;

    beforeEach(inject(function(elementRegistry, selection) {

      startEvent_2 = elementRegistry.get('StartEvent_2');

      selection.select(startEvent_2);

      TestHelper.triggerFormFieldSelection(0, container);
    }));


    describe('add camunda:property', function() {

      beforeEach(function() {
        var addButton = domQuery('[data-entry="form-field-properties"] [data-action="addElement"]', container);

        TestHelper.triggerEvent(addButton, 'click');
      });

      describe('in the DOM', function() {

        var propertiesTable;

        beforeEach(function() {
          propertiesTable = domQuery('[data-entry="form-field-properties"] [data-list-entry-container]', container);
        });

        it('should execute', function() {

          var propertyRow = domQuery('[data-index="0"]', propertiesTable);

          expect(propertyRow).to.exist;
          // expect the row to contain 2 input fields and a remove button
          expect(propertyRow.childNodes).to.have.length(3);

          expect(propertyRow.childNodes[0].name).to.equal('id');
          expect(propertyRow.childNodes[0].value).to.contain('Property_');

          expect(propertyRow.childNodes[1].name).to.equal('value');
          expect(propertyRow.childNodes[1].value).to.equal('');

          expect(propertyRow.childNodes[2].getAttribute('data-action')).to.equal('deleteElement');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(propertiesTable.childNodes).to.have.length(0);
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          var propertyRow = domQuery('[data-index="0"]', propertiesTable);

          expect(propertyRow).to.exist;
          // expect the row to contain 2 input fields and a remove button
          expect(propertyRow.childNodes).to.have.length(3);

          expect(propertyRow.childNodes[0].name).to.equal('id');
          expect(propertyRow.childNodes[0].value).to.contain('Property_');

          expect(propertyRow.childNodes[1].name).to.equal('value');
          expect(propertyRow.childNodes[1].value).to.equal('');

          expect(propertyRow.childNodes[2].getAttribute('data-action')).to.equal('deleteElement');
        }));

      });


      describe('on the business object', function() {

        it('should execute', function() {

          var properties = getProperties(startEvent_2),
              bo = getBusinessObject(startEvent_2);

          // then
          expect(properties).to.exist;
          expect(properties[0].id).to.contain('Property_');
          expect(properties[0].name).to.be.undefined;
          expect(bo.get('camunda:formKey')).to.equal('myForm.html');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          var properties = getProperties(startEvent_2),
              bo = getBusinessObject(startEvent_2);

          // then
          expect(properties).to.be.undefined;
          expect(bo.get('camunda:formKey')).to.equal('myForm.html');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          var properties = getProperties(startEvent_2),
              bo = getBusinessObject(startEvent_2);

          // then
          expect(properties).to.exist;
          expect(properties[0].id).to.contain('Property_');
          expect(properties[0].name).to.be.undefined;
          expect(bo.get('camunda:formKey')).to.equal('myForm.html');
        }));

      });

    });

  });


  describe('element with existing properties', function() {

    var startEvent_1;

    beforeEach(inject(function(elementRegistry, selection) {

      startEvent_1 = elementRegistry.get('StartEvent_1');

      selection.select(startEvent_1);

      TestHelper.triggerFormFieldSelection(0, container);
    }));


    describe('add camunda:value', function() {

      beforeEach(function() {
        var addButton = domQuery('[data-entry="form-field-properties"] [data-action="addElement"]', container);

        TestHelper.triggerEvent(addButton, 'click');
      });

      describe('in the DOM', function() {

        var propertiesTable;

        beforeEach(function() {
          propertiesTable = domQuery('[data-entry="form-field-properties"] [data-list-entry-container]', container);
        });

        it('should execute', function() {

          // then
          expect(propertiesTable.childNodes).to.have.length(3);

          var propertyRow = domQuery('[data-index="2"]', propertiesTable);

          expect(propertyRow.childNodes).to.have.length(3);

          expect(propertyRow.childNodes[0].name).to.equal('id');
          expect(propertyRow.childNodes[0].value).to.contain('Property_');

          expect(propertyRow.childNodes[1].name).to.equal('value');
          expect(propertyRow.childNodes[1].value).to.equal('');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(propertiesTable.childNodes).to.have.length(2);

          var propertyRow1 = domQuery('[data-index="0"]', propertiesTable),
              propertyRow2 = domQuery('[data-index="1"]', propertiesTable);

          expect(propertyRow1.childNodes[0].value).not.to.contain('Property_');
          expect(propertyRow2.childNodes[0].value).not.to.contain('Property_');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(propertiesTable.childNodes).to.have.length(3);

          var propertyRow = domQuery('[data-index="2"]', propertiesTable);

          expect(propertyRow.childNodes).to.have.length(3);

          expect(propertyRow.childNodes[0].name).to.equal('id');
          expect(propertyRow.childNodes[0].value).to.contain('Property_');

          expect(propertyRow.childNodes[1].name).to.equal('value');
          expect(propertyRow.childNodes[1].value).to.equal('');
        }));

      });


      describe('on the business object', function() {

        it('should execute', function() {

          var properties = getProperties(startEvent_1);

          // then
          expect(properties).to.exist;
          expect(properties).to.have.length(3);
          expect(properties[2].id).to.contain('Property_');
          expect(properties[2].name).to.be.undefined;
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          var properties = getProperties(startEvent_1);

          // then
          expect(properties).to.exist;
          expect(properties).to.have.length(2);
          expect(properties[0].id).to.equal('foo');
          expect(properties[1].id).to.equal('P42');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          var properties = getProperties(startEvent_1);

          // then
          expect(properties).to.exist;
          expect(properties).to.have.length(3);
          expect(properties[2].id).to.contain('Property_');
          expect(properties[2].name).to.be.undefined;
        }));

      });

    });


    describe('update value', function() {

      var input;

      beforeEach(function() {

        input = domQuery('[data-entry="form-field-properties"] [data-index="1"] [name="id"]', container);

        TestHelper.triggerValue(input, 'newId', 'change');
      });

      describe('in the DOM', function() {

        it('should execute', function() {

          // then
          expect(input.value).to.equal('newId');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(input.value).to.equal('P42');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(input.value).to.equal('newId');
        }));

      });


      describe('on the business object', function() {

        it('should execute', function() {

          // then
          var properties = getProperties(startEvent_1);

          expect(properties[1].id).to.equal('newId');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          var properties = getProperties(startEvent_1);

          expect(properties[1].id).to.equal('P42');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          var properties = getProperties(startEvent_1);

          expect(properties[1].id).to.equal('newId');
        }));

      });

    });


    describe('remove value', function() {

      var properties;

      beforeEach(function() {
        properties = domQuery('[data-entry="form-field-properties"] [data-list-entry-container]', container);

        var removeButton = domQuery('[data-index="1"] [data-action="deleteElement"]', properties);

        // remove the second value
        TestHelper.triggerEvent(removeButton, 'click');
      });

      describe('in the DOM', function() {

        it('should execute', function() {

          // then
          expect(properties.childNodes).to.have.length(1);

          var rowNode = properties.childNodes[0];

          expect(rowNode.childNodes[0].value).to.equal('foo');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(properties.childNodes).to.have.length(2);

          var rowNode1 = properties.childNodes[0],
              rowNode2 = properties.childNodes[1];

          expect(rowNode1.childNodes[0].value).to.equal('foo');
          expect(rowNode2.childNodes[0].value).to.equal('P42');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(properties.childNodes).to.have.length(1);

          var rowNode = properties.childNodes[0];

          expect(rowNode.childNodes[0].value).to.equal('foo');
        }));

      });


      describe('on the business object', function() {

        it('should execute', function() {

          // then
          var properties = getProperties(startEvent_1);

          expect(properties).to.have.length(1);
          expect(properties[0].id).to.equal('foo');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          var properties = getProperties(startEvent_1);

          expect(properties).to.have.length(2);
          expect(properties[0].id).to.equal('foo');
          expect(properties[1].id).to.equal('P42');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          var properties = getProperties(startEvent_1);

          expect(properties).to.have.length(1);
          expect(properties[0].id).to.equal('foo');
        }));

      });

    });


    describe('insert invalid id', function() {

      var input;

      beforeEach(function() {

        input = domQuery('[data-entry="form-field-properties"] [data-index="1"] [name="id"]', container);

        TestHelper.triggerValue(input, 'invalid id', 'change');
      });

      describe('in the DOM', function() {

        it('should execute', function() {

          // then
          expect(input.value).to.equal('invalid id');
          expect(domClasses(input).has('invalid')).to.be.true;
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(input.value).to.equal('P42');
          expect(domClasses(input).has('invalid')).to.be.false;
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          // cannot redo to invalid state
          expect(input.value).to.equal('P42');
          expect(domClasses(input).has('invalid')).to.be.false;
        }));

      });


      describe('on the business object', function() {

        it('should execute', function() {

          // then
          var properties = getProperties(startEvent_1);

          expect(properties[1].id).to.equal('P42');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          var properties = getProperties(startEvent_1);

          expect(properties[1].id).to.equal('P42');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          var properties = getProperties(startEvent_1);

          expect(properties[1].id).to.equal('P42');
        }));

      });

    });

  });

});
