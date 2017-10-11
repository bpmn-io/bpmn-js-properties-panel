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

var getValues = function(shape) {
  return getExtensionElements(getBusinessObject(shape), 'camunda:FormData')[0].fields[0].values;
};

describe('form-data-enum', function() {

  var diagramXML = require('./FormDataEnum.bpmn');

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

  describe('switch from type string', function() {

    var startEvent_2;

    beforeEach(inject(function(elementRegistry, selection) {

      startEvent_2 = elementRegistry.get('StartEvent_2');

      selection.select(startEvent_2);

      TestHelper.triggerFormFieldSelection(0, container);

      var selectBox = domQuery('[data-entry="form-field-type"] select', container);

      TestHelper.selectedByOption(selectBox, 'enum');
      TestHelper.triggerEvent(selectBox, 'change');
    }));


    describe('add camunda:value', function() {

      beforeEach(function() {
        var addButton = domQuery('[data-entry="form-field-enum-values"] [data-action="addElement"]', container);

        TestHelper.triggerEvent(addButton, 'click');
      });

      describe('in the DOM', function() {

        var valueTable;

        beforeEach(function() {
          valueTable = domQuery('[data-entry="form-field-enum-values"] [data-list-entry-container]', container);
        });

        it('should execute', function() {

          var valueRow = domQuery('[data-index="0"]', valueTable);

          expect(valueRow).to.exist;
          // expect the row to contain 2 input fields and a remove button
          expect(valueRow.childNodes).to.have.length(3);

          expect(valueRow.childNodes[0].name).to.equal('id');
          expect(valueRow.childNodes[0].value).to.contain('Value_');

          expect(valueRow.childNodes[1].name).to.equal('name');
          expect(valueRow.childNodes[1].value).to.equal('');

          expect(valueRow.childNodes[2].getAttribute('data-action')).to.equal('deleteElement');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(valueTable.childNodes).to.have.length(0);
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          var valueRow = domQuery('[data-index="0"]', valueTable);

          expect(valueRow).to.exist;
          // expect the row to contain 2 input fields and a remove button
          expect(valueRow.childNodes).to.have.length(3);

          expect(valueRow.childNodes[0].name).to.equal('id');
          expect(valueRow.childNodes[0].value).to.contain('Value_');

          expect(valueRow.childNodes[1].name).to.equal('name');
          expect(valueRow.childNodes[1].value).to.equal('');

          expect(valueRow.childNodes[2].getAttribute('data-action')).to.equal('deleteElement');
        }));

      });


      describe('on the business object', function() {

        var getValues;

        beforeEach(function() {

          getValues = function() {
            return getExtensionElements(getBusinessObject(startEvent_2), 'camunda:FormData')[0].fields[0].values;
          };
        });

        it('should execute', function() {

          var values = getValues(startEvent_2);

          // then
          expect(values).to.exist;
          expect(values[0].id).to.contain('Value_');
          expect(values[0].name).to.be.undefined;
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          var values = getValues(startEvent_2);

          // then
          expect(values).to.be.undefined;
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          var values = getValues(startEvent_2);

          // then
          expect(values).to.exist;
          expect(values[0].id).to.contain('Value_');
          expect(values[0].name).to.be.undefined;
        }));

      });

    });

  });


  describe('type enum', function() {

    var startEvent_1;

    beforeEach(inject(function(elementRegistry, selection) {

      startEvent_1 = elementRegistry.get('StartEvent_1');

      selection.select(startEvent_1);

      TestHelper.triggerFormFieldSelection(0, container);
    }));


    describe('add camunda:value', function() {

      beforeEach(function() {
        var addButton = domQuery('[data-entry="form-field-enum-values"] [data-action="addElement"]', container);

        TestHelper.triggerEvent(addButton, 'click');
      });

      describe('in the DOM', function() {

        var valueTable;

        beforeEach(function() {
          valueTable = domQuery('[data-entry="form-field-enum-values"] [data-list-entry-container]', container);
        });

        it('should execute', function() {

          // then
          expect(valueTable.childNodes).to.have.length(3);

          var valueRow = domQuery('[data-index="2"]', valueTable);

          expect(valueRow.childNodes).to.have.length(3);

          expect(valueRow.childNodes[0].name).to.equal('id');
          expect(valueRow.childNodes[0].value).to.contain('Value_');

          expect(valueRow.childNodes[1].name).to.equal('name');
          expect(valueRow.childNodes[1].value).to.equal('');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(valueTable.childNodes).to.have.length(2);

          var valueRow1 = domQuery('[data-index="0"]', valueTable),
              valueRow2 = domQuery('[data-index="1"]', valueTable);

          expect(valueRow1.childNodes[0].value).not.to.contain('Value_');
          expect(valueRow2.childNodes[0].value).not.to.contain('Value_');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(valueTable.childNodes).to.have.length(3);

          var valueRow = domQuery('[data-index="2"]', valueTable);

          expect(valueRow.childNodes).to.have.length(3);

          expect(valueRow.childNodes[0].name).to.equal('id');
          expect(valueRow.childNodes[0].value).to.contain('Value_');

          expect(valueRow.childNodes[1].name).to.equal('name');
          expect(valueRow.childNodes[1].value).to.equal('');
        }));

      });


      describe('on the business object', function() {

        it('should execute', function() {

          var values = getValues(startEvent_1);

          // then
          expect(values).to.exist;
          expect(values).to.have.length(3);
          expect(values[2].id).to.contain('Value_');
          expect(values[2].name).to.be.undefined;
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          var values = getValues(startEvent_1);

          // then
          expect(values).to.exist;
          expect(values).to.have.length(2);
          expect(values[0].name).not.to.contain('Value_');
          expect(values[1].name).not.to.contain('Value_');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          var values = getValues(startEvent_1);

          // then
          expect(values).to.exist;
          expect(values).to.have.length(3);
          expect(values[2].id).to.contain('Value_');
          expect(values[2].name).to.be.undefined;
        }));

      });

    });


    describe('update value', function() {

      var input;

      beforeEach(function() {

        input = domQuery('[data-entry="form-field-enum-values"] [data-index="1"] [name="id"]', container);

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
          expect(input.value).to.equal('mee');
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
          var values = getValues(startEvent_1);

          expect(values[1].id).to.equal('newId');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          var values = getValues(startEvent_1);

          expect(values[1].id).to.equal('mee');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          var values = getValues(startEvent_1);

          expect(values[1].id).to.equal('newId');
        }));

      });

    });


    describe('remove value', function() {

      var values;

      beforeEach(function() {
        values = domQuery('[data-entry="form-field-enum-values"] [data-list-entry-container]', container);

        var removeButton = domQuery('[data-index="1"] [data-action="deleteElement"]', values);

        // remove the second value
        TestHelper.triggerEvent(removeButton, 'click');
      });

      describe('in the DOM', function() {

        it('should execute', function() {

          // then
          expect(values.childNodes).to.have.length(1);

          var rowNode = values.childNodes[0];

          expect(rowNode.childNodes[0].value).to.equal('foo');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(values.childNodes).to.have.length(2);

          var rowNode1 = values.childNodes[0],
              rowNode2 = values.childNodes[1];

          expect(rowNode1.childNodes[0].value).to.equal('foo');
          expect(rowNode2.childNodes[0].value).to.equal('mee');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(values.childNodes).to.have.length(1);

          var rowNode = values.childNodes[0];

          expect(rowNode.childNodes[0].value).to.equal('foo');
        }));

      });


      describe('on the business object', function() {

        it('should execute', function() {

          // then
          var values = getValues(startEvent_1);

          expect(values).to.have.length(1);
          expect(values[0].id).to.equal('foo');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          var values = getValues(startEvent_1);

          expect(values).to.have.length(2);
          expect(values[0].id).to.equal('foo');
          expect(values[1].id).to.equal('mee');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          var values = getValues(startEvent_1);

          expect(values).to.have.length(1);
          expect(values[0].id).to.equal('foo');
        }));

      });

    });


    describe('insert invaid id', function() {

      var input;

      beforeEach(function() {

        input = domQuery('[data-entry="form-field-enum-values"] [data-index="1"] [name="id"]', container);

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
          expect(input.value).to.equal('mee');
          expect(domClasses(input).has('invalid')).to.be.false;
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          // cannot redo to invalid state
          expect(input.value).to.equal('mee');
          expect(domClasses(input).has('invalid')).to.be.false;
        }));

      });


      describe('on the business object', function() {

        it('should execute', function() {

          // then
          var values = getValues(startEvent_1);

          expect(values[1].id).to.equal('mee');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          var values = getValues(startEvent_1);

          expect(values[1].id).to.equal('mee');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          var values = getValues(startEvent_1);

          expect(values[1].id).to.equal('mee');
        }));

      });

    });


    describe('remove type enum', function() {

      var values;

      beforeEach(function() {

        values = domQuery('[data-entry="form-field-enum-values"]', container);

        var selectBox = domQuery('[data-entry="form-field-type"] select', container);

        TestHelper.selectedByOption(selectBox, 'string');
        TestHelper.triggerEvent(selectBox, 'change');
      });

      describe('in the DOM', function() {

        it('should hide values', inject(function() {

          // then
          expect(domClasses(values.childNodes[0]).has('bpp-hidden')).to.be.true;
          expect(domClasses(values.childNodes[1]).has('bpp-hidden')).to.be.true;
        }));

        it('should hide values - undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(domClasses(values.childNodes[0]).has('bpp-hidden')).to.be.false;
          expect(domClasses(values.childNodes[1]).has('bpp-hidden')).to.be.false;
        }));


        it('should hide values - redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(domClasses(values.childNodes[0]).has('bpp-hidden')).to.be.true;
          expect(domClasses(values.childNodes[1]).has('bpp-hidden')).to.be.true;
        }));

      });


      describe('on the business object', function() {

        it('should execute', function() {

          // then
          var values = getValues(startEvent_1);

          expect(values).to.be.undefined;
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          var values = getValues(startEvent_1);

          expect(values).to.have.length(2);
          expect(values[0].id).to.equal('foo');
          expect(values[1].id).to.equal('mee');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          var values = getValues(startEvent_1);

          expect(values).to.be.undefined;
        }));

      });

    });

  });

});
