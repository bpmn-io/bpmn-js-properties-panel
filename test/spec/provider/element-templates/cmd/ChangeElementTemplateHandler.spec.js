import {
  bootstrapModeler,
  getBpmnJS,
  inject
} from 'test/TestHelper';

import TestContainer from 'mocha-test-container-support';

import CoreModule from 'bpmn-js/lib/core';
import ElementTemplatesModule from 'src/provider/element-templates';
import ModelingModule from 'bpmn-js/lib/features/modeling';
import PropertiesPanelCommandsModule from 'src/cmd';

import camundaModdlePackage from 'camunda-bpmn-moddle/resources/camunda';

import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  findCamundaErrorEventDefinition,
  findExtension,
  findExtensions
} from 'src/provider/element-templates/Helper';

import { findRootElementsByType } from 'src/utils/ElementUtil';

import {
  find,
  isArray,
  isString,
  isUndefined
} from 'min-dash';

const modules = [
  CoreModule,
  ElementTemplatesModule,
  ModelingModule,
  PropertiesPanelCommandsModule,
  {
    propertiesPanel: [ 'value', { registerProvider() {} } ]
  }
];

const moddleExtensions = {
  camunda: camundaModdlePackage
};


describe('element-templates - ChangeElementTemplateHandler', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  function bootstrap(diagramXML) {
    return bootstrapModeler(diagramXML, {
      container,
      modules,
      moddleExtensions
    });
  }


  describe('change template (new template specified)', function() {

    describe('update camunda:modelerTemplate and camunda:modelerTemplateVersion', function() {

      beforeEach(bootstrap(require('./task.bpmn').default));

      const newTemplate = require('./task-template-1.json');


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

        beforeEach(bootstrap(require('./sequence-flow.bpmn').default));

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

        beforeEach(bootstrap(require('./task.bpmn').default));

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

        beforeEach(bootstrap(require('./service-task.bpmn').default));

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

        beforeEach(bootstrap(require('./task.bpmn').default));

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
          expect(executionListeners).to.jsonEqual([ {
            $type: 'camunda:ExecutionListener',
            event: 'start',
            script: {
              $type: 'camunda:Script',
              scriptFormat: 'foo',
              value: 'bar'
            }
          } ]);
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
          expect(executionListeners).to.jsonEqual([ {
            $type: 'camunda:ExecutionListener',
            event: 'start',
            script: {
              $type: 'camunda:Script',
              scriptFormat: 'foo',
              value: 'bar'
            }
          } ]);
        }));

      });


      describe('camunda:ExecutionListener not specified', function() {

        beforeEach(bootstrap(require('./task-execution-listener.bpmn').default));

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

        beforeEach(bootstrap(require('./service-task.bpmn').default));

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

        beforeEach(bootstrap(require('./service-task-field.bpmn').default));

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

        beforeEach(bootstrap(require('./call-activity.bpmn').default));

        var newTemplate = require('./call-activity-template-1.json');


        it('execute', inject(function(elementRegistry) {

          // given
          var callActivity = elementRegistry.get('CallActivity_1');

          // when
          changeTemplate(callActivity, newTemplate);

          // then
          expectElementTemplate(callActivity, 'call-activity-template', 1);

          var insAndOuts = findExtensions(callActivity, [ 'camunda:In', 'camunda:Out' ]);

          expect(insAndOuts).to.have.length(13);
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
              local: true,
              source: '${in-3-value}',
              target: 'in-3-target'
            },
            {
              $type: 'camunda:In',
              local: true,
              sourceExpression: '${in-4-value}',
              target: 'in-4-target'
            },
            {
              $type: 'camunda:Out',
              local: true,
              source: 'out-3-source',
              target: 'out-3-value'
            },
            {
              $type: 'camunda:Out',
              local: true,
              sourceExpression: '${ out-4-source-expression }',
              target: 'out-4-value'
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
              local: true,
              variables: 'all'
            },
            {
              $type: 'camunda:Out',
              local: true,
              variables: 'all'
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

          expect(insAndOuts).to.have.length(13);
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
              local: true,
              source: '${in-3-value}',
              target: 'in-3-target'
            },
            {
              $type: 'camunda:In',
              local: true,
              sourceExpression: '${in-4-value}',
              target: 'in-4-target'
            },
            {
              $type: 'camunda:Out',
              local: true,
              source: 'out-3-source',
              target: 'out-3-value'
            },
            {
              $type: 'camunda:Out',
              local: true,
              sourceExpression: '${ out-4-source-expression }',
              target: 'out-4-value'
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
              local: true,
              variables: 'all'
            },
            {
              $type: 'camunda:Out',
              local: true,
              variables: 'all'
            },
            {
              $type: 'camunda:In',
              businessKey: '${in-business-key-value}'
            }
          ]);
        }));

      });


      describe('camunda:In and camunda:Out not specified', function() {

        beforeEach(bootstrap(require('./call-activity-ins-and-outs.bpmn').default));

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

        beforeEach(bootstrap(require('./task.bpmn').default));

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
          expect(inputOutput.get('camunda:inputParameters')).to.have.length(2);
          expect(inputOutput.get('camunda:outputParameters')).to.have.length(2);

          expect(inputOutput.get('camunda:inputParameters')).to.jsonEqual([
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

          expect(inputOutput.get('camunda:outputParameters')).to.jsonEqual([
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
          expect(inputOutput.get('camunda:inputParameters')).to.have.length(2);
          expect(inputOutput.get('camunda:outputParameters')).to.have.length(2);

          expect(inputOutput.get('camunda:inputParameters')).to.jsonEqual([
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

          expect(inputOutput.get('camunda:outputParameters')).to.jsonEqual([
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

        beforeEach(bootstrap(require('./task-input-output.bpmn').default));

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

        beforeEach(bootstrap(require('./task.bpmn').default));

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
          expect(properties.values).to.jsonEqual([ {
            $type: 'camunda:Property',
            name: 'foo',
            value: 'bar'
          } ]);
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
          expect(properties.values).to.jsonEqual([ {
            $type: 'camunda:Property',
            name: 'foo',
            value: 'bar'
          } ]);
        }));

      });


      describe('camunda:Property not specified', function() {

        beforeEach(bootstrap(require('./task-property.bpmn').default));

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
          expect(properties.values).to.jsonEqual([ {
            $type: 'camunda:Property',
            name: 'foo',
            value: 'bar'
          } ]);
        }));

      });

    });


    describe('update camunda:ErrorEventDefinition', function() {

      describe('camunda:ErrorEventDefinition specified', function() {

        beforeEach(bootstrap(require('./service-task.bpmn').default));

        var newTemplate = require('./error-template-1.json');


        it('execute', inject(function(elementRegistry) {

          // given
          var task = elementRegistry.get('ServiceTask_1');

          // when
          changeTemplate(task, newTemplate);

          // then
          expectElementTemplate(task, 'error-template', 1);

          var errorEventDefinition = findCamundaErrorEventDefinition(task, 'Error_1'),
              error = errorEventDefinition.errorRef;

          expect(errorEventDefinition).to.exist;
          expect(errorEventDefinition.get('expression')).to.eql('expression-value');

          expect(error).to.exist;
          expect(error.get('name')).to.equal('error-name');
        }));


        it('undo', inject(function(elementRegistry, commandStack) {

          // given
          var task = elementRegistry.get('ServiceTask_1');

          changeTemplate(task, newTemplate);

          // when
          commandStack.undo();

          // then
          expectNoElementTemplate(task);

          var errorEventDefinition = findCamundaErrorEventDefinition(task, 'Error_1');

          expect(errorEventDefinition).to.not.exist;
        }));


        it('redo', inject(function(elementRegistry, commandStack) {

          // given
          var task = elementRegistry.get('ServiceTask_1');

          changeTemplate(task, newTemplate);

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expectElementTemplate(task, 'error-template', 1);

          var errorEventDefinition = findCamundaErrorEventDefinition(task, 'Error_1'),
              error = errorEventDefinition.errorRef;


          expect(errorEventDefinition).to.exist;
          expect(errorEventDefinition.get('expression')).to.eql('expression-value');

          expect(error).to.exist;
          expect(error.get('name')).to.equal('error-name');
        }));

      });


      describe('camunda:ErrorEventDefinition not specified', function() {

        beforeEach(bootstrap(require('./service-task-error.bpmn').default));

        var newTemplate = require('./task-template-no-properties.json');


        it('should not override existing', inject(function(elementRegistry) {

          // given
          var task = elementRegistry.get('ServiceTask_1');

          // when
          changeTemplate(task, newTemplate);

          // then
          expectElementTemplate(task, 'task-template-no-properties');

          var errorEventDefinition = findCamundaErrorEventDefinition(task, 'fooError'),
              error = errorEventDefinition.errorRef;

          expect(errorEventDefinition).to.exist;
          expect(errorEventDefinition.get('expression')).to.eql('error-expression');

          expect(error).to.exist;
          expect(error.get('name')).to.equal('error-name');
        }));

      });

    });


    describe('update scope elements', function() {

      describe('camunda:Connector', function() {

        describe('camunda:Connector specified (legacy)', function() {

          beforeEach(bootstrap(require('./service-task.bpmn').default));

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

            expect(inputOutput.inputParameters).to.jsonEqual([ {
              $type: 'camunda:InputParameter',
              name: 'input-1-name',
              value: 'input-1-value'
            } ]);

            expect(inputOutput.outputParameters).to.jsonEqual([ {
              $type: 'camunda:OutputParameter',
              name: 'output-1-value',
              value: 'output-1-source'
            } ]);
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

            expect(inputOutput.inputParameters).to.jsonEqual([ {
              $type: 'camunda:InputParameter',
              name: 'input-1-name',
              value: 'input-1-value'
            } ]);

            expect(inputOutput.outputParameters).to.jsonEqual([ {
              $type: 'camunda:OutputParameter',
              name: 'output-1-value',
              value: 'output-1-source'
            } ]);
          }));

        });


        describe('camunda:Connector specified', function() {

          beforeEach(bootstrap(require('./service-task.bpmn').default));

          var newTemplate = require('./service-task-connector-template-1.json');


          it('execute', inject(function(elementRegistry) {

            // given
            var serviceTask = elementRegistry.get('ServiceTask_1');

            // when
            changeTemplate(serviceTask, newTemplate);

            // then
            expectElementTemplate(serviceTask, 'service-task-template-connector', 1);

            var connector = findExtension(serviceTask, 'camunda:Connector');

            expect(connector).to.exist;
            expect(connector.get('connectorId')).to.equal('foo');

            var inputOutput = connector.get('inputOutput');

            expect(inputOutput).to.exist;

            expect(inputOutput.inputParameters).to.jsonEqual([ {
              $type: 'camunda:InputParameter',
              name: 'input-1-name',
              value: 'input-1-value'
            } ]);

            expect(inputOutput.outputParameters).to.jsonEqual([ {
              $type: 'camunda:OutputParameter',
              name: 'output-1-value',
              value: 'output-1-source'
            } ]);
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
            expectElementTemplate(serviceTask, 'service-task-template-connector', 1);

            var connector = findExtension(serviceTask, 'camunda:Connector');

            expect(connector).to.exist;
            expect(connector.get('connectorId')).to.equal('foo');

            var inputOutput = connector.get('inputOutput');

            expect(inputOutput).to.exist;

            expect(inputOutput.inputParameters).to.jsonEqual([ {
              $type: 'camunda:InputParameter',
              name: 'input-1-name',
              value: 'input-1-value'
            } ]);

            expect(inputOutput.outputParameters).to.jsonEqual([ {
              $type: 'camunda:OutputParameter',
              name: 'output-1-value',
              value: 'output-1-source'
            } ]);
          }));

        });


        describe('camunda:Connector not specified', function() {

          beforeEach(bootstrap(require('./service-task-connector.bpmn').default));

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

            expect(inputOutput.inputParameters).to.jsonEqual([ {
              $type: 'camunda:InputParameter',
              name: 'input-1-name',
              value: 'input-1-value'
            } ]);

            expect(inputOutput.outputParameters).to.jsonEqual([ {
              $type: 'camunda:OutputParameter',
              name: 'output-1-name',
              value: 'output-1-value'
            } ]);
          }));

        });

      });


      describe('bpmn:Error', function() {

        describe('bpmn:Error specified', function() {

          beforeEach(bootstrap(require('./service-task.bpmn').default));

          var newTemplate = require('./error-template-1.json');

          it('execute', inject(function(elementRegistry) {

            // given
            var serviceTask = elementRegistry.get('ServiceTask_1'),
                businessObject = getBusinessObject(serviceTask);

            // when
            changeTemplate(serviceTask, newTemplate);

            // then
            expectElementTemplate(serviceTask, 'error-template', 1);

            var errors = findRootElementsByType(businessObject, 'bpmn:Error'),
                error = errors[0];

            expect(errors).to.have.length(1);

            expect(error).to.exist;
            expect(error.get('errorMessage')).to.equal('error-message');
            expect(error.get('errorCode')).to.equal('error-code');
            expect(error.get('name')).to.equal('error-name');
          }));


          it('undo', inject(function(elementRegistry, commandStack) {

            // given
            var serviceTask = elementRegistry.get('ServiceTask_1'),
                businessObject = getBusinessObject(serviceTask);

            changeTemplate(serviceTask, newTemplate);

            // when
            commandStack.undo();

            expectNoElementTemplate(serviceTask);

            var error = findRootElementsByType(businessObject, 'bpmn:Error')[0];

            expect(error).to.not.exist;
          }));


          it('redo', inject(function(elementRegistry, commandStack) {

            // given
            var serviceTask = elementRegistry.get('ServiceTask_1'),
                businessObject = getBusinessObject(serviceTask);

            changeTemplate(serviceTask, newTemplate);

            // when
            commandStack.undo();
            commandStack.redo();

            // then
            expectElementTemplate(serviceTask, 'error-template', 1);

            var errors = findRootElementsByType(businessObject, 'bpmn:Error'),
                error = errors[0];

            expect(errors).to.have.length(1);

            expect(error).to.exist;
            expect(error.get('errorMessage')).to.eql('error-message');
            expect(error.get('errorCode')).to.eql('error-code');
            expect(error.get('name')).to.eql('error-name');
          }));

        });


        describe('bpmn:Error not specified', function() {

          beforeEach(bootstrap(require('./service-task-error.bpmn').default));

          var newTemplate = require('./service-task-template-no-properties.json');


          it('should not override existing', inject(function(elementRegistry) {

            // given
            var serviceTask = elementRegistry.get('ServiceTask_1');

            // when
            changeTemplate(serviceTask, newTemplate);

            // then
            expectElementTemplate(serviceTask, 'service-task-template-no-properties');

            var error = findErrorForEventDefinition(serviceTask, 'fooError');

            expect(error).to.exist;
            expect(error.get('name')).to.equal('error-name');
            expect(error.get('errorMessage')).to.equal('error-message');
            expect(error.get('errorCode')).to.equal('error-code');
          }));

        });

      });

    });

  });


  describe('change template (new and old template specified)', function() {

    describe('update camunda:modelerTemplate and camunda:modelerTemplateVersion', function() {

      beforeEach(bootstrap(require('./task-template.bpmn').default));

      var newTemplate = require('./task-template-2.json');


      it('execute', inject(function(elementRegistry) {

        // given
        var task = elementRegistry.get('Task_1');

        // when
        changeTemplate(task, newTemplate);

        // then
        expectElementTemplate(task, 'task-template', 2);
      }));

    });


    describe('update properties', function() {

      describe('update bpmn:conditionExpression', function() {

        beforeEach(bootstrap(require('./sequence-flow.bpmn').default));


        it('property changed', inject(function(elementRegistry) {

          // given
          var sequenceFlow = elementRegistry.get('SequenceFlow_1'),
              businessObject = getBusinessObject(sequenceFlow);

          var oldTemplate = createTemplate({
            value: '${foo}',
            binding: {
              type: 'property',
              name: 'conditionExpression',
              scriptFormat: 'fooScript'
            }
          });

          var newTemplate = createTemplate({
            value: '${bar}',
            binding: {
              type: 'property',
              name: 'conditionExpression',
              scriptFormat: 'barScript'
            }
          });

          changeTemplate('SequenceFlow_1', oldTemplate);

          var conditionExpression = businessObject.get('bpmn:conditionExpression');

          updateBusinessObject('SequenceFlow_1', conditionExpression, {
            'bpmn:body': '${baz}',
            'bpmn:language': 'bazScript'
          });

          // when
          changeTemplate(sequenceFlow, newTemplate, oldTemplate);

          // then
          conditionExpression = businessObject.get('bpmn:conditionExpression');

          expect(conditionExpression).to.exist;
          expect(conditionExpression.$instanceOf('bpmn:FormalExpression')).to.be.true;
          expect(conditionExpression.get('bpmn:body')).to.equal('${baz}');
          expect(conditionExpression.get('bpmn:language')).to.equal('bazScript');
        }));


        it('property unchanged', inject(function(elementRegistry) {

          // given
          var sequenceFlow = elementRegistry.get('SequenceFlow_1'),
              businessObject = getBusinessObject(sequenceFlow);

          var oldTemplate = createTemplate({
            value: '${foo}',
            binding: {
              type: 'property',
              name: 'conditionExpression',
              scriptFormat: 'fooScript'
            }
          });

          var newTemplate = createTemplate({
            value: '${bar}',
            binding: {
              type: 'property',
              name: 'conditionExpression',
              scriptFormat: 'barScript'
            }
          });

          changeTemplate('SequenceFlow_1', oldTemplate);

          // when
          changeTemplate(sequenceFlow, newTemplate, oldTemplate);

          // then
          var conditionExpression = businessObject.get('bpmn:conditionExpression');

          expect(conditionExpression).to.exist;
          expect(conditionExpression.$instanceOf('bpmn:FormalExpression')).to.be.true;
          expect(conditionExpression.get('bpmn:body')).to.equal('${bar}');
          expect(conditionExpression.get('bpmn:language')).to.equal('barScript');
        }));

      });


      describe('update camunda:asyncBefore', function() {

        beforeEach(bootstrap(require('./task.bpmn').default));

        it('property changed', inject(function(elementRegistry) {

          // given
          var task = elementRegistry.get('Task_1'),
              businessObject = getBusinessObject(task);

          var oldTemplate = createTemplate({
            value: true,
            binding: {
              type: 'property',
              name: 'camunda:asyncBefore'
            }
          });

          var newTemplate = createTemplate({
            value: true,
            binding: {
              type: 'property',
              name: 'camunda:asyncBefore'
            }
          });

          changeTemplate('Task_1', oldTemplate);

          updateProperties('Task_1', { 'camunda:asyncBefore': false });

          // when
          changeTemplate(task, newTemplate, oldTemplate);

          // then
          var asyncBefore = businessObject.get('camunda:asyncBefore');

          expect(asyncBefore).to.be.false;
        }));


        it('property not changed', inject(function(elementRegistry) {

          // given
          var task = elementRegistry.get('Task_1'),
              businessObject = getBusinessObject(task);

          var oldTemplate = createTemplate({
            value: true,
            binding: {
              type: 'property',
              name: 'camunda:asyncBefore'
            }
          });

          var newTemplate = createTemplate({
            value: false,
            binding: {
              type: 'property',
              name: 'camunda:asyncBefore'
            }
          });

          changeTemplate('Task_1', oldTemplate);

          // when
          changeTemplate(task, newTemplate, oldTemplate);

          // then
          var asyncBefore = businessObject.get('camunda:asyncBefore');

          expect(asyncBefore).to.be.false;
        }));

      });


      describe('update camunda:expression', function() {

        beforeEach(bootstrap(require('./service-task.bpmn').default));


        it('property changed', inject(function(elementRegistry) {

          // given
          var serviceTask = elementRegistry.get('ServiceTask_1'),
              businessObject = getBusinessObject(serviceTask);

          var oldTemplate = createTemplate({
            value: '${foo}',
            binding: {
              type: 'property',
              name: 'camunda:expression'
            }
          });

          var newTemplate = createTemplate({
            value: '${bar}',
            binding: {
              type: 'property',
              name: 'camunda:expression'
            }
          });

          changeTemplate('ServiceTask_1', oldTemplate);

          updateProperties('ServiceTask_1', { 'camunda:expression': '${baz}' });

          // when
          changeTemplate(serviceTask, newTemplate, oldTemplate);

          // then
          var expression = businessObject.get('camunda:expression');

          expect(expression).to.equal('${baz}');
        }));


        it('property not changed', inject(function(elementRegistry) {

          // given
          var serviceTask = elementRegistry.get('ServiceTask_1'),
              businessObject = getBusinessObject(serviceTask);

          var oldTemplate = createTemplate({
            value: '${foo}',
            binding: {
              type: 'property',
              name: 'camunda:expression'
            }
          });

          var newTemplate = createTemplate({
            value: '${bar}',
            binding: {
              type: 'property',
              name: 'camunda:expression'
            }
          });

          changeTemplate('ServiceTask_1', oldTemplate);

          // when
          changeTemplate(serviceTask, newTemplate, oldTemplate);

          // then
          var expression = businessObject.get('camunda:expression');

          expect(expression).to.equal('${bar}');
        }));

      });

    });


    describe('update camunda:ExecutionListener', function() {

      beforeEach(bootstrap(require('./task.bpmn').default));

      // We assume that execution listeners cannot be edited through the properties panel and
      // therefore can always be overridden
      it('should always override', inject(function(elementRegistry) {

        // given
        var task = elementRegistry.get('Task_1');

        var oldTemplate = createTemplate({
          value: 'bar',
          binding: {
            type: 'camunda:executionListener',
            event: 'start',
            scriptFormat: 'foo'
          }
        });

        var newTemplate = createTemplate({
          value: 'baz',
          binding: {
            type: 'camunda:executionListener',
            event: 'start',
            scriptFormat: 'foo'
          }
        });

        changeTemplate('Task_1', oldTemplate);

        // when
        changeTemplate(task, newTemplate, oldTemplate);

        // then
        var executionListeners = findExtensions(task, [ 'camunda:ExecutionListener' ]);

        expect(executionListeners).to.have.length(1);
        expect(executionListeners).to.jsonEqual([ {
          $type: 'camunda:ExecutionListener',
          event: 'start',
          script: {
            $type: 'camunda:Script',
            scriptFormat: 'foo',
            value: 'baz'
          }
        } ]);
      }));

    });


    describe('update camunda:Field', function() {

      beforeEach(bootstrap(require('./service-task.bpmn').default));


      it('property changed', inject(function(elementRegistry) {

        // given
        var serviceTask = elementRegistry.get('ServiceTask_1');

        var oldTemplate = createTemplate({
          value: 'foo',
          binding: {
            type: 'camunda:field',
            name: 'foo'
          }
        });

        var newTemplate = createTemplate({
          value: 'bar',
          binding: {
            type: 'camunda:field',
            name: 'foo'
          }
        });

        changeTemplate('ServiceTask_1', oldTemplate);

        var field = findExtensions(serviceTask, [ 'camunda:Field' ])[ 0 ];

        updateBusinessObject('ServiceTask_1', field, {
          string: 'baz'
        });

        // when
        changeTemplate(serviceTask, newTemplate, oldTemplate);

        // then
        var fields = findExtensions(serviceTask, [ 'camunda:Field' ]);

        expect(fields).to.have.length(1);
        expect(fields).to.jsonEqual([ {
          $type: 'camunda:Field',
          string: 'baz',
          name: 'foo'
        } ]);
      }));


      it('property unchanged', inject(function(elementRegistry) {

        // given
        var serviceTask = elementRegistry.get('ServiceTask_1');

        var oldTemplate = createTemplate({
          value: 'foo',
          binding: {
            type: 'camunda:field',
            name: 'foo'
          }
        });

        var newTemplate = createTemplate({
          value: 'bar',
          binding: {
            type: 'camunda:field',
            name: 'foo'
          }
        });

        changeTemplate('ServiceTask_1', oldTemplate);

        // when
        changeTemplate(serviceTask, newTemplate, oldTemplate);

        // then
        var fields = findExtensions(serviceTask, [ 'camunda:Field' ]);

        expect(fields).to.have.length(1);
        expect(fields).to.jsonEqual([ {
          $type: 'camunda:Field',
          string: 'bar',
          name: 'foo'
        } ]);
      }));


      it('complex', inject(function(elementRegistry) {

        // given
        var serviceTask = elementRegistry.get('ServiceTask_1');

        var oldTemplate = createTemplate([
          {
            value: 'field-1-old-value',
            binding: {
              type: 'camunda:field',
              name: 'field-1-name'
            }
          },
          {
            value: 'field-2-old-value',
            binding: {
              type: 'camunda:field',
              name: 'field-2-name'
            }
          },
          {
            value: 'field-3-old-value',
            binding: {
              type: 'camunda:field',
              name: 'field-3-name'
            }
          },
          {
            value: 'field-4-value',
            binding: {
              type: 'camunda:field',
              name: 'field-4-name'
            }
          }
        ]);

        var newTemplate = createTemplate([
          {
            value: 'field-1-new-value',
            binding: {
              type: 'camunda:field',
              name: 'field-1-name'
            }
          },
          {
            value: 'field-2-new-value',
            binding: {
              type: 'camunda:field',
              name: 'field-2-name'
            }
          },
          {
            value: 'field-3-new-value',
            binding: {
              type: 'camunda:field',
              name: 'field-3-name'
            }
          },
          {
            value: 'field-5-value',
            binding: {
              type: 'camunda:field',
              name: 'field-5-name'
            }
          }
        ]);

        changeTemplate('ServiceTask_1', oldTemplate);

        expect(findExtensions(serviceTask, [ 'camunda:Field' ])).to.have.length(4);

        var field1 = find(findExtensions(serviceTask, [ 'camunda:Field' ]), function(field) {
          return field.get('camunda:name') === 'field-1-name';
        });

        updateBusinessObject('ServiceTask_1', field1, {
          string: 'field-1-value-changed'
        });

        var field2 = find(findExtensions(serviceTask, [ 'camunda:Field' ]), function(field) {
          return field.get('camunda:name') === 'field-2-name';
        });

        updateBusinessObject('ServiceTask_1', field2, {
          name: 'field-2-name-changed',
          string: 'field-2-value-changed'
        });

        // when
        changeTemplate(serviceTask, newTemplate, oldTemplate);

        // then
        var fields = findExtensions(serviceTask, [ 'camunda:Field' ]);

        expect(fields).to.have.length(4);

        // Expect 1st field not to have been overridden because it's value was changed
        // Expect 2nd field to have been removed because it couldn't be identified after its name was changed
        // Expect 3rd field to have been overridden because its value wasn't changed
        // Expect 4th field to have been removed because it was removed from template
        // Expect 5th field to have been added because it was added to template
        expect(fields).to.jsonEqual([
          {
            $type: 'camunda:Field',
            string: 'field-1-value-changed',
            name: 'field-1-name'
          },
          {
            $type: 'camunda:Field',
            string: 'field-3-new-value',
            name: 'field-3-name'
          },
          {
            $type: 'camunda:Field',
            string: 'field-2-new-value',
            name: 'field-2-name'
          },
          {
            $type: 'camunda:Field',
            string: 'field-5-value',
            name: 'field-5-name'
          }
        ]);
      }));

    });


    describe('update camunda:In and camunda:Out', function() {

      beforeEach(bootstrap(require('./call-activity.bpmn').default));


      describe('bpmn:CallActivity', function() {

        it('property changed', inject(function(elementRegistry) {

          // given
          var callActivity = elementRegistry.get('CallActivity_1');

          var oldTemplate = createTemplate([
            {
              value: 'in-1-old-value',
              binding: {
                type: 'camunda:in',
                target: 'in-1-target'
              }
            },
            {
              value: 'out-1-old-value',
              binding: {
                type: 'camunda:out',
                source: 'out-1-source'
              }
            }
          ]);

          var newTemplate = createTemplate([
            {
              value: 'in-1-new-value',
              binding: {
                type: 'camunda:in',
                target: 'in-1-target'
              }
            },
            {
              value: 'out-1-new-value',
              binding: {
                type: 'camunda:out',
                source: 'out-1-source'
              }
            }
          ]);

          changeTemplate('CallActivity_1', oldTemplate);

          var camundaIn = findExtensions(callActivity, [ 'camunda:In' ])[ 0 ];

          updateBusinessObject('CallActivity_1', camundaIn, {
            source: 'in-1-changed-value'
          });

          var camundaOut = findExtensions(callActivity, [ 'camunda:Out' ])[ 0 ];

          updateBusinessObject('CallActivity_1', camundaOut, {
            target: 'out-1-changed-value'
          });

          // when
          changeTemplate(callActivity, newTemplate, oldTemplate);

          // then
          var insAndOuts = findExtensions(callActivity, [ 'camunda:In', 'camunda:Out' ]);

          expect(insAndOuts).to.have.length(2);
          expect(insAndOuts).to.jsonEqual([
            {
              $type: 'camunda:In',
              target: 'in-1-target',
              source: 'in-1-changed-value'
            },
            {
              $type: 'camunda:Out',
              target: 'out-1-changed-value',
              source: 'out-1-source'
            }
          ]);
        }));


        it('property unchanged', inject(function(elementRegistry) {

          // given
          var callActivity = elementRegistry.get('CallActivity_1');

          var oldTemplate = createTemplate([
            {
              value: 'in-1-old-value',
              binding: {
                type: 'camunda:in',
                target: 'in-1-target'
              }
            },
            {
              value: 'out-1-old-value',
              binding: {
                type: 'camunda:out',
                source: 'out-1-source'
              }
            }
          ]);

          var newTemplate = createTemplate([
            {
              value: 'in-1-new-value',
              binding: {
                type: 'camunda:in',
                target: 'in-1-target'
              }
            },
            {
              value: 'out-1-new-value',
              binding: {
                type: 'camunda:out',
                source: 'out-1-source'
              }
            }
          ]);

          changeTemplate('CallActivity_1', oldTemplate);

          // when
          changeTemplate(callActivity, newTemplate, oldTemplate);

          // then
          var insAndOuts = findExtensions(callActivity, [ 'camunda:In', 'camunda:Out' ]);

          expect(insAndOuts).to.have.length(2);
          expect(insAndOuts).to.jsonEqual([
            {
              $type: 'camunda:In',
              target: 'in-1-target',
              source: 'in-1-new-value'
            },
            {
              $type: 'camunda:Out',
              target: 'out-1-new-value',
              source: 'out-1-source'
            }
          ]);
        }));


        it('complex', inject(function(elementRegistry) {

          // given
          var callActivity = elementRegistry.get('CallActivity_1');

          var oldTemplate = createTemplate([
            {
              value: 'in-1-old-value',
              binding: {
                type: 'camunda:in',
                target: 'in-1-target'
              }
            },
            {
              value: 'in-2-old-value',
              binding: {
                type: 'camunda:in',
                target: 'in-2-target'
              }
            },
            {
              binding: {
                type: 'camunda:in',
                variables: 'all'
              }
            },
            {
              value: '${in-old-business-key-value}',
              binding: {
                type: 'camunda:in:businessKey'
              }
            }
          ]);

          var newTemplate = createTemplate([
            {
              value: '${in-1-new-value}',
              binding: {
                type: 'camunda:in',
                target: 'in-1-target',
                expression: true
              }
            },
            {
              value: 'in-2-new-value',
              binding: {
                type: 'camunda:in',
                target: 'in-2-target',
                local: true
              }
            },
            {
              value: '${in-new-business-key-value}',
              binding: {
                type: 'camunda:in:businessKey'
              }
            }
          ]);

          changeTemplate('CallActivity_1', oldTemplate);

          var camundaIn = findExtensions(callActivity, [ 'camunda:In' ])[ 0 ];

          updateBusinessObject('CallActivity_1', camundaIn, {
            source: 'in-1-changed-value'
          });

          // when
          changeTemplate(callActivity, newTemplate, oldTemplate);

          // then
          var insAndOuts = findExtensions(callActivity, [ 'camunda:In', 'camunda:Out' ]);

          expect(insAndOuts).to.have.length(3);

          // Expect 1st in to have been replaced due to change from source to source expression
          // Expect 2nd in to have been updated and its `camunda:local` property set to true
          // Expect variables=all in to have been removed
          // Expect business key in to have been overridden
          expect(insAndOuts).to.jsonEqual([
            {
              $type: 'camunda:In',
              target: 'in-2-target',
              source: 'in-2-new-value',
              local: true
            },
            {
              $type: 'camunda:In',
              businessKey: '${in-new-business-key-value}',
            },
            {
              $type: 'camunda:In',
              target: 'in-1-target',
              sourceExpression: '${in-1-new-value}'
            }
          ]);
        }));

      });


      describe('bpmn:SignalEventDefinition', function() {

        // Scope not yet supported
      });

    });


    describe('update camunda:InputParameter and camunda:OutputParameter', function() {

      beforeEach(bootstrap(require('./task.bpmn').default));


      it('property changed', inject(function(elementRegistry) {

        // given
        var task = elementRegistry.get('Task_1');

        var oldTemplate = createTemplate([
          {
            value: 'input-1-old-value',
            binding: {
              type: 'camunda:inputParameter',
              name: 'input-1-name'
            }
          },
          {
            value: 'output-1-old-value',
            binding: {
              type: 'camunda:outputParameter',
              source: 'output-1-source'
            }
          }
        ]);

        var newTemplate = createTemplate([
          {
            value: 'input-1-new-value',
            binding: {
              type: 'camunda:inputParameter',
              name: 'input-1-name'
            }
          },
          {
            value: 'output-1-new-value',
            binding: {
              type: 'camunda:outputParameter',
              source: 'output-1-source'
            }
          }
        ]);

        changeTemplate('Task_1', oldTemplate);

        var input = getInputParameter(task, 'input-1-name');

        updateBusinessObject('Task_1', input, {
          value: 'input-1-changed-value'
        });

        var output = getOutputParameter(task, 'output-1-source');

        updateBusinessObject('Task_1', output, {
          name: 'output-1-changed-value'
        });

        // when
        changeTemplate(task, newTemplate, oldTemplate);

        // then
        var inputOutput = findExtension(task, 'camunda:InputOutput');

        expect(inputOutput).to.exist;
        expect(inputOutput.get('camunda:inputParameters')).to.have.length(1);
        expect(inputOutput.get('camunda:outputParameters')).to.have.length(1);

        expect(inputOutput.get('camunda:inputParameters')).to.jsonEqual([
          {
            $type: 'camunda:InputParameter',
            name: 'input-1-name',
            value: 'input-1-changed-value'
          }
        ]);

        expect(inputOutput.get('camunda:outputParameters')).to.jsonEqual([
          {
            $type: 'camunda:OutputParameter',
            name: 'output-1-changed-value',
            value: 'output-1-source'
          }
        ]);
      }));


      it('property unchanged', inject(function(elementRegistry) {

        // given
        var task = elementRegistry.get('Task_1');

        var oldTemplate = createTemplate([
          {
            value: 'input-1-old-value',
            binding: {
              type: 'camunda:inputParameter',
              name: 'input-1-name'
            }
          },
          {
            value: 'output-1-old-value',
            binding: {
              type: 'camunda:outputParameter',
              source: 'output-1-source'
            }
          }
        ]);

        var newTemplate = createTemplate([
          {
            value: 'input-1-new-value',
            binding: {
              type: 'camunda:inputParameter',
              name: 'input-1-name'
            }
          },
          {
            value: 'output-1-new-value',
            binding: {
              type: 'camunda:outputParameter',
              source: 'output-1-source'
            }
          }
        ]);

        changeTemplate('Task_1', oldTemplate);

        // when
        changeTemplate(task, newTemplate, oldTemplate);

        // then
        var inputOutput = findExtension(task, 'camunda:InputOutput');

        expect(inputOutput).to.exist;
        expect(inputOutput.get('camunda:inputParameters')).to.have.length(1);
        expect(inputOutput.get('camunda:outputParameters')).to.have.length(1);

        expect(inputOutput.get('camunda:inputParameters')).to.jsonEqual([
          {
            $type: 'camunda:InputParameter',
            name: 'input-1-name',
            value: 'input-1-new-value'
          }
        ]);

        expect(inputOutput.get('camunda:outputParameters')).to.jsonEqual([
          {
            $type: 'camunda:OutputParameter',
            name: 'output-1-new-value',
            value: 'output-1-source'
          }
        ]);
      }));


      it('complex', inject(function(elementRegistry) {

        // given
        var task = elementRegistry.get('Task_1');

        var oldTemplate = createTemplate([
          {
            value: '${input-1-old-value}',
            binding: {
              type: 'camunda:inputParameter',
              name: 'input-1-name',
              scriptFormat: 'foo'
            }
          },
          {
            value: 'output-1-old-value',
            binding: {
              type: 'camunda:outputParameter',
              source: '${output-1-source}',
              scriptFormat: 'foo'
            }
          },
          {
            value: 'input-2-old-value',
            binding: {
              type: 'camunda:inputParameter',
              name: 'input-2-name'
            }
          },
          {
            value: 'output-2-old-value',
            binding: {
              type: 'camunda:outputParameter',
              source: 'output-2-source'
            }
          },
          {
            value: 'input-3-old-value',
            binding: {
              type: 'camunda:inputParameter',
              name: 'input-3-name'
            }
          },
          {
            value: 'output-3-old-value',
            binding: {
              type: 'camunda:outputParameter',
              source: 'output-3-source'
            }
          }
        ]);

        var newTemplate = createTemplate([
          {
            value: '${input-1-new-value}',
            binding: {
              type: 'camunda:inputParameter',
              name: 'input-1-name',
              scriptFormat: 'foo'
            }
          },
          {
            value: 'output-1-new-value',
            binding: {
              type: 'camunda:outputParameter',
              source: '${output-1-source}',
              scriptFormat: 'foo'
            }
          },
          {
            value: '${input-2-new-value}',
            binding: {
              type: 'camunda:inputParameter',
              name: 'input-2-name',
              scriptFormat: 'foo'
            }
          },
          {
            value: 'output-2-new-value',
            binding: {
              type: 'camunda:outputParameter',
              source: '${output-2-source}',
              scriptFormat: 'foo'
            }
          },
          {
            value: 'input-4-new-value',
            binding: {
              type: 'camunda:inputParameter',
              name: 'input-4-name'
            }
          },
          {
            value: 'output-4-new-value',
            binding: {
              type: 'camunda:outputParameter',
              source: 'output-4-source'
            }
          }
        ]);

        changeTemplate('Task_1', oldTemplate);

        var input1 = getInputParameter(task, 'input-1-name');

        updateBusinessObject('Task_1', input1.get('camunda:definition'), {
          value: '${input-1-changed-value}'
        });

        var output1 = getOutputParameter(task, '${output-1-source}');

        updateBusinessObject('Task_1', output1, {
          name: 'output-1-changed-value'
        });

        var input2 = getInputParameter(task, 'input-2-name');

        updateBusinessObject('Task_1', input2, {
          value: '${input-2-changed-value}'
        });

        var output2 = getOutputParameter(task, 'output-2-source');

        updateBusinessObject('Task_1', output2, {
          name: 'output-2-changed-value'
        });

        // when
        changeTemplate(task, newTemplate, oldTemplate);

        // then
        var inputOutput = findExtension(task, 'camunda:InputOutput');

        expect(inputOutput).to.exist;
        expect(inputOutput.get('camunda:inputParameters')).to.have.length(3);
        expect(inputOutput.get('camunda:outputParameters')).to.have.length(3);

        // Expect 1st input to not have been overridden because it was changed
        // Expect 2nd input to have been removed because property changed to script
        // Expect 3rd input to have been removed
        // Expect 4th input to have been added
        expect(inputOutput.get('camunda:inputParameters')).to.jsonEqual([
          {
            $type: 'camunda:InputParameter',
            name: 'input-1-name',
            definition: {
              $type: 'camunda:Script',
              scriptFormat: 'foo',
              value: '${input-1-changed-value}'
            }
          },
          {
            $type: 'camunda:InputParameter',
            name: 'input-2-name',
            definition: {
              $type: 'camunda:Script',
              scriptFormat: 'foo',
              value: '${input-2-new-value}'
            }
          },
          {
            $type: 'camunda:InputParameter',
            name: 'input-4-name',
            value: 'input-4-new-value'
          }
        ]);

        // Expect 1st output to not have been overridden because it was changed
        // Expect 2nd output to have been removed because property changed to script
        // Expect 3rd output to have been removed
        // Expect 4th output to have been added
        expect(inputOutput.get('camunda:outputParameters')).to.jsonEqual([
          {
            $type: 'camunda:OutputParameter',
            name: 'output-1-changed-value',
            definition: {
              $type: 'camunda:Script',
              scriptFormat: 'foo',
              value: '${output-1-source}'
            }
          },
          {
            $type: 'camunda:OutputParameter',
            name: 'output-2-new-value',
            definition: {
              $type: 'camunda:Script',
              scriptFormat: 'foo',
              value: '${output-2-source}'
            }
          },
          {
            $type: 'camunda:OutputParameter',
            name: 'output-4-new-value',
            value: 'output-4-source'
          }
        ]);
      }));

    });


    describe('update camunda:Property', function() {

      beforeEach(bootstrap(require('./task.bpmn').default));


      it('property changed', inject(function(elementRegistry) {

        // given
        var task = elementRegistry.get('Task_1');

        var oldTemplate = createTemplate({
          value: 'property-1-old-value',
          binding: {
            type: 'camunda:property',
            name: 'property-1-name'
          }
        });

        var newTemplate = createTemplate({
          value: 'property-1-new-value',
          binding: {
            type: 'camunda:property',
            name: 'property-1-name'
          }
        });

        changeTemplate('Task_1', oldTemplate);

        var property = getCamundaProperty(task, 'property-1-name');

        updateBusinessObject('Task_1', property, {
          value: 'property-1-changed-value'
        });

        // when
        changeTemplate(task, newTemplate, oldTemplate);

        // then
        var properties = findExtensions(task, [ 'camunda:Properties' ])[ 0 ];

        expect(properties).to.exist;

        expect(properties.get('camunda:values')).to.have.length(1);
        expect(properties.get('camunda:values')).to.jsonEqual([ {
          $type: 'camunda:Property',
          name: 'property-1-name',
          value: 'property-1-changed-value'
        } ]);
      }));


      it('property unchanged', inject(function(elementRegistry) {

        // given
        var task = elementRegistry.get('Task_1');

        var oldTemplate = createTemplate({
          value: 'property-1-old-value',
          binding: {
            type: 'camunda:property',
            name: 'property-1-name'
          }
        });

        var newTemplate = createTemplate({
          value: 'property-1-new-value',
          binding: {
            type: 'camunda:property',
            name: 'property-1-name'
          }
        });

        changeTemplate('Task_1', oldTemplate);

        // when
        changeTemplate(task, newTemplate, oldTemplate);

        // then
        var properties = findExtensions(task, [ 'camunda:Properties' ])[ 0 ];

        expect(properties).to.exist;

        expect(properties.get('camunda:values')).to.have.length(1);
        expect(properties.get('camunda:values')).to.jsonEqual([ {
          $type: 'camunda:Property',
          name: 'property-1-name',
          value: 'property-1-new-value'
        } ]);
      }));


      it('complex', inject(function(elementRegistry) {

        // given
        var task = elementRegistry.get('Task_1');

        var oldTemplate = createTemplate([
          {
            value: 'property-1-old-value',
            binding: {
              type: 'camunda:property',
              name: 'property-1-name'
            }
          },
          {
            value: 'property-2-old-value',
            binding: {
              type: 'camunda:property',
              name: 'property-2-name'
            }
          },
          {
            value: 'property-3-old-value',
            binding: {
              type: 'camunda:property',
              name: 'property-3-name'
            }
          }
        ]);

        var newTemplate = createTemplate([
          {
            value: 'property-1-changed-value',
            binding: {
              type: 'camunda:property',
              name: 'property-1-name'
            }
          },
          {
            value: 'property-2-new-value',
            binding: {
              type: 'camunda:property',
              name: 'property-2-name'
            }
          },
          {
            value: 'property-4-new-value',
            binding: {
              type: 'camunda:property',
              name: 'property-4-name'
            }
          }
        ]);

        changeTemplate('Task_1', oldTemplate);

        var property = getCamundaProperty(task, 'property-1-name');

        updateBusinessObject('Task_1', property, {
          value: 'property-1-changed-value'
        });

        // when
        changeTemplate(task, newTemplate, oldTemplate);

        // then
        var properties = findExtensions(task, [ 'camunda:Properties' ])[ 0 ];

        expect(properties).to.exist;

        expect(properties.get('camunda:values')).to.have.length(3);

        // Expect 1st property not to have been updated because it was changed
        // Expect 2nd property to have been overridden because it was not changed
        // Expect 3rd property to have been removed
        // Expect 4th property to have been added
        expect(properties.get('camunda:values')).to.jsonEqual([
          {
            $type: 'camunda:Property',
            name: 'property-1-name',
            value: 'property-1-changed-value'
          },
          {
            $type: 'camunda:Property',
            name: 'property-2-name',
            value: 'property-2-new-value'
          },
          {
            $type: 'camunda:Property',
            name: 'property-4-name',
            value: 'property-4-new-value'
          }
        ]);
      }));

    });


    describe('update camunda:ErrorEventDefinition', function() {

      beforeEach(bootstrap(require('./service-task.bpmn').default));


      it('property changed', inject(function(elementRegistry) {

        // given
        var serviceTask = elementRegistry.get('ServiceTask_1');

        var oldTemplate = {
          properties: [
            {
              value: 'error-expression-old-value',
              binding: {
                type: 'camunda:errorEventDefinition',
                errorRef: 'error-1'
              }
            },
          ],
          scopes: [
            {
              id: 'error-1',
              type: 'bpmn:Error',
              properties: [
                {
                  value: 'error-code',
                  binding: {
                    type: 'property',
                    name: 'errorCode'
                  }
                },
                {
                  value: 'error-message',
                  binding: {
                    type: 'property',
                    name: 'camunda:errorMessage'
                  }
                },
                {
                  value: 'error-name',
                  binding: {
                    type: 'property',
                    name: 'name'
                  }
                }
              ]
            }
          ]
        };

        var newTemplate = {
          properties: [
            {
              value: 'error-expression-new-value',
              binding: {
                type: 'camunda:errorEventDefinition',
                errorRef: 'error-1'
              }
            },
          ],
          scopes: [
            {
              id: 'error-1',
              type: 'bpmn:Error',
              properties: [
                {
                  value: 'error-code',
                  binding: {
                    type: 'property',
                    name: 'errorCode'
                  }
                },
                {
                  value: 'error-message',
                  binding: {
                    type: 'property',
                    name: 'camunda:errorMessage'
                  }
                },
                {
                  value: 'error-name',
                  binding: {
                    type: 'property',
                    name: 'name'
                  }
                }
              ]
            }
          ]
        };

        changeTemplate(serviceTask, oldTemplate);

        var errorEventDefinition =
          findCamundaErrorEventDefinition(serviceTask, 'error-1');

        updateBusinessObject(serviceTask, errorEventDefinition, {
          expression: 'error-expression-updated-value'
        });

        // when
        changeTemplate(serviceTask, newTemplate, oldTemplate);

        errorEventDefinition =
          findCamundaErrorEventDefinition(serviceTask, 'error-1');

        // then
        expect(errorEventDefinition.expression).to.eql('error-expression-updated-value');
      }));


      it('should always create one Error only for each definition', inject(function(elementRegistry) {

        // given
        var serviceTask = elementRegistry.get('ServiceTask_1');

        var oldTemplate = {
          properties: [
            {
              value: 'error-expression-old-value',
              binding: {
                type: 'camunda:errorEventDefinition',
                errorRef: 'error-1'
              }
            },
          ],
          scopes: [
            {
              id: 'error-1',
              type: 'bpmn:Error',
              properties: [
                {
                  value: 'error-code',
                  binding: {
                    type: 'property',
                    name: 'errorCode'
                  }
                },
                {
                  value: 'error-message',
                  binding: {
                    type: 'property',
                    name: 'camunda:errorMessage'
                  }
                },
                {
                  value: 'error-name',
                  binding: {
                    type: 'property',
                    name: 'name'
                  }
                }
              ]
            }
          ]
        };

        var newTemplate = {
          properties: [
            {
              value: 'error-expression-new-value',
              binding: {
                type: 'camunda:errorEventDefinition',
                errorRef: 'error-1'
              }
            },
          ],
          scopes: [
            {
              id: 'error-1',
              type: 'bpmn:Error',
              properties: [
                {
                  value: 'error-code',
                  binding: {
                    type: 'property',
                    name: 'errorCode'
                  }
                },
                {
                  value: 'error-message',
                  binding: {
                    type: 'property',
                    name: 'camunda:errorMessage'
                  }
                },
                {
                  value: 'error-name',
                  binding: {
                    type: 'property',
                    name: 'name'
                  }
                }
              ]
            }
          ]
        };

        changeTemplate(serviceTask, oldTemplate);

        var errorEventDefinition =
          findCamundaErrorEventDefinition(serviceTask, 'error-1');

        updateBusinessObject(serviceTask, errorEventDefinition, {
          expression: 'error-expression-updated-value'
        });

        // when
        changeTemplate(serviceTask, newTemplate, oldTemplate);

        // then
        var errors = findRootElementsByType(getBusinessObject(serviceTask), 'bpmn:Error'),
            error = errors[0];

        expect(errors).to.have.length(1);

        expect(error).to.exist;
        expect(error.get('id').indexOf('Error_error-1')).to.equal(0); // start with binding error ref
        expect(error.get('errorCode')).to.equal('error-code');
        expect(error.get('name')).to.equal('error-name');
        expect(error.get('errorMessage')).to.eql('error-message');
      }));


      it('properties unchanged', inject(function(elementRegistry) {

        // given
        var serviceTask = elementRegistry.get('ServiceTask_1');

        var oldTemplate = {
          properties: [
            {
              value: 'error-expression-old-value',
              binding: {
                type: 'camunda:errorEventDefinition',
                errorRef: 'error-1'
              }
            },
          ],
          scopes: [
            {
              id: 'error-1',
              type: 'bpmn:Error',
              properties: [
                {
                  value: 'error-code',
                  binding: {
                    type: 'property',
                    name: 'errorCode'
                  }
                },
                {
                  value: 'error-message',
                  binding: {
                    type: 'property',
                    name: 'camunda:errorMessage'
                  }
                },
                {
                  value: 'error-name',
                  binding: {
                    type: 'property',
                    name: 'name'
                  }
                }
              ]
            }
          ]
        };

        var newTemplate = {
          properties: [
            {
              value: 'error-expression-new-value',
              binding: {
                type: 'camunda:errorEventDefinition',
                errorRef: 'error-1'
              }
            },
          ],
          scopes: [
            {
              id: 'error-1',
              type: 'bpmn:Error',
              properties: [
                {
                  value: 'error-code',
                  binding: {
                    type: 'property',
                    name: 'errorCode'
                  }
                },
                {
                  value: 'error-message',
                  binding: {
                    type: 'property',
                    name: 'camunda:errorMessage'
                  }
                },
                {
                  value: 'error-name',
                  binding: {
                    type: 'property',
                    name: 'name'
                  }
                }
              ]
            }
          ]
        };

        changeTemplate(serviceTask, oldTemplate);

        // when
        changeTemplate(serviceTask, newTemplate, oldTemplate);

        // then
        var errorEventDefinition = findCamundaErrorEventDefinition(serviceTask, 'error-1');

        expect(errorEventDefinition).to.exist;

        expect(errorEventDefinition.get('expression')).to.eql('error-expression-new-value');
      }));


      it('complex', inject(function(elementRegistry) {

        // given
        var serviceTask = elementRegistry.get('ServiceTask_1');

        var oldTemplate = {
          properties: [
            {
              value: 'error-expression-old-value-1',
              binding: {
                type: 'camunda:errorEventDefinition',
                errorRef: 'error-1'
              }
            },
            {
              value: 'error-expression-old-value-2',
              binding: {
                type: 'camunda:errorEventDefinition',
                errorRef: 'error-2'
              }
            },
            {
              value: 'error-expression-old-value-3',
              binding: {
                type: 'camunda:errorEventDefinition',
                errorRef: 'error-3'
              }
            }
          ],
          scopes: [
            {
              id: 'error-1',
              type: 'bpmn:Error',
              properties: []
            },
            {
              id: 'error-2',
              type: 'bpmn:Error',
              properties: []
            },
            {
              id: 'error-3',
              type: 'bpmn:Error',
              properties: []
            }
          ]
        };

        var newTemplate = {
          properties: [
            {
              value: 'error-expression-old-value-1',
              binding: {
                type: 'camunda:errorEventDefinition',
                errorRef: 'error-1'
              }
            },
            {
              value: 'error-expression-new-value-2',
              binding: {
                type: 'camunda:errorEventDefinition',
                errorRef: 'error-2'
              }
            },
            {
              value: 'error-expression-new-value-4',
              binding: {
                type: 'camunda:errorEventDefinition',
                errorRef: 'error-4'
              }
            }
          ],
          scopes: [
            {
              id: 'error-1',
              type: 'bpmn:Error',
              properties: []
            },
            {
              id: 'error-2',
              type: 'bpmn:Error',
              properties: []
            },
            {
              id: 'error-4',
              type: 'bpmn:Error',
              properties: []
            }
          ]
        };

        changeTemplate(serviceTask, oldTemplate);

        var errorEventDefinition = findCamundaErrorEventDefinition(serviceTask, 'error-1');

        updateBusinessObject(serviceTask, errorEventDefinition, {
          expression: 'error-expression-updated-value'
        });

        // when
        changeTemplate(serviceTask, newTemplate, oldTemplate);

        // then
        var errorEventDefinitions = findExtensions(serviceTask, [ 'camunda:ErrorEventDefinition' ]);

        expect(errorEventDefinitions).to.have.length(3);

        // Expect 1st definition not to have been overridden because it's value was changed
        // Expect 2nd definition to have been updated
        // Expect 3rd definition to have been removed because it was removed from template
        // Expect 4th definition to have been added because it was added to template
        expect(findCamundaErrorEventDefinition(serviceTask, 'error-1').expression)
          .to.equal('error-expression-updated-value');
        expect(findCamundaErrorEventDefinition(serviceTask, 'error-2').expression)
          .to.equal('error-expression-new-value-2');
        expect(findCamundaErrorEventDefinition(serviceTask, 'error-3')).to.not.exist;
        expect(findCamundaErrorEventDefinition(serviceTask, 'error-4')).to.exist;
      }));

    });


    describe('update scope elements', function() {

      describe('camunda:Connector (legacy)', function() {

        beforeEach(bootstrap(require('./service-task.bpmn').default));


        it('properties changed', inject(function(elementRegistry) {

          // given
          var serviceTask = elementRegistry.get('ServiceTask_1');

          var oldTemplate = {
            properties: [],
            scopes: {
              'camunda:Connector': {
                properties: [
                  {
                    value: 'input-1-old-value',
                    binding: {
                      type: 'camunda:inputParameter',
                      name: 'input-1-name'
                    }
                  },
                  {
                    value: 'output-1-old-value',
                    binding: {
                      type: 'camunda:outputParameter',
                      source: 'output-1-source'
                    }
                  }
                ]
              }
            }
          };

          var newTemplate = createTemplate([
            {
              value: 'input-1-new-value',
              binding: {
                type: 'camunda:inputParameter',
                name: 'input-1-name'
              }
            },
            {
              value: 'output-1-new-value',
              binding: {
                type: 'camunda:outputParameter',
                source: 'output-1-source'
              }
            }
          ], 'camunda:Connector');

          changeTemplate('ServiceTask_1', oldTemplate);

          var connector = findExtension(serviceTask, 'camunda:Connector');

          var input = getInputParameter(connector, 'input-1-name');

          updateBusinessObject(serviceTask, input, {
            value: 'input-1-changed-value'
          });

          var output = getOutputParameter(connector, 'output-1-source');

          updateBusinessObject(serviceTask, output, {
            name: 'output-1-changed-value'
          });

          // when
          changeTemplate(serviceTask, newTemplate, oldTemplate);

          // then
          connector = findExtension(serviceTask, 'camunda:Connector');

          expect(connector).to.exist;
          expect(connector).to.jsonEqual({
            $type: 'camunda:Connector',
            inputOutput: {
              $type: 'camunda:InputOutput',
              inputParameters: [
                {
                  $type: 'camunda:InputParameter',
                  name: 'input-1-name',
                  value: 'input-1-changed-value'
                }
              ],
              outputParameters: [
                {
                  $type: 'camunda:OutputParameter',
                  name: 'output-1-changed-value',
                  value: 'output-1-source'
                }
              ]
            }
          });
        }));


        it('properties unchanged', inject(function(elementRegistry) {

          // given
          var serviceTask = elementRegistry.get('ServiceTask_1');

          var oldTemplate = {
            properties: [],
            scopes: {
              'camunda:Connector': {
                properties: [
                  {
                    value: 'input-1-old-value',
                    binding: {
                      type: 'camunda:inputParameter',
                      name: 'input-1-name'
                    }
                  },
                  {
                    value: 'output-1-old-value',
                    binding: {
                      type: 'camunda:outputParameter',
                      source: 'output-1-source'
                    }
                  }
                ]
              }
            }
          };

          var newTemplate = createTemplate([
            {
              value: 'input-1-new-value',
              binding: {
                type: 'camunda:inputParameter',
                name: 'input-1-name'
              }
            },
            {
              value: 'output-1-new-value',
              binding: {
                type: 'camunda:outputParameter',
                source: 'output-1-source'
              }
            }
          ], 'camunda:Connector');

          changeTemplate('ServiceTask_1', oldTemplate);

          // when
          changeTemplate(serviceTask, newTemplate, oldTemplate);

          // then
          var connector = findExtension(serviceTask, 'camunda:Connector');

          expect(connector).to.exist;
          expect(connector).to.jsonEqual({
            $type: 'camunda:Connector',
            inputOutput: {
              $type: 'camunda:InputOutput',
              inputParameters: [
                {
                  $type: 'camunda:InputParameter',
                  name: 'input-1-name',
                  value: 'input-1-new-value'
                }
              ],
              outputParameters: [
                {
                  $type: 'camunda:OutputParameter',
                  name: 'output-1-new-value',
                  value: 'output-1-source'
                }
              ]
            }
          });
        }));

      });


      describe('camunda:Connector', function() {

        beforeEach(bootstrap(require('./service-task.bpmn').default));


        it('properties changed', inject(function(elementRegistry) {

          // given
          var serviceTask = elementRegistry.get('ServiceTask_1');

          var oldTemplate = createTemplate([
            {
              value: 'input-1-old-value',
              binding: {
                type: 'camunda:inputParameter',
                name: 'input-1-name'
              }
            },
            {
              value: 'output-1-old-value',
              binding: {
                type: 'camunda:outputParameter',
                source: 'output-1-source'
              }
            }
          ], 'camunda:Connector');

          var newTemplate = createTemplate([
            {
              value: 'input-1-new-value',
              binding: {
                type: 'camunda:inputParameter',
                name: 'input-1-name'
              }
            },
            {
              value: 'output-1-new-value',
              binding: {
                type: 'camunda:outputParameter',
                source: 'output-1-source'
              }
            }
          ], 'camunda:Connector');

          changeTemplate('ServiceTask_1', oldTemplate);

          var connector = findExtension(serviceTask, 'camunda:Connector');

          var input = getInputParameter(connector, 'input-1-name');

          updateBusinessObject(serviceTask, input, {
            value: 'input-1-changed-value'
          });

          var output = getOutputParameter(connector, 'output-1-source');

          updateBusinessObject(serviceTask, output, {
            name: 'output-1-changed-value'
          });

          // when
          changeTemplate(serviceTask, newTemplate, oldTemplate);

          // then
          connector = findExtension(serviceTask, 'camunda:Connector');

          expect(connector).to.exist;
          expect(connector).to.jsonEqual({
            $type: 'camunda:Connector',
            inputOutput: {
              $type: 'camunda:InputOutput',
              inputParameters: [
                {
                  $type: 'camunda:InputParameter',
                  name: 'input-1-name',
                  value: 'input-1-changed-value'
                }
              ],
              outputParameters: [
                {
                  $type: 'camunda:OutputParameter',
                  name: 'output-1-changed-value',
                  value: 'output-1-source'
                }
              ]
            }
          });
        }));


        it('properties unchanged', inject(function(elementRegistry) {

          // given
          var serviceTask = elementRegistry.get('ServiceTask_1');

          var oldTemplate = createTemplate([
            {
              value: 'input-1-old-value',
              binding: {
                type: 'camunda:inputParameter',
                name: 'input-1-name'
              }
            },
            {
              value: 'output-1-old-value',
              binding: {
                type: 'camunda:outputParameter',
                source: 'output-1-source'
              }
            }
          ], 'camunda:Connector');

          var newTemplate = createTemplate([
            {
              value: 'input-1-new-value',
              binding: {
                type: 'camunda:inputParameter',
                name: 'input-1-name'
              }
            },
            {
              value: 'output-1-new-value',
              binding: {
                type: 'camunda:outputParameter',
                source: 'output-1-source'
              }
            }
          ], 'camunda:Connector');

          changeTemplate('ServiceTask_1', oldTemplate);

          // when
          changeTemplate(serviceTask, newTemplate, oldTemplate);

          // then
          var connector = findExtension(serviceTask, 'camunda:Connector');

          expect(connector).to.exist;
          expect(connector).to.jsonEqual({
            $type: 'camunda:Connector',
            inputOutput: {
              $type: 'camunda:InputOutput',
              inputParameters: [
                {
                  $type: 'camunda:InputParameter',
                  name: 'input-1-name',
                  value: 'input-1-new-value'
                }
              ],
              outputParameters: [
                {
                  $type: 'camunda:OutputParameter',
                  name: 'output-1-new-value',
                  value: 'output-1-source'
                }
              ]
            }
          });
        }));

      });


      describe('bpmn:Error', function() {

        beforeEach(bootstrap(require('./service-task.bpmn').default));


        it('properties changed', inject(function(elementRegistry) {

          // given
          var serviceTask = elementRegistry.get('ServiceTask_1');

          var oldTemplate = {
            properties: [
              {
                value: 'error-expression',
                binding: {
                  type: 'camunda:errorEventDefinition',
                  errorRef: 'error-1'
                }
              },
            ],
            scopes: [
              {
                id: 'error-1',
                type: 'bpmn:Error',
                properties: [
                  {
                    value: 'error-code-old-value',
                    binding: {
                      type: 'property',
                      name: 'errorCode'
                    }
                  },
                  {
                    value: 'error-message-old-value',
                    binding: {
                      type: 'property',
                      name: 'camunda:errorMessage'
                    }
                  },
                  {
                    value: 'error-name-old-value',
                    binding: {
                      type: 'property',
                      name: 'name'
                    }
                  }
                ]
              }
            ]
          };

          var newTemplate = {
            properties: [
              {
                value: 'error-expression',
                binding: {
                  type: 'camunda:errorEventDefinition',
                  errorRef: 'error-1'
                }
              },
            ],
            scopes: [
              {
                id: 'error-1',
                type: 'bpmn:Error',
                properties: [
                  {
                    value: 'error-code-new-value',
                    binding: {
                      type: 'property',
                      name: 'errorCode'
                    }
                  },
                  {
                    value: 'error-message-new-value',
                    binding: {
                      type: 'property',
                      name: 'camunda:errorMessage'
                    }
                  },
                  {
                    value: 'error-name-new-value',
                    binding: {
                      type: 'property',
                      name: 'name'
                    }
                  }
                ]
              }
            ]
          };

          changeTemplate(serviceTask, oldTemplate);

          var error = findErrorForEventDefinition(serviceTask, 'error-1');

          updateBusinessObject(serviceTask, error, {
            name: 'error-name-updated-value',
            errorMessage: 'error-message-updated-value'
          });

          // when
          changeTemplate(serviceTask, newTemplate, oldTemplate);

          // then
          error = findErrorForEventDefinition(serviceTask, 'error-1');

          expect(error).to.exist;
          expect(error.get('errorCode')).to.equal('error-code-new-value'); // were untouched
          expect(error.get('errorMessage')).to.eql('error-message-updated-value');
          expect(error.get('name')).to.eql('error-name-updated-value');
        }));


        it('properties unchanged', inject(function(elementRegistry) {

          // given
          var serviceTask = elementRegistry.get('ServiceTask_1');

          var oldTemplate = {
            properties: [
              {
                value: 'error-expression',
                binding: {
                  type: 'camunda:errorEventDefinition',
                  errorRef: 'error-1'
                }
              },
            ],
            scopes: [
              {
                id: 'error-1',
                type: 'bpmn:Error',
                properties: [
                  {
                    value: 'error-code-old-value',
                    binding: {
                      type: 'property',
                      name: 'errorCode'
                    }
                  },
                  {
                    value: 'error-message-old-value',
                    binding: {
                      type: 'property',
                      name: 'camunda:errorMessage'
                    }
                  },
                  {
                    value: 'error-name-old-value',
                    binding: {
                      type: 'property',
                      name: 'name'
                    }
                  }
                ]
              }
            ]
          };

          var newTemplate = {
            properties: [
              {
                value: 'error-expression',
                binding: {
                  type: 'camunda:errorEventDefinition',
                  errorRef: 'error-1'
                }
              },
            ],
            scopes: [
              {
                id: 'error-1',
                type: 'bpmn:Error',
                properties: [
                  {
                    value: 'error-code-new-value',
                    binding: {
                      type: 'property',
                      name: 'errorCode'
                    }
                  },
                  {
                    value: 'error-message-new-value',
                    binding: {
                      type: 'property',
                      name: 'camunda:errorMessage'
                    }
                  },
                  {
                    value: 'error-name-new-value',
                    binding: {
                      type: 'property',
                      name: 'name'
                    }
                  }
                ]
              }
            ]
          };

          changeTemplate(serviceTask, oldTemplate);

          // when
          changeTemplate(serviceTask, newTemplate, oldTemplate);

          // then
          var errors = findRootElementsByType(getBusinessObject(serviceTask), 'bpmn:Error'),
              error = errors[0];

          expect(errors).to.have.length(1);

          expect(error).to.exist;
          expect(error.get('errorCode')).to.equal('error-code-new-value');
          expect(error.get('name')).to.equal('error-name-new-value');
          expect(error.get('errorMessage')).to.eql('error-message-new-value');
        }));


        it('complex', inject(function(elementRegistry) {

          // given
          var serviceTask = elementRegistry.get('ServiceTask_1');

          var oldTemplate = {
            properties: [
              {
                value: 'error-expression-old-value-1',
                binding: {
                  type: 'camunda:errorEventDefinition',
                  errorRef: 'error-1'
                }
              },
              {
                value: 'error-expression-old-value-2',
                binding: {
                  type: 'camunda:errorEventDefinition',
                  errorRef: 'error-2'
                }
              },
              {
                value: 'error-expression-old-value-3',
                binding: {
                  type: 'camunda:errorEventDefinition',
                  errorRef: 'error-3'
                }
              }
            ],
            scopes: [
              {
                id: 'error-1',
                type: 'bpmn:Error',
                properties: [
                  {
                    value: 'error-code-old-value-1',
                    binding: {
                      type: 'property',
                      name: 'errorCode'
                    }
                  },
                  {
                    value: 'error-message-old-value-1',
                    binding: {
                      type: 'property',
                      name: 'camunda:errorMessage'
                    }
                  },
                  {
                    value: 'error-name-old-value-1',
                    binding: {
                      type: 'property',
                      name: 'name'
                    }
                  }
                ]
              },
              {
                id: 'error-2',
                type: 'bpmn:Error',
                properties: [
                  {
                    value: 'error-code-old-value-2',
                    binding: {
                      type: 'property',
                      name: 'errorCode'
                    }
                  },
                  {
                    value: 'error-message-old-value-2',
                    binding: {
                      type: 'property',
                      name: 'camunda:errorMessage'
                    }
                  },
                  {
                    value: 'error-name-old-value-2',
                    binding: {
                      type: 'property',
                      name: 'name'
                    }
                  }
                ]
              },
              {
                id: 'error-3',
                type: 'bpmn:Error',
                properties: [
                  {
                    value: 'error-code-old-value-3',
                    binding: {
                      type: 'property',
                      name: 'errorCode'
                    }
                  },
                  {
                    value: 'error-message-old-value-3',
                    binding: {
                      type: 'property',
                      name: 'camunda:errorMessage'
                    }
                  },
                  {
                    value: 'error-name-old-value-3',
                    binding: {
                      type: 'property',
                      name: 'name'
                    }
                  }
                ]
              }
            ]
          };

          var newTemplate = {
            properties: [
              {
                value: 'error-expression-old-value-1',
                binding: {
                  type: 'camunda:errorEventDefinition',
                  errorRef: 'error-1'
                }
              },
              {
                value: 'error-expression-old-value-2',
                binding: {
                  type: 'camunda:errorEventDefinition',
                  errorRef: 'error-2'
                }
              },
              {
                value: 'error-expression-new-value-4',
                binding: {
                  type: 'camunda:errorEventDefinition',
                  errorRef: 'error-4'
                }
              }
            ],
            scopes: [
              {
                id: 'error-1',
                type: 'bpmn:Error',
                properties: [
                  {
                    value: 'error-code-new-value-1',
                    binding: {
                      type: 'property',
                      name: 'errorCode'
                    }
                  },
                  {
                    value: 'error-message-new-value-1',
                    binding: {
                      type: 'property',
                      name: 'camunda:errorMessage'
                    }
                  },
                  {
                    value: 'error-name-new-value-1',
                    binding: {
                      type: 'property',
                      name: 'name'
                    }
                  }
                ]
              },
              {
                id: 'error-2',
                type: 'bpmn:Error',
                properties: [
                  {
                    value: 'error-code-new-value-2',
                    binding: {
                      type: 'property',
                      name: 'errorCode'
                    }
                  },
                  {
                    value: 'error-message-new-value-2',
                    binding: {
                      type: 'property',
                      name: 'camunda:errorMessage'
                    }
                  },
                  {
                    value: 'error-name-new-value-2',
                    binding: {
                      type: 'property',
                      name: 'name'
                    }
                  }
                ]
              },
              {
                id: 'error-4',
                type: 'bpmn:Error',
                properties: [
                  {
                    value: 'error-code-new-value-4',
                    binding: {
                      type: 'property',
                      name: 'errorCode'
                    }
                  },
                  {
                    value: 'error-message-new-value-4',
                    binding: {
                      type: 'property',
                      name: 'camunda:errorMessage'
                    }
                  },
                  {
                    value: 'error-name-new-value-4',
                    binding: {
                      type: 'property',
                      name: 'name'
                    }
                  }
                ]
              }
            ]
          };

          changeTemplate(serviceTask, oldTemplate);

          var error = findErrorForEventDefinition(serviceTask, 'error-1');

          updateBusinessObject(serviceTask, error, {
            name: 'error-name-updated-value'
          });

          // when
          changeTemplate(serviceTask, newTemplate, oldTemplate);

          // then

          // Expect 1st error not to have been overridden because it's value was changed
          // Expect 2nd error to have been updated
          // Expect 3rd error to have been removed because it was removed from template
          // Expect 4th error to have been added because it was added to template
          expect(findErrorForEventDefinition(serviceTask, 'error-1').name)
            .to.equal('error-name-updated-value');
          expect(findErrorForEventDefinition(serviceTask, 'error-2').name)
            .to.equal('error-name-new-value-2');
          expect(findErrorForEventDefinition(serviceTask, 'error-3')).to.not.exist;
          expect(findErrorForEventDefinition(serviceTask, 'error-4')).to.exist;
        }));

      });

    });

  });


  describe('change template (no new template specified)', function() {

    describe('should not remove properties', function() {

      beforeEach(bootstrap(require('./task-template.bpmn').default));


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


  describe('_getOrCreateExtensionElements', function() {

    beforeEach(bootstrap(require('./task.bpmn').default));

    var newTemplate = require('./task-template-1.json');

    it('should work with existing extension elements', inject(function(elementRegistry) {

      // given
      var task = elementRegistry.get('Task_2'),
          businessObject = getBusinessObject(task);

      // when
      changeTemplate(task, newTemplate);

      // then
      expectElementTemplate(task, 'task-template', 1);

      var extensionElements = businessObject.get('extensionElements');

      expect(extensionElements).to.exist;
      expect(findExtensions(businessObject, [ 'camunda:ErrorEventDefinition' ]))
        .to.have.length(1);
    }));


    it('should set parent to newly created extension elements', inject(function(elementRegistry) {

      // given
      var task = elementRegistry.get('Task_1'),
          businessObject = getBusinessObject(task);

      var extensionElements = businessObject.get('extensionElements');

      // assume
      expect(extensionElements).to.not.exist;

      // when
      changeTemplate(task, newTemplate);

      // then
      expectElementTemplate(task, 'task-template', 1);

      extensionElements = businessObject.get('extensionElements');

      expect(extensionElements).to.exist;
      expect(extensionElements.$parent).to.eql(businessObject);
    }));

  });

});



// helpers //////////

function changeTemplate(element, newTemplate, oldTemplate) {
  return getBpmnJS().invoke(function(commandStack, elementRegistry) {
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
  getBpmnJS().invoke(function(elementRegistry) {
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
  getBpmnJS().invoke(function(elementRegistry) {
    if (isString(element)) {
      element = elementRegistry.get(element);
    }

    expect(element).to.exist;

    var businessObject = getBusinessObject(element);

    expect(businessObject.get('camunda:modelerTemplate')).not.to.exist;
    expect(businessObject.get('camunda:modelerTemplateVersion')).not.to.exist;
  });
}

function createTemplate(properties, scope) {
  if (!isArray(properties)) {
    properties = [ properties ];
  }

  var template = {
    properties: [],
    scopes: []
  };

  if (scope) {
    template.scopes = [
      {
        type: scope,
        properties: properties
      }
    ];
  } else {
    template.properties = properties;
  }

  return template;
}

function getCamundaProperty(element, name) {
  var camundaProperties = findExtensions(element, [ 'camunda:Properties' ])[ 0 ];

  return find(camundaProperties.get('camunda:values'), function(camundaProperty) {
    return camundaProperty.get('camunda:name') === name;
  });
}

function getInputParameter(element, name) {
  var inputOutput;

  if (is(element, 'camunda:Connector')) {
    inputOutput = element.get('camunda:inputOutput');
  } else {
    inputOutput = findExtension(element, 'camunda:InputOutput');
  }

  return find(inputOutput.get('camunda:inputParameters'), function(inputParameter) {
    return inputParameter.get('camunda:name') === name;
  });
}

function getOutputParameter(element, source) {
  var inputOutput;

  if (is(element, 'camunda:Connector')) {
    inputOutput = element.get('camunda:inputOutput');
  } else {
    inputOutput = findExtension(element, 'camunda:InputOutput');
  }

  return find(inputOutput.get('camunda:outputParameters'), function(outputParameter) {
    var definition = outputParameter.get('camunda:definition');

    if (definition) {
      return definition.get('camunda:value') === source;
    } else {
      return outputParameter.get('camunda:value') === source;
    }
  });
}

function updateProperties(element, properties) {
  getBpmnJS().invoke(function(elementRegistry, modeling) {
    if (isString(element)) {
      element = elementRegistry.get(element);
    }

    expect(element).to.exist;

    modeling.updateProperties(element, properties);
  });
}

function updateBusinessObject(element, businessObject, properties) {
  getBpmnJS().invoke(function(commandStack, elementRegistry) {
    if (isString(element)) {
      element = elementRegistry.get(element);
    }

    expect(element).to.exist;

    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties
    });
  });
}

function findErrorForEventDefinition(element, bindingErrorRef) {
  var eventDefinition = findCamundaErrorEventDefinition(element, bindingErrorRef);

  if (eventDefinition) {
    return eventDefinition.errorRef;
  }
}
