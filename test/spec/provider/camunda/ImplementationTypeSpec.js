'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule  = require('../../../../lib'),
    coreModule               = require('bpmn-js/lib/core'),
    selectionModule          = require('diagram-js/lib/features/selection'),
    modelingModule           = require('bpmn-js/lib/features/modeling'),
    propertiesProviderModule = require('../../../../lib/provider/camunda'),
    camundaModdlePackage     = require('camunda-bpmn-moddle/resources/camunda');

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var extensionElementsHelper = require('../../../../lib/helper/ExtensionElementsHelper');

var domQuery = require('min-dom/lib/query'),
    domClasses = require('min-dom/lib/classes');

var find = require('lodash/collection/find');

function getEntry(entryId, container) {
  return domQuery('div[data-entry="' + entryId + '"]', container);
}

function getInputField(container, entryId, inputName) {
  var entry = getEntry(entryId, container);
  var selector = 'input' + (inputName ? '[name="' + inputName + '"]' : '');
  return domQuery(selector, entry);
}

function getSelectField(container, entryId, selectName) {
  var entry = getEntry(entryId, container);
  var selector = 'select' + (selectName ? '[name="' + selectName + '"]' : '');
  return domQuery(selector, entry);
}

function getImplementationTypeSelect(container) {
  return getSelectField(container, 'implementation');
}

function getDelegateInput(container) {
  return getInputField(container, 'delegate');
}

function getResultVariableInput(container) {
  return getInputField(container, 'resultVariable');
}

function getExternalTopicInput(container) {
  return getInputField(container, 'externalTopic');
}

function getConfigureConnectorLink(container) {
  var entry = getEntry('configureConnectorLink', container);
  return domQuery('a', entry);
}

function getCallableElementRefInput(container) {
  return getInputField(container, 'callable-element-ref');
}

function getCallableBindingSelect(container) {
  return getSelectField(container, 'callable-binding');
}

function getDmnResultVariableInput(container) {
  return getInputField(container, 'dmn-resultVariable');
}

function selectImplementationType(type, container) {
  var implementationTypeSelect = getImplementationTypeSelect(container);
  var option = find(implementationTypeSelect.options, function(o) {
    return o.value === type;
  });
  option.selected  = 'selected';
  TestHelper.triggerEvent(implementationTypeSelect, 'change');
}

function isHidden(node) {
  return domClasses(node).has('bpp-hidden');
}

function isInputHidden(node) {
  return isHidden(node.parentNode);
}

function hasErrorMessage(node) {
  return domClasses(node).has('bpp-error-message');
}


