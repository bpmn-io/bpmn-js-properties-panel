'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('lib'),
    domQuery = require('min-dom').query,
    coreModule = require('bpmn-js/lib/core').default,
    selectionModule = require('diagram-js/lib/features/selection').default,
    modelingModule = require('bpmn-js/lib/features/modeling').default,
    propertiesProviderModule = require('lib/provider/camunda'),
    camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda'),
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    eventDefinitionHelper = require('lib/helper/EventDefinitionHelper');

function getGeneralTab(container) {
  return domQuery('div[data-tab="general"]', container);
}

function getDetailsGroup(container) {
  var tab = getGeneralTab(container);
  return domQuery('div[data-group="details"]', tab);
}

function getEntry(container, entryId) {
  return domQuery('div[data-entry="' + entryId + '"]', getDetailsGroup(container));
}

function getInputField(container, entryId, inputName) {
  var selector = 'input' + (inputName ? '[name="' + inputName + '"]' : '');
  return domQuery(selector, getEntry(container, entryId));
}

function getErrorMessageField(container) {
  return getInputField(container, 'error-element-message', 'errorMessage');
}

function getErrorCodeVariableField(container) {
  return getInputField(container, 'errorCodeVariable', 'errorCodeVariable');
}

function getErrorMessageVariableField(container) {
  return getInputField(container, 'errorMessageVariable', 'errorMessageVariable');
}

function getClearButton(container, selector) {
  return domQuery('div[data-entry=' + selector + '] button[data-action=clear]', container);
}

