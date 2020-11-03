'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('lib'),
    domQuery = require('min-dom').query,
    domClasses = require('min-dom').classes,
    coreModule = require('bpmn-js/lib/core').default,
    selectionModule = require('diagram-js/lib/features/selection').default,
    modelingModule = require('bpmn-js/lib/features/modeling').default,
    propertiesProviderModule = require('lib/provider/bpmn'),
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    find = require('lodash/find'),
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

function getSelectField(container, entryId, selectName) {
  var selector = 'select' + (selectName ? '[name="' + selectName + '"]' : '');
  return domQuery(selector, getEntry(container, entryId));
}

function getErrorDefinitionsField(container) {
  return getSelectField(container, 'event-definitions-error', 'selectedElement');
}

function selectErrorDefinition(id, container) {
  var selectBox = getErrorDefinitionsField(container);
  var option = find(selectBox.options, function(o) {
    return o.value === id;
  });
  option.selected = 'selected';
  TestHelper.triggerEvent(selectBox, 'change');
}

function getErrorNameField(container) {
  return getInputField(container, 'error-element-name', 'name');
}

function getErrorCodeField(container) {
  return getInputField(container, 'error-element-code', 'errorCode');
}

function getClearButton(container, selector) {
  return domQuery('div[data-entry=' + selector + '] button[data-action=clear]', container);
}

function getCreateButton(container, selector) {
  return domQuery('div[data-entry=' + selector + '] button[data-action=addElement]', container);
}

function isHidden(node) {
  return domClasses(node).has('bpp-hidden');
}

