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

var extensionElementsHelper = require('../../../../lib/helper/ExtensionElementsHelper');

describe('listener-fieldInjection-properties', function() {

  var diagramXML = require('./ListenerFieldInjection.bpmn');

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

  function getExtensionElements(bo, type) {
    return extensionElementsHelper.getExtensionElements(bo, type) || [];
  }

  function getCamundaFields(bo, type, idx) {
    var extensionElements = getExtensionElements(bo, type);
    return extensionElements[idx].fields || [];
  }

  function getInput(container, inputNode) {
    return domQuery('div[data-entry=' + inputNode.dataEntry + '] input[name=' + inputNode.name + ']', container);
  }

  function getTextbox(container, inputNode) {
    return domQuery('div[data-entry=' + inputNode.dataEntry + '] div[name=' + inputNode.name + ']', container);
  }

  function getSelect(container, inputNode) {
    return domQuery('div[data-entry=' + inputNode.dataEntry + '] select[name=' + inputNode.name + ']', container);
  }

  function getAddButton(container, selector) {
    return domQuery('div[data-entry=' + selector + '] button[data-action=createElement]', container);
  }

  function getRemoveButton(container, selector) {
    return domQuery('div[data-entry=' + selector + '] button[data-action=removeElement]', container);
  }

  function selectOption(container, inputNode) {
    var select = getSelect(container, inputNode);

    select.options[0].selected = 'selected';
    TestHelper.triggerEvent(select, 'change');
  }

  var EXECUTION_LISTENER_TYPE = 'camunda:ExecutionListener',
      TASK_LISTENER_TYPE       = 'camunda:TaskListener';

  var FIELD_NAME_ELEMENT                = { dataEntry: 'listener-field-name', name: 'fieldName' },
      FIELD_TYPE_ELEMENT                = { dataEntry: 'listener-field-type', name: 'fieldType' },
      FIELD_VALUE_ELEMENT               = { dataEntry: 'listener-field-value', name: 'fieldValue' },
      FIELDS_SELECT_ELEMENT             = { dataEntry: 'listener-fields', name: 'selectedExtensionElement' },
      EXECUTION_LISTENER_SELECT_ELEMENT = { dataEntry: 'executionListeners', name: 'selectedExtensionElement' },
      TASK_LISTENER_SELECT_ELEMENT      = { dataEntry: 'taskListeners', name: 'selectedExtensionElement' };


  describe('get', function() {

    describe('#serviceTask', function() {

      var camundaField;

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        var shape = elementRegistry.get('ServiceTask');
        selection.select(shape);

        var bo = getBusinessObject(shape);
        camundaField = getCamundaFields(bo, EXECUTION_LISTENER_TYPE, 0)[0];

        // select listener
        selectOption(propertiesPanel._container, EXECUTION_LISTENER_SELECT_ELEMENT);
        // select field
        selectOption(propertiesPanel._container, FIELDS_SELECT_ELEMENT);

      }));


      it('name', inject(function(propertiesPanel) {

        var field = getInput(propertiesPanel._container, FIELD_NAME_ELEMENT);

        expect(field.value).to.equal(camundaField.get('name'));

      }));

      it('fieldType', inject(function(propertiesPanel) {

        var field = getSelect(propertiesPanel._container, FIELD_TYPE_ELEMENT);

        expect(field.value).to.equal('string');

      }));

      it('fieldValue', inject(function(propertiesPanel) {

        var field = getTextbox(propertiesPanel._container, FIELD_VALUE_ELEMENT);

        expect(field.textContent).to.equal(camundaField.get('string'));

      }));

    });


    describe('#user select executionListener', function() {

      var camundaField;

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        var shape = elementRegistry.get('UserTask');
        selection.select(shape);

        var bo = getBusinessObject(shape);
        camundaField = getCamundaFields(bo, EXECUTION_LISTENER_TYPE, 0)[0];

        // select listener
        selectOption(propertiesPanel._container, EXECUTION_LISTENER_SELECT_ELEMENT);
        // select field
        selectOption(propertiesPanel._container, FIELDS_SELECT_ELEMENT);

      }));


      it('name', inject(function(propertiesPanel) {

        var field = getInput(propertiesPanel._container, FIELD_NAME_ELEMENT);

        expect(field.value).to.equal(camundaField.get('name'));

      }));

      it('fieldType', inject(function(propertiesPanel) {

        var field = getSelect(propertiesPanel._container, FIELD_TYPE_ELEMENT);

        expect(field.value).to.equal('string');

      }));

      it('fieldValue', inject(function(propertiesPanel) {

        var field = getTextbox(propertiesPanel._container, FIELD_VALUE_ELEMENT);

        expect(field.textContent).to.equal('myStringValue');

      }));

    });

    describe('#user select taskListener', function() {

      var camundaField;

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        var shape = elementRegistry.get('UserTask');
        selection.select(shape);

        var bo = getBusinessObject(shape);
        camundaField = getCamundaFields(bo, TASK_LISTENER_TYPE, 0)[0];

        // select listener
        selectOption(propertiesPanel._container, TASK_LISTENER_SELECT_ELEMENT);
        // select field
        selectOption(propertiesPanel._container, FIELDS_SELECT_ELEMENT);

      }));


      it('name', inject(function(propertiesPanel) {

        var field = getInput(propertiesPanel._container, FIELD_NAME_ELEMENT);

        expect(field.value).to.equal(camundaField.get('name'));

      }));

      it('fieldType', inject(function(propertiesPanel) {

        var field = getSelect(propertiesPanel._container, FIELD_TYPE_ELEMENT);

        expect(field.value).to.equal('expression');

      }));

      it('fieldValue', inject(function(propertiesPanel) {

        var field = getTextbox(propertiesPanel._container, FIELD_VALUE_ELEMENT);

        expect(field.textContent).to.equal('${myExpression}');

      }));

    });


    describe('#executionListener with stringValue attr', function() {

      var camundaField;

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        var shape = elementRegistry.get('Process_1');
        selection.select(shape);

        var bo = getBusinessObject(shape);
        camundaField = getCamundaFields(bo, EXECUTION_LISTENER_TYPE, 0)[0];

        // select listener
        selectOption(propertiesPanel._container, EXECUTION_LISTENER_SELECT_ELEMENT);
        // select field
        selectOption(propertiesPanel._container, FIELDS_SELECT_ELEMENT);

      }));


      it('name', inject(function(propertiesPanel) {

        var field = getInput(propertiesPanel._container, FIELD_NAME_ELEMENT);

        expect(field.value).to.equal(camundaField.get('name'));

      }));

      it('fieldType', inject(function(propertiesPanel) {

        var field = getSelect(propertiesPanel._container, FIELD_TYPE_ELEMENT);

        expect(field.value).to.equal('string');

      }));

      it('fieldValue', inject(function(propertiesPanel) {

        var field = getTextbox(propertiesPanel._container, FIELD_VALUE_ELEMENT);

        expect(field.textContent).to.equal(camundaField.get('stringValue'));

      }));

    });


    describe('#executionListener with expression element', function() {

      var camundaField;

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        var shape = elementRegistry.get('SequenceFlow_1');
        selection.select(shape);

        var bo = getBusinessObject(shape);
        camundaField = getCamundaFields(bo, EXECUTION_LISTENER_TYPE, 0)[0];

        // select listener
        selectOption(propertiesPanel._container, EXECUTION_LISTENER_SELECT_ELEMENT);
        // select field
        selectOption(propertiesPanel._container, FIELDS_SELECT_ELEMENT);

      }));


      it('name', inject(function(propertiesPanel) {

        var field = getInput(propertiesPanel._container, FIELD_NAME_ELEMENT);

        expect(field.value).to.equal(camundaField.get('name'));

      }));

      it('fieldType', inject(function(propertiesPanel) {

        var field = getSelect(propertiesPanel._container, FIELD_TYPE_ELEMENT);

        expect(field.value).to.equal('expression');

      }));

      it('fieldValue', inject(function(propertiesPanel) {

        var field = getTextbox(propertiesPanel._container, FIELD_VALUE_ELEMENT);

        expect(field.textContent).to.equal(camundaField.get('expression'));

      }));

    });


  });


  describe('set', function() {

    describe('#serviceTask', function() {

      var camundaField;

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        var shape = elementRegistry.get('ServiceTask');
        selection.select(shape);

        var bo = getBusinessObject(shape);
        camundaField = getCamundaFields(bo, EXECUTION_LISTENER_TYPE, 0)[0];

        // select listener
        selectOption(propertiesPanel._container, EXECUTION_LISTENER_SELECT_ELEMENT);
        // select field
        selectOption(propertiesPanel._container, FIELDS_SELECT_ELEMENT);

      }));

      describe('#name', function() {

        var field;

        beforeEach(inject(function(propertiesPanel) {

          field = getInput(propertiesPanel._container, FIELD_NAME_ELEMENT);

          TestHelper.triggerValue(field, 'FOO', 'change');

        }));

        describe('in the DOM', function() {

          it('should execute', function() {
            expect(field.value).to.equal('FOO');
          });

          it('should undo', inject(function(commandStack) {

            commandStack.undo();

            expect(field.value).to.equal('FieldServiceTaskOne');
          }));

          it('should redo', inject(function(commandStack) {

            commandStack.undo();
            commandStack.redo();

            expect(field.value).to.equal('FOO');

          }));

        });

        describe('on the business object', function() {

          it('should execute', function() {
            expect(camundaField.get('name')).to.equal('FOO');
          });

          it('should undo', inject(function(commandStack) {

            commandStack.undo();

            expect(camundaField.get('name')).to.equal('FieldServiceTaskOne');
          }));

          it('should redo', inject(function(commandStack) {

            commandStack.undo();
            commandStack.redo();

            expect(camundaField.get('name')).to.equal('FOO');

          }));

        });

      });

      describe('#fieldType', function() {

        var field;

        beforeEach(inject(function(propertiesPanel) {

          field = getSelect(propertiesPanel._container, FIELD_TYPE_ELEMENT);

          // select 'expression'
          field.options[1].selected = 'selected';
          TestHelper.triggerEvent(field, 'change');

        }));

        describe('in the DOM', function() {

          it('should execute', function() {
            expect(field.value).to.equal('expression');
          });

          it('should undo', inject(function(commandStack) {

            commandStack.undo();

            expect(field.value).to.equal('string');
          }));

          it('should redo', inject(function(commandStack) {

            commandStack.undo();
            commandStack.redo();

            expect(field.value).to.equal('expression');

          }));

        });

        describe('on the business object', function() {

          it('should execute', function() {
            expect(camundaField.get('string')).to.be.undefined;
            expect(camundaField.get('expression')).to.exist;
          });

          it('should undo', inject(function(commandStack) {

            commandStack.undo();

            expect(camundaField.get('string')).to.exist;
            expect(camundaField.get('expression')).to.be.undefined;
          }));

          it('should redo', inject(function(commandStack) {

            commandStack.undo();
            commandStack.redo();

            expect(camundaField.get('string')).to.be.undefined;
            expect(camundaField.get('expression')).to.exist;
          }));

        });

      });

      describe('#fieldValue', function() {

        var field;

        beforeEach(inject(function(propertiesPanel) {
          field = getTextbox(propertiesPanel._container, FIELD_VALUE_ELEMENT);

          TestHelper.triggerValue(field, 'FOO', 'change');

        }));

        describe('in the DOM', function() {

          it('should execute', function() {
            expect(field.textContent).to.equal('FOO');
          });

          it('should undo', inject(function(commandStack) {

            commandStack.undo();

            expect(field.textContent).to.equal('myStringValue');
          }));

          it('should redo', inject(function(commandStack) {

            commandStack.undo();
            commandStack.redo();

            expect(field.textContent).to.equal('FOO');

          }));

        });

        describe('on the business object', function() {

          it('should execute', function() {
            expect(camundaField.get('string')).to.equal('FOO');
          });

          it('should undo', inject(function(commandStack) {

            commandStack.undo();

            expect(camundaField.get('string')).to.equal('myStringValue');
          }));

          it('should redo', inject(function(commandStack) {

            commandStack.undo();
            commandStack.redo();

            expect(camundaField.get('string')).to.equal('FOO');
          }));

        });

      });


    });


    describe('#userTask', function() {

      var camundaField;

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        var shape = elementRegistry.get('UserTask');
        selection.select(shape);

        var bo = getBusinessObject(shape);
        camundaField = getCamundaFields(bo, TASK_LISTENER_TYPE, 0)[0];

        // select listener
        selectOption(propertiesPanel._container, TASK_LISTENER_SELECT_ELEMENT);
        // select field
        selectOption(propertiesPanel._container, FIELDS_SELECT_ELEMENT);

      }));

      describe('#name', function() {

        var field;

        beforeEach(inject(function(propertiesPanel) {
          field = getInput(propertiesPanel._container, FIELD_NAME_ELEMENT);

          TestHelper.triggerValue(field, 'FOO', 'change');

        }));

        describe('in the DOM', function() {

          it('should execute', function() {
            expect(field.value).to.equal('FOO');
          });

          it('should undo', inject(function(commandStack) {

            commandStack.undo();

            expect(field.value).to.equal('FieldUserTask');
          }));

          it('should redo', inject(function(commandStack) {

            commandStack.undo();
            commandStack.redo();

            expect(field.value).to.equal('FOO');

          }));

        });

        describe('on the business object', function() {

          it('should execute', function() {
            expect(camundaField.get('name')).to.equal('FOO');
          });

          it('should undo', inject(function(commandStack) {

            commandStack.undo();

            expect(camundaField.get('name')).to.equal('FieldUserTask');
          }));

          it('should redo', inject(function(commandStack) {

            commandStack.undo();
            commandStack.redo();

            expect(camundaField.get('name')).to.equal('FOO');

          }));

        });

      });

      describe('#fieldType', function() {

        var field;

        beforeEach(inject(function(propertiesPanel) {
          field = getSelect(propertiesPanel._container, FIELD_TYPE_ELEMENT);

          // select 'string'
          field.options[0].selected = 'selected';
          TestHelper.triggerEvent(field, 'change');

        }));

        describe('in the DOM', function() {

          it('should execute', function() {
            expect(field.value).to.equal('string');
          });

          it('should undo', inject(function(commandStack) {

            commandStack.undo();

            expect(field.value).to.equal('expression');
          }));

          it('should redo', inject(function(commandStack) {

            commandStack.undo();
            commandStack.redo();

            expect(field.value).to.equal('string');

          }));

        });

        describe('on the business object', function() {

          it('should execute', function() {
            expect(camundaField.get('expression')).to.be.undefined;
            expect(camundaField.get('string')).to.exist;
          });

          it('should undo', inject(function(commandStack) {

            commandStack.undo();

            expect(camundaField.get('expression')).to.exist;
            expect(camundaField.get('string')).to.be.undefined;
          }));

          it('should redo', inject(function(commandStack) {

            commandStack.undo();
            commandStack.redo();

            expect(camundaField.get('expression')).to.be.undefined;
            expect(camundaField.get('string')).to.exist;
          }));

        });

      });

      describe('#fieldValue', function() {

        var field;

        beforeEach(inject(function(propertiesPanel) {
          field = getTextbox(propertiesPanel._container, FIELD_VALUE_ELEMENT);

          TestHelper.triggerValue(field, 'FOO', 'change');

        }));

        describe('in the DOM', function() {

          it('should execute', function() {
            expect(field.textContent).to.equal('FOO');
          });

          it('should undo', inject(function(commandStack) {

            commandStack.undo();

            expect(field.textContent).to.equal('${myExpression}');
          }));

          it('should redo', inject(function(commandStack) {

            commandStack.undo();
            commandStack.redo();

            expect(field.textContent).to.equal('FOO');

          }));

        });

        describe('on the business object', function() {

          it('should execute', function() {
            expect(camundaField.get('expression')).to.equal('FOO');
          });

          it('should undo', inject(function(commandStack) {

            commandStack.undo();

            expect(camundaField.get('expression')).to.equal('${myExpression}');
          }));

          it('should redo', inject(function(commandStack) {

            commandStack.undo();
            commandStack.redo();

            expect(camundaField.get('expression')).to.equal('FOO');
          }));

        });

      });


    });


  });


  describe('add camunda:field', function() {

    describe('#userTask', function() {

      var bo;

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        var shape = elementRegistry.get('UserTask');
        selection.select(shape);

        bo = getBusinessObject(shape);

        // select listener
        selectOption(propertiesPanel._container, TASK_LISTENER_SELECT_ELEMENT);

        var button = getAddButton(propertiesPanel._container, 'listener-fields');

        TestHelper.triggerEvent(button, 'click');

      }));

      describe('in the DOM', function() {

        it('should execute', inject(function(propertiesPanel) {
          var field = getSelect(propertiesPanel._container, FIELDS_SELECT_ELEMENT);
          expect(field.options).to.have.length(2);
        }));

        it('should undo', inject(function(commandStack, propertiesPanel) {

          commandStack.undo();

          var field = getSelect(propertiesPanel._container, FIELDS_SELECT_ELEMENT);
          expect(field.options).to.have.length(1);
        }));

        it('should redo', inject(function(commandStack, propertiesPanel) {

          commandStack.undo();
          commandStack.redo();

          var field = getSelect(propertiesPanel._container, FIELDS_SELECT_ELEMENT);
          expect(field.options).to.have.length(2);

        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {
          var camundaField = getCamundaFields(bo, TASK_LISTENER_TYPE, 0);
          expect(camundaField).to.have.length(2);
        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          var camundaField = getCamundaFields(bo, TASK_LISTENER_TYPE, 0);
          expect(camundaField).to.have.length(1);
        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          var camundaField = getCamundaFields(bo, TASK_LISTENER_TYPE, 0);
          expect(camundaField).to.have.length(2);
        }));

      });

    });


    describe('#serviceTask', function() {

      var bo;

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        var shape = elementRegistry.get('ServiceTask');
        selection.select(shape);

        bo = getBusinessObject(shape);

        // select listener
        selectOption(propertiesPanel._container, EXECUTION_LISTENER_SELECT_ELEMENT);

        var button = getAddButton(propertiesPanel._container, 'listener-fields');

        TestHelper.triggerEvent(button, 'click');

      }));

      describe('in the DOM', function() {

        it('should execute', inject(function(propertiesPanel) {
          var field = getSelect(propertiesPanel._container, FIELDS_SELECT_ELEMENT);
          expect(field.options).to.have.length(3);
        }));

        it('should undo', inject(function(commandStack, propertiesPanel) {

          commandStack.undo();

          var field = getSelect(propertiesPanel._container, FIELDS_SELECT_ELEMENT);
          expect(field.options).to.have.length(2);
        }));

        it('should redo', inject(function(commandStack, propertiesPanel) {

          commandStack.undo();
          commandStack.redo();

          var field = getSelect(propertiesPanel._container, FIELDS_SELECT_ELEMENT);
          expect(field.options).to.have.length(3);

        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {
          var camundaField = getCamundaFields(bo, EXECUTION_LISTENER_TYPE, 0);
          expect(camundaField).to.have.length(3);
        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          var camundaField = getCamundaFields(bo, EXECUTION_LISTENER_TYPE, 0);
          expect(camundaField).to.have.length(2);
        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          var camundaField = getCamundaFields(bo, EXECUTION_LISTENER_TYPE, 0);
          expect(camundaField).to.have.length(3);
        }));

      });

    });


    describe('#endEvent', function() {

      var bo;

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        var shape = elementRegistry.get('EndEvent_1');
        selection.select(shape);

        bo = getBusinessObject(shape);

        // add execution listener
        var button = getAddButton(propertiesPanel._container, 'executionListeners');

        TestHelper.triggerEvent(button, 'click');

        // add camunda:field
        button = getAddButton(propertiesPanel._container, 'listener-fields');

        TestHelper.triggerEvent(button, 'click');

      }));

      describe('in the DOM', function() {

        it('should execute', inject(function(propertiesPanel) {
          var field = getSelect(propertiesPanel._container, FIELDS_SELECT_ELEMENT);
          expect(field.options).to.have.length(1);
        }));

        it('should undo', inject(function(commandStack, propertiesPanel) {

          commandStack.undo();

          var field = getSelect(propertiesPanel._container, FIELDS_SELECT_ELEMENT);
          expect(field.options).to.have.length(0);
        }));

        it('should redo', inject(function(commandStack, propertiesPanel) {

          commandStack.undo();
          commandStack.redo();

          var field = getSelect(propertiesPanel._container, FIELDS_SELECT_ELEMENT);
          expect(field.options).to.have.length(1);

        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {
          var camundaField = getCamundaFields(bo, EXECUTION_LISTENER_TYPE, 0);
          expect(camundaField).to.have.length(1);
        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          var camundaField = getCamundaFields(bo, EXECUTION_LISTENER_TYPE, 0);
          expect(camundaField).to.have.length(0);
        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          var camundaField = getCamundaFields(bo, EXECUTION_LISTENER_TYPE, 0);
          expect(camundaField).to.have.length(1);
        }));

      });

    });


  });


  describe('remove camunda:field', function() {

    describe('#serviceTask', function() {

      var bo;

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        var shape = elementRegistry.get('ServiceTask');
        selection.select(shape);

        bo = getBusinessObject(shape);

        var button = getRemoveButton(propertiesPanel._container, 'listener-fields');

        // select listener
        selectOption(propertiesPanel._container, EXECUTION_LISTENER_SELECT_ELEMENT);

        // select field
        selectOption(propertiesPanel._container, FIELDS_SELECT_ELEMENT);

        TestHelper.triggerEvent(button, 'click');

      }));

      describe('in the DOM', function() {

        it('should execute', inject(function(propertiesPanel) {
          var field = getSelect(propertiesPanel._container, FIELDS_SELECT_ELEMENT);
          expect(field.options).to.have.length(1);
        }));

        it('should undo', inject(function(commandStack, propertiesPanel) {

          commandStack.undo();

          var field = getSelect(propertiesPanel._container, FIELDS_SELECT_ELEMENT);
          expect(field.options).to.have.length(2);
        }));

        it('should redo', inject(function(commandStack, propertiesPanel) {

          commandStack.undo();
          commandStack.redo();

          var field = getSelect(propertiesPanel._container, FIELDS_SELECT_ELEMENT);
          expect(field.options).to.have.length(1);

        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {
          var camundaField = getCamundaFields(bo, EXECUTION_LISTENER_TYPE, 0);
          expect(camundaField).to.have.length(1);
        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          var camundaField = getCamundaFields(bo, EXECUTION_LISTENER_TYPE, 0);
          expect(camundaField).to.have.length(2);
        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          var camundaField = getCamundaFields(bo, EXECUTION_LISTENER_TYPE, 0);
          expect(camundaField).to.have.length(1);
        }));

      });

    });

    describe('#userTask', function() {

      var bo;

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        var shape = elementRegistry.get('UserTask');
        selection.select(shape);

        bo = getBusinessObject(shape);

        var button = getRemoveButton(propertiesPanel._container, 'listener-fields');

        // select listener
        selectOption(propertiesPanel._container, TASK_LISTENER_SELECT_ELEMENT);

        // select field
        selectOption(propertiesPanel._container, FIELDS_SELECT_ELEMENT);

        TestHelper.triggerEvent(button, 'click');

      }));

      describe('in the DOM', function() {

        it('should execute', inject(function(propertiesPanel) {
          var field = getSelect(propertiesPanel._container, FIELDS_SELECT_ELEMENT);
          expect(field.options).to.have.length(0);
        }));

        it('should undo', inject(function(commandStack, propertiesPanel) {

          commandStack.undo();

          var field = getSelect(propertiesPanel._container, FIELDS_SELECT_ELEMENT);
          expect(field.options).to.have.length(1);
        }));

        it('should redo', inject(function(commandStack, propertiesPanel) {

          commandStack.undo();
          commandStack.redo();

          var field = getSelect(propertiesPanel._container, FIELDS_SELECT_ELEMENT);
          expect(field.options).to.have.length(0);

        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {
          var camundaField = getCamundaFields(bo, TASK_LISTENER_TYPE, 0);
          expect(camundaField).to.have.length(0);
        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          var camundaField = getCamundaFields(bo, TASK_LISTENER_TYPE, 0);
          expect(camundaField).to.have.length(1);
        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          var camundaField = getCamundaFields(bo, TASK_LISTENER_TYPE, 0);
          expect(camundaField).to.have.length(0);
        }));

      });

    });


  });


  describe('remove camunda:listener', function() {

    describe('#userTask remove executionListener', function() {

      var bo;

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        var shape = elementRegistry.get('UserTask');
        selection.select(shape);

        bo = getBusinessObject(shape);

        var button = getRemoveButton(propertiesPanel._container, 'executionListeners');

        // select listener
        selectOption(propertiesPanel._container, EXECUTION_LISTENER_SELECT_ELEMENT);

        TestHelper.triggerEvent(button, 'click');

      }));

      describe('in the DOM', function() {

        it('should execute', inject(function(propertiesPanel) {

          var field = getSelect(propertiesPanel._container, EXECUTION_LISTENER_SELECT_ELEMENT);
          expect(field.options).to.have.length(0);

        }));

        it('should undo', inject(function(commandStack, propertiesPanel) {

          commandStack.undo();

          var field = getSelect(propertiesPanel._container, EXECUTION_LISTENER_SELECT_ELEMENT);
          expect(field.options).to.have.length(1);

        }));

        it('should redo', inject(function(commandStack, propertiesPanel) {

          commandStack.undo();
          commandStack.redo();

          var field = getSelect(propertiesPanel._container, EXECUTION_LISTENER_SELECT_ELEMENT);
          expect(field.options).to.have.length(0);

        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {

          expect(getExtensionElements(bo, EXECUTION_LISTENER_TYPE)).to.have.length(0);

        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          expect(getExtensionElements(bo, EXECUTION_LISTENER_TYPE)).to.have.length(1);
          var camundaField = getCamundaFields(bo, EXECUTION_LISTENER_TYPE, 0);
          expect(camundaField).to.have.length(1);

        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          expect(getExtensionElements(bo, EXECUTION_LISTENER_TYPE)).to.have.length(0);

        }));

      });

    });


    describe('#userTask remove taskListener', function() {

      var bo;

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        var shape = elementRegistry.get('UserTask');
        selection.select(shape);

        bo = getBusinessObject(shape);

        var button = getRemoveButton(propertiesPanel._container, 'taskListeners');

        // select listener
        selectOption(propertiesPanel._container, TASK_LISTENER_SELECT_ELEMENT);

        TestHelper.triggerEvent(button, 'click');

      }));

      describe('in the DOM', function() {

        it('should execute', inject(function(propertiesPanel) {

          var field = getSelect(propertiesPanel._container, TASK_LISTENER_SELECT_ELEMENT);
          expect(field.options).to.have.length(0);

        }));

        it('should undo', inject(function(commandStack, propertiesPanel) {

          commandStack.undo();

          var field = getSelect(propertiesPanel._container, TASK_LISTENER_SELECT_ELEMENT);
          expect(field.options).to.have.length(1);
        }));

        it('should redo', inject(function(commandStack, propertiesPanel) {

          commandStack.undo();
          commandStack.redo();

          var field = getSelect(propertiesPanel._container, TASK_LISTENER_SELECT_ELEMENT);
          expect(field.options).to.have.length(0);

        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {

          expect(getExtensionElements(bo, TASK_LISTENER_TYPE)).to.have.length(0);

        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          expect(getExtensionElements(bo, TASK_LISTENER_TYPE)).to.have.length(1);

          var camundaField = getCamundaFields(bo, TASK_LISTENER_TYPE, 0);
          expect(camundaField).to.have.length(1);

        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          expect(getExtensionElements(bo, TASK_LISTENER_TYPE)).to.have.length(0);

        }));

      });

    });


  });


  describe('validation errors', function() {

    beforeEach(inject(function(elementRegistry, selection, propertiesPanel) {

      var item = elementRegistry.get('StartEvent_1');
      selection.select(item);

      // select listener
      selectOption(propertiesPanel._container, EXECUTION_LISTENER_SELECT_ELEMENT);

      // select field
      selectOption(propertiesPanel._container, FIELDS_SELECT_ELEMENT);

    }));

    it('should be shown if the name field is empty', inject(function(propertiesPanel) {

      var field = getInput(propertiesPanel._container, FIELD_NAME_ELEMENT);

      expect(domClasses(field).has('invalid')).to.be.true;

    }));

    it('should be shown if fieldType selected and no fieldValue is empty', inject(function(propertiesPanel) {

      var fieldType = getSelect(propertiesPanel._container, FIELD_TYPE_ELEMENT);
      var fieldValue = getTextbox(propertiesPanel._container, FIELD_VALUE_ELEMENT);

      expect(fieldType.value).to.equal('string');
      expect(domClasses(fieldValue).has('invalid')).to.be.true;

    }));


  });


  describe('control visibility', function() {

    function expectVisible(visible, getter, inputNode, parentElement) {

      return inject(function(propertiesPanel, selection, elementRegistry) {

        var field = getter(propertiesPanel._container, inputNode);

        if (parentElement) {
          field = field.parentElement;
        }

        // then
        if (visible) {
          expect(field).to.exist;
        } else {
          expect(domClasses(field).has('bpp-hidden')).to.be.true;
        }
      });
    }

    describe('should show', function() {

      beforeEach(inject(function(elementRegistry, selection, propertiesPanel) {

        var item = elementRegistry.get('ServiceTask');
        selection.select(item);

        // select listener
        selectOption(propertiesPanel._container, EXECUTION_LISTENER_SELECT_ELEMENT);

        // select field
        selectOption(propertiesPanel._container, FIELDS_SELECT_ELEMENT);

      }));

      it('fieldName', expectVisible(true, getInput, FIELD_NAME_ELEMENT));
      it('fieldType', expectVisible(true, getSelect, FIELD_TYPE_ELEMENT));
      it('fieldValue', expectVisible(true, getTextbox, FIELD_VALUE_ELEMENT));

    });

    describe('should hide', function() {

      beforeEach(inject(function(elementRegistry, selection, propertiesPanel) {

        var item = elementRegistry.get('ServiceTask');
        selection.select(item);

        // select listener
        selectOption(propertiesPanel._container, EXECUTION_LISTENER_SELECT_ELEMENT);

      }));

      it('fieldName', expectVisible(false, getInput, FIELD_NAME_ELEMENT, true));
      it('fieldType', expectVisible(false, getSelect, FIELD_TYPE_ELEMENT));
      it('fieldValue', expectVisible(false, getTextbox, FIELD_VALUE_ELEMENT, true));

    });

  });


});