describe('implementation type', function() {

  var diagramXML = require('./ImplementationType.bpmn');

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

  describe('property controls in the DOM', function() {

    var container;

    beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
      // given
      container = propertiesPanel._container;
    }));

    describe('class properties', function(elementRegistry, selection) {

      beforeEach(inject(function(elementRegistry, selection) {
        // given
        var shape = elementRegistry.get('CLASS');
        // when
        selection.select(shape);
      }));


      it('should show class implementation type', function() {
        // then
        expect(getImplementationTypeSelect(container).value).to.equal('class');
      });


      it('should show java class property', function() {
        // then
        expect(isInputHidden(getDelegateInput(container))).to.be.false;
        expect(getDelegateInput(container).value).to.equal('foo');
      });


      it('should hide result variable property', function() {
        // then
        expect(isInputHidden(getResultVariableInput(container))).to.be.true;
      });


      it('should hide external topic property', function() {
        // then
        expect(isInputHidden(getExternalTopicInput(container))).to.be.true;
      });


      it('should hide configure connector link', function() {
        // then
        expect(isHidden(getConfigureConnectorLink(container))).to.be.true;
      });

    });


    describe('expression properties', function(elementRegistry, selection) {

      beforeEach(inject(function(elementRegistry, selection) {
        // given
        var shape = elementRegistry.get('EXPRESSION');
        // when
        selection.select(shape);
      }));


      it('should show expression implementation type', function() {
        // then
        expect(getImplementationTypeSelect(container).value).to.equal('expression');
      });


      it('should show expression property', function() {
        // then
        expect(isInputHidden(getDelegateInput(container))).to.be.false;
        expect(getDelegateInput(container).value).to.equal('foo');
      });


      it('should show result variable property', function() {
        // then
        expect(isInputHidden(getResultVariableInput(container))).to.be.false;
      });


      it('should hide external topic property', function() {
        // then
        expect(isInputHidden(getExternalTopicInput(container))).to.be.true;
      });


      it('should hide configure connector link', function() {
        // then
        expect(isHidden(getConfigureConnectorLink(container))).to.be.true;
      });

    });


    describe('delegate expression properties', function(elementRegistry, selection) {

      beforeEach(inject(function(elementRegistry, selection) {
        // given
        var shape = elementRegistry.get('DELEGATE_EXPRESSION');
        // when
        selection.select(shape);
      }));


      it('should show delegate expression implementation type', function() {
        // then
        expect(getImplementationTypeSelect(container).value).to.equal('delegateExpression');
      });


      it('should show java class property', function() {
        // then
        expect(isInputHidden(getDelegateInput(container))).to.be.false;
        expect(getDelegateInput(container).value).to.equal('foo');
      });


      it('should hide result variable property', function() {
        // then
        expect(isInputHidden(getResultVariableInput(container))).to.be.true;
      });


      it('should hide external topic property', function() {
        // then
        expect(isInputHidden(getExternalTopicInput(container))).to.be.true;
      });


      it('should hide configure connector link', function() {
        // then
        expect(isHidden(getConfigureConnectorLink(container))).to.be.true;
      });

    });


    describe('external properties', function(elementRegistry, selection) {

      beforeEach(inject(function(elementRegistry, selection) {
        // given
        var shape = elementRegistry.get('EXTERNAL');
        // when
        selection.select(shape);
      }));


      it('should show external implementation type', function() {
        // then
        expect(getImplementationTypeSelect(container).value).to.equal('external');
      });


      it('should show external topic property', function() {
        // then
        expect(isInputHidden(getExternalTopicInput(container))).to.be.false;
        expect(getExternalTopicInput(container).value).to.equal('foo');
      });


      it('should hide java class property', function() {
        // then
        expect(isInputHidden(getDelegateInput(container))).to.be.true;
      });


      it('should hide result variable property', function() {
        // then
        expect(isInputHidden(getResultVariableInput(container))).to.be.true;
      });


      it('should hide configure connector link', function() {
        // then
        expect(isHidden(getConfigureConnectorLink(container))).to.be.true;
      });

    });


    describe('connector properties', function(elementRegistry, selection) {

      beforeEach(inject(function(elementRegistry, selection) {
        // given
        var shape = elementRegistry.get('CONNECTOR');
        // when
        selection.select(shape);
      }));

      it('should show connector implementation type', function() {
        // then
        expect(getImplementationTypeSelect(container).value).to.equal('connector');
      });


      it('should show configure connector link', function() {
        // then
        expect(isHidden(getConfigureConnectorLink(container))).to.be.false;
      });


      it('should hide java class property', function() {
        // then
        expect(isInputHidden(getDelegateInput(container))).to.be.true;
      });


      it('should hide external topic property', function() {
        // then
        expect(isInputHidden(getExternalTopicInput(container))).to.be.true;
      });


      it('should hide result variable property', function() {
        // then
        expect(isInputHidden(getResultVariableInput(container))).to.be.true;
      });

    });


    describe('dmn properties', function(elementRegistry, selection) {

      beforeEach(inject(function(elementRegistry, selection) {
        // given
        var shape = elementRegistry.get('DMN');
        // when
        selection.select(shape);
      }));

      it('should show dmn implementation type', function() {
        // then
        expect(getImplementationTypeSelect(container).value).to.equal('dmn');
      });


      it('should show dmn callable element property', function() {
        // then
        expect(isInputHidden(getCallableElementRefInput(container))).to.be.false;
        expect(getCallableElementRefInput(container).value).to.equal('foo');
      });


      it('should show dmn callable binding property', function() {
        // then
        expect(isInputHidden(getCallableBindingSelect(container))).to.be.false;
        expect(getCallableBindingSelect(container).value).to.equal('latest');
      });


      it('should show dmn result variable property', function() {
        // then
        expect(isInputHidden(getDmnResultVariableInput(container))).to.be.false;
      });


      it('should hide java class property', function() {
        // then
        expect(isInputHidden(getDelegateInput(container))).to.be.true;
      });


      it('should hide result variable property', function() {
        // then
        expect(isInputHidden(getResultVariableInput(container))).to.be.true;
      });


      it('should hide configure connector link', function() {
        // then
        expect(isHidden(getConfigureConnectorLink(container))).to.be.true;
      });

    });

  });

  describe('change implementation type', function() {

    var container, implementationTypeSelect, bo;

    describe('from class', function() {

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        // given
        container = propertiesPanel._container;
        var shape = elementRegistry.get('CLASS');
        selection.select(shape);
        bo = getBusinessObject(shape);
        implementationTypeSelect = getImplementationTypeSelect(container);
      }));

      describe('to expression', function() {

        beforeEach(function() {
          // when
          selectImplementationType('expression', container);
        });

        describe('in the DOM', function() {

          it('should execute', function() {
            // then
            expect(implementationTypeSelect.value).to.equal('expression');
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(implementationTypeSelect.value).to.equal('class');
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(implementationTypeSelect.value).to.equal('expression');
          }));

        });

        describe('on the business object', function() {

          it('should execute', function() {
            // then
            expect(bo.get('camunda:class')).to.be.undefined;
            expect(bo.get('camunda:expression')).not.to.be.undefined;
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(bo.get('camunda:class')).not.to.be.undefined;
            expect(bo.get('camunda:expression')).to.be.undefined;
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(bo.get('camunda:class')).to.be.undefined;
            expect(bo.get('camunda:expression')).not.to.be.undefined;
          }));

        });

      });


      describe('to delegate expression', function() {

        beforeEach(function() {
          // when
          selectImplementationType('delegateExpression', container);
        });

        describe('in the DOM', function() {

          it('should execute', function() {
            // then
            expect(implementationTypeSelect.value).to.equal('delegateExpression');
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(implementationTypeSelect.value).to.equal('class');
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(implementationTypeSelect.value).to.equal('delegateExpression');
          }));

        });

        describe('on the business object', function() {

          it('should execute', function() {
            // then
            expect(bo.get('camunda:class')).to.be.undefined;
            expect(bo.get('camunda:delegateExpression')).not.to.be.undefined;
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(bo.get('camunda:class')).not.to.be.undefined;
            expect(bo.get('camunda:delegateExpression')).to.be.undefined;
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(bo.get('camunda:class')).to.be.undefined;
            expect(bo.get('camunda:delegateExpression')).not.to.be.undefined;
          }));

        });

      });


      describe('to external', function() {

        beforeEach(function() {
          // when
          selectImplementationType('external', container);
        });

        describe('in the DOM', function() {

          it('should execute', function() {
            // then
            expect(implementationTypeSelect.value).to.equal('external');
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(implementationTypeSelect.value).to.equal('class');
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(implementationTypeSelect.value).to.equal('external');
          }));

        });

        describe('on the business object', function() {

          it('should execute', function() {
            // then
            expect(bo.get('camunda:class')).to.be.undefined;
            expect(bo.get('camunda:type')).to.equal('external');
            expect(bo.get('camunda:topic')).not.to.be.undefined;
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(bo.get('camunda:class')).not.to.be.undefined;
            expect(bo.get('camunda:type')).to.be.undefined;
            expect(bo.get('camunda:topic')).to.be.undefined;
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(bo.get('camunda:class')).to.be.undefined;
            expect(bo.get('camunda:type')).to.equal('external');
            expect(bo.get('camunda:topic')).not.to.be.undefined;
          }));

        });

      });


      describe('to connector', function() {

        beforeEach(function() {
          // when
          selectImplementationType('connector', container);
        });

        describe('in the DOM', function() {

          it('should execute', function() {
            // then
            expect(hasErrorMessage(getConfigureConnectorLink(container))).to.be.true;
            expect(isHidden(getConfigureConnectorLink(container))).to.be.false;
            expect(implementationTypeSelect.value).to.equal('connector');
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(hasErrorMessage(getConfigureConnectorLink(container))).to.be.false;
            expect(isHidden(getConfigureConnectorLink(container))).to.be.true;
            expect(implementationTypeSelect.value).to.equal('class');
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(hasErrorMessage(getConfigureConnectorLink(container))).to.be.true;
            expect(isHidden(getConfigureConnectorLink(container))).to.be.false;
            expect(implementationTypeSelect.value).to.equal('connector');
          }));

        });

        describe('on the business object', function() {

          it('should execute', function() {
            // then
            expect(bo.get('camunda:class')).to.be.undefined;
            var connectors = extensionElementsHelper.getExtensionElements(bo, 'camunda:Connector');
            expect(connectors[0]).to.exist;
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(bo.get('camunda:class')).not.to.be.undefined;
            var connectors = extensionElementsHelper.getExtensionElements(bo, 'camunda:Connector');
            expect(connectors).not.to.exist;
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(bo.get('camunda:class')).to.be.undefined;
            var connectors = extensionElementsHelper.getExtensionElements(bo, 'camunda:Connector');
            expect(connectors[0]).to.exist;
          }));

        });

      });


      describe('to dmn', function() {

        beforeEach(inject(function(elementRegistry, selection) {
          // given
          var shape = elementRegistry.get('BRT_CLASS');
          selection.select(shape);
          bo = getBusinessObject(shape);
          implementationTypeSelect = getImplementationTypeSelect(container);

          // when
          selectImplementationType('dmn', container);
        }));

        describe('in the DOM', function() {

          it('should execute', function() {
            // then
            expect(implementationTypeSelect.value).to.equal('dmn');
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(implementationTypeSelect.value).to.equal('class');
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(implementationTypeSelect.value).to.equal('dmn');
          }));

        });

        describe('on the business object', function() {

          it('should execute', function() {
            // then
            expect(bo.get('camunda:class')).to.be.undefined;
            expect(bo.get('camunda:decisionRef')).not.to.be.undefined;
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(bo.get('camunda:class')).not.to.be.undefined;
            expect(bo.get('camunda:decisionRef')).to.be.undefined;
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(bo.get('camunda:class')).to.be.undefined;
            expect(bo.get('camunda:decisionRef')).not.to.be.undefined;
          }));

        });

      });


    });


    describe('from expression', function() {

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        // given
        container = propertiesPanel._container;
        var shape = elementRegistry.get('EXPRESSION');
        selection.select(shape);
        bo = getBusinessObject(shape);
        implementationTypeSelect = getImplementationTypeSelect(container);
      }));

      describe('to class', function() {

        beforeEach(function() {
          // when
          selectImplementationType('class', container);
        });

        describe('in the DOM', function() {

          it('should execute', function() {
            // then
            expect(implementationTypeSelect.value).to.equal('class');
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(implementationTypeSelect.value).to.equal('expression');
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(implementationTypeSelect.value).to.equal('class');
          }));

        });

        describe('on the business object', function() {

          it('should execute', function() {
            // then
            expect(bo.get('camunda:class')).not.to.be.undefined;
            expect(bo.get('camunda:expression')).to.be.undefined;
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(bo.get('camunda:class')).to.be.undefined;
            expect(bo.get('camunda:expression')).not.to.be.undefined;
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(bo.get('camunda:class')).not.to.be.undefined;
            expect(bo.get('camunda:expression')).to.be.undefined;
          }));

        });

      });


      describe('to delegate expression', function() {

        beforeEach(function() {
          // when
          selectImplementationType('delegateExpression', container);
        });

        describe('in the DOM', function() {

          it('should execute', function() {
            // then
            expect(implementationTypeSelect.value).to.equal('delegateExpression');
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(implementationTypeSelect.value).to.equal('expression');
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(implementationTypeSelect.value).to.equal('delegateExpression');
          }));

        });

        describe('on the business object', function() {

          it('should execute', function() {
            // then
            expect(bo.get('camunda:expression')).to.be.undefined;
            expect(bo.get('camunda:delegateExpression')).not.to.be.undefined;
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(bo.get('camunda:expression')).not.to.be.undefined;
            expect(bo.get('camunda:delegateExpression')).to.be.undefined;
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(bo.get('camunda:expression')).to.be.undefined;
            expect(bo.get('camunda:delegateExpression')).not.to.be.undefined;
          }));

        });

      });


      describe('to external', function() {

        beforeEach(function() {
          // when
          selectImplementationType('external', container);
        });

        describe('in the DOM', function() {

          it('should execute', function() {
            // then
            expect(implementationTypeSelect.value).to.equal('external');
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(implementationTypeSelect.value).to.equal('expression');
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(implementationTypeSelect.value).to.equal('external');
          }));

        });

        describe('on the business object', function() {

          it('should execute', function() {
            // then
            expect(bo.get('camunda:expression')).to.be.undefined;
            expect(bo.get('camunda:type')).to.equal('external');
            expect(bo.get('camunda:topic')).not.to.be.undefined;
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(bo.get('camunda:expression')).not.to.be.undefined;
            expect(bo.get('camunda:type')).to.be.undefined;
            expect(bo.get('camunda:topic')).to.be.undefined;
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(bo.get('camunda:expression')).to.be.undefined;
            expect(bo.get('camunda:type')).to.equal('external');
            expect(bo.get('camunda:topic')).not.to.be.undefined;
          }));

        });

      });


      describe('to connector', function() {

        beforeEach(function() {
          // when
          selectImplementationType('connector', container);
        });

        describe('in the DOM', function() {

          it('should execute', function() {
            // then
            expect(hasErrorMessage(getConfigureConnectorLink(container))).to.be.true;
            expect(isHidden(getConfigureConnectorLink(container))).to.be.false;
            expect(implementationTypeSelect.value).to.equal('connector');
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(hasErrorMessage(getConfigureConnectorLink(container))).to.be.false;
            expect(isHidden(getConfigureConnectorLink(container))).to.be.true;
            expect(implementationTypeSelect.value).to.equal('expression');
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(hasErrorMessage(getConfigureConnectorLink(container))).to.be.true;
            expect(isHidden(getConfigureConnectorLink(container))).to.be.false;
            expect(implementationTypeSelect.value).to.equal('connector');
          }));

        });

        describe('on the business object', function() {

          it('should execute', function() {
            // then
            expect(bo.get('camunda:expression')).to.be.undefined;
            var connectors = extensionElementsHelper.getExtensionElements(bo, 'camunda:Connector');
            expect(connectors[0]).to.exist;

          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(bo.get('camunda:expression')).not.to.be.undefined;
            var connectors = extensionElementsHelper.getExtensionElements(bo, 'camunda:Connector');
            expect(connectors).not.to.exist;
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(bo.get('camunda:expression')).to.be.undefined;
            var connectors = extensionElementsHelper.getExtensionElements(bo, 'camunda:Connector');
            expect(connectors[0]).to.exist;
          }));

        });

      });


      describe('to dmn', function() {

        beforeEach(inject(function(elementRegistry, selection) {
          // given
          var shape = elementRegistry.get('BRT_EXPRESSION');
          selection.select(shape);
          bo = getBusinessObject(shape);
          implementationTypeSelect = getImplementationTypeSelect(container);

          // when
          selectImplementationType('dmn', container);
        }));

        describe('in the DOM', function() {

          it('should execute', function() {
            // then
            expect(implementationTypeSelect.value).to.equal('dmn');
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(implementationTypeSelect.value).to.equal('expression');
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(implementationTypeSelect.value).to.equal('dmn');
          }));

        });

        describe('on the business object', function() {

          it('should execute', function() {
            // then
            expect(bo.get('camunda:expression')).to.be.undefined;
            expect(bo.get('camunda:decisionRef')).not.to.be.undefined;
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(bo.get('camunda:expression')).not.to.be.undefined;
            expect(bo.get('camunda:decisionRef')).to.be.undefined;
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(bo.get('camunda:expression')).to.be.undefined;
            expect(bo.get('camunda:decisionRef')).not.to.be.undefined;
          }));

        });

      });

    });


    describe('from delegate expression', function() {

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        // given
        container = propertiesPanel._container;
        var shape = elementRegistry.get('DELEGATE_EXPRESSION');
        selection.select(shape);
        bo = getBusinessObject(shape);
        implementationTypeSelect = getImplementationTypeSelect(container);
      }));

      describe('to class', function() {

        beforeEach(function() {
          // when
          selectImplementationType('class', container);
        });

        describe('in the DOM', function() {

          it('should execute', function() {
            // then
            expect(implementationTypeSelect.value).to.equal('class');
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(implementationTypeSelect.value).to.equal('delegateExpression');
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(implementationTypeSelect.value).to.equal('class');
          }));

        });

        describe('on the business object', function() {

          it('should execute', function() {
            // then
            expect(bo.get('camunda:class')).not.to.be.undefined;
            expect(bo.get('camunda:delegateExpression')).to.be.undefined;
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(bo.get('camunda:class')).to.be.undefined;
            expect(bo.get('camunda:delegateExpression')).not.to.be.undefined;
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(bo.get('camunda:class')).not.to.be.undefined;
            expect(bo.get('camunda:delegateExpression')).to.be.undefined;
          }));

        });

      });


      describe('to expression', function() {

        beforeEach(function() {
          // when
          selectImplementationType('expression', container);
        });

        describe('in the DOM', function() {

          it('should execute', function() {
            // then
            expect(implementationTypeSelect.value).to.equal('expression');
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(implementationTypeSelect.value).to.equal('delegateExpression');
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(implementationTypeSelect.value).to.equal('expression');
          }));

        });

        describe('on the business object', function() {

          it('should execute', function() {
            // then
            expect(bo.get('camunda:delegateExpression')).to.be.undefined;
            expect(bo.get('camunda:expression')).not.to.be.undefined;
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(bo.get('camunda:delegateExpression')).not.to.be.undefined;
            expect(bo.get('camunda:expression')).to.be.undefined;
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(bo.get('camunda:delegateExpression')).to.be.undefined;
            expect(bo.get('camunda:expression')).not.to.be.undefined;
          }));

        });

      });


      describe('to external', function() {

        beforeEach(function() {
          // when
          selectImplementationType('external', container);
        });

        describe('in the DOM', function() {

          it('should execute', function() {
            // then
            expect(implementationTypeSelect.value).to.equal('external');
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(implementationTypeSelect.value).to.equal('delegateExpression');
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(implementationTypeSelect.value).to.equal('external');
          }));

        });

        describe('on the business object', function() {

          it('should execute', function() {
            // then
            expect(bo.get('camunda:delegateExpression')).to.be.undefined;
            expect(bo.get('camunda:type')).to.equal('external');
            expect(bo.get('camunda:topic')).not.to.be.undefined;
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(bo.get('camunda:delegateExpression')).not.to.be.undefined;
            expect(bo.get('camunda:type')).to.be.undefined;
            expect(bo.get('camunda:topic')).to.be.undefined;
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(bo.get('camunda:delegateExpression')).to.be.undefined;
            expect(bo.get('camunda:type')).to.equal('external');
            expect(bo.get('camunda:topic')).not.to.be.undefined;
          }));

        });

      });


      describe('to connector', function() {

        beforeEach(function() {
          // when
          selectImplementationType('connector', container);
        });

        describe('in the DOM', function() {

          it('should execute', function() {
            // then
            expect(hasErrorMessage(getConfigureConnectorLink(container))).to.be.true;
            expect(isHidden(getConfigureConnectorLink(container))).to.be.false;
            expect(implementationTypeSelect.value).to.equal('connector');
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(hasErrorMessage(getConfigureConnectorLink(container))).to.be.false;
            expect(isHidden(getConfigureConnectorLink(container))).to.be.true;
            expect(implementationTypeSelect.value).to.equal('delegateExpression');
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(isHidden(getConfigureConnectorLink(container))).to.be.false;
            expect(implementationTypeSelect.value).to.equal('connector');
          }));

        });

        describe('on the business object', function() {

          it('should execute', function() {
            // then
            expect(bo.get('camunda:delegateExpression')).to.be.undefined;
            var connectors = extensionElementsHelper.getExtensionElements(bo, 'camunda:Connector');
            expect(connectors[0]).to.exist;

          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(bo.get('camunda:delegateExpression')).not.to.be.undefined;
            var connectors = extensionElementsHelper.getExtensionElements(bo, 'camunda:Connector');
            expect(connectors).not.to.exist;
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(bo.get('camunda:delegateExpression')).to.be.undefined;
            var connectors = extensionElementsHelper.getExtensionElements(bo, 'camunda:Connector');
            expect(connectors[0]).to.exist;
          }));

        });

      });


      describe('to dmn', function() {

        beforeEach(inject(function(elementRegistry, selection) {
          // given
          var shape = elementRegistry.get('BRT_DELEGATE_EXPRESSION');
          selection.select(shape);
          bo = getBusinessObject(shape);
          implementationTypeSelect = getImplementationTypeSelect(container);

          // when
          selectImplementationType('dmn', container);
        }));

        describe('in the DOM', function() {

          it('should execute', function() {
            // then
            expect(implementationTypeSelect.value).to.equal('dmn');
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(implementationTypeSelect.value).to.equal('delegateExpression');
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(implementationTypeSelect.value).to.equal('dmn');
          }));

        });

        describe('on the business object', function() {

          it('should execute', function() {
            // then
            expect(bo.get('camunda:delegateExpression')).to.be.undefined;
            expect(bo.get('camunda:decisionRef')).not.to.be.undefined;
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(bo.get('camunda:delegateExpression')).not.to.be.undefined;
            expect(bo.get('camunda:decisionRef')).to.be.undefined;
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(bo.get('camunda:delegateExpression')).to.be.undefined;
            expect(bo.get('camunda:decisionRef')).not.to.be.undefined;
          }));

        });

      });

    });


    describe('from external', function() {

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        // given
        container = propertiesPanel._container;
        var shape = elementRegistry.get('EXTERNAL');
        selection.select(shape);
        bo = getBusinessObject(shape);
        implementationTypeSelect = getImplementationTypeSelect(container);
      }));

      describe('to class', function() {

        beforeEach(function() {
          // when
          selectImplementationType('class', container);
        });

        describe('in the DOM', function() {

          it('should execute', function() {
            // then
            expect(implementationTypeSelect.value).to.equal('class');
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(implementationTypeSelect.value).to.equal('external');
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(implementationTypeSelect.value).to.equal('class');
          }));

        });

        describe('on the business object', function() {

          it('should execute', function() {
            // then
            expect(bo.get('camunda:class')).not.to.be.undefined;
            expect(bo.get('camunda:type')).to.be.undefined;
            expect(bo.get('camunda:topic')).to.be.undefined;
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(bo.get('camunda:class')).to.be.undefined;
            expect(bo.get('camunda:type')).not.to.be.undefined;
            expect(bo.get('camunda:topic')).not.to.be.undefined;
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(bo.get('camunda:class')).not.to.be.undefined;
            expect(bo.get('camunda:type')).to.be.undefined;
            expect(bo.get('camunda:topic')).to.be.undefined;
          }));

        });

      });


      describe('to expression', function() {

        beforeEach(function() {
          // when
          selectImplementationType('expression', container);
        });

        describe('in the DOM', function() {

          it('should execute', function() {
            // then
            expect(implementationTypeSelect.value).to.equal('expression');
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(implementationTypeSelect.value).to.equal('external');
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(implementationTypeSelect.value).to.equal('expression');
          }));

        });

        describe('on the business object', function() {

          it('should execute', function() {
            // then
            expect(bo.get('camunda:expression')).not.to.be.undefined;
            expect(bo.get('camunda:type')).to.be.undefined;
            expect(bo.get('camunda:topic')).to.be.undefined;
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(bo.get('camunda:expression')).to.be.undefined;
            expect(bo.get('camunda:type')).not.to.be.undefined;
            expect(bo.get('camunda:topic')).not.to.be.undefined;
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(bo.get('camunda:expression')).not.to.be.undefined;
            expect(bo.get('camunda:type')).to.be.undefined;
            expect(bo.get('camunda:topic')).to.be.undefined;
          }));

        });

      });


      describe('to delegate expression', function() {

        beforeEach(function() {
          // when
          selectImplementationType('delegateExpression', container);
        });

        describe('in the DOM', function() {

          it('should execute', function() {
            // then
            expect(implementationTypeSelect.value).to.equal('delegateExpression');
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(implementationTypeSelect.value).to.equal('external');
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(implementationTypeSelect.value).to.equal('delegateExpression');
          }));

        });

        describe('on the business object', function() {

          it('should execute', function() {
            // then
            expect(bo.get('camunda:type')).to.be.undefined;
            expect(bo.get('camunda:topic')).to.be.undefined;
            expect(bo.get('camunda:delegateExpression')).not.to.be.undefined;
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(bo.get('camunda:type')).not.to.be.undefined;
            expect(bo.get('camunda:topic')).not.to.be.undefined;
            expect(bo.get('camunda:delegateExpression')).to.be.undefined;
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(bo.get('camunda:type')).to.be.undefined;
            expect(bo.get('camunda:topic')).to.be.undefined;
            expect(bo.get('camunda:delegateExpression')).not.to.be.undefined;
          }));

        });

      });


      describe('to connector', function() {

        beforeEach(function() {
          // when
          selectImplementationType('connector', container);
        });

        describe('in the DOM', function() {

          it('should execute', function() {
            // then
            expect(hasErrorMessage(getConfigureConnectorLink(container))).to.be.true;
            expect(isHidden(getConfigureConnectorLink(container))).to.be.false;
            expect(implementationTypeSelect.value).to.equal('connector');
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(hasErrorMessage(getConfigureConnectorLink(container))).to.be.false;
            expect(isHidden(getConfigureConnectorLink(container))).to.be.true;
            expect(implementationTypeSelect.value).to.equal('external');
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(hasErrorMessage(getConfigureConnectorLink(container))).to.be.true;
            expect(isHidden(getConfigureConnectorLink(container))).to.be.false;
            expect(implementationTypeSelect.value).to.equal('connector');
          }));

        });

        describe('on the business object', function() {

          it('should execute', function() {
            // then
            expect(bo.get('camunda:type')).to.be.undefined;
            expect(bo.get('camunda:topic')).to.be.undefined;
            var connectors = extensionElementsHelper.getExtensionElements(bo, 'camunda:Connector');
            expect(connectors[0]).to.exist;

          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(bo.get('camunda:type')).not.to.be.undefined;
            expect(bo.get('camunda:topic')).not.to.be.undefined;
            var connectors = extensionElementsHelper.getExtensionElements(bo, 'camunda:Connector');
            expect(connectors).not.to.exist;
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(bo.get('camunda:type')).to.be.undefined;
            expect(bo.get('camunda:topic')).to.be.undefined;
            var connectors = extensionElementsHelper.getExtensionElements(bo, 'camunda:Connector');
            expect(connectors[0]).to.exist;
          }));

        });

      });


    });


    describe('from connector', function() {

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        // given
        container = propertiesPanel._container;
        var shape = elementRegistry.get('CONNECTOR');
        selection.select(shape);
        bo = getBusinessObject(shape);
        implementationTypeSelect = getImplementationTypeSelect(container);
      }));

      describe('to class', function() {

        beforeEach(function() {
          // when
          selectImplementationType('class', container);
        });

        describe('in the DOM', function() {

          it('should execute', function() {
            // then
            expect(implementationTypeSelect.value).to.equal('class');
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(implementationTypeSelect.value).to.equal('connector');
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(implementationTypeSelect.value).to.equal('class');
          }));

        });

        describe('on the business object', function() {

          it('should execute', function() {
            // then
            expect(bo.get('camunda:class')).not.to.be.undefined;
            var connectors = extensionElementsHelper.getExtensionElements(bo, 'camunda:Connector');
            expect(connectors).not.to.exist;
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(bo.get('camunda:class')).to.be.undefined;
            var connectors = extensionElementsHelper.getExtensionElements(bo, 'camunda:Connector');
            expect(connectors[0]).to.exist;
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(bo.get('camunda:class')).not.to.be.undefined;
            var connectors = extensionElementsHelper.getExtensionElements(bo, 'camunda:Connector');
            expect(connectors).not.to.exist;
          }));

        });

      });


      describe('to expression', function() {

        beforeEach(function() {
          // when
          selectImplementationType('expression', container);
        });

        describe('in the DOM', function() {

          it('should execute', function() {
            // then
            expect(implementationTypeSelect.value).to.equal('expression');
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(implementationTypeSelect.value).to.equal('connector');
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(implementationTypeSelect.value).to.equal('expression');
          }));

        });

        describe('on the business object', function() {

          it('should execute', function() {
            // then
            expect(bo.get('camunda:expression')).not.to.be.undefined;
            var connectors = extensionElementsHelper.getExtensionElements(bo, 'camunda:Connector');
            expect(connectors).not.to.exist;
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(bo.get('camunda:expression')).to.be.undefined;
            var connectors = extensionElementsHelper.getExtensionElements(bo, 'camunda:Connector');
            expect(connectors[0]).to.exist;
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(bo.get('camunda:expression')).not.to.be.undefined;
            var connectors = extensionElementsHelper.getExtensionElements(bo, 'camunda:Connector');
            expect(connectors).not.to.exist;
          }));

        });

      });


      describe('to delegate expression', function() {

        beforeEach(function() {
          // when
          selectImplementationType('delegateExpression', container);
        });

        describe('in the DOM', function() {

          it('should execute', function() {
            // then
            expect(implementationTypeSelect.value).to.equal('delegateExpression');
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(implementationTypeSelect.value).to.equal('connector');
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(implementationTypeSelect.value).to.equal('delegateExpression');
          }));

        });

        describe('on the business object', function() {

          it('should execute', function() {
            // then
            expect(bo.get('camunda:delegateExpression')).not.to.be.undefined;
            var connectors = extensionElementsHelper.getExtensionElements(bo, 'camunda:Connector');
            expect(connectors).not.to.exist;
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(bo.get('camunda:delegateExpression')).to.be.undefined;
            var connectors = extensionElementsHelper.getExtensionElements(bo, 'camunda:Connector');
            expect(connectors[0]).to.exist;
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(bo.get('camunda:delegateExpression')).not.to.be.undefined;
            var connectors = extensionElementsHelper.getExtensionElements(bo, 'camunda:Connector');
            expect(connectors).not.to.exist;
          }));

        });

      });


      describe('to external', function() {

        beforeEach(function() {
          // when
          selectImplementationType('external', container);
        });

        describe('in the DOM', function() {

          it('should execute', function() {
            // then
            expect(isHidden(getConfigureConnectorLink(container))).to.be.true;
            expect(implementationTypeSelect.value).to.equal('external');
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then

            expect(isHidden(getConfigureConnectorLink(container))).to.be.false;
            expect(implementationTypeSelect.value).to.equal('connector');
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(isHidden(getConfigureConnectorLink(container))).to.be.true;
            expect(implementationTypeSelect.value).to.equal('external');
          }));

        });

        describe('on the business object', function() {

          it('should execute', function() {
            // then
            expect(bo.get('camunda:type')).not.to.be.undefined;
            expect(bo.get('camunda:topic')).not.to.be.undefined;
            var connectors = extensionElementsHelper.getExtensionElements(bo, 'camunda:Connector');
            expect(connectors).not.to.exist;

          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(bo.get('camunda:type')).to.be.undefined;
            expect(bo.get('camunda:topic')).to.be.undefined;
            var connectors = extensionElementsHelper.getExtensionElements(bo, 'camunda:Connector');
            expect(connectors[0]).to.exist;
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(bo.get('camunda:type')).not.to.be.undefined;
            expect(bo.get('camunda:topic')).not.to.be.undefined;
            var connectors = extensionElementsHelper.getExtensionElements(bo, 'camunda:Connector');
            expect(connectors).not.to.exist;
          }));

        });

      });


      describe('to dmn', function() {

        beforeEach(inject(function(elementRegistry, selection) {
          // given
          var shape = elementRegistry.get('BRT_CONNECTOR');
          selection.select(shape);
          bo = getBusinessObject(shape);
          implementationTypeSelect = getImplementationTypeSelect(container);

          // when
          selectImplementationType('dmn', container);
        }));

        describe('in the DOM', function() {

          it('should execute', function() {
            // then
            expect(implementationTypeSelect.value).to.equal('dmn');
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(implementationTypeSelect.value).to.equal('connector');
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(implementationTypeSelect.value).to.equal('dmn');
          }));

        });

        describe('on the business object', function() {

          it('should execute', function() {
            // then
            var connectors = extensionElementsHelper.getExtensionElements(bo, 'camunda:Connector');
            expect(connectors).not.to.exist;
            expect(bo.get('camunda:decisionRef')).not.to.be.undefined;
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            var connectors = extensionElementsHelper.getExtensionElements(bo, 'camunda:Connector');
            expect(connectors[0]).to.exist;
            expect(bo.get('camunda:decisionRef')).to.be.undefined;
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            var connectors = extensionElementsHelper.getExtensionElements(bo, 'camunda:Connector');
            expect(connectors).not.to.exist;
            expect(bo.get('camunda:decisionRef')).not.to.be.undefined;
          }));

        });

      });

    });


    describe('from dmn', function() {

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        // given
        container = propertiesPanel._container;
        var shape = elementRegistry.get('DMN');
        selection.select(shape);
        bo = getBusinessObject(shape);
        implementationTypeSelect = getImplementationTypeSelect(container);
      }));

      describe('to class', function() {

        beforeEach(function() {
          // when
          selectImplementationType('class', container);
        });

        describe('in the DOM', function() {

          it('should execute', function() {
            // then
            expect(implementationTypeSelect.value).to.equal('class');
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(implementationTypeSelect.value).to.equal('dmn');
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(implementationTypeSelect.value).to.equal('class');
          }));

        });

        describe('on the business object', function() {

          it('should execute', function() {
            // then
            expect(bo.get('camunda:class')).not.to.be.undefined;
            expect(bo.get('camunda:decisionRef')).to.be.undefined;
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(bo.get('camunda:class')).to.be.undefined;
            expect(bo.get('camunda:decisionRef')).not.to.be.undefined;
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(bo.get('camunda:class')).not.to.be.undefined;
            expect(bo.get('camunda:decisionRef')).to.be.undefined;
          }));

        });

      });


      describe('to expression', function() {

        beforeEach(function() {
          // when
          selectImplementationType('expression', container);
        });

        describe('in the DOM', function() {

          it('should execute', function() {
            // then
            expect(implementationTypeSelect.value).to.equal('expression');
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(implementationTypeSelect.value).to.equal('dmn');
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(implementationTypeSelect.value).to.equal('expression');
          }));

        });

        describe('on the business object', function() {

          it('should execute', function() {
            // then
            expect(bo.get('camunda:expression')).not.to.be.undefined;
            expect(bo.get('camunda:decisionRef')).to.be.undefined;
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(bo.get('camunda:expression')).to.be.undefined;
            expect(bo.get('camunda:decisionRef')).not.to.be.undefined;
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(bo.get('camunda:expression')).not.to.be.undefined;
            expect(bo.get('camunda:decisionRef')).to.be.undefined;
          }));

        });

      });


      describe('to delegate expression', function() {

        beforeEach(function() {
          // when
          selectImplementationType('delegateExpression', container);
        });

        describe('in the DOM', function() {

          it('should execute', function() {
            // then
            expect(implementationTypeSelect.value).to.equal('delegateExpression');
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(implementationTypeSelect.value).to.equal('dmn');
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(implementationTypeSelect.value).to.equal('delegateExpression');
          }));

        });

        describe('on the business object', function() {

          it('should execute', function() {
            // then
            expect(bo.get('camunda:delegateExpression')).not.to.be.undefined;
            expect(bo.get('camunda:decisionRef')).to.be.undefined;
          });


          it('should undo', inject(function(commandStack) {

            // when
            commandStack.undo();

            // then
            expect(bo.get('camunda:delegateExpression')).to.be.undefined;
            expect(bo.get('camunda:decisionRef')).not.to.be.undefined;
          }));


          it('should redo', inject(function(commandStack) {

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expect(bo.get('camunda:delegateExpression')).not.to.be.undefined;
            expect(bo.get('camunda:decisionRef')).to.be.undefined;
          }));

        });

      });

    });

  });

  describe('other extension elements', function() {


    it('should retain other extension elements when removing connector', inject(function(elementRegistry, selection) {
      // given
      var shape = elementRegistry.get('WITH_LISTENER_AND_CONNECTOR');
      selection.select(shape);
      var bo = getBusinessObject(shape);

      // when
      selectImplementationType('expression', container);

      // then
      expect(bo.extensionElements).to.exist;

      var listeners = extensionElementsHelper.getExtensionElements(bo, 'camunda:ExecutionListener');
      expect(listeners[0]).not.to.be.empty;

    }));


    it('should retain other extension elements when adding connector', inject(function(elementRegistry, selection) {
      // given
      var shape = elementRegistry.get('WITH_LISTENER');
      selection.select(shape);
      var bo = getBusinessObject(shape);

      // when
      selectImplementationType('connector', container);

      // then
      expect(bo.extensionElements).to.exist;

      var connectors = extensionElementsHelper.getExtensionElements(bo, 'camunda:Connector');
      expect(connectors[0]).to.exist;

      var listeners = extensionElementsHelper.getExtensionElements(bo, 'camunda:ExecutionListener');
      expect(listeners[0]).to.exist;

    }));

  });

});