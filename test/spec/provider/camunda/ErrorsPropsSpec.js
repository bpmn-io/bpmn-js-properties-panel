'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('lib'),
    coreModule = require('bpmn-js/lib/core').default,
    selectionModule = require('diagram-js/lib/features/selection').default,
    modelingModule = require('bpmn-js/lib/features/modeling').default,
    propertiesProviderModule = require('lib/provider/camunda'),
    camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda');

var domQuery = require('min-dom').query,
    domClasses = require('min-dom').classes;

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    getExtensionElements = require('../../../../lib/helper/ExtensionElementsHelper').getExtensionElements;


describe('error-props', function() {

  var diagramXML = require('./ErrorsProps.bpmn');

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
    container = propertiesPanel._container;
  }));


  describe('error group in input/output tab', function() {

    it('should not exist on task', inject(function(elementRegistry, selection) {

      // given
      var task = elementRegistry.get('Task_1');

      // when
      selection.select(task);

      var errorGroup = getErrorsGroup(container);

      // then
      expect(domClasses(errorGroup).has('bpp-hidden')).to.be.true;
    }));


    it('should not exist on non-external service task', inject(function(elementRegistry, selection) {

      // given
      var serviceTask = elementRegistry.get('ServiceTask_3');

      // when
      selection.select(serviceTask);

      var errorGroup = getErrorsGroup(container);

      // then
      expect(domClasses(errorGroup).has('bpp-hidden')).to.be.true;
    }));


    it('should exist on external service task', inject(function(elementRegistry, selection) {

      // given
      var serviceTask = elementRegistry.get('ServiceTask_1');

      // when
      selection.select(serviceTask);

      var errorGroup = getErrorsGroup(container);

      // then
      expect(domClasses(errorGroup).has('bpp-hidden')).to.be.false;
    }));

  });


  describe('error entries', function() {

    it('should display placeholder if there are no errors declared', inject(function(elementRegistry, selection) {

      // given
      var serviceTask = elementRegistry.get('ServiceTask_1');
      selection.select(serviceTask);

      // when
      var noErrorLabel = domQuery('[data-entry="error-placeholder"] span', container);

      // then
      expect(noErrorLabel).to.exist;
      expect(noErrorLabel.textContent).to.eql('No errors defined.');
    }));


    describe('collapsible', function() {

      it('should display no error title', inject(function(elementRegistry, selection) {

        // given
        var serviceTask = elementRegistry.get('ServiceTask_2');
        selection.select(serviceTask);

        // when
        var collapsible = getCollapsibleContainer(container, 0);
        var collapsibleTitle = getCollapsibleTitle(collapsible);

        // then
        expect(collapsibleTitle.textContent).to.eql('No Error referenced');
      }));


      it('should display error title', inject(function(elementRegistry, selection) {

        // given
        var serviceTask = elementRegistry.get('ServiceTask_2');
        selection.select(serviceTask);

        // when
        var collapsible = getCollapsibleContainer(container, 1);
        var collapsibleTitle = getCollapsibleTitle(collapsible);

        // then
        expect(collapsibleTitle.textContent).to.eql('Error_1');
      }));


      it('should display error code', inject(function(elementRegistry, selection) {

        // given
        var serviceTask = elementRegistry.get('ServiceTask_2');
        selection.select(serviceTask);

        // when
        var collapsible = getCollapsibleContainer(container, 2);
        var collapsibleTitle = getCollapsibleTitle(collapsible);

        // then
        expect(collapsibleTitle.textContent).to.contain('(code = 123)');
      }));


      it('should display throw expression', inject(function(elementRegistry, selection) {

        // given
        var serviceTask = elementRegistry.get('ServiceTask_2');
        selection.select(serviceTask);

        // when
        var collapsible = getCollapsibleContainer(container, 2);
        var collapsibleDescription = getCollapsibleDescription(collapsible);

        // then
        expect(collapsibleDescription.textContent).to.eql('${expression}');
      }));

    });


    describe('create camunda:ErrorEventDefinition', function() {

      var serviceTask;

      beforeEach(inject(function(elementRegistry, selection) {

        // given
        serviceTask = elementRegistry.get('ServiceTask_1');
        selection.select(serviceTask);

        // assume
        expect(getCollapsibleContainer(container, 0)).to.be.null;
        expect(getErrorEventDefinitions(serviceTask).length).to.eql(0);

        // when
        clickButton('.bpp-error__add', container);
      }));


      describe('in the DOM', function() {

        it('should do', function() {

          // when
          var collapsible = getCollapsibleContainer(container, 0);

          // then
          expect(collapsible).to.exist;
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();
          var collapsible = getCollapsibleContainer(container, 0);

          // then
          expect(collapsible).to.be.null;
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();
          var collapsible = getCollapsibleContainer(container, 0);

          // then
          expect(collapsible).to.exist;
        }));

      });


      describe('on the business object', function() {

        it('should do', function() {

          // then
          expect(getErrorEventDefinitions(serviceTask).length).to.eql(1);
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(getErrorEventDefinitions(serviceTask).length).to.eql(0);
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(getErrorEventDefinitions(serviceTask).length).to.eql(1);
        }));

      });

    });


    describe('remove camunda:ErrorEventDefinition', function() {

      var serviceTask;
      var collapsible;

      beforeEach(inject(function(elementRegistry, selection) {

        // given
        serviceTask = elementRegistry.get('ServiceTask_2');
        selection.select(serviceTask);
        collapsible = getCollapsibleContainer(container, 2);

        // assume
        expect(collapsible).to.exist;
        expect(getErrorEventDefinitions(serviceTask).length).to.eql(3);

        // when
        clickButton('.bpp-collapsible__remove', collapsible);
      }));


      describe('in the DOM', function() {

        it('should do', function() {

          // when
          collapsible = getCollapsibleContainer(container, 2);

          // then
          expect(collapsible).to.be.null;
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();
          collapsible = getCollapsibleContainer(container, 2);

          // then
          expect(collapsible).to.exist;
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();
          collapsible = getCollapsibleContainer(container, 2);

          // then
          expect(collapsible).to.be.null;
        }));

      });


      describe('on the business object', function() {

        it('should do', function() {

          // then
          expect(getErrorEventDefinitions(serviceTask).length).to.eql(2);
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(getErrorEventDefinitions(serviceTask).length).to.eql(3);
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(getErrorEventDefinitions(serviceTask).length).to.eql(2);
        }));

      });

    });


    describe('referenced errors', function() {

      var serviceTask;

      beforeEach(inject(function(elementRegistry, selection) {
        serviceTask = elementRegistry.get('ServiceTask_2');
        selection.select(serviceTask);
      }));


      it('should display existing errors in selectbox', function() {

        // given
        var collapsible = getCollapsibleContainer(container, 0);
        var errorReferenceContainer = getErrorReferenceContainer(container, 0);

        // when
        toggleCollapsible(collapsible);
        var selectBox = getSelectBox(errorReferenceContainer);

        // then
        expect(selectBox.options.length).to.eql(4); // 3 errors and 1 empty option
      });


      it('should update collapsible title on selecting error', function() {

        // given
        var collapsible = getCollapsibleContainer(container, 0);
        toggleCollapsible(collapsible);
        var errorReferenceContainer = getErrorReferenceContainer(container, 0);
        var selectBox = getSelectBox(errorReferenceContainer);
        var collapsibleTitle = getCollapsibleTitle(collapsible).textContent;

        // assume
        expect(selectBox.value).to.eql('');
        expect(collapsibleTitle).to.eql('No Error referenced');

        // when
        selectOptionByValue(selectBox, 'Error_1');
        collapsibleTitle = getCollapsibleTitle(collapsible).textContent;

        // then
        expect(collapsibleTitle).to.eql('Error_1');
      });


      it('should update error name on selecting error', function() {

        // given
        var collapsible = getCollapsibleContainer(container, 0);
        toggleCollapsible(collapsible);
        var errorReferenceContainer = getErrorReferenceContainer(container, 0);
        var selectBox = getSelectBox(errorReferenceContainer);
        var errorName = getErrorNameInput(container, 0).value;

        // assume
        expect(selectBox.value).to.eql('');
        expect(errorName).to.eql('');

        // when
        selectOptionByValue(selectBox, 'Error_1');
        errorName = getErrorNameInput(container, 0).value;

        // then
        expect(errorName).to.eql('Error_1');
      });


      describe('create bpmn:Error', function() {

        var collapsible;
        var errorReferenceContainer;
        var selectBox;

        beforeEach(inject(function(elementRegistry) {
          collapsible = getCollapsibleContainer(container, 0);
          toggleCollapsible(collapsible);
          errorReferenceContainer = getErrorReferenceContainer(container, 0);
          selectBox = getSelectBox(errorReferenceContainer);

          // assume
          expect(getRootErrors(elementRegistry).length).to.eql(3);
          expect(selectBox.options.length).to.eql(4);

          // when
          clickButton('button.action-button.add', errorReferenceContainer);
        }));


        describe('in the DOM', function() {

          it('should do', inject(function(elementRegistry) {
            selectBox = getSelectBox(errorReferenceContainer);

            // then
            expect(selectBox.options.length).to.eql(5);
          }));


          it('should undo', inject(function(elementRegistry, commandStack) {

            // when
            commandStack.undo();
            selectBox = getSelectBox(errorReferenceContainer);

            // then
            expect(selectBox.options.length).to.eql(4);
          }));


          it('should redo', inject(function(elementRegistry, commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();
            selectBox = getSelectBox(errorReferenceContainer);

            // then
            expect(selectBox.options.length).to.eql(5);
          }));

        });


        describe('on the business object', function() {

          it('should do', inject(function(elementRegistry) {

            // when
            var errors = getRootErrors(elementRegistry);

            // then
            expect(errors.length).to.eql(4);
          }));


          it('should undo', inject(function(elementRegistry, commandStack) {

            // when
            commandStack.undo();
            var errors = getRootErrors(elementRegistry);

            // then
            expect(errors.length).to.eql(3);
          }));


          it('should redo', inject(function(elementRegistry, commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();
            var errors = getRootErrors(elementRegistry);

            // then
            expect(errors.length).to.eql(4);
          }));

        });

      });

    });


    describe('validation', function() {

      var serviceTask;

      beforeEach(inject(function(elementRegistry, selection) {
        serviceTask = elementRegistry.get('ServiceTask_2');
        selection.select(serviceTask);

        var collapsible = getCollapsibleContainer(container, 0);
        toggleCollapsible(collapsible);

        var errorReferenceContainer = getErrorReferenceContainer(container, 0);
        var selectBox = getSelectBox(errorReferenceContainer);
        selectOptionByValue(selectBox, 'Error_Without_A_Name');
      }));


      it('should validate throw expression', function() {

        // given
        var throwExpressionInput = getThrowExpressionInput(container, 0);

        // when
        var inputClasses = domClasses(throwExpressionInput);

        // then
        expect(inputClasses.has('invalid')).to.be.true;
      });


      it('should validate error name', function() {

        // given
        var errorNameInput = getErrorNameInput(container, 0);

        // when
        var inputClasses = domClasses(errorNameInput);

        // then
        expect(inputClasses.has('invalid')).to.be.true;
      });


      it('should validate error code', function() {

        // given
        var errorCodeInput = getErrorCodeInput(container, 0);

        // when
        var inputClasses = domClasses(errorCodeInput);

        // then
        expect(inputClasses.has('invalid')).to.be.true;
      });


      it('should not validate error message', function() {

        // given
        var errorMessageInput = getErrorMessageInput(container, 0);

        // when
        var inputClasses = domClasses(errorMessageInput);

        // then
        expect(inputClasses.has('invalid')).to.be.false;
      });

    });

  });

});