describe('error-event-properties', function() {

  var diagramXML = require('./ErrorEventDefinition.bpmn');

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


  describe('get', function() {

    var container, errorEventDefinition;

    beforeEach(inject(function(elementRegistry, propertiesPanel, selection) {

      // given
      container = propertiesPanel._container;

      var shape = elementRegistry.get('ErrorStartEvent_all');
      selection.select(shape);

      var bo = getBusinessObject(shape);
      errorEventDefinition = eventDefinitionHelper.getErrorEventDefinition(bo);

    }));


    it('should fetch the errorMessage of an error event', function() {

      var field = getErrorMessageField(container);

      expect(field.value).to.equal(errorEventDefinition.errorRef.errorMessage);

    });


    it('should fetch the errorCodeVariable of an error event', function() {

      var field = getErrorCodeVariableField(container);

      expect(field.value).to.equal(errorEventDefinition.get('camunda:errorCodeVariable'));

    });


    it('should fetch the errorMessageVariable of an error event', function() {

      var field = getErrorMessageVariableField(container);

      expect(field.value).to.equal(errorEventDefinition.get('camunda:errorMessageVariable'));

    });

  });


  describe('set', function() {

    describe('should set the errorMessage for an error event', function() {

      var errorEventDefinition, field;

      beforeEach(inject(function(elementRegistry, selection) {

        // given
        var item = elementRegistry.get('ErrorEndEvent_ErrorMessage');
        selection.select(item);

        var bo = item.businessObject;
        errorEventDefinition = eventDefinitionHelper.getErrorEventDefinition(bo);

        field = getErrorMessageField(container);

        // when
        TestHelper.triggerValue(field, 'FOO', 'change');

      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(field.value).to.equal('FOO');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(field.value).to.equal('message');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(field.value).to.equal('FOO');
        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {
          expect(errorEventDefinition.errorRef.errorMessage).to.equal('FOO');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(errorEventDefinition.errorRef.errorMessage).to.equal('message');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(errorEventDefinition.errorRef.errorMessage).to.equal('FOO');
        }));

      });

    });


    describe('should set the errorCodeVariable for an error event', function() {

      var errorEventDefinition, field;

      beforeEach(inject(function(elementRegistry, selection) {

        // given
        var item = elementRegistry.get('ErrorStartEvent_all');
        selection.select(item);

        var bo = item.businessObject;
        errorEventDefinition = eventDefinitionHelper.getErrorEventDefinition(bo);

        field = getErrorCodeVariableField(container);

        // when
        TestHelper.triggerValue(field, 'FOO', 'change');

      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(field.value).to.equal('FOO');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(field.value).to.equal('myErrorCodeVariable');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(field.value).to.equal('FOO');
        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {
          expect(errorEventDefinition.get('camunda:errorCodeVariable')).to.equal('FOO');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(errorEventDefinition.get('camunda:errorCodeVariable')).to.equal('myErrorCodeVariable');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(errorEventDefinition.get('camunda:errorCodeVariable')).to.equal('FOO');
        }));

      });

    });


    describe('should set the errorMessageVariable for an error event', function() {

      var errorEventDefinition, field;

      beforeEach(inject(function(elementRegistry, selection) {

        // given
        var item = elementRegistry.get('ErrorStartEvent_all');
        selection.select(item);

        var bo = item.businessObject;
        errorEventDefinition = eventDefinitionHelper.getErrorEventDefinition(bo);

        field = getErrorMessageVariableField(container);

        // when
        TestHelper.triggerValue(field, 'FOO', 'change');

      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(field.value).to.equal('FOO');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(field.value).to.equal('myErrorMessageVariable');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(field.value).to.equal('FOO');
        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {
          expect(errorEventDefinition.get('camunda:errorMessageVariable')).to.equal('FOO');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(errorEventDefinition.get('camunda:errorMessageVariable')).to.equal('myErrorMessageVariable');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(errorEventDefinition.get('camunda:errorMessageVariable')).to.equal('FOO');
        }));

      });

    });


  });


  describe('remove', function() {

    var container, errorEventDefinition;

    beforeEach(inject(function(elementRegistry, propertiesPanel, selection) {

      // given
      container = propertiesPanel._container;

      var shape = elementRegistry.get('ErrorStartEvent_all');
      selection.select(shape);

      var bo = getBusinessObject(shape);
      errorEventDefinition = eventDefinitionHelper.getErrorEventDefinition(bo);

    }));


    describe('#errorMessage', function() {

      var field, button;

      beforeEach(function() {

        field = getErrorMessageField(container);
        button = getClearButton(container, 'error-element-message');

        TestHelper.triggerEvent(button, 'click');

      });

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(field.value).is.empty;
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(field.value).to.equal('message');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(field.value).is.empty;
        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {
          expect(errorEventDefinition.errorRef.errorMessage).to.be.undefined;
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(errorEventDefinition.errorRef.errorMessage).to.equal('message');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(errorEventDefinition.errorRef.errorMessage).to.be.undefined;
        }));

      });

    });


    describe('#errorCodeVariable', function() {

      var field, button;

      beforeEach(function() {

        field = getErrorCodeVariableField(container);
        button = getClearButton(container, 'errorCodeVariable');

        TestHelper.triggerEvent(button, 'click');

      });

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(field.value).is.empty;
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(field.value).to.equal('myErrorCodeVariable');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(field.value).is.empty;
        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {
          expect(errorEventDefinition.get('camunda:errorCodeVariable')).to.be.undefined;
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(errorEventDefinition.get('camunda:errorCodeVariable')).to.equal('myErrorCodeVariable');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(errorEventDefinition.get('camunda:errorCodeVariable')).to.be.undefined;
        }));

      });

    });


    describe('#errorMessageVariable', function() {

      var field, button;

      beforeEach(function() {

        field = getErrorMessageVariableField(container);
        button = getClearButton(container, 'errorMessageVariable');

        TestHelper.triggerEvent(button, 'click');

      });

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(field.value).is.empty;
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(field.value).to.equal('myErrorMessageVariable');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(field.value).is.empty;
        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {
          expect(errorEventDefinition.get('camunda:errorMessageVariable')).to.be.undefined;
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(errorEventDefinition.get('camunda:errorMessageVariable')).to.equal('myErrorMessageVariable');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(errorEventDefinition.get('camunda:errorMessageVariable')).to.be.undefined;
        }));

      });

    });

  });


  describe('control visibility', function() {

    function expectVisible(elementId, visible, getter) {

      return inject(function(propertiesPanel, selection, elementRegistry) {

        // given
        var element = elementRegistry.get(elementId);

        // assume
        expect(element).to.exist;

        // when
        selection.select(element);
        var field = getter(propertiesPanel._container);

        // then
        if (visible) {
          expect(field).to.exist;
        } else {
          expect(field).not.to.exist;
        }
      });
    }


    describe('should show', function() {

      it('StartEvent_ErrorCodeVariable', expectVisible('ErrorStartEvent_all', true, getErrorCodeVariableField));
      it('StartEvent_ErrorMessageVariable', expectVisible('ErrorStartEvent_all', true, getErrorMessageVariableField));

    });


    describe('should hide', function() {

      it('EndEvent_ErrorCodeVariable', expectVisible('ErrorEndEvent_ErrorMessage', false, getErrorCodeVariableField));
      it('EndEvent_ErrorMessageVariable', expectVisible('ErrorEndEvent_ErrorMessage', false, getErrorMessageVariableField));

    });

  });


});
