'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('../../../../lib'),
    domQuery = require('min-dom/lib/query'),
    domClasses = require('min-dom/lib/classes'),
    is = require('bpmn-js/lib/util/ModelUtil').is,
    forEach = require('lodash/collection/forEach'),
    coreModule = require('bpmn-js/lib/core'),
    selectionModule = require('diagram-js/lib/features/selection'),
    modelingModule = require('bpmn-js/lib/features/modeling'),
    propertiesProviderModule = require('../../../../lib/provider/camunda'),
    camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda'),
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;


describe('callActivity - properties', function() {

  var diagramXML = require('./CallActivity.bpmn');

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

  function getCamundaInWithBusinessKey(extensionElements) {
    var camundaIn = [];
    if (extensionElements && extensionElements.values) {
      forEach(extensionElements.values, function(value) {
        if (is(value, 'camunda:In') && value.businessKey) {
          camundaIn.push(value);
        }
      });
    }
    return camundaIn;
  }

  function getSelect(container, selector) {
    return domQuery('select[name=' + selector + ']', container);
  }

  function getInput(container, selector) {
    return domQuery('input[name=' + selector + ']', container);
  }

  function getClearButton(container, selector) {
    return domQuery('div[data-entry=' + selector + '] button[data-action=clear]', container);
  }


  describe('get', function() {

    it('#callActivityType', inject(function(propertiesPanel, elementRegistry, selection) {

      var shape = elementRegistry.get('CallActivity_1');
      selection.select(shape);

      var callActivityTypeSelect = getSelect(propertiesPanel._container, 'callActivityType');

      expect(callActivityTypeSelect.value).to.equal('bpmn');

    }));


    it('#calledElement', inject(function(propertiesPanel, elementRegistry, selection) {

      var shape = elementRegistry.get('CallActivity_1');
      selection.select(shape);

      var businessObject = getBusinessObject(shape);
      var field = getInput(propertiesPanel._container, 'callableElementRef');

      expect(field.value).to.equal(businessObject.get('calledElement'));

    }));


    it('#calledElementBinding', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('CallActivity_1');
      selection.select(shape);

      var bo = getBusinessObject(shape);
      var selectedOption = getSelect(propertiesPanel._container, 'callableBinding');

      expect(selectedOption.value).to.equal(bo.get('camunda:calledElementBinding'));

    }));


    it('#calledElementVersion', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('CallActivity_1');
      selection.select(shape);

      var businessObject = getBusinessObject(shape);
      var field = getInput(propertiesPanel._container, 'callableVersion');

      expect(field.value).to.equal(businessObject.get('calledElementVersion'));

    }));


    it('#businessKey for a BPMN call activity', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('CallActivity_6');
      selection.select(shape);

      var bo = getBusinessObject(shape);
      var camundaIn = getCamundaInWithBusinessKey(bo.extensionElements);

      var checkBox = getInput(propertiesPanel._container, 'callableBusinessKey');

      expect(checkBox.checked).to.be.true;
      expect(camundaIn[0].businessKey).to.equal('#{execution.processBusinessKey}');

    }));


    it('#businessKey for a CMMN call activity', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('CallActivity_7');
      selection.select(shape);

      var bo = getBusinessObject(shape);
      var camundaIn = getCamundaInWithBusinessKey(bo.extensionElements);

      var checkBox = getInput(propertiesPanel._container, 'callableBusinessKey');

      expect(checkBox.checked).to.be.true;
      expect(camundaIn[0].businessKey).to.equal('#{execution.processBusinessKey}');

    }));


    it('#calledElementTenantId', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('CallActivity_9');
      selection.select(shape);

      var businessObject = getBusinessObject(shape);
      var field = getInput(propertiesPanel._container, 'tenantId');

      expect(field.value).to.equal(businessObject.get('camunda:calledElementTenantId'));

    }));


    it('#caseTenantId', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('CallActivity_8');
      selection.select(shape);

      var businessObject = getBusinessObject(shape);
      var field = getInput(propertiesPanel._container, 'tenantId');

      expect(field.value).to.equal(businessObject.get('camunda:caseTenantId'));

    }));


    it('#caseRef', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('CallActivity_4');
      selection.select(shape);

      var businessObject = getBusinessObject(shape);
      var field = getInput(propertiesPanel._container, 'callableElementRef');

      expect(field.value).to.equal(businessObject.get('camunda:caseRef'));

    }));


    it('#caseBinding', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('CallActivity_4');
      selection.select(shape);

      var businessObject = getBusinessObject(shape);
      var field = getSelect(propertiesPanel._container, 'callableBinding');

      expect(field.value).to.equal(businessObject.get('camunda:caseBinding'));

    }));


    it('#caseVersion', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('CallActivity_4');
      selection.select(shape);

      var businessObject = getBusinessObject(shape);
      var field = getInput(propertiesPanel._container, 'callableVersion');

      expect(field.value).to.equal(businessObject.get('camunda:caseVersion'));

    }));


    it('#variableMappingClass', inject(function(propertiesPanel, elementRegistry, selection) {

      var shape = elementRegistry.get('CallActivity_10');
      selection.select(shape);

      var businessObject = getBusinessObject(shape);
      var field = getInput(propertiesPanel._container, 'delegateVariableMapping');

      expect(field.value).to.equal(businessObject.get('camunda:variableMappingClass'));

    }));


    it('#variableMappingDelegateExpression', inject(function(propertiesPanel, elementRegistry, selection) {

      var shape = elementRegistry.get('CallActivity_11');
      selection.select(shape);

      var businessObject = getBusinessObject(shape);
      var field = getInput(propertiesPanel._container, 'delegateVariableMapping');

      expect(field.value).to.equal(businessObject.get('camunda:variableMappingDelegateExpression'));

    }));

  });

  describe('set', function() {

    describe('#calledElement', function() {

      var field, bo;

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        var shape = elementRegistry.get('CallActivity_1');
        selection.select(shape);

        bo = getBusinessObject(shape);
        field = getInput(propertiesPanel._container, 'callableElementRef');

        TestHelper.triggerValue(field, 'FOO');
      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(field.value).to.equal('FOO');
        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          expect(field.value).to.equal('asd');
        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          expect(field.value).to.equal('FOO');

        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {
          expect(bo.get('calledElement')).to.equal('FOO');
        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          expect(bo.get('calledElement')).to.equal('asd');
        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          expect(bo.get('calledElement')).to.equal('FOO');

        }));

      });

    });


    describe('#calledElementBinding', function() {

      var field, bo;

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        var shape = elementRegistry.get('CallActivity_1');
        selection.select(shape);

        bo = getBusinessObject(shape);
        field = getSelect(propertiesPanel._container, 'callableBinding');

        // select 'latest'
        field.options[0].selected  = 'selected';
        TestHelper.triggerEvent(field, 'change');

      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(field.value).to.equal('latest');
        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          expect(field.value).to.equal('version');
        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          expect(field.value).to.equal('latest');

        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {
          expect(bo.get('camunda:calledElementBinding')).to.equal('latest');
        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          expect(bo.get('camunda:calledElementBinding')).to.equal('version');
        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          expect(bo.get('camunda:calledElementBinding')).to.equal('latest');

        }));

      });

    });


    describe('#calledElementVersion', function() {

      var field, bo;

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        var shape = elementRegistry.get('CallActivity_1');
        selection.select(shape);

        bo = getBusinessObject(shape);
        field = getInput(propertiesPanel._container, 'callableVersion');

        TestHelper.triggerValue(field, '42', 'change');
      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(field.value).to.equal('42');
        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          expect(field.value).to.equal('17');
        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          expect(field.value).to.equal('42');

        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {
          expect(bo.get('camunda:calledElementVersion')).to.equal('42');
        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          expect(bo.get('camunda:calledElementVersion')).to.equal('17');
        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          expect(bo.get('camunda:calledElementVersion')).to.equal('42');

        }));

      });

    });


    describe('#caseRef', function() {

      var field, bo;

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        var shape = elementRegistry.get('CallActivity_4');
        selection.select(shape);

        bo = getBusinessObject(shape);
        field = getInput(propertiesPanel._container, 'callableElementRef');

        TestHelper.triggerValue(field, 'myCase', 'change');
      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(field.value).to.equal('myCase');
        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          expect(field.value).to.equal('checkCreditCase');
        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          expect(field.value).to.equal('myCase');

        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {
          expect(bo.get('camunda:caseRef')).to.equal('myCase');
        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          expect(bo.get('camunda:caseRef')).to.equal('checkCreditCase');
        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          expect(bo.get('camunda:caseRef')).to.equal('myCase');

        }));

      });

    });


    describe('#caseVersion', function() {

      var field, bo;

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        var shape = elementRegistry.get('CallActivity_4');
        selection.select(shape);

        bo = getBusinessObject(shape);
        field = getInput(propertiesPanel._container, 'callableVersion');

        TestHelper.triggerValue(field, '24', 'change');
      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(field.value).to.equal('24');
        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          expect(field.value).to.equal('17');
        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          expect(field.value).to.equal('24');

        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {
          expect(bo.get('camunda:caseVersion')).to.equal('24');
        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          expect(bo.get('camunda:caseVersion')).to.equal('17');
        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          expect(bo.get('camunda:caseVersion')).to.equal('24');

        }));

      });

    });


    describe('#businessKey', function() {

      var field, bo;

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        var shape = elementRegistry.get('CallActivity_2');
        selection.select(shape);

        bo = getBusinessObject(shape);

        field = getInput(propertiesPanel._container, 'callableBusinessKey');

        TestHelper.triggerEvent(field, 'click');
      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(field.checked).to.be.true;
        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          expect(field.checked).to.be.false;
        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          expect(field.checked).to.be.true;

        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {

          var camundaIn = getCamundaInWithBusinessKey(bo.extensionElements);
          expect(camundaIn[0].businessKey).to.equal('#{execution.processBusinessKey}');

        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          var camundaIn = getCamundaInWithBusinessKey(bo.extensionElements);
          expect(camundaIn).to.have.length(0);

        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          var camundaIn = getCamundaInWithBusinessKey(bo.extensionElements);
          expect(camundaIn[0].businessKey).to.equal('#{execution.processBusinessKey}');

        }));

      });

    });


    describe('#calledElementTenantId', function() {

      var field, bo;

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        var shape = elementRegistry.get('CallActivity_9');
        selection.select(shape);

        bo = getBusinessObject(shape);
        field = getInput(propertiesPanel._container, 'tenantId');

        TestHelper.triggerValue(field, 'tenant2', 'change');
      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(field.value).to.equal('tenant2');
        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          expect(field.value).to.equal('tenant1');
        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          expect(field.value).to.equal('tenant2');

        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {
          expect(bo.get('camunda:calledElementTenantId')).to.equal('tenant2');
        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          expect(bo.get('camunda:calledElementTenantId')).to.equal('tenant1');
        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          expect(bo.get('camunda:calledElementTenantId')).to.equal('tenant2');

        }));

      });

    });


    describe('#caseTenantId', function() {

      var field, bo;

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        var shape = elementRegistry.get('CallActivity_8');
        selection.select(shape);

        bo = getBusinessObject(shape);
        field = getInput(propertiesPanel._container, 'tenantId');

        TestHelper.triggerValue(field, 'tenant2', 'change');
      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(field.value).to.equal('tenant2');
        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          expect(field.value).to.equal('tenant1');
        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          expect(field.value).to.equal('tenant2');

        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {
          expect(bo.get('camunda:caseTenantId')).to.equal('tenant2');
        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          expect(bo.get('camunda:caseTenantId')).to.equal('tenant1');
        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          expect(bo.get('camunda:caseTenantId')).to.equal('tenant2');

        }));

      });

    });


    describe('#variableMappingClass', function() {

      var field, bo;

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        var shape = elementRegistry.get('CallActivity_10');
        selection.select(shape);

        bo = getBusinessObject(shape);
        field = getInput(propertiesPanel._container, 'delegateVariableMapping');

        TestHelper.triggerValue(field, 'FOO', 'change');
      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(field.value).to.equal('FOO');
        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          expect(field.value).to.equal('test');
        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          expect(field.value).to.equal('FOO');

        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {
          expect(bo.get('camunda:variableMappingClass')).to.equal('FOO');
        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          expect(bo.get('camunda:variableMappingClass')).to.equal('test');
        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          expect(bo.get('camunda:variableMappingClass')).to.equal('FOO');

        }));

      });

    });


    describe('#variableMappingDelegateExpression', function() {

      var field, bo;

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        var shape = elementRegistry.get('CallActivity_11');
        selection.select(shape);

        bo = getBusinessObject(shape);
        field = getInput(propertiesPanel._container, 'delegateVariableMapping');

        TestHelper.triggerValue(field, 'FOO', 'change');
      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(field.value).to.equal('FOO');
        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          expect(field.value).to.equal('${test}');
        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          expect(field.value).to.equal('FOO');

        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {
          expect(bo.get('camunda:variableMappingDelegateExpression')).to.equal('FOO');
        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          expect(bo.get('camunda:variableMappingDelegateExpression')).to.equal('${test}');
        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          expect(bo.get('camunda:variableMappingDelegateExpression')).to.equal('FOO');

        }));

      });

    });


    describe('#callActivityType', function() {

      describe('change to #CMMN', function() {

        var field, bo;

        beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
          var shape = elementRegistry.get('CallActivity_1');
          selection.select(shape);

          bo = getBusinessObject(shape);
          field = getSelect(propertiesPanel._container, 'callActivityType');

          // select 'CMMN'
          field.options[1].selected = 'selected';

          TestHelper.triggerEvent(field, 'change');
        }));

        describe('in the DOM', function() {

          it('should execute', function() {

            expect(field.value).to.equal('cmmn');

          });

          it('should undo', inject(function(commandStack) {

            commandStack.undo();

            expect(field.value).to.equal('bpmn');
          }));

          it('should redo', inject(function(commandStack) {

            commandStack.undo();
            commandStack.redo();

            expect(field.value).to.equal('cmmn');

          }));

        });

        describe('on the business object', function() {

          it('should execute', function() {

            expect(bo.get('calledElement')).to.be.undefined;
            expect(bo.get('camunda:calledElementVersion')).to.be.undefined;
            expect(bo.get('camunda:calledElementTenantId')).to.be.undefined;
            expect(bo.get('camunda:variableMappingClass')).to.be.undefined;
            expect(bo.get('camunda:variableMappingDelegateExpression')).to.be.undefined;
            expect(bo.get('camunda:caseRef')).to.exist;

          });

          it('should undo', inject(function(commandStack) {

            commandStack.undo();

            expect(bo.get('calledElement')).to.exist;
            expect(bo.get('camunda:caseRef')).to.be.undefined;

          }));

          it('should redo', inject(function(commandStack) {

            commandStack.undo();
            commandStack.redo();

            expect(bo.get('calledElement')).to.be.undefined;
            expect(bo.get('camunda:calledElementVersion')).to.be.undefined;
            expect(bo.get('camunda:calledElementTenantId')).to.be.undefined;
            expect(bo.get('camunda:variableMappingClass')).to.be.undefined;
            expect(bo.get('camunda:variableMappingDelegateExpression')).to.be.undefined;
            expect(bo.get('camunda:caseRef')).to.exist;

          }));

        });

      });


      describe('change to undefined', function() {

        var field, bo;

        beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
          var shape = elementRegistry.get('CallActivity_1');
          selection.select(shape);

          bo = getBusinessObject(shape);
          field = getSelect(propertiesPanel._container, 'callActivityType');

          // select ''
          field.options[2].selected = 'selected';

          TestHelper.triggerEvent(field, 'change');
        }));

        describe('in the DOM', function() {

          it('should execute', function() {

            expect(field.value).to.equal('');

          });

          it('should undo', inject(function(commandStack) {

            commandStack.undo();

            expect(field.value).to.equal('bpmn');
          }));

          it('should redo', inject(function(commandStack) {

            commandStack.undo();
            commandStack.redo();

            expect(field.value).to.equal('');

          }));

        });

        describe('on the business object', function() {

          it('should execute', function() {

            expect(bo.get('calledElement')).to.be.undefined;
            expect(bo.get('camunda:calledElementVersion')).to.be.undefined;
            expect(bo.get('camunda:calledElementTenantId')).to.be.undefined;
            expect(bo.get('camunda:variableMappingClass')).to.be.undefined;
            expect(bo.get('camunda:variableMappingDelegateExpression')).to.be.undefined;
            expect(bo.get('camunda:caseRef')).to.be.undefined;

          });

          it('should undo', inject(function(commandStack) {

            commandStack.undo();

            expect(bo.get('calledElement')).to.exist;
            expect(bo.get('camunda:caseRef')).to.be.undefined;

          }));

          it('should redo', inject(function(commandStack) {

            commandStack.undo();
            commandStack.redo();

            expect(bo.get('calledElement')).to.be.undefined;
            expect(bo.get('camunda:calledElementVersion')).to.be.undefined;
            expect(bo.get('camunda:calledElementTenantId')).to.be.undefined;
            expect(bo.get('camunda:variableMappingClass')).to.be.undefined;
            expect(bo.get('camunda:variableMappingDelegateExpression')).to.be.undefined;
            expect(bo.get('camunda:caseRef')).to.be.undefined;

          }));

        });

      });

    });


    describe('#delegateVariableMappingType', function() {

      describe('change to #variableMappingDelegateExpression', function() {

        var field, bo;

        beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
          var shape = elementRegistry.get('CallActivity_10');
          selection.select(shape);

          bo = getBusinessObject(shape);
          field = getSelect(propertiesPanel._container, 'delegateVariableMappingType');

          // select 'variableMappingDelegateExpression'
          field.options[1].selected = 'selected';

          TestHelper.triggerEvent(field, 'change');
        }));

        describe('in the DOM', function() {

          it('should execute', function() {

            expect(field.value).to.equal('variableMappingDelegateExpression');

          });

          it('should undo', inject(function(commandStack) {

            commandStack.undo();

            expect(field.value).to.equal('variableMappingClass');
          }));

          it('should redo', inject(function(commandStack) {

            commandStack.undo();
            commandStack.redo();

            expect(field.value).to.equal('variableMappingDelegateExpression');

          }));

        });

        describe('on the business object', function() {

          it('should execute', function() {

            expect(bo.get('camunda:variableMappingClass')).to.be.undefined;
            expect(bo.get('camunda:variableMappingDelegateExpression')).to.exist;

          });

          it('should undo', inject(function(commandStack) {

            commandStack.undo();

            expect(bo.get('camunda:variableMappingClass')).to.exist;
            expect(bo.get('camunda:variableMappingDelegateExpression')).to.be.undefined;

          }));

          it('should redo', inject(function(commandStack) {

            commandStack.undo();
            commandStack.redo();

            expect(bo.get('camunda:variableMappingClass')).to.be.undefined;
            expect(bo.get('camunda:variableMappingDelegateExpression')).to.exist;

          }));

        });

      });


      describe('change to undefined', function() {

        var field, bo;

        beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
          var shape = elementRegistry.get('CallActivity_10');
          selection.select(shape);

          bo = getBusinessObject(shape);
          field = getSelect(propertiesPanel._container, 'delegateVariableMappingType');

          // select ''
          field.options[2].selected = 'selected';

          TestHelper.triggerEvent(field, 'change');
        }));

        describe('in the DOM', function() {

          it('should execute', function() {

            expect(field.value).to.equal('');

          });

          it('should undo', inject(function(commandStack) {

            commandStack.undo();

            expect(field.value).to.equal('variableMappingClass');
          }));

          it('should redo', inject(function(commandStack) {

            commandStack.undo();
            commandStack.redo();

            expect(field.value).to.equal('');

          }));

        });


        describe('on the business object', function() {

          it('should execute', function() {

            expect(bo.get('camunda:variableMappingClass')).to.be.undefined;
            expect(bo.get('camunda:variableMappingDelegateExpression')).to.be.undefined;

          });

          it('should undo', inject(function(commandStack) {

            commandStack.undo();

            expect(bo.get('camunda:variableMappingClass')).to.exist;
            expect(bo.get('camunda:variableMappingDelegateExpression')).to.be.undefined;

          }));

          it('should redo', inject(function(commandStack) {

            commandStack.undo();
            commandStack.redo();

            expect(bo.get('camunda:variableMappingClass')).to.be.undefined;
            expect(bo.get('camunda:variableMappingDelegateExpression')).to.be.undefined;

          }));

        });

      });


      describe('change to #CMMN', function() {

        var field, bo;

        beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
          var shape = elementRegistry.get('CallActivity_10');
          selection.select(shape);

          bo = getBusinessObject(shape);
          field = getSelect(propertiesPanel._container, 'callActivityType');

          // select 'CMMN'
          field.options[1].selected = 'selected';

          TestHelper.triggerEvent(field, 'change');
        }));


        describe('in the DOM', function() {

          it('should execute', function() {

            expect(field.value).to.equal('cmmn');

          });

          it('should undo', inject(function(commandStack) {

            commandStack.undo();

            expect(field.value).to.equal('bpmn');
          }));

          it('should redo', inject(function(commandStack) {

            commandStack.undo();
            commandStack.redo();

            expect(field.value).to.equal('cmmn');

          }));

        });


        describe('on the business object', function() {

          it('should execute', function() {

            expect(bo.get('camunda:variableMappingClass')).to.be.undefined;
            expect(bo.get('calledElement')).to.be.undefined;
            expect(bo.get('camunda:caseRef')).to.exist;

          });

          it('should undo', inject(function(commandStack) {

            commandStack.undo();

            expect(bo.get('camunda:variableMappingClass')).to.exist;
            expect(bo.get('calledElement')).to.exist;
            expect(bo.get('camunda:caseRef')).to.be.undefined;

          }));

          it('should redo', inject(function(commandStack) {

            commandStack.undo();
            commandStack.redo();

            expect(bo.get('camunda:variableMappingClass')).to.be.undefined;
            expect(bo.get('calledElement')).to.be.undefined;
            expect(bo.get('camunda:caseRef')).to.exist;

          }));

        });

      });

    });


  });


  describe('remove', function() {

    describe('#calledElement', function() {

      var field, bo;

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        var shape = elementRegistry.get('CallActivity_1');
        selection.select(shape);

        bo = getBusinessObject(shape);

        var clearButton = getClearButton(propertiesPanel._container, 'callable-element-ref');
        field = getInput(propertiesPanel._container, 'callableElementRef');

        TestHelper.triggerEvent(clearButton, 'click');
      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(field.value).to.equal('');
        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          expect(field.value).to.equal('asd');
        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          expect(field.value).to.equal('');

        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {
          expect(bo.get('calledElement')).to.equal('');
        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          expect(bo.get('calledElement')).to.equal('asd');
        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          expect(bo.get('calledElement')).to.equal('');

        }));

      });

    });


    describe('#calledElementVersion', function() {

      var field, bo;

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        var shape = elementRegistry.get('CallActivity_1');
        selection.select(shape);

        bo = getBusinessObject(shape);

        var clearButton = getClearButton(propertiesPanel._container, 'callable-version');
        field = getInput(propertiesPanel._container, 'callableVersion');

        TestHelper.triggerEvent(clearButton, 'click');
      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(field.value).to.equal('');
        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          expect(field.value).to.equal('17');
        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          expect(field.value).to.equal('');

        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {
          expect(bo.get('camunda:calledElementVersion')).to.be.undefined;
        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          expect(bo.get('camunda:calledElementVersion')).to.eql('17');
        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          expect(bo.get('camunda:calledElementVersion')).to.be.undefined;

        }));

      });

    });


    describe('#caseVersion', function() {

      var field, bo;

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        var shape = elementRegistry.get('CallActivity_4');
        selection.select(shape);

        bo = getBusinessObject(shape);

        var clearButton = getClearButton(propertiesPanel._container, 'callable-version');
        field = getInput(propertiesPanel._container, 'callableVersion');

        TestHelper.triggerEvent(clearButton, 'click');
      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(field.value).to.equal('');
        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          expect(field.value).to.equal('17');
        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          expect(field.value).to.equal('');

        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {
          expect(bo.get('camunda:caseVersion')).to.be.undefined;
        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          expect(bo.get('camunda:caseVersion')).to.eql('17');
        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          expect(bo.get('camunda:caseVersion')).to.be.undefined;

        }));

      });

    });


    describe('#businessKey', function() {

      var field, bo;

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        var shape = elementRegistry.get('CallActivity_6');
        selection.select(shape);

        bo = getBusinessObject(shape);

        field = getInput(propertiesPanel._container, 'callableBusinessKey');

        TestHelper.triggerEvent(field, 'click');
      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(field.checked).to.be.false;
        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          expect(field.checked).to.be.true;
        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          expect(field.checked).to.be.false;

        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {

          var camundaIn = getCamundaInWithBusinessKey(bo.extensionElements);
          expect(camundaIn).to.have.length(0);

        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          var camundaIn = getCamundaInWithBusinessKey(bo.extensionElements);
          expect(camundaIn[0].businessKey).to.equal('#{execution.processBusinessKey}');

        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          var camundaIn = getCamundaInWithBusinessKey(bo.extensionElements);
          expect(camundaIn).to.have.length(0);

        }));

      });

    });


    describe('#calledElementTenantId', function() {

      var field, bo;

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        var shape = elementRegistry.get('CallActivity_9');
        selection.select(shape);

        bo = getBusinessObject(shape);

        var clearButton = getClearButton(propertiesPanel._container, 'tenant-id');
        field = getInput(propertiesPanel._container, 'tenantId');

        TestHelper.triggerEvent(clearButton, 'click');
      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(field.value).to.equal('');
        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          expect(field.value).to.equal('tenant1');
        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          expect(field.value).to.equal('');

        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {
          expect(bo.get('camunda:calledElementTenantId')).to.be.undefined;
        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          expect(bo.get('camunda:calledElementTenantId')).to.equal('tenant1');
        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          expect(bo.get('camunda:calledElementTenantId')).to.be.undefined;

        }));

      });

    });


    describe('#caseTenantId', function() {

      var field, bo;

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        var shape = elementRegistry.get('CallActivity_8');
        selection.select(shape);

        bo = getBusinessObject(shape);

        var clearButton = getClearButton(propertiesPanel._container, 'tenant-id');
        field = getInput(propertiesPanel._container, 'tenantId');

        TestHelper.triggerEvent(clearButton, 'click');
      }));

      describe('in the DOM', function() {

        it('should execute', function() {

          expect(field.value).to.equal('');

        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          expect(field.value).to.equal('tenant1');

        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          expect(field.value).to.equal('');

        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {

          expect(bo.get('camunda:caseTenantId')).to.be.undefined;

        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          expect(bo.get('camunda:caseTenantId')).to.equal('tenant1');

        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          expect(bo.get('camunda:caseTenantId')).to.be.undefined;

        }));

      });

    });


  });


  describe('validation', function() {

    describe('#delegateVariableMapping', function() {

      var field;

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        var shape = elementRegistry.get('CallActivity_12');
        selection.select(shape);

        field = getInput(propertiesPanel._container, 'delegateVariableMapping');

      }));

      it('should be shown when a #delegateVariableMappingType is selected and no value set', function() {

        expect(domClasses(field).has('invalid')).to.be.true;

      });

    });


    describe('#callableElementRef', function() {

      var field;

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        var shape = elementRegistry.get('CallActivity_12');
        selection.select(shape);

        field = getInput(propertiesPanel._container, 'callableElementRef');

      }));

      it('should be shown when #callableElementRef is empty', function() {

        expect(domClasses(field).has('invalid')).to.be.true;

      });

    });


    describe('#callableVersion', function() {

      var field;

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        var shape = elementRegistry.get('CallActivity_12');
        selection.select(shape);

        field = getInput(propertiesPanel._container, 'callableVersion');

      }));

      it('should be shown when #callableVersion is empty', function() {

        expect(domClasses(field).has('invalid')).to.be.true;

      });

    });

  });


  describe('default values', function() {

    var field, bo;

    beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
      var shape = elementRegistry.get('CallActivity_5');
      selection.select(shape);

      bo = getBusinessObject(shape);
      field = getSelect(propertiesPanel._container, 'callableBinding');

    }));

    it('#calledElementBinding', function() {

      expect(field.value).to.equal(bo.get('camunda:calledElementBinding'));

    });


    it('#caseBinding', function() {

      expect(field.value).to.equal(bo.get('camunda:caseBinding'));

    });

  });


  describe('control visibility', function() {

    function expectVisible(elementId, visible, getter, selector, parentElement) {

      return inject(function(propertiesPanel, selection, elementRegistry) {

        // given
        var element = elementRegistry.get(elementId);

        // assume
        expect(element).to.exist;

        // when
        selection.select(element);
        var field = getter(propertiesPanel._container, selector);

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

      it('BPMN - delegateVariableMappingType', expectVisible('CallActivity_1', true, getSelect, 'delegateVariableMappingType'));
      it('delegateVariableMapping', expectVisible('CallActivity_1', true, getInput, 'delegateVariableMapping'));

      it('BPMN - callActivityType', expectVisible('CallActivity_5', true, getSelect, 'callActivityType'));
      it('BPMN - callableBusinessKey', expectVisible('CallActivity_5', true, getInput, 'callableBusinessKey'));

      it('BPMN - callableElementRef', expectVisible('CallActivity_1', true, getInput, 'callableElementRef'));
      it('BPMN - callableBinding', expectVisible('CallActivity_1', true, getSelect, 'callableBinding'));
      it('BPMN - callableVersion', expectVisible('CallActivity_1', true, getInput, 'callableVersion'));
      it('BPMN - tenantId', expectVisible('CallActivity_1', true, getInput, 'tenantId'));

    });


    describe('should hide', function() {

      it('CMMN - delegateVariableMappingType', expectVisible('CallActivity_3', false, getSelect, 'delegateVariableMappingType'));
      it('CMMN - delegateVariableMapping', expectVisible('CallActivity_3', false, getInput, 'delegateVariableMapping', true));

      it('BPMN - delegateVariableMappingType', expectVisible('CallActivity_5', false, getSelect, 'delegateVariableMappingType'));
      it('BPMN - delegateVariableMapping', expectVisible('CallActivity_5', false, getInput, 'delegateVariableMapping', true));

      it('BPMN - callableElementRef', expectVisible('CallActivity_5', false, getInput, 'callableElementRef', true));
      it('BPMN - callableBinding', expectVisible('CallActivity_5', false, getSelect, 'callableBinding'));
      it('BPMN - callableVersion', expectVisible('CallActivity_5', false, getInput, 'callableVersion', true));
      it('BPMN - tenantId', expectVisible('CallActivity_5', false, getInput, 'tenantId', true));

    });

  });


  it('should not show version field when changing callActivityType from BPMN to CMMN and back for an element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_2');

    selection.select(shape);

    var callableBindingSelect = domQuery('select[name=callableBinding]', propertiesPanel._container),
        callableVersionInput = domQuery('input[name=callableVersion]', propertiesPanel._container),
        callActivityTypeSelect = domQuery('select[name=callActivityType]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(callActivityTypeSelect.value).to.equal('bpmn');

    expect(callableBindingSelect.value).to.equal('latest');

    expect(businessObject.get('camunda:calledElementBinding')).to.equal('latest'); // default value in camunda-moddle

    expect(businessObject.get('camunda:caseRef')).not.to.exist;
    expect(businessObject.get('camunda:caseBinding')).to.equal('latest');
    expect(businessObject.get('camunda:caseVersion')).not.to.exist;

    // when change called element binding to 'version'
    callableBindingSelect.options[2].selected = 'selected';
    TestHelper.triggerEvent(callableBindingSelect, 'change');

    // and when change call activity type to 'cmmn'
    callActivityTypeSelect.options[1].selected = 'selected';
    TestHelper.triggerEvent(callActivityTypeSelect, 'change');

    // then
    expect(callActivityTypeSelect.value).to.equal('cmmn');

    expect(callableBindingSelect.value).to.equal('latest');
    expect(callableVersionInput.parentElement.className).to.contains('bpp-hidden');

    // when change back to 'bpmn'
    callActivityTypeSelect.options[0].selected = 'selected';
    TestHelper.triggerEvent(callActivityTypeSelect, 'change');

    // then
    expect(callActivityTypeSelect.value).to.equal('bpmn');

    expect(callableBindingSelect.value).to.equal('latest');
    expect(callableVersionInput.parentElement.className).to.contains('bpp-hidden');

    // property 'camunda:calledElementBinding' should not exist in the business object,
    // because there is the default value 'latest'
    expect(businessObject.get('camunda:calledElementBinding')).to.equal('latest');
    expect(businessObject.get('camunda:calledElementVersion')).not.to.exist;

    expect(businessObject.get('camunda:caseBinding')).to.equal('latest');
    expect(businessObject.get('camunda:caseVersion')).not.to.exist;

  }));


  it('should not show version field when changing callActivityType from CMMN to BPMN and back for an element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_3');

    selection.select(shape);

    var callableBindingSelect = domQuery('select[name=callableBinding]', propertiesPanel._container),
        callableVersionInput = domQuery('input[name=callableVersion]', propertiesPanel._container),
        callActivityTypeSelect = domQuery('select[name=callActivityType]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(callActivityTypeSelect.value).to.equal('cmmn');

    expect(callableBindingSelect.value).to.equal('latest');

    expect(businessObject.get('camunda:caseBinding')).to.equal('latest');

    expect(businessObject.get('camunda:calledElement')).not.to.exist;
    expect(businessObject.get('camunda:calledElementBinding')).to.equal('latest'); // default value in the camunda-moddle
    expect(businessObject.get('camunda:calledElementVersion')).not.to.exist;

    // when change case binding to 'version'
    callableBindingSelect.options[2].selected = 'selected';
    TestHelper.triggerEvent(callableBindingSelect, 'change');

    // and when change call activity type to 'bpmn'
    callActivityTypeSelect.options[0].selected = 'selected';
    TestHelper.triggerEvent(callActivityTypeSelect, 'change');

    // then
    expect(callActivityTypeSelect.value).to.equal('bpmn');

    expect(callableBindingSelect.value).to.equal('latest');
    expect(callableVersionInput.parentElement.className).to.contains('bpp-hidden');

    // when change back to 'cmmn'
    callActivityTypeSelect.options[1].selected = 'selected';
    TestHelper.triggerEvent(callActivityTypeSelect, 'change');

    // then
    expect(callActivityTypeSelect.value).to.equal('cmmn');

    expect(callableBindingSelect.value).to.equal('latest');
    expect(callableVersionInput.parentElement.className).to.contains('bpp-hidden');

    expect(businessObject.get('camunda:calledElementBinding')).to.equal('latest');
    expect(businessObject.get('camunda:calledElementVersion')).not.to.exist;

    expect(businessObject.get('camunda:caseRef')).to.be.empty;
    expect(businessObject.get('camunda:caseBinding')).to.equal('latest');
    expect(businessObject.get('camunda:caseVersion')).not.to.exist;

  }));

});