function isInputHidden(node) {
  return isHidden(node.parentNode);
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
    modules: testModules
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

      var shape = elementRegistry.get('ErrorBoundaryEvent_All');
      selection.select(shape);

      var bo = getBusinessObject(shape);
      errorEventDefinition = eventDefinitionHelper.getErrorEventDefinition(bo);

    }));


    it('should fetch the errorRef of an error event', function() {

      var field = getErrorDefinitionsField(container);

      expect(field.value).to.equal(errorEventDefinition.errorRef.id);

    });


    it('should fetch the errorName of an error event', function() {

      var field = getErrorNameField(container);

      expect(field.value).to.equal(errorEventDefinition.errorRef.name);

    });


    it('should fetch the errorCode of an error event', function() {

      var field = getErrorCodeField(container);

      expect(field.value).to.equal(errorEventDefinition.errorRef.errorCode);

    });

  });


  describe('set', function() {

    describe('should set the errorName for an error event', function() {

      var errorEventDefinition, field;

      beforeEach(inject(function(elementRegistry, selection, propertiesPanel) {

        // given
        var item = elementRegistry.get('ErrorEndEvent_ErrorCode');
        selection.select(item);

        var bo = item.businessObject;
        errorEventDefinition = eventDefinitionHelper.getErrorEventDefinition(bo);

        field = getErrorNameField(container);

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
          expect(field.value).to.equal('b');
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
          expect(errorEventDefinition.errorRef.name).to.equal('FOO');
        });

        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(errorEventDefinition.errorRef.name).to.equal('b');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(errorEventDefinition.errorRef.name).to.equal('FOO');
        }));

      });

    });


    describe('should set the errorCode for an error event', function() {

      var errorEventDefinition, field;

      beforeEach(inject(function(elementRegistry, selection, propertiesPanel) {

        // given
        var item = elementRegistry.get('ErrorEndEvent_ErrorCode');
        selection.select(item);

        var bo = item.businessObject;
        errorEventDefinition = eventDefinitionHelper.getErrorEventDefinition(bo);

        field = getErrorCodeField(container);

        // when
        TestHelper.triggerValue(field, '', 'change');

      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(field.value).to.equal('');
        });

        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(field.value).to.equal('foo');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(field.value).to.equal('');
        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {
          expect(errorEventDefinition.errorRef.errorCode).to.be.undefined;
        });

        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(errorEventDefinition.errorRef.errorCode).to.equal('foo');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(errorEventDefinition.errorRef.errorCode).to.be.undefined;
        }));

      });

    });


  });


  describe('change error reference', function() {

    var container, errorEventDefinition;

    beforeEach(inject(function(elementRegistry, propertiesPanel, selection) {

      // given
      container = propertiesPanel._container;

      var shape = elementRegistry.get('WITH_ERROR_REF');
      selection.select(shape);

      var bo = getBusinessObject(shape);
      errorEventDefinition = eventDefinitionHelper.getErrorEventDefinition(bo);
    }));


    describe('to another error element', function() {

      var select;

      beforeEach(function() {
        select = getErrorDefinitionsField(container);

        // when
        selectErrorDefinition('Error_2', container);
      });


      describe('in the DOM', function() {

        it('should execute', function() {

          // then
          expect(select.value).to.equal('Error_2');

          expect(isInputHidden(getErrorNameField(container))).to.be.false;
          expect(isInputHidden(getErrorCodeField(container))).to.be.false;
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(select.value).to.equal('Error_4');

          expect(isInputHidden(getErrorNameField(container))).to.be.false;
          expect(isInputHidden(getErrorCodeField(container))).to.be.false;
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(select.value).to.equal('Error_2');

          expect(isInputHidden(getErrorNameField(container))).to.be.false;
          expect(isInputHidden(getErrorCodeField(container))).to.be.false;
        }));

      });


      describe('on the business object', function() {

        it('should execute', function() {

          // then
          expect(errorEventDefinition.errorRef).to.be.ok;
          expect(errorEventDefinition.errorRef.id).to.equal('Error_2');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(errorEventDefinition.errorRef).to.be.ok;
          expect(errorEventDefinition.errorRef.id).to.equal('Error_4');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(errorEventDefinition.errorRef).to.be.ok;
          expect(errorEventDefinition.errorRef.id).to.equal('Error_2');
        }));

      });

    });


    describe('to undefined', function() {

      var select;

      beforeEach(function() {
        select = getErrorDefinitionsField(container);

        // when
        selectErrorDefinition('', container);
      });

      describe('in the DOM', function() {

        it('should execute', function() {

          // then
          expect(select.value).to.equal('');

          expect(isInputHidden(getErrorNameField(container))).to.be.true;
          expect(isInputHidden(getErrorCodeField(container))).to.be.true;
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(select.value).to.equal('Error_4');

          expect(isInputHidden(getErrorNameField(container))).to.be.false;
          expect(isInputHidden(getErrorCodeField(container))).to.be.false;
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(select.value).to.equal('');

          expect(isInputHidden(getErrorNameField(container))).to.be.true;
          expect(isInputHidden(getErrorCodeField(container))).to.be.true;
        }));

      });


      describe('on the business object', function() {

        it('should execute', function() {

          // then
          expect(errorEventDefinition.errorRef).not.to.be.ok;
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(errorEventDefinition.errorRef).to.be.ok;
          expect(errorEventDefinition.errorRef.id).to.equal('Error_4');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(errorEventDefinition.errorRef).not.to.be.ok;
        }));

      });

    });

  });


  describe('validation', function() {

    var container;

    beforeEach(inject(function(elementRegistry, propertiesPanel, selection) {

      // given
      container = propertiesPanel._container;

      var shape = elementRegistry.get('ErrorEndEvent_Invalid');
      selection.select(shape);

    }));

    it('should be shown if error name is empty', function() {

      var field = getErrorNameField(container);

      expect(domClasses(field).has('invalid')).to.be.true;

    });
  });


  describe('remove', function() {

    var container, errorEventDefinition;

    beforeEach(inject(function(elementRegistry, propertiesPanel, selection) {

      // given
      container = propertiesPanel._container;

      var shape = elementRegistry.get('ErrorBoundaryEvent_All');
      selection.select(shape);

      var bo = getBusinessObject(shape);
      errorEventDefinition = eventDefinitionHelper.getErrorEventDefinition(bo);

    }));

    describe('#errorCode', function() {

      var field, button;

      beforeEach(function() {

        field = getErrorCodeField(container);
        button = getClearButton(container, 'error-element-code');

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
          expect(field.value).to.equal('foo');
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
          expect(errorEventDefinition.errorRef.errorCode).to.be.undefined;
        });

        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(errorEventDefinition.errorRef.errorCode).to.equal('foo');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(errorEventDefinition.errorRef.errorCode).to.be.undefined;
        }));

      });

    });

  });


  describe('create new error', function() {

    var errorEventDefinition, field;

    beforeEach(inject(function(elementRegistry, selection, propertiesPanel) {

      // given
      var item = elementRegistry.get('ErrorStartEvent_Empty');
      selection.select(item);

      var bo = item.businessObject;
      errorEventDefinition = eventDefinitionHelper.getErrorEventDefinition(bo);

      var button = getCreateButton(container, 'event-definitions-error');
      field = getErrorDefinitionsField(container);

      // when
      TestHelper.triggerEvent(button, 'click');

    }));

    describe('in the DOM', function() {

      it('should execute', function() {
        expect(field).to.have.length(6);
        expect(field.value).not.to.equal('');
      });

      it('should undo', inject(function(commandStack) {

        // when
        commandStack.undo();

        // then
        expect(field).to.have.length(5);
        expect(field.value).to.equal('');
      }));


      it('should redo', inject(function(commandStack) {

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(field).to.have.length(6);
        expect(field.value).not.to.equal('');
      }));

    });

    describe('on the business object', function() {

      it('should execute', function() {
        expect(errorEventDefinition.errorRef.name).to.exist;
      });

      it('should undo', inject(function(commandStack) {

        // when
        commandStack.undo();

        // then
        expect(errorEventDefinition.errorRef).to.be.undefined;
      }));


      it('should redo', inject(function(commandStack) {

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(errorEventDefinition.errorRef.name).to.exist;
      }));

    });

  });


});