// HELPERS ///////////////////

// Fetch Moddle Elements

function getRootErrors(elementRegistry) {
  var process = elementRegistry.get('Process_1');
  var definition = process.businessObject.$parent;
  var errors = definition.rootElements.filter(function(el) {
    return el.$type === 'bpmn:Error';
  });
  return errors;
}

function getErrorEventDefinitions(task) {
  var bo = getBusinessObject(task);

  return getExtensionElements(bo, 'camunda:ErrorEventDefinition') || [];
}


// Fetch Input Elements

function getCollapsibleTitle(collapsible) {
  return domQuery('.bpp-collapsible__title', collapsible);
}

function getCollapsibleDescription(collapsible) {
  return domQuery('.bpp-collapsible__description', collapsible);
}

function getSelectBox(errorReference) {
  return domQuery('select#camunda-error', errorReference);
}

function getThrowExpressionInput(container, index) {
  return domQuery('input#camunda-error-' + index + 'error-expression');
}

function getErrorNameInput(container, index) {
  return domQuery('input#camunda-error-' + index + 'error-element-name', container);
}

function getErrorCodeInput(container, index) {
  return domQuery('input#camunda-error-' + index + 'error-element-code', container);
}

function getErrorMessageInput(container, index) {
  return domQuery('input#camunda-error-' + index + 'error-element-message', container);
}

// Fetch Containers

function getCollapsibleContainer(container, index) {
  return domQuery('.bpp-collapsible[data-entry="error-' + index + 'collapsible"]', container);
}

function getErrorReferenceContainer(container, index) {
  return domQuery('[data-entry="error-' + index + 'error-reference"]', container);
}

function getErrorsGroup(container) {
  return domQuery('[data-group*="errors"]', getInputOutputTab(container));
}

function getInputOutputTab(container) {
  return domQuery('div[data-tab="input-output"]', container);
}


// Trigger DOM Events

function selectOptionByValue(selectBox, value) {
  TestHelper.selectedByOption(selectBox, value);
  TestHelper.triggerEvent(selectBox, 'change');
}

function toggleCollapsible(collapsible) {
  var toggle = domQuery('[data-action="toggle"]', collapsible);
  TestHelper.triggerEvent(toggle, 'click');
}

function clickButton(selector, container) {
  var button = domQuery(selector, container);
  TestHelper.triggerEvent(button, 'click');
}
