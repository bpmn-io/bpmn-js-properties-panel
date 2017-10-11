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

function getExtensionsTab(container) {
  return domQuery('div[data-tab="extensionElements"]', container);
}

function getPropertiesGroup(container) {
  var extensions = getExtensionsTab(container);
  return domQuery('div[data-group="extensionElements-properties"]', extensions);
}

function getPropertiesEntry(container) {
  var group = getPropertiesGroup(container);
  return domQuery('div[data-entry="properties"]', group);
}

function clickAddProperty(container) {
  var entry = getPropertiesEntry(container);
  var addButton = domQuery('button[data-action="addElement"]', entry);
  TestHelper.triggerEvent(addButton, 'click');
}

function getPropertiesTable(container) {
  var entry = getPropertiesEntry(container);
  return domQuery('div[data-list-entry-container]', entry);
}

var getPropertyValues = function(element, isNoParticipant) {
  var bo = getBusinessObject(element).get('processRef');
  if (isNoParticipant) {
    bo = getBusinessObject(element);
  }
  var properties = (getExtensionElements(bo, 'camunda:Properties') || [])[0];

  if (properties) {
    return properties.values;
  }
};

describe('extensionElements-properties-collaboration', function() {

  var diagramXML = require('./PropertiesCollaboration.bpmn');

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

  describe('participant without existing properties', function() {

    var participant;

    beforeEach(inject(function(elementRegistry, selection) {
      // given
      participant = elementRegistry.get('Participant_Without_Props');
      selection.select(participant);
    }));


    describe('add camunda:property', function() {

      var container;

      beforeEach(inject(function(propertiesPanel) {
        container = propertiesPanel._container;
        // when
        clickAddProperty(container);
      }));

      describe('in the DOM', function() {

        var propertiesTable;

        beforeEach(function() {
          propertiesTable = getPropertiesTable(container);
        });

        it('should execute', function() {

          var propertyRow = domQuery('[data-index="0"]', propertiesTable);

          expect(propertyRow).to.exist;
          // expect the row to contain 2 input fields and a remove button
          expect(propertyRow.childNodes).to.have.length(3);

          expect(propertyRow.childNodes[0].name).to.equal('name');
          expect(propertyRow.childNodes[0].value).to.equal('');

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

          expect(propertyRow.childNodes[0].name).to.equal('name');
          expect(propertyRow.childNodes[0].value).to.equal('');

          expect(propertyRow.childNodes[1].name).to.equal('value');
          expect(propertyRow.childNodes[1].value).to.equal('');

          expect(propertyRow.childNodes[2].getAttribute('data-action')).to.equal('deleteElement');
        }));

      });


      describe('on the business object', function() {


        it('should execute', function() {

          var properties = getPropertyValues(participant);

          // then
          expect(properties).to.exist;
          expect(properties).to.have.length(1);
          expect(properties[0].name).to.be.undefined;
          expect(properties[0].name).to.be.undefined;
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          var properties = getPropertyValues(participant);

          // then
          expect(properties).to.be.undefined;
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          var properties = getPropertyValues(participant);

          // then
          expect(properties).to.exist;
          expect(properties).to.have.length(1);
          expect(properties[0].name).to.be.undefined;
          expect(properties[0].name).to.be.undefined;
        }));

      });

    });

  });


  describe('startEvent without existing properties', function() {

    var startEvent;

    beforeEach(inject(function(elementRegistry, selection) {
      // given
      startEvent = elementRegistry.get('StartEvent_1');
      selection.select(startEvent);
    }));


    describe('add camunda:property', function() {

      var container;

      beforeEach(inject(function(propertiesPanel) {
        container = propertiesPanel._container;
        // when
        clickAddProperty(container);
      }));

      describe('in the DOM', function() {

        var propertiesTable;

        beforeEach(function() {
          propertiesTable = getPropertiesTable(container);
        });

        it('should execute', function() {

          var propertyRow = domQuery('[data-index="0"]', propertiesTable);

          expect(propertyRow).to.exist;
          // expect the row to contain 2 input fields and a remove button
          expect(propertyRow.childNodes).to.have.length(3);

          expect(propertyRow.childNodes[0].name).to.equal('name');
          expect(propertyRow.childNodes[0].value).to.equal('');

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

          expect(propertyRow.childNodes[0].name).to.equal('name');
          expect(propertyRow.childNodes[0].value).to.equal('');

          expect(propertyRow.childNodes[1].name).to.equal('value');
          expect(propertyRow.childNodes[1].value).to.equal('');

          expect(propertyRow.childNodes[2].getAttribute('data-action')).to.equal('deleteElement');
        }));

      });


      describe('on the business object', function() {


        it('should execute', function() {

          var properties = getPropertyValues(startEvent, true);

          // then
          expect(properties).to.exist;
          expect(properties).to.have.length(1);
          expect(properties[0].name).to.be.undefined;
          expect(properties[0].name).to.be.undefined;
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          var properties = getPropertyValues(startEvent, true);

          // then
          expect(properties).to.be.undefined;
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          var properties = getPropertyValues(startEvent, true);

          // then
          expect(properties).to.exist;
          expect(properties).to.have.length(1);
          expect(properties[0].name).to.be.undefined;
          expect(properties[0].name).to.be.undefined;
        }));

      });

    });

  });


  describe('participant with existing properties', function() {

    var participant;

    beforeEach(inject(function(elementRegistry, selection) {
      // given
      participant = elementRegistry.get('Participant_With_Props');
      selection.select(participant);
    }));


    describe('add camunda:value', function() {

      var container;

      beforeEach(inject(function(propertiesPanel) {
        container = propertiesPanel._container;
        // when
        clickAddProperty(container);
      }));


      describe('in the DOM', function() {

        var propertiesTable;

        beforeEach(function() {
          propertiesTable = getPropertiesTable(container);
        });

        it('should execute', function() {

          // then
          expect(propertiesTable.childNodes).to.have.length(3);

          var propertyRow = domQuery('[data-index="2"]', propertiesTable);

          expect(propertyRow.childNodes).to.have.length(3);

          expect(propertyRow.childNodes[0].name).to.equal('name');
          expect(propertyRow.childNodes[0].value).to.equal('');

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

          expect(propertyRow1.childNodes[0].value).to.equal('nameOne');
          expect(propertyRow2.childNodes[0].value).to.equal('nameTwo');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(propertiesTable.childNodes).to.have.length(3);

          var propertyRow = domQuery('[data-index="2"]', propertiesTable);

          expect(propertyRow.childNodes).to.have.length(3);

          expect(propertyRow.childNodes[0].name).to.equal('name');
          expect(propertyRow.childNodes[0].value).to.equal('');

          expect(propertyRow.childNodes[1].name).to.equal('value');
          expect(propertyRow.childNodes[1].value).to.equal('');
        }));

      });


      describe('on the business object', function() {

        it('should execute', function() {

          var properties = getPropertyValues(participant);

          // then
          expect(properties).to.exist;
          expect(properties).to.have.length(3);
          expect(properties[2].name).to.be.undefined;
          expect(properties[2].value).to.be.undefined;
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          var properties = getPropertyValues(participant);

          // then
          expect(properties).to.exist;
          expect(properties).to.have.length(2);
          expect(properties[0].name).to.equal('nameOne');
          expect(properties[1].name).to.equal('nameTwo');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          var properties = getPropertyValues(participant);

          // then
          expect(properties).to.exist;
          expect(properties).to.have.length(3);
          expect(properties[2].name).to.be.undefined;
          expect(properties[2].value).to.be.undefined;
        }));

      });

    });


    describe('update name value', function() {

      var input, propertiesTable;

      beforeEach(function() {
        propertiesTable = getPropertiesTable(container);

        // when
        input = domQuery('[data-index="1"] [name="name"]', propertiesTable);
        TestHelper.triggerValue(input, 'newValue', 'change');
      });

      describe('in the DOM', function() {

        it('should execute', function() {

          // then
          expect(input.value).to.equal('newValue');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(input.value).to.equal('nameTwo');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(input.value).to.equal('newValue');
        }));

      });


      describe('on the business object', function() {

        it('should execute', function() {

          // then
          var properties = getPropertyValues(participant);

          expect(properties[1].name).to.equal('newValue');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          var properties = getPropertyValues(participant);

          expect(properties[1].name).to.equal('nameTwo');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          var properties = getPropertyValues(participant);

          expect(properties[1].name).to.equal('newValue');
        }));

      });

    });


    describe('update value', function() {

      var input, propertiesTable;

      beforeEach(function() {
        propertiesTable = getPropertiesTable(container);

        // when
        input = domQuery('[data-index="1"] [name="value"]', propertiesTable);
        TestHelper.triggerValue(input, 'xyz', 'change');
      });

      describe('in the DOM', function() {

        it('should execute', function() {

          // then
          expect(input.value).to.equal('xyz');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(input.value).to.equal('valueTwo');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(input.value).to.equal('xyz');
        }));

      });


      describe('on the business object', function() {

        it('should execute', function() {

          // then
          var properties = getPropertyValues(participant);

          expect(properties[1].value).to.equal('xyz');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          var properties = getPropertyValues(participant);

          expect(properties[1].value).to.equal('valueTwo');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          var properties = getPropertyValues(participant);

          expect(properties[1].value).to.equal('xyz');
        }));

      });

    });

    describe('remove value', function() {

      var propertiesTable;

      beforeEach(function() {
        propertiesTable = getPropertiesTable(container);

        var removeButton = domQuery('[data-index="0"] [data-action="deleteElement"]', propertiesTable);

        // remove the second value
        TestHelper.triggerEvent(removeButton, 'click');
      });

      describe('in the DOM', function() {

        it('should execute', function() {

          // then
          expect(propertiesTable.childNodes).to.have.length(1);

          var propertyRow1 = domQuery('[data-index="0"]', propertiesTable);

          expect(propertyRow1.childNodes[0].value).to.equal('nameTwo');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(propertiesTable.childNodes).to.have.length(2);

          var propertyRow1 = domQuery('[data-index="0"]', propertiesTable),
              propertyRow2 = domQuery('[data-index="1"]', propertiesTable);

          expect(propertyRow1.childNodes[0].value).to.equal('nameOne');
          expect(propertyRow2.childNodes[0].value).to.equal('nameTwo');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(propertiesTable.childNodes).to.have.length(1);

          var propertyRow1 = domQuery('[data-index="0"]', propertiesTable);

          expect(propertyRow1.childNodes[0].value).to.equal('nameTwo');
        }));

      });


      describe('on the business object', function() {

        it('should execute', function() {

          // then
          var properties = getPropertyValues(participant);

          expect(properties).to.have.length(1);
          expect(properties[0].name).to.equal('nameTwo');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          var properties = getPropertyValues(participant);

          expect(properties).to.have.length(2);
          expect(properties[0].name).to.equal('nameOne');
          expect(properties[1].name).to.equal('nameTwo');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          var properties = getPropertyValues(participant);

          expect(properties).to.have.length(1);
          expect(properties[0].name).to.equal('nameTwo');
        }));

      });

    });

  });


  describe('other extension elements', function() {

    it('should retain other extension elements when removing last property value',
      inject(function(elementRegistry, selection, propertiesPanel) {

        // given
        var shape = elementRegistry.get('Participant_With_Listener_And_Props');
        selection.select(shape);
        var bo = getBusinessObject(shape).get('processRef');

        var propertiesTable = getPropertiesTable(propertiesPanel._container);
        var removeButton = domQuery('[data-index="0"] [data-action="deleteElement"]', propertiesTable);

        // when
        TestHelper.triggerEvent(removeButton, 'click');

        // then
        expect(bo.extensionElements).to.exist;
        expect(bo.extensionElements.values).to.have.length(1);

        var listeners = getExtensionElements(bo, 'camunda:ExecutionListener');
        expect(listeners[0]).not.to.be.empty;

      }));


    it('should retain other extension elements when adding property value',
      inject(function(elementRegistry, selection, propertiesPanel) {

        // given
        var shape = elementRegistry.get('Participant_With_Listener_And_Props');
        selection.select(shape);
        var bo = getBusinessObject(shape).get('processRef');

        // when
        clickAddProperty(propertiesPanel._container);

        // then
        expect(bo.extensionElements).to.exist;
        expect(bo.extensionElements.values).to.have.length(2);

        var properties = getExtensionElements(bo, 'camunda:Properties');
        expect(properties[0]).not.to.be.empty;

        var listeners = getExtensionElements(bo, 'camunda:ExecutionListener');
        expect(listeners[0]).not.to.be.empty;

      }));

  });


  describe('visibility', function() {

    it('participant without processRef', inject(function(elementRegistry, selection, propertiesPanel) {

      // given
      var participant = elementRegistry.get('Participant_Without_Process');
      selection.select(participant);

      var extensionTab = getExtensionsTab(propertiesPanel._container);

      expect(domClasses(extensionTab).has('bpp-hidden')).to.be.true;

    }));

  });


});
