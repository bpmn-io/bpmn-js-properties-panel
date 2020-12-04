'use strict';

var TestHelper = require('../../../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var coreModule = require('bpmn-js/lib/core').default,
    elementTemplatesModule = require('lib/provider/camunda/element-templates'),
    modelingModule = require('bpmn-js/lib/features/modeling').default,
    propertiesPanelCommandsModule = require('lib/cmd');

var camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda');

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var findExtension = require('lib/provider/camunda/element-templates/Helper').findExtension,
    findExtensions = require('lib/provider/camunda/element-templates/Helper').findExtensions;

var isArray = require('lodash/isArray'),
    isString = require('lodash/isString'),
    isUndefined = require('lodash/isUndefined');

var modules = [
  coreModule,
  elementTemplatesModule,
  modelingModule,
  propertiesPanelCommandsModule
];

var moddleExtensions = {
  camunda: camundaModdlePackage
};


describe.only('element-templates - ChangeElementTemplateHandler', function() {

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  function bootstrap(diagramXML) {
    return bootstrapModeler(diagramXML, {
      container: container,
      modules: modules,
      moddleExtensions: moddleExtensions
    });
  }


  describe('change template (new template specified)', function() {

    describe('update camunda:modelerTemplate and camunda:modelerTemplateVersion', function() {

      beforeEach(bootstrap(require('./task.bpmn')));

      var newTemplate = require('./task-template-1.json');


      it('execute', inject(function(elementRegistry) {

        // given
        var task = elementRegistry.get('Task_1');

        // when
        changeTemplate(task, newTemplate);

        // then
        expectElementTemplate(task, 'task-template', 1);
      }));


      it('undo', inject(function(commandStack, elementRegistry) {

        // given
        var task = elementRegistry.get('Task_1');

        changeTemplate(task, newTemplate);

        // when
        commandStack.undo();

        // then
        expectNoElementTemplate(task);
      }));


      it('redo', inject(function(commandStack, elementRegistry) {

        // given
        var task = elementRegistry.get('Task_1');

        changeTemplate(task, newTemplate);

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expectElementTemplate(task, 'task-template', 1);
      }));

    });


    describe('update properties', function() {

      describe('update bpmn:conditionExpression', function() {

        beforeEach(bootstrap(require('./sequence-flow.bpmn')));

        var newTemplate = require('./sequence-flow-template-1.json');


        it('execute', inject(function(elementRegistry) {

          // given
          var sequenceFlow = elementRegistry.get('SequenceFlow_1'),
              businessObject = getBusinessObject(sequenceFlow);

          // when
          changeTemplate(sequenceFlow, newTemplate);

          // then
          expectElementTemplate(sequenceFlow, 'sequence-flow-template', 1);

          var conditionExpression = businessObject.get('bpmn:conditionExpression');

          expect(conditionExpression).to.exist;
          expect(conditionExpression.$instanceOf('bpmn:FormalExpression')).to.be.true;
          expect(conditionExpression.get('bpmn:body')).to.equal('${foo}');
          expect(conditionExpression.get('bpmn:language')).to.equal('fooScript');
        }));


        it('undo', inject(function(commandStack, elementRegistry) {

          // given
          var sequenceFlow = elementRegistry.get('SequenceFlow_1'),
              businessObject = sequenceFlow.businessObject;

          changeTemplate(sequenceFlow, newTemplate);

          // when
          commandStack.undo();

          // then
          expectNoElementTemplate(sequenceFlow);

          var condition = businessObject.get('bpmn:conditionExpression');

          expect(condition).not.to.exist;
        }));


        it('redo', inject(function(commandStack, elementRegistry) {

          // given
          var sequenceFlow = elementRegistry.get('SequenceFlow_1'),
              businessObject = sequenceFlow.businessObject;

          changeTemplate(sequenceFlow, newTemplate);

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expectElementTemplate(sequenceFlow, 'sequence-flow-template', 1);

          var conditionExpression = businessObject.get('bpmn:conditionExpression');

          expect(conditionExpression).to.exist;
          expect(conditionExpression.$instanceOf('bpmn:FormalExpression')).to.be.true;
          expect(conditionExpression.get('bpmn:body')).to.equal('${foo}');
          expect(conditionExpression.get('bpmn:language')).to.equal('fooScript');
        }));

      });


      describe('update camunda:asyncBefore', function() {

        beforeEach(bootstrap(require('./task.bpmn')));

        var newTemplate = require('./task-template-1.json');


        it('execute', inject(function(elementRegistry) {

          // given
          var task = elementRegistry.get('Task_1'),
              businessObject = getBusinessObject(task);

          // when
          changeTemplate(task, newTemplate);

          // then
          expectElementTemplate(task, 'task-template', 1);

          var asyncBefore = businessObject.get('camunda:asyncBefore');

          expect(asyncBefore).to.be.true;
        }));


        it('undo', inject(function(commandStack, elementRegistry) {

          // given
          var task = elementRegistry.get('Task_1'),
              businessObject = getBusinessObject(task);

          changeTemplate(task, newTemplate);

          // when
          commandStack.undo();

          // then
          expectNoElementTemplate(task);

          var asyncBefore = businessObject.get('camunda:asyncBefore');

          expect(asyncBefore).to.be.false;
        }));


        it('redo', inject(function(commandStack, elementRegistry) {

          // given
          var task = elementRegistry.get('Task_1'),
              businessObject = getBusinessObject(task);

          changeTemplate(task, newTemplate);

          commandStack.undo();

          // when
          commandStack.redo();

          // then
          expectElementTemplate(task, 'task-template', 1);

          var asyncBefore = businessObject.get('camunda:asyncBefore');

          expect(asyncBefore).to.be.true;
        }));

      });


      describe('update camunda:expression ', function() {

        beforeEach(bootstrap(require('./service-task.bpmn')));

        var newTemplate = require('./service-task-template-1.json');


        it('execute', inject(function(elementRegistry) {

          // given
          var serviceTask = elementRegistry.get('ServiceTask_1'),
              businessObject = serviceTask.businessObject;

          // when
          changeTemplate(serviceTask, newTemplate);

          // then
          expectElementTemplate(serviceTask, 'service-task-template', 1);

          expect(businessObject.get('camunda:expression')).to.equal('${foo}');

          // Only one of `camunda:class`, `camunda:delegateExpression` and `camunda:expression` can
          // be set
          expect(businessObject.get('camunda:class')).not.to.exist;
        }));


        it('undo', inject(function(commandStack, elementRegistry) {

          // given
          var serviceTask = elementRegistry.get('ServiceTask_1'),
              businessObject = serviceTask.businessObject;

          changeTemplate(serviceTask, newTemplate);

          // when
          commandStack.undo();

          // then
          expectNoElementTemplate(serviceTask);

          var camundaExpression = businessObject.get('camunda:expression');

          expect(camundaExpression).not.to.exist;
        }));


        it('redo', inject(function(commandStack, elementRegistry) {

          // given
          var serviceTask = elementRegistry.get('ServiceTask_1'),
              businessObject = serviceTask.businessObject;

          changeTemplate(serviceTask, newTemplate);

          commandStack.undo();

          // when
          commandStack.redo();

          // then
          expectElementTemplate(serviceTask, 'service-task-template', 1);

          expect(businessObject.get('camunda:expression')).to.equal('${foo}');

          // Only one of `camunda:class`, `camunda:delegateExpression` and `camunda:expression` can
          // be set
          expect(businessObject.get('camunda:class')).not.to.exist;
        }));

      });

    });


    describe('update camunda:ExecutionListener', function() {

      describe('camunda:ExecutionListener specified', function() {

        beforeEach(bootstrap(require('./task.bpmn')));

        var newTemplate = require('./task-template-1.json');


        it('execute', inject(function(elementRegistry) {

          // given
          var task = elementRegistry.get('Task_1');

          // when
          changeTemplate(task, newTemplate);

          // then
          expectElementTemplate(task, 'task-template', 1);

          var executionListeners = findExtensions(task, [ 'camunda:ExecutionListener' ]);

          expect(executionListeners).to.have.length(1);
          expect(executionListeners).to.jsonEqual([{
            $type: 'camunda:ExecutionListener',
            event: 'start',
            script: {
              $type: 'camunda:Script',
              scriptFormat: 'foo',
              value: 'bar'
            }
          }]);
        }));


        it('undo', inject(function(commandStack, elementRegistry) {

          // given
          var task = elementRegistry.get('Task_1');

          changeTemplate(task, newTemplate);

          // when
          commandStack.undo();

          // then
          expectNoElementTemplate(task);

          var executionListeners = findExtensions(task, [ 'camunda:ExecutionListener' ]);

          expect(executionListeners).to.have.length(0);
        }));


        it('redo', inject(function(commandStack, elementRegistry) {

          // given
          var task = elementRegistry.get('Task_1');

          changeTemplate(task, newTemplate);

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expectElementTemplate(task, 'task-template', 1);

          var executionListeners = findExtensions(task, [ 'camunda:ExecutionListener' ]);

          expect(executionListeners).to.have.length(1);
          expect(executionListeners).to.jsonEqual([{
            $type: 'camunda:ExecutionListener',
            event: 'start',
            script: {
              $type: 'camunda:Script',
              scriptFormat: 'foo',
              value: 'bar'
            }
          }]);
        }));

      });


      describe('camunda:ExecutionListener not specified', function() {

        beforeEach(bootstrap(require('./task-execution-listener.bpmn')));

        var newTemplate = require('./task-template-no-properties.json');


        it('should not override existing', inject(function(elementRegistry) {

          // given
          var task = elementRegistry.get('Task_1');

          // when
          changeTemplate(task, newTemplate);

          // then
          expectElementTemplate(task, 'task-template-no-properties');

          var executionListeners = findExtensions(task, [ 'camunda:ExecutionListener' ]);

          expect(executionListeners).to.have.length(1);
          expect(executionListeners).to.jsonEqual([
            {
              $type: 'camunda:ExecutionListener',
              class: 'foo',
              event: 'start'
            }
          ]);
        }));

      });

    });


    describe('update camunda:Field', function() {

      describe('camunda:Field specified', function() {

        beforeEach(bootstrap(require('./service-task.bpmn')));

        var newTemplate = require('./service-task-template-1.json');


        it('execute', inject(function(elementRegistry) {

          // given
          var serviceTask = elementRegistry.get('ServiceTask_1');

          // when
          changeTemplate(serviceTask, newTemplate);

          // then
          expectElementTemplate(serviceTask, 'service-task-template', 1);

          var fields = findExtensions(serviceTask, [ 'camunda:Field' ]);

          expect(fields).to.have.length(2);
          expect(fields).to.jsonEqual([
            {
              $type: 'camunda:Field',
              string: 'foo',
              name: 'foo'
            },
            {
              $type: 'camunda:Field',
              expression: '${bar}',
              name: 'bar'
            }
          ]);
        }));


        it('undo', inject(function(commandStack, elementRegistry) {

          // given
          var serviceTask = elementRegistry.get('ServiceTask_1');

          changeTemplate(serviceTask, newTemplate);

          // when
          commandStack.undo();

          // then
          expectNoElementTemplate(serviceTask);

          var fields = findExtensions(serviceTask, [ 'camunda:Field' ]);

          expect(fields).to.have.length(0);
        }));


        it('redo', inject(function(commandStack, elementRegistry) {

          // given
          var serviceTask = elementRegistry.get('ServiceTask_1');

          changeTemplate(serviceTask, newTemplate);

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expectElementTemplate(serviceTask, 'service-task-template', 1);

          var fields = findExtensions(serviceTask, [ 'camunda:Field' ]);

          expect(fields).to.have.length(2);
          expect(fields).to.jsonEqual([
            {
              $type: 'camunda:Field',
              string: 'foo',
              name: 'foo'
            },
            {
              $type: 'camunda:Field',
              expression: '${bar}',
              name: 'bar'
            }
          ]);
        }));

      });


      describe('camunda:Field not specified', function() {

        beforeEach(bootstrap(require('./service-task-field.bpmn')));

        var newTemplate = require('./service-task-template-no-properties.json');


        it('should not override existing', inject(function(elementRegistry) {

          // given
          var serviceTask = elementRegistry.get('ServiceTask_1');

          // when
          changeTemplate(serviceTask, newTemplate);

          // then
          expectElementTemplate(serviceTask, 'service-task-template-no-properties');

          var fields = findExtensions(serviceTask, [ 'camunda:Field' ]);

          expect(fields).to.have.length(2);
          expect(fields).to.jsonEqual([
            {
              $type: 'camunda:Field',
              name: 'foo',
              string: 'foo'
            },
            {
              $type: 'camunda:Field',
              name: 'bar',
              expression: '${bar}'
            }
          ]);
        }));

      });

    });


    describe('update camunda:In and camunda:Out', function() {

      describe('camunda:In and camunda:Out specified', function() {

        beforeEach(bootstrap(require('./call-activity.bpmn')));

        var newTemplate = require('./call-activity-template-1.json');


        it('execute', inject(function(elementRegistry) {

          // given
          var callActivity = elementRegistry.get('CallActivity_1');

          // when
          changeTemplate(callActivity, newTemplate);

          // then
          expectElementTemplate(callActivity, 'call-activity-template', 1);

          var insAndOuts = findExtensions(callActivity, [ 'camunda:In', 'camunda:Out' ]);

          expect(insAndOuts).to.have.length(9);
          expect(insAndOuts).to.jsonEqual([
            {
              $type: 'camunda:In',
              target: 'in-1-target',
              source: 'in-1-value'
            },
            {
              $type: 'camunda:Out',
              target: 'out-1-value',
              source: 'out-1-source'
            },
            {
              $type: 'camunda:In',
              target: 'in-2-target',
              sourceExpression: '${in-2-value}'
            },
            {
              $type: 'camunda:Out',
              target: 'out-2-value',
              sourceExpression: '${out-2-source-expression}'
            },
            {
              $type: 'camunda:In',
              variables: 'all'
            },
            {
              $type: 'camunda:Out',
              variables: 'all'
            },
            {
              $type: 'camunda:In',
              variables: 'all',
              local: true
            },
            {
              $type: 'camunda:Out',
              variables: 'all',
              local: true
            },
            {
              $type: 'camunda:In',
              businessKey: '${in-business-key-value}'
            }
          ]);
        }));


        it('undo', inject(function(commandStack, elementRegistry) {

          // given
          var callActivity = elementRegistry.get('CallActivity_1');

          changeTemplate(callActivity, newTemplate);

          // when
          commandStack.undo();

          // then
          expectNoElementTemplate(callActivity);

          var insAndOuts = findExtensions(callActivity, [ 'camunda:In', 'camunda:Out' ]);

          expect(insAndOuts).to.have.length(0);
        }));


        it('redo', inject(function(commandStack, elementRegistry) {

          // given
          var callActivity = elementRegistry.get('CallActivity_1');

          changeTemplate(callActivity, newTemplate);

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expectElementTemplate(callActivity, 'call-activity-template', 1);

          var insAndOuts = findExtensions(callActivity, [ 'camunda:In', 'camunda:Out' ]);

          expect(insAndOuts).to.have.length(9);
          expect(insAndOuts).to.jsonEqual([
            {
              $type: 'camunda:In',
              target: 'in-1-target',
              source: 'in-1-value'
            },
            {
              $type: 'camunda:Out',
              target: 'out-1-value',
              source: 'out-1-source'
            },
            {
              $type: 'camunda:In',
              target: 'in-2-target',
              sourceExpression: '${in-2-value}'
            },
            {
              $type: 'camunda:Out',
              target: 'out-2-value',
              sourceExpression: '${out-2-source-expression}'
            },
            {
              $type: 'camunda:In',
              variables: 'all'
            },
            {
              $type: 'camunda:Out',
              variables: 'all'
            },
            {
              $type: 'camunda:In',
              variables: 'all',
              local: true
            },
            {
              $type: 'camunda:Out',
              variables: 'all',
              local: true
            },
            {
              $type: 'camunda:In',
              businessKey: '${in-business-key-value}'
            }
          ]);
        }));

      });


      describe('camunda:In and camunda:Out not specified', function() {

        beforeEach(bootstrap(require('./call-activity-ins-and-outs.bpmn')));

        var newTemplate = require('./call-activity-template-no-properties.json');


        it('should not override existing', inject(function(elementRegistry) {

          // given
          var callActivity = elementRegistry.get('CallActivity_1');

          // when
          changeTemplate(callActivity, newTemplate);

          // then
          expectElementTemplate(callActivity, 'call-activity-template-no-properties');

          var insAndOuts = findExtensions(callActivity, [ 'camunda:In', 'camunda:Out' ]);

          expect(insAndOuts).to.have.length(2);
          expect(insAndOuts).to.jsonEqual([
            {
              $type: 'camunda:In',
              source: 'in-1-value',
              target: 'in-1-target'
            },
            {
              $type: 'camunda:Out',
              source: 'out-1-source',
              target: 'out-1-value'
            }
          ]);
        }));

      });

    });


    describe('update camunda:InputOutput', function() {

      describe('camunda:Input and camunda:Output specified', function() {

        beforeEach(bootstrap(require('./task.bpmn')));

        var newTemplate = require('./task-template-1.json');


        it('execute', inject(function(elementRegistry) {

          // given
          var task = elementRegistry.get('Task_1');

          // when
          changeTemplate(task, newTemplate);

          // then
          expectElementTemplate(task, 'task-template', 1);

          var inputOutput = findExtension(task, 'camunda:InputOutput');

          expect(inputOutput).to.exist;
          expect(inputOutput.inputParameters).to.have.length(2);
          expect(inputOutput.outputParameters).to.have.length(2);

          expect(inputOutput.inputParameters).to.jsonEqual([
            {
              $type: 'camunda:InputParameter',
              name: 'input-1-name',
              value: 'input-1-value'
            },
            {
              $type: 'camunda:InputParameter',
              name: 'input-2-name',
              definition: {
                $type: 'camunda:Script',
                scriptFormat: 'foo',
                value: '${input-2-value}'
              }
            }
          ]);

          expect(inputOutput.outputParameters).to.jsonEqual([
            {
              $type: 'camunda:OutputParameter',
              name: 'output-1-value',
              value: 'output-1-source'
            },
            {
              $type: 'camunda:OutputParameter',
              name: 'output-2-value',
              definition: {
                $type: 'camunda:Script',
                scriptFormat: 'foo',
                value: '${output-2-source}'
              }
            }
          ]);
        }));


        it('undo', inject(function(commandStack, elementRegistry) {

          // given
          var task = elementRegistry.get('Task_1');

          changeTemplate(task, newTemplate);

          // when
          commandStack.undo();

          // then
          expectNoElementTemplate(task);

          var inputOutput = findExtension(task, 'camunda:InputOutput');

          expect(inputOutput).not.to.exist;
        }));


        it('redo', inject(function(commandStack, elementRegistry) {

          // given
          var task = elementRegistry.get('Task_1');

          changeTemplate(task, newTemplate);

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expectElementTemplate(task, 'task-template', 1);

          var inputOutput = findExtension(task, 'camunda:InputOutput');

          expect(inputOutput).to.exist;
          expect(inputOutput.inputParameters).to.have.length(2);
          expect(inputOutput.outputParameters).to.have.length(2);

          expect(inputOutput.inputParameters).to.jsonEqual([
            {
              $type: 'camunda:InputParameter',
              name: 'input-1-name',
              value: 'input-1-value'
            },
            {
              $type: 'camunda:InputParameter',
              name: 'input-2-name',
              definition: {
                $type: 'camunda:Script',
                scriptFormat: 'foo',
                value: '${input-2-value}'
              }
            }
          ]);

          expect(inputOutput.outputParameters).to.jsonEqual([
            {
              $type: 'camunda:OutputParameter',
              name: 'output-1-value',
              value: 'output-1-source'
            },
            {
              $type: 'camunda:OutputParameter',
              name: 'output-2-value',
              definition: {
                $type: 'camunda:Script',
                scriptFormat: 'foo',
                value: '${output-2-source}'
              }
            }
          ]);
        }));

      });


      describe('camunda:Input and camunda:Output not specified', function() {

        beforeEach(bootstrap(require('./task-input-output.bpmn')));

        var newTemplate = require('./task-template-no-properties.json');


        it('should not override existing', inject(function(elementRegistry) {

          // given
          var task = elementRegistry.get('Task_1');

          // when
          changeTemplate(task, newTemplate);

          // then
          expectElementTemplate(task, 'task-template-no-properties');

          var inputOutput = findExtension(task, 'camunda:InputOutput');

          expect(inputOutput).to.exist;
          expect(inputOutput.inputParameters).to.have.length(1);
          expect(inputOutput.outputParameters).to.have.length(1);

          expect(inputOutput.inputParameters).to.jsonEqual([
            {
              $type: 'camunda:InputParameter',
              name: 'input-1-name',
              value: 'input-1-value'
            }
          ]);

          expect(inputOutput.outputParameters).to.jsonEqual([
            {
              $type: 'camunda:OutputParameter',
              name: 'output-1-value',
              value: 'output-1-source'
            }
          ]);
        }));

      });

    });


    describe('update camunda:Property', function() {

      describe('camunda:Property specified', function() {

        beforeEach(bootstrap(require('./task.bpmn')));

        var newTemplate = require('./task-template-1.json');


        it('execute', inject(function(elementRegistry) {

          // given
          var task = elementRegistry.get('Task_1');

          // when
          changeTemplate(task, newTemplate);

          // then
          expectElementTemplate(task, 'task-template', 1);

          var properties = findExtension(task, 'camunda:Properties');

          expect(properties).to.exist;
          expect(properties.values).to.jsonEqual([{
            $type: 'camunda:Property',
            name: 'foo',
            value: 'bar'
          }]);
        }));


        it('undo', inject(function(commandStack, elementRegistry) {

          // given
          var task = elementRegistry.get('Task_1');

          changeTemplate(task, newTemplate);

          // when
          commandStack.undo();

          // then
          expectNoElementTemplate(task);

          var properties = findExtension(task, 'camunda:Properties');

          expect(properties).not.to.exist;
        }));


        it('redo', inject(function(commandStack, elementRegistry) {

          // given
          var task = elementRegistry.get('Task_1');

          changeTemplate(task, newTemplate);

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expectElementTemplate(task, 'task-template', 1);

          var properties = findExtension(task, 'camunda:Properties');

          expect(properties).to.exist;
          expect(properties.values).to.jsonEqual([{
            $type: 'camunda:Property',
            name: 'foo',
            value: 'bar'
          }]);
        }));

      });


      describe('camunda:Property not specified', function() {

        beforeEach(bootstrap(require('./task-property.bpmn')));

        var newTemplate = require('./task-template-no-properties.json');


        it('should not override existing', inject(function(elementRegistry) {

          // given
          var task = elementRegistry.get('Task_1');

          // when
          changeTemplate(task, newTemplate);

          // then
          expectElementTemplate(task, 'task-template-no-properties');

          var properties = findExtension(task, 'camunda:Properties');

          expect(properties).to.exist;
          expect(properties.values).to.jsonEqual([{
            $type: 'camunda:Property',
            name: 'foo',
            value: 'bar'
          }]);
        }));

      });

    });


    describe('update scope elements', function() {

      describe('camunda:Connector', function() {

        describe('camunda:Connector specified', function() {

          beforeEach(bootstrap(require('./service-task.bpmn')));

          var newTemplate = require('./service-task-template-1.json');


          it('execute', inject(function(elementRegistry) {

            // given
            var serviceTask = elementRegistry.get('ServiceTask_1');

            // when
            changeTemplate(serviceTask, newTemplate);

            // then
            expectElementTemplate(serviceTask, 'service-task-template', 1);

            var connector = findExtension(serviceTask, 'camunda:Connector');

            expect(connector).to.exist;
            expect(connector.get('connectorId')).to.equal('foo');

            var inputOutput = connector.get('inputOutput');

            expect(inputOutput).to.exist;

            expect(inputOutput.inputParameters).to.jsonEqual([{
              $type: 'camunda:InputParameter',
              name: 'input-1-name',
              value: 'input-1-value'
            }]);

            expect(inputOutput.outputParameters).to.jsonEqual([{
              $type: 'camunda:OutputParameter',
              name: 'output-1-value',
              value: 'output-1-source'
            }]);
          }));


          it('undo', inject(function(commandStack, elementRegistry) {

            // given
            var serviceTask = elementRegistry.get('ServiceTask_1');

            changeTemplate(serviceTask, newTemplate);

            // when
            commandStack.undo();

            // then
            expectNoElementTemplate(serviceTask);

            var connector = findExtension(serviceTask, 'camunda:Connector');

            expect(connector).not.to.exist;
          }));


          it('redo', inject(function(commandStack, elementRegistry) {

            // given
            var serviceTask = elementRegistry.get('ServiceTask_1');

            changeTemplate(serviceTask, newTemplate);

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expectElementTemplate(serviceTask, 'service-task-template', 1);

            var connector = findExtension(serviceTask, 'camunda:Connector');

            expect(connector).to.exist;
            expect(connector.get('connectorId')).to.equal('foo');

            var inputOutput = connector.get('inputOutput');

            expect(inputOutput).to.exist;

            expect(inputOutput.inputParameters).to.jsonEqual([{
              $type: 'camunda:InputParameter',
              name: 'input-1-name',
              value: 'input-1-value'
            }]);

            expect(inputOutput.outputParameters).to.jsonEqual([{
              $type: 'camunda:OutputParameter',
              name: 'output-1-value',
              value: 'output-1-source'
            }]);
          }));

        });


        describe('camunda:Connector not specified', function() {

          beforeEach(bootstrap(require('./service-task-connector.bpmn')));

          var newTemplate = require('./service-task-template-no-properties.json');


          it('should not override existing', inject(function(elementRegistry) {

            // given
            var serviceTask = elementRegistry.get('ServiceTask_1');

            // when
            changeTemplate(serviceTask, newTemplate);

            // then
            expectElementTemplate(serviceTask, 'service-task-template-no-properties');

            var connector = findExtension(serviceTask, 'camunda:Connector');

            expect(connector).to.exist;
            expect(connector.get('connectorId')).to.equal('foo');

            var inputOutput = connector.get('inputOutput');

            expect(inputOutput).to.exist;

            expect(inputOutput.inputParameters).to.jsonEqual([{
              $type: 'camunda:InputParameter',
              name: 'input-1-name',
              value: 'input-1-value'
            }]);

            expect(inputOutput.outputParameters).to.jsonEqual([{
              $type: 'camunda:OutputParameter',
              name: 'output-1-name',
              value: 'output-1-value'
            }]);
          }));

        });

      });

    });

  });


  describe('change template (new and old template specified)', function() {

    describe('update camunda:modelerTemplate and camunda:modelerTemplateVersion', function() {

      var diagramXML = require('./task-template.bpmn');

      var newTemplate = require('./task-template-2.json');

      beforeEach(bootstrapModeler(diagramXML, {
        container: container,
        modules: modules,
        moddleExtensions: moddleExtensions
      }));


      it('execute', inject(function(elementRegistry) {

        // given
        var task = elementRegistry.get('Task_1');

        // when
        changeTemplate(task, newTemplate);

        // then
        expectElementTemplate(task, 'task-template', 2);
      }));

    });


    // TODO

  });


  describe('change template (no new template specified)', function() {

    describe('should not remove properties', function() {

      beforeEach(bootstrap(require('./task-template.bpmn')));


      it('execute', inject(function(elementRegistry) {

        // given
        var task = elementRegistry.get('Task_1'),
            businessObject = getBusinessObject(task);

        // when
        changeTemplate(task, null);

        // then
        expectNoElementTemplate(task);

        expect(businessObject.get('camunda:asyncBefore')).to.be.true;

        expect(findExtensions(task, [ 'camunda:ExecutionListener' ])).to.have.length(1);
        expect(findExtension(task, [ 'camunda:Properties' ])).to.exist;
        expect(findExtension(task, [ 'camunda:InputOutput' ])).to.exist;
      }));


      it('undo', inject(function(commandStack, elementRegistry) {

        // given
        var task = elementRegistry.get('Task_1');

        changeTemplate(task, null);

        // when
        commandStack.undo();

        // then
        expectElementTemplate(task, 'task-template', 1);
      }));


      it('redo', inject(function(commandStack, elementRegistry) {

        // given
        var task = elementRegistry.get('Task_1'),
            businessObject = getBusinessObject(task);


        changeTemplate(task, null);

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expectNoElementTemplate(task);

        expect(businessObject.get('camunda:asyncBefore')).to.be.true;

        expect(findExtensions(task, [ 'camunda:ExecutionListener' ])).to.have.length(1);
        expect(findExtension(task, [ 'camunda:Properties' ])).to.exist;
        expect(findExtension(task, [ 'camunda:InputOutput' ])).to.exist;
      }));

    });

  });

});



// helpers //////////

function changeTemplate(element, newTemplate, oldTemplate) {
  return TestHelper.getBpmnJS().invoke(function(commandStack, elementRegistry) {
    if (isString(element)) {
      element = elementRegistry.get(element);
    }

    expect(element).to.exist;

    return commandStack.execute('propertiesPanel.camunda.changeTemplate', {
      element: element,
      newTemplate: newTemplate,
      oldTemplate: oldTemplate
    });
  });
}

function expectElementTemplate(element, id, version) {
  TestHelper.getBpmnJS().invoke(function(elementRegistry) {
    if (isString(element)) {
      element = elementRegistry.get(element);
    }

    expect(element).to.exist;

    var businessObject = getBusinessObject(element);

    expect(businessObject.get('camunda:modelerTemplate')).to.exist;
    expect(businessObject.get('camunda:modelerTemplate')).to.equal(id);

    if (isUndefined(version)) {
      return;
    }

    expect(businessObject.get('camunda:modelerTemplateVersion')).to.exist;
    expect(businessObject.get('camunda:modelerTemplateVersion')).to.equal(version);
  });
}

function expectNoElementTemplate(element) {
  TestHelper.getBpmnJS().invoke(function(elementRegistry) {
    if (isString(element)) {
      element = elementRegistry.get(element);
    }

    expect(element).to.exist;

    var businessObject = getBusinessObject(element);

    expect(businessObject.get('camunda:modelerTemplate')).not.to.exist;
    expect(businessObject.get('camunda:modelerTemplateVersion')).not.to.exist;
  });
}

function createTemplate(properties, id, version) {
  if (!isArray(properties)) {
    properties = [ properties ];
  }

  return {
    id: id,
    version: version,
    properties: properties
  };
}

function updateProperties(element, properties) {
  TestHelper.getBpmnJS().invoke(function(elementRegistry, modeling) {
    if (isString(element)) {
      element = elementRegistry.get(element);
    }

    expect(element).to.exist;

    modeling.updateProperties(element, properties);
  });
}

function updateBusinessObject(element, businessObject, properties) {
  TestHelper.getBpmnJS().invoke(function(commandStack, elementRegistry) {
    if (isString(element)) {
      element = elementRegistry.get(element);
    }

    expect(element).to.exist;

    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: businessObject,
      properties: properties
    });
  });
}