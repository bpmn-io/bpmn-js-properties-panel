import {
  bootstrapModeler,
  getBpmnJS,
  inject
} from 'test/TestHelper';

import TestContainer from 'mocha-test-container-support';

import CoreModule from 'bpmn-js/lib/core';
import ElementTemplatesModule from 'src/provider/cloud-element-templates';
import ModelingModule from 'bpmn-js/lib/features/modeling';
import PropertiesPanelCommandsModule from 'src/cmd';

import zeebeModdlePackage from 'zeebe-bpmn-moddle/resources/zeebe';

import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import {
  findExtension
} from 'src/provider/cloud-element-templates/Helper';

import {
  createInputParameter,
  createOutputParameter
} from 'src/provider/cloud-element-templates/CreateHelper';

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
  zeebe: zeebeModdlePackage
};


describe('cloud-element-templates - ChangeElementTemplateHandler', function() {

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

    describe('update zeebe:modelerTemplate and zeebe:modelerTemplateVersion', function() {

      beforeEach(bootstrap(require('./task.bpmn').default));

      const newTemplate = require('./task-template-1.json');


      it('execute', inject(function(elementRegistry) {

        // given
        const task = elementRegistry.get('Task_1');

        // when
        changeTemplate(task, newTemplate);

        // then
        expectElementTemplate(task, 'task-template', 1);
      }));


      it('undo', inject(function(commandStack, elementRegistry) {

        // given
        const task = elementRegistry.get('Task_1');

        changeTemplate(task, newTemplate);

        // when
        commandStack.undo();

        // then
        expectNoElementTemplate(task);
      }));


      it('redo', inject(function(commandStack, elementRegistry) {

        // given
        const task = elementRegistry.get('Task_1');

        changeTemplate(task, newTemplate);

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expectElementTemplate(task, 'task-template', 1);
      }));

    });


    describe('update name', function() {

      beforeEach(bootstrap(require('./task.bpmn').default));

      const newTemplate = require('./task-template-1.json');


      it('execute', inject(function(elementRegistry) {

        // given
        const task = elementRegistry.get('Task_1'),
              businessObject = getBusinessObject(task);

        // when
        changeTemplate(task, newTemplate);

        // then
        expectElementTemplate(task, 'task-template', 1);

        const name = businessObject.get('bpmn:name');

        expect(name).to.exist;
        expect(name).to.equal('task-name');
      }));


      it('undo', inject(function(commandStack, elementRegistry) {

        // given
        const task = elementRegistry.get('Task_1'),
              businessObject = task.businessObject;

        changeTemplate(task, newTemplate);

        // when
        commandStack.undo();

        // then
        expectNoElementTemplate(task);

        const name = businessObject.get('bpmn:name');

        expect(name).not.to.exist;
      }));


      it('redo', inject(function(commandStack, elementRegistry) {

        // given
        const task = elementRegistry.get('Task_1'),
              businessObject = task.businessObject;

        changeTemplate(task, newTemplate);

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expectElementTemplate(task, 'task-template', 1);

        const name = businessObject.get('bpmn:name');

        expect(name).to.exist;
        expect(name).to.equal('task-name');
      }));

    });


    describe('update zeebe:taskDefinition', function() {

      describe('zeebe:taskDefinition:type specified', function() {

        beforeEach(bootstrap(require('./task.bpmn').default));

        const newTemplate = require('./task-template-1.json');


        it('execute', inject(function(elementRegistry) {

          // given
          const task = elementRegistry.get('Task_1');

          // when
          changeTemplate(task, newTemplate);

          // then
          expectElementTemplate(task, 'task-template', 1);

          const taskDefinition = findExtension(task, 'zeebe:TaskDefinition');

          expect(taskDefinition).to.exist;
          expect(taskDefinition.get('type')).to.equal('task-type');
        }));


        it('undo', inject(function(commandStack, elementRegistry) {

          // given
          const task = elementRegistry.get('Task_1');

          changeTemplate(task, newTemplate);

          // when
          commandStack.undo();

          // then
          expectNoElementTemplate(task);

          const taskDefinition = findExtension(task, 'zeebe:TaskDefinition');

          expect(taskDefinition).not.to.exist;
        }));


        it('redo', inject(function(commandStack, elementRegistry) {

          // given
          const task = elementRegistry.get('Task_1');

          changeTemplate(task, newTemplate);

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expectElementTemplate(task, 'task-template', 1);

          const taskDefinition = findExtension(task, 'zeebe:TaskDefinition');

          expect(taskDefinition).to.exist;
          expect(taskDefinition.get('type')).to.equal('task-type');
        }));

      });


      describe('zeebe:taskDefinition:type not specified', function() {

        beforeEach(bootstrap(require('./task-definition.bpmn').default));

        const newTemplate = require('./task-template-no-properties.json');


        it('should not override existing', inject(function(elementRegistry) {

          // given
          const task = elementRegistry.get('Task_1');

          // when
          changeTemplate(task, newTemplate);

          // then
          expectElementTemplate(task, 'task-template-no-properties');

          const taskDefinition = findExtension(task, 'zeebe:TaskDefinition');

          expect(taskDefinition).to.exist;
          expect(taskDefinition.get('type')).to.equal('task-type');
        }));

      });

    });


    describe('update zeebe:ioMapping', function() {

      describe('zeebe:Input and zeebe:Output specified', function() {

        beforeEach(bootstrap(require('./task.bpmn').default));

        const newTemplate = require('./task-template-1.json');


        it('execute', inject(function(elementRegistry) {

          // given
          const task = elementRegistry.get('Task_1');

          // when
          changeTemplate(task, newTemplate);

          // then
          expectElementTemplate(task, 'task-template', 1);

          const ioMapping = findExtension(task, 'zeebe:IoMapping');

          expect(ioMapping).to.exist;
          expect(ioMapping.get('zeebe:inputParameters')).to.have.length(2);
          expect(ioMapping.get('zeebe:outputParameters')).to.have.length(2);

          expect(ioMapping.get('zeebe:inputParameters')).to.jsonEqual([
            {
              $type: 'zeebe:Input',
              source: 'input-1-source',
              target: 'input-1-target'
            },
            {
              $type: 'zeebe:Input',
              source: 'input-2-source',
              target: 'input-2-target'
            }
          ]);

          expect(ioMapping.get('zeebe:outputParameters')).to.jsonEqual([
            {
              $type: 'zeebe:Output',
              source: 'output-1-source',
              target: 'output-1-target'
            },
            {
              $type: 'zeebe:Output',
              source: 'output-2-source',
              target: 'output-2-target'
            }
          ]);
        }));


        it('undo', inject(function(commandStack, elementRegistry) {

          // given
          const task = elementRegistry.get('Task_1');

          changeTemplate(task, newTemplate);

          // when
          commandStack.undo();

          // then
          expectNoElementTemplate(task);

          const ioMapping = findExtension(task, 'zeebe:IoMapping');

          expect(ioMapping).not.to.exist;
        }));


        it('redo', inject(function(commandStack, elementRegistry) {

          // given
          const task = elementRegistry.get('Task_1');

          changeTemplate(task, newTemplate);

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expectElementTemplate(task, 'task-template', 1);

          const ioMapping = findExtension(task, 'zeebe:IoMapping');

          expect(ioMapping).to.exist;
          expect(ioMapping.get('zeebe:inputParameters')).to.have.length(2);
          expect(ioMapping.get('zeebe:outputParameters')).to.have.length(2);

          expect(ioMapping.get('zeebe:inputParameters')).to.jsonEqual([
            {
              $type: 'zeebe:Input',
              source: 'input-1-source',
              target: 'input-1-target'
            },
            {
              $type: 'zeebe:Input',
              source: 'input-2-source',
              target: 'input-2-target'
            }
          ]);

          expect(ioMapping.get('zeebe:outputParameters')).to.jsonEqual([
            {
              $type: 'zeebe:Output',
              source: 'output-1-source',
              target: 'output-1-target'
            },
            {
              $type: 'zeebe:Output',
              source: 'output-2-source',
              target: 'output-2-target'
            }
          ]);
        }));

      });


      describe('optional', function() {

        beforeEach(bootstrap(require('./task.bpmn').default));

        const newTemplate = require('./task-template-optional.json');

        it('should create (non empty value)', inject(function(elementRegistry) {

          // given
          const task = elementRegistry.get('Task_1');

          // when
          changeTemplate(task, newTemplate);

          // then
          expectElementTemplate(task, 'task-template-optional', 1);

          const ioMapping = findExtension(task, 'zeebe:IoMapping');

          expect(ioMapping).to.exist;
          expect(getInputParameter(task, 'input-1-target')).to.exist;
          expect(getOutputParameter(task, 'output-1-source')).to.exist;
        }));


        it('should NOT create (empty value)', inject(function(elementRegistry) {

          // given
          const task = elementRegistry.get('Task_1');

          // when
          changeTemplate(task, newTemplate);

          // then
          expectElementTemplate(task, 'task-template-optional', 1);

          const ioMapping = findExtension(task, 'zeebe:IoMapping');

          expect(ioMapping).to.exist;
          expect(getInputParameter(task, 'input-2-target')).not.to.exist;
          expect(getOutputParameter(task, 'output-2-source')).not.to.exist;
        }));

      });


      describe('zeebe:Input and zeebe:Output not specified', function() {

        beforeEach(bootstrap(require('./task-input-output.bpmn').default));

        const newTemplate = require('./task-template-no-properties.json');


        it('should not override existing', inject(function(elementRegistry) {

          // given
          const task = elementRegistry.get('Task_1');

          // when
          changeTemplate(task, newTemplate);

          // then
          expectElementTemplate(task, 'task-template-no-properties');

          const ioMapping = findExtension(task, 'zeebe:IoMapping');

          expect(ioMapping).to.exist;
          expect(ioMapping.inputParameters).to.have.length(1);
          expect(ioMapping.outputParameters).to.have.length(1);

          expect(ioMapping.inputParameters).to.jsonEqual([
            {
              $type: 'zeebe:Input',
              target: 'input-1-target',
              source: 'input-1-source'
            }
          ]);

          expect(ioMapping.outputParameters).to.jsonEqual([
            {
              $type: 'zeebe:Output',
              target: 'output-1-target',
              source: 'output-1-source'
            }
          ]);
        }));

      });

    });


    describe('update zeebe:taskHeaders', function() {

      describe('zeebe:Header specified', function() {

        beforeEach(bootstrap(require('./task.bpmn').default));

        const newTemplate = require('./task-template-1.json');


        it('execute', inject(function(elementRegistry) {

          // given
          const task = elementRegistry.get('Task_1');

          // when
          changeTemplate(task, newTemplate);

          // then
          expectElementTemplate(task, 'task-template', 1);

          const taskHeaders = findExtension(task, 'zeebe:TaskHeaders');

          expect(taskHeaders).to.exist;
          expect(taskHeaders.get('zeebe:values')).to.have.length(2);

          expect(taskHeaders.get('zeebe:values')).to.jsonEqual([
            {
              $type: 'zeebe:Header',
              key: 'header-1-key',
              value: 'header-1-value'
            },
            {
              $type: 'zeebe:Header',
              key: 'header-2-key',
              value: 'header-2-value'
            }
          ]);
        }));


        it('undo', inject(function(commandStack, elementRegistry) {

          // given
          const task = elementRegistry.get('Task_1');

          changeTemplate(task, newTemplate);

          // when
          commandStack.undo();

          // then
          expectNoElementTemplate(task);

          const taskHeaders = findExtension(task, 'zeebe:TaskHeaders');

          expect(taskHeaders).not.to.exist;
        }));


        it('redo', inject(function(commandStack, elementRegistry) {

          // given
          const task = elementRegistry.get('Task_1');

          changeTemplate(task, newTemplate);

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expectElementTemplate(task, 'task-template', 1);

          const taskHeaders = findExtension(task, 'zeebe:TaskHeaders');

          expect(taskHeaders).to.exist;
          expect(taskHeaders.get('zeebe:values')).to.have.length(2);

          expect(taskHeaders.get('zeebe:values')).to.jsonEqual([
            {
              $type: 'zeebe:Header',
              key: 'header-1-key',
              value: 'header-1-value'
            },
            {
              $type: 'zeebe:Header',
              key: 'header-2-key',
              value: 'header-2-value'
            }
          ]);
        }));

      });


      describe('zeebe:Header not specified', function() {

        beforeEach(bootstrap(require('./task-headers.bpmn').default));

        const newTemplate = require('./task-template-no-properties.json');


        it('should not override existing', inject(function(elementRegistry) {

          // given
          const task = elementRegistry.get('Task_1');

          // when
          changeTemplate(task, newTemplate);

          // then
          expectElementTemplate(task, 'task-template-no-properties');

          const taskHeaders = findExtension(task, 'zeebe:TaskHeaders');

          expect(taskHeaders).to.exist;
          expect(taskHeaders.values).to.have.length(2);

          expect(taskHeaders.values).to.jsonEqual([
            {
              $type: 'zeebe:Header',
              key: 'header-1-key',
              value: 'header-1-value'
            },
            {
              $type: 'zeebe:Header',
              key: 'header-2-key',
              value: 'header-2-value'
            }
          ]);

        }));

      });

    });

  });


  describe('change template (new and old template specified)', function() {

    describe('update zeebe:modelerTemplate and zeebe:modelerTemplateVersion', function() {

      beforeEach(bootstrap(require('./task-template.bpmn').default));

      const newTemplate = require('./task-template-2.json');


      it('execute', inject(function(elementRegistry) {

        // given
        const task = elementRegistry.get('Task_1');

        // when
        changeTemplate(task, newTemplate);

        // then
        expectElementTemplate(task, 'task-template', 2);
      }));

    });


    describe('update properties', function() {

      describe('update name', function() {

        beforeEach(bootstrap(require('./task.bpmn').default));


        it('property changed', inject(function(elementRegistry) {

          // given
          const task = elementRegistry.get('Task_1'),
                businessObject = getBusinessObject(task);

          const oldTemplate = createTemplate({
            value: 'task-old-name',
            binding: {
              type: 'property',
              name: 'name'
            }
          });

          const newTemplate = createTemplate({
            value: 'task-new-name',
            binding: {
              type: 'property',
              name: 'name'
            }
          });

          changeTemplate('Task_1', oldTemplate);

          let name = businessObject.get('bpmn:name');

          updateBusinessObject('Task_1', businessObject, {
            'name': 'task-name-changed'
          });

          // when
          changeTemplate(task, newTemplate, oldTemplate);

          // then
          name = businessObject.get('bpmn:name');

          expect(name).to.exist;
          expect(name).to.equal('task-name-changed');
        }));


        it('property unchanged', inject(function(elementRegistry) {

          // given
          const task = elementRegistry.get('Task_1'),
                businessObject = getBusinessObject(task);

          const oldTemplate = createTemplate({
            value: 'task-old-name',
            binding: {
              type: 'property',
              name: 'name'
            }
          });

          const newTemplate = createTemplate({
            value: 'task-new-name',
            binding: {
              type: 'property',
              name: 'name'
            }
          });

          changeTemplate('Task_1', oldTemplate);

          // when
          changeTemplate(task, newTemplate, oldTemplate);

          // then
          const name = businessObject.get('bpmn:name');

          expect(name).to.exist;
          expect(name).to.equal('task-new-name');
        }));

      });

    });


    describe('update zeebe:taskDefinition', function() {

      beforeEach(bootstrap(require('./task.bpmn').default));


      it('property changed', inject(function(elementRegistry) {

        // given
        const task = elementRegistry.get('Task_1');

        const oldTemplate = createTemplate([
          {
            value: 'task-type-old',
            binding: {
              type: 'zeebe:taskDefinition:type'
            }
          }
        ]);

        const newTemplate = createTemplate([
          {
            value: 'task-type-new',
            binding: {
              type: 'zeebe:taskDefinition:type'
            }
          }
        ]);

        changeTemplate('Task_1', oldTemplate);

        let taskDefinition = findExtension(task, 'zeebe:TaskDefinition');

        updateBusinessObject('Task_1', taskDefinition, {
          type: 'task-type-changed'
        });

        // when
        changeTemplate(task, newTemplate, oldTemplate);

        // then
        taskDefinition = findExtension(task, 'zeebe:TaskDefinition');

        expect(taskDefinition).to.exist;
        expect(taskDefinition.get('type')).to.equal('task-type-changed');
      }));


      it('property unchanged', inject(function(elementRegistry) {

        // given
        const task = elementRegistry.get('Task_1');

        const oldTemplate = createTemplate([
          {
            value: 'task-type-old',
            binding: {
              type: 'zeebe:taskDefinition:type'
            }
          }
        ]);

        const newTemplate = createTemplate([
          {
            value: 'task-type-new',
            binding: {
              type: 'zeebe:taskDefinition:type'
            }
          }
        ]);

        changeTemplate('Task_1', oldTemplate);

        // when
        changeTemplate(task, newTemplate, oldTemplate);

        // then
        const taskDefinition = findExtension(task, 'zeebe:TaskDefinition');

        expect(taskDefinition).to.exist;
        expect(taskDefinition.get('type')).to.equal('task-type-new');
      }));

    });


    describe('update zeebe:Input and zeebe:Output', function() {

      beforeEach(bootstrap(require('./task.bpmn').default));


      it('property changed', inject(function(elementRegistry) {

        // given
        const task = elementRegistry.get('Task_1');

        const oldTemplate = createTemplate([
          {
            value: 'input-1-old-value',
            binding: {
              type: 'zeebe:input',
              name: 'input-1-target'
            }
          },
          {
            value: 'output-1-old-value',
            binding: {
              type: 'zeebe:output',
              source: 'output-1-source'
            }
          }
        ]);

        const newTemplate = createTemplate([
          {
            value: 'input-1-new-value',
            binding: {
              type: 'zeebe:input',
              name: 'input-1-target'
            }
          },
          {
            value: 'output-1-new-value',
            binding: {
              type: 'zeebe:output',
              source: 'output-1-source'
            }
          }
        ]);

        changeTemplate('Task_1', oldTemplate);

        const input = getInputParameter(task, 'input-1-target');

        updateBusinessObject('Task_1', input, {
          source: 'input-1-changed-value'
        });

        const output = getOutputParameter(task, 'output-1-source');

        updateBusinessObject('Task_1', output, {
          target: 'output-1-changed-value'
        });

        // when
        changeTemplate(task, newTemplate, oldTemplate);

        // then
        const ioMapping = findExtension(task, 'zeebe:IoMapping');

        expect(ioMapping).to.exist;
        expect(ioMapping.get('zeebe:inputParameters')).to.have.length(1);
        expect(ioMapping.get('zeebe:outputParameters')).to.have.length(1);

        expect(ioMapping.get('zeebe:inputParameters')).to.jsonEqual([
          {
            $type: 'zeebe:Input',
            source: 'input-1-changed-value',
            target: 'input-1-target',
          }
        ]);

        expect(ioMapping.get('zeebe:outputParameters')).to.jsonEqual([
          {
            $type: 'zeebe:Output',
            source: 'output-1-source',
            target: 'output-1-changed-value'
          }
        ]);
      }));


      it('property unchanged', inject(function(elementRegistry) {

        // given
        const task = elementRegistry.get('Task_1');

        const oldTemplate = createTemplate([
          {
            value: 'input-1-old-value',
            binding: {
              type: 'zeebe:input',
              name: 'input-1-target'
            }
          },
          {
            value: 'output-1-old-value',
            binding: {
              type: 'zeebe:output',
              source: 'output-1-source'
            }
          }
        ]);

        const newTemplate = createTemplate([
          {
            value: 'input-1-new-value',
            binding: {
              type: 'zeebe:input',
              name: 'input-1-target'
            }
          },
          {
            value: 'output-1-new-value',
            binding: {
              type: 'zeebe:output',
              source: 'output-1-source'
            }
          }
        ]);

        changeTemplate('Task_1', oldTemplate);

        // when
        changeTemplate(task, newTemplate, oldTemplate);

        // then
        const ioMapping = findExtension(task, 'zeebe:IoMapping');

        expect(ioMapping).to.exist;
        expect(ioMapping.get('zeebe:inputParameters')).to.have.length(1);
        expect(ioMapping.get('zeebe:outputParameters')).to.have.length(1);

        expect(ioMapping.get('zeebe:inputParameters')).to.jsonEqual([
          {
            $type: 'zeebe:Input',
            source: 'input-1-new-value',
            target: 'input-1-target'
          }
        ]);

        expect(ioMapping.get('zeebe:outputParameters')).to.jsonEqual([
          {
            $type: 'zeebe:Output',
            source: 'output-1-source',
            target: 'output-1-new-value'
          }
        ]);
      }));


      it('complex', inject(function(elementRegistry) {

        // given
        const task = elementRegistry.get('Task_1');

        const oldTemplate = createTemplate([
          {
            value: 'input-1-old-value',
            binding: {
              type: 'zeebe:input',
              name: 'input-1-target'
            }
          },
          {
            value: 'output-1-old-value',
            binding: {
              type: 'zeebe:output',
              source: 'output-1-source'
            }
          },
          {
            value: 'input-2-old-value',
            binding: {
              type: 'zeebe:input',
              name: 'input-2-target'
            }
          },
          {
            value: 'output-2-old-value',
            binding: {
              type: 'zeebe:output',
              source: 'output-2-source'
            }
          },
          {
            value: 'input-3-old-value',
            binding: {
              type: 'zeebe:input',
              name: 'input-3-target'
            }
          },
          {
            value: 'output-3-old-value',
            binding: {
              type: 'zeebe:output',
              source: 'output-3-source'
            }
          }
        ]);

        const newTemplate = createTemplate([
          {
            value: 'input-1-new-value',
            binding: {
              type: 'zeebe:input',
              name: 'input-1-target'
            }
          },
          {
            value: 'output-1-new-value',
            binding: {
              type: 'zeebe:output',
              source: 'output-1-source'
            }
          },
          {
            value: 'input-2-new-value',
            binding: {
              type: 'zeebe:input',
              name: 'input-2-target'
            }
          },
          {
            value: 'output-2-new-value',
            binding: {
              type: 'zeebe:output',
              source: 'output-2-source'
            }
          },
          {
            value: 'input-4-new-value',
            binding: {
              type: 'zeebe:input',
              name: 'input-4-target'
            }
          },
          {
            value: 'output-4-new-value',
            binding: {
              type: 'zeebe:output',
              source: 'output-4-source'
            }
          }
        ]);

        changeTemplate('Task_1', oldTemplate);

        const input1 = getInputParameter(task, 'input-1-target');

        updateBusinessObject('Task_1', input1, {
          source: 'input-1-changed-value'
        });

        const output1 = getOutputParameter(task, 'output-1-source');

        updateBusinessObject('Task_1', output1, {
          target: 'output-1-changed-value'
        });

        // when
        changeTemplate(task, newTemplate, oldTemplate);

        // then
        const ioMapping = findExtension(task, 'zeebe:IoMapping');

        expect(ioMapping).to.exist;
        expect(ioMapping.get('zeebe:inputParameters')).to.have.length(3);
        expect(ioMapping.get('zeebe:outputParameters')).to.have.length(3);

        // Expect 1st input to not have been overridden because it was changed
        // Expect 2nd input to have been updated
        // Expect 3rd input to have been removed
        // Expect 4th input to have been added
        expect(ioMapping.get('zeebe:inputParameters')).to.jsonEqual([
          {
            $type: 'zeebe:Input',
            source: 'input-1-changed-value',
            target: 'input-1-target'
          },
          {
            $type: 'zeebe:Input',
            source: 'input-2-new-value',
            target: 'input-2-target'
          },
          {
            $type: 'zeebe:Input',
            source: 'input-4-new-value',
            target: 'input-4-target'
          }
        ]);

        // Expect 1st output to not have been overridden because it was changed
        // Expect 2nd output to have been updated
        // Expect 3rd output to have been removed
        // Expect 4th output to have been added
        expect(ioMapping.get('zeebe:outputParameters')).to.jsonEqual([
          {
            $type: 'zeebe:Output',
            source: 'output-1-source',
            target: 'output-1-changed-value'
          },
          {
            $type: 'zeebe:Output',
            source: 'output-2-source',
            target: 'output-2-new-value'
          },
          {
            $type: 'zeebe:Output',
            source: 'output-4-source',
            target: 'output-4-new-value'
          }
        ]);
      }));

    });


    describe('optional - zeebe:Input and zeebe:Output', function() {

      beforeEach(bootstrap(require('./task.bpmn').default));


      it('should create - optional -> non optional', inject(function(elementRegistry) {

        // given
        const task = elementRegistry.get('Task_1');

        const oldTemplate = createTemplate([
          {
            optional: true,
            binding: {
              type: 'zeebe:input',
              name: 'input-1-target'
            }
          },
          {
            optional: true,
            binding: {
              type: 'zeebe:output',
              source: 'output-1-source'
            }
          }
        ]);

        const newTemplate = createTemplate([
          {
            binding: {
              type: 'zeebe:input',
              name: 'input-1-target'
            }
          },
          {
            binding: {
              type: 'zeebe:output',
              source: 'output-1-source'
            }
          }
        ]);

        changeTemplate('Task_1', oldTemplate);

        let ioMapping = findExtension(task, 'zeebe:IoMapping');

        // assume
        expect(ioMapping.get('zeebe:inputParameters')).to.be.empty;
        expect(ioMapping.get('zeebe:outputParameters')).to.be.empty;

        // when
        changeTemplate(task, newTemplate, oldTemplate);

        // then
        ioMapping = findExtension(task, 'zeebe:IoMapping');

        expect(ioMapping).to.exist;
        expect(ioMapping.get('zeebe:inputParameters')).to.have.length(1);
        expect(ioMapping.get('zeebe:outputParameters')).to.have.length(1);

        expect(ioMapping.get('zeebe:inputParameters')).to.jsonEqual([
          {
            $type: 'zeebe:Input',
            source: undefined,
            target: 'input-1-target',
          }
        ]);

        expect(ioMapping.get('zeebe:outputParameters')).to.jsonEqual([
          {
            $type: 'zeebe:Output',
            source: 'output-1-source',
            target: undefined
          }
        ]);
      }));


      it('should remove - non optional -> optional (empty value)', inject(function(elementRegistry) {

        // given
        const task = elementRegistry.get('Task_1');

        const oldTemplate = createTemplate([
          {
            value: 'input-1-source',
            binding: {
              type: 'zeebe:input',
              name: 'input-1-target'
            }
          },
          {
            value: 'input-2-source',
            binding: {
              type: 'zeebe:output',
              source: 'output-1-source'
            }
          }
        ]);

        const newTemplate = createTemplate([
          {
            optional: true,
            binding: {
              type: 'zeebe:input',
              name: 'input-1-target'
            }
          },
          {
            optional: true,
            binding: {
              type: 'zeebe:output',
              source: 'output-1-source'
            }
          }
        ]);

        changeTemplate('Task_1', oldTemplate);

        let ioMapping = findExtension(task, 'zeebe:IoMapping');

        // assume
        expect(ioMapping.get('zeebe:inputParameters')).not.to.be.empty;
        expect(ioMapping.get('zeebe:outputParameters')).not.to.be.empty;

        // when
        changeTemplate(task, newTemplate, oldTemplate);

        // then
        ioMapping = findExtension(task, 'zeebe:IoMapping');

        expect(ioMapping.get('zeebe:inputParameters')).to.be.empty;
        expect(ioMapping.get('zeebe:outputParameters')).to.to.be.empty;
      }));


      it('should keep - non optional -> optional (new value)', inject(function(elementRegistry) {

        // given
        const task = elementRegistry.get('Task_1');

        const oldTemplate = createTemplate([
          {
            value: 'input-1-source',
            binding: {
              type: 'zeebe:input',
              name: 'input-1-target'
            }
          },
          {
            value: 'input-2-source',
            binding: {
              type: 'zeebe:output',
              source: 'output-1-source'
            }
          }
        ]);

        const newTemplate = createTemplate([
          {
            value: 'input-1-new-source',
            optional: true,
            binding: {
              type: 'zeebe:input',
              name: 'input-1-target'
            }
          },
          {
            value: 'output-1-new-target',
            optional: true,
            binding: {
              type: 'zeebe:output',
              source: 'output-1-source'
            }
          }
        ]);

        changeTemplate('Task_1', oldTemplate);

        let ioMapping = findExtension(task, 'zeebe:IoMapping');

        // assume
        expect(ioMapping.get('zeebe:inputParameters')).not.to.be.empty;
        expect(ioMapping.get('zeebe:outputParameters')).not.to.be.empty;

        // when
        changeTemplate(task, newTemplate, oldTemplate);

        // then
        ioMapping = findExtension(task, 'zeebe:IoMapping');

        expect(ioMapping.get('zeebe:inputParameters')).to.have.length(1);
        expect(ioMapping.get('zeebe:outputParameters')).to.have.length(1);

        expect(ioMapping.get('zeebe:inputParameters')).to.jsonEqual([
          {
            $type: 'zeebe:Input',
            source: 'input-1-new-source',
            target: 'input-1-target',
          }
        ]);

        expect(ioMapping.get('zeebe:outputParameters')).to.jsonEqual([
          {
            $type: 'zeebe:Output',
            source: 'output-1-source',
            target: 'output-1-new-target'
          }
        ]);
      }));


      it('should update - optional -> optional', inject(function(elementRegistry) {

        // given
        const task = elementRegistry.get('Task_1');

        const oldTemplate = createTemplate([
          {
            optional: true,
            value: 'input-1-old-source',
            binding: {
              type: 'zeebe:input',
              name: 'input-1-target'
            }
          },
          {
            optional: true,
            value: 'output-1-old-target',
            binding: {
              type: 'zeebe:output',
              source: 'output-1-source'
            }
          }
        ]);

        const newTemplate = createTemplate([
          {
            optional: true,
            value: 'input-1-new-source',
            binding: {
              type: 'zeebe:input',
              name: 'input-1-target'
            }
          },
          {
            optional: true,
            value: 'output-1-new-target',
            binding: {
              type: 'zeebe:output',
              source: 'output-1-source'
            }
          }
        ]);

        changeTemplate('Task_1', oldTemplate);

        // assume
        let ioMapping = findExtension(task, 'zeebe:IoMapping');

        // assume
        expect(ioMapping.get('zeebe:inputParameters')).to.be.not.empty;
        expect(ioMapping.get('zeebe:outputParameters')).to.be.not.empty;

        // when
        changeTemplate(task, newTemplate, oldTemplate);

        // then
        ioMapping = findExtension(task, 'zeebe:IoMapping');

        expect(ioMapping.get('zeebe:inputParameters')).to.have.length(1);
        expect(ioMapping.get('zeebe:outputParameters')).to.have.length(1);

        expect(ioMapping.get('zeebe:inputParameters')).to.jsonEqual([
          {
            $type: 'zeebe:Input',
            source: 'input-1-new-source',
            target: 'input-1-target',
          }
        ]);

        expect(ioMapping.get('zeebe:outputParameters')).to.jsonEqual([
          {
            $type: 'zeebe:Output',
            source: 'output-1-source',
            target: 'output-1-new-target'
          }
        ]);
      }));


      it('should keep - optional -> optional (changed)',
        inject(function(elementRegistry, bpmnFactory) {

          // given
          const task = elementRegistry.get('Task_1');

          const oldTemplate = createTemplate([
            {
              optional: true,
              binding: {
                type: 'zeebe:input',
                name: 'input-1-target'
              }
            },
            {
              optional: true,
              binding: {
                type: 'zeebe:output',
                source: 'output-1-source'
              }
            }
          ]);

          const newTemplate = createTemplate([
            {
              optional: true,
              binding: {
                type: 'zeebe:input',
                name: 'input-1-target'
              }
            },
            {
              optional: true,
              binding: {
                type: 'zeebe:output',
                source: 'output-1-source'
              }
            }
          ]);

          changeTemplate('Task_1', oldTemplate);

          const input = createInputParameter({
            name: 'input-1-target'
          }, 'input-1-changed-source', bpmnFactory);

          const output = createOutputParameter({
            source: 'output-1-source'
          }, 'output-1-changed-target', bpmnFactory);

          let ioMapping = findExtension(task, 'zeebe:IoMapping');

          updateBusinessObject('Task_1', ioMapping, {
            inputParameters: [ input ],
            outputParameters: [ output ]
          });

          // when
          changeTemplate(task, newTemplate, oldTemplate);

          // then
          ioMapping = findExtension(task, 'zeebe:IoMapping');

          expect(ioMapping.get('zeebe:inputParameters')).to.have.length(1);
          expect(ioMapping.get('zeebe:outputParameters')).to.have.length(1);

          expect(ioMapping.get('zeebe:inputParameters')).to.jsonEqual([
            {
              $type: 'zeebe:Input',
              source: 'input-1-changed-source',
              target: 'input-1-target',
            }
          ]);

          expect(ioMapping.get('zeebe:outputParameters')).to.jsonEqual([
            {
              $type: 'zeebe:Output',
              source: 'output-1-source',
              target: 'output-1-changed-target'
            }
          ]);
        })
      );


      it('should create - optional -> optional (new value)', inject(function(elementRegistry) {

        // given
        const task = elementRegistry.get('Task_1');

        const oldTemplate = createTemplate([
          {
            optional: true,
            binding: {
              type: 'zeebe:input',
              name: 'input-1-target'
            }
          },
          {
            optional: true,
            binding: {
              type: 'zeebe:output',
              source: 'output-1-source'
            }
          }
        ]);

        const newTemplate = createTemplate([
          {
            optional: true,
            value: 'input-1-new-source',
            binding: {
              type: 'zeebe:input',
              name: 'input-1-target'
            }
          },
          {
            optional: true,
            value: 'output-1-new-target',
            binding: {
              type: 'zeebe:output',
              source: 'output-1-source'
            }
          }
        ]);

        changeTemplate('Task_1', oldTemplate);

        // when
        changeTemplate(task, newTemplate, oldTemplate);

        // then
        const ioMapping = findExtension(task, 'zeebe:IoMapping');

        expect(ioMapping.get('zeebe:inputParameters')).to.have.length(1);
        expect(ioMapping.get('zeebe:outputParameters')).to.have.length(1);

        expect(ioMapping.get('zeebe:inputParameters')).to.jsonEqual([
          {
            $type: 'zeebe:Input',
            source: 'input-1-new-source',
            target: 'input-1-target',
          }
        ]);

        expect(ioMapping.get('zeebe:outputParameters')).to.jsonEqual([
          {
            $type: 'zeebe:Output',
            source: 'output-1-source',
            target: 'output-1-new-target'
          }
        ]);
      }));

    });


    describe('update zeebe:Header', function() {

      beforeEach(bootstrap(require('./task.bpmn').default));


      it('property changed', inject(function(elementRegistry) {

        // given
        const task = elementRegistry.get('Task_1');

        const oldTemplate = createTemplate([
          {
            value: 'header-1-old-value',
            binding: {
              type: 'zeebe:taskHeader',
              key: 'header-1-key'
            }
          },
          {
            value: 'header-2-old-value',
            binding: {
              type: 'zeebe:taskHeader',
              key: 'header-2-key'
            }
          }
        ]);

        const newTemplate = createTemplate([
          {
            value: 'header-1-new-value',
            binding: {
              type: 'zeebe:taskHeader',
              key: 'header-1-key'
            }
          },
          {
            value: 'header-2-new-value',
            binding: {
              type: 'zeebe:taskHeader',
              key: 'header-2-key'
            }
          }
        ]);

        changeTemplate('Task_1', oldTemplate);

        const header = getTaskHeader(task, 'header-1-key');

        updateBusinessObject('Task_1', header, {
          value: 'header-1-changed-value'
        });

        // when
        changeTemplate(task, newTemplate, oldTemplate);

        // then
        const taskHeaders = findExtension(task, 'zeebe:TaskHeaders');

        expect(taskHeaders).to.exist;
        expect(taskHeaders.get('zeebe:values')).to.have.length(2);

        expect(taskHeaders.get('zeebe:values')).to.jsonEqual([
          {
            $type: 'zeebe:Header',
            key: 'header-1-key',
            value: 'header-1-changed-value',
          },
          {
            $type: 'zeebe:Header',
            key: 'header-2-key',
            value: 'header-2-new-value',
          }
        ]);
      }));


      it('property unchanged', inject(function(elementRegistry) {

        // given
        const task = elementRegistry.get('Task_1');

        const oldTemplate = createTemplate([
          {
            value: 'header-1-old-value',
            binding: {
              type: 'zeebe:taskHeader',
              key: 'header-1-key'
            }
          },
          {
            value: 'header-2-old-value',
            binding: {
              type: 'zeebe:taskHeader',
              key: 'header-2-key'
            }
          }
        ]);

        const newTemplate = createTemplate([
          {
            value: 'header-1-new-value',
            binding: {
              type: 'zeebe:taskHeader',
              key: 'header-1-key'
            }
          },
          {
            value: 'header-2-new-value',
            binding: {
              type: 'zeebe:taskHeader',
              key: 'header-2-key'
            }
          }
        ]);

        changeTemplate('Task_1', oldTemplate);

        // when
        changeTemplate(task, newTemplate, oldTemplate);

        // then
        const taskHeaders = findExtension(task, 'zeebe:TaskHeaders');

        expect(taskHeaders).to.exist;
        expect(taskHeaders.get('zeebe:values')).to.have.length(2);

        expect(taskHeaders.get('zeebe:values')).to.jsonEqual([
          {
            $type: 'zeebe:Header',
            key: 'header-1-key',
            value: 'header-1-new-value'
          },
          {
            $type: 'zeebe:Header',
            key: 'header-2-key',
            value: 'header-2-new-value'
          }
        ]);
      }));


      it('complex', inject(function(elementRegistry) {

        // given
        const task = elementRegistry.get('Task_1');

        const oldTemplate = createTemplate([
          {
            value: 'header-1-old-value',
            binding: {
              type: 'zeebe:taskHeader',
              key: 'header-1-key'
            }
          },
          {
            value: 'header-2-old-value',
            binding: {
              type: 'zeebe:taskHeader',
              key: 'header-2-key'
            }
          },
          {
            value: 'header-3-old-value',
            binding: {
              type: 'zeebe:taskHeader',
              key: 'header-3-key'
            }
          }
        ]);

        const newTemplate = createTemplate([
          {
            value: 'header-1-new-value',
            binding: {
              type: 'zeebe:taskHeader',
              key: 'header-1-key'
            }
          },
          {
            value: 'header-2-new-value',
            binding: {
              type: 'zeebe:taskHeader',
              key: 'header-2-key'
            }
          },
          {
            value: 'header-4-new-value',
            binding: {
              type: 'zeebe:taskHeader',
              key: 'header-4-key'
            }
          }
        ]);

        changeTemplate('Task_1', oldTemplate);

        const header1 = getTaskHeader(task, 'header-1-key');

        updateBusinessObject('Task_1', header1, {
          value: 'header-1-changed-value'
        });

        // when
        changeTemplate(task, newTemplate, oldTemplate);

        // then
        const taskHeaders = findExtension(task, 'zeebe:TaskHeaders');

        expect(taskHeaders).to.exist;
        expect(taskHeaders.get('zeebe:values')).to.have.length(3);

        // Expect 1st header to not have been overridden because it was changed
        // Expect 2nd header to have been updated
        // Expect 3rd header to have been removed
        // Expect 4th header to have been added
        expect(taskHeaders.get('zeebe:values')).to.jsonEqual([
          {
            $type: 'zeebe:Header',
            key: 'header-1-key',
            value: 'header-1-changed-value'
          },
          {
            $type: 'zeebe:Header',
            key: 'header-2-key',
            value: 'header-2-new-value'
          },
          {
            $type: 'zeebe:Header',
            key: 'header-4-key',
            value: 'header-4-new-value'
          },
        ]);
      }));

    });

  });


  describe('change template (no new template specified)', function() {

    describe('should not remove properties', function() {

      beforeEach(bootstrap(require('./task-template.bpmn').default));


      it('execute', inject(function(elementRegistry) {

        // given
        const task = elementRegistry.get('Task_1');

        // when
        changeTemplate(task, null);

        // then
        expectNoElementTemplate(task);

        expect(findExtension(task, 'zeebe:TaskDefinition')).to.exist;
        expect(findExtension(task, 'zeebe:IoMapping')).to.exist;
        expect(findExtension(task, 'zeebe:TaskHeaders')).to.exist;
      }));


      it('undo', inject(function(commandStack, elementRegistry) {

        // given
        const task = elementRegistry.get('Task_1');

        changeTemplate(task, null);

        // when
        commandStack.undo();

        // then
        expectElementTemplate(task, 'task-template', 1);
      }));


      it('redo', inject(function(commandStack, elementRegistry) {

        // given
        const task = elementRegistry.get('Task_1');

        changeTemplate(task, null);

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expectNoElementTemplate(task);

        expect(findExtension(task, 'zeebe:TaskDefinition')).to.exist;
        expect(findExtension(task, 'zeebe:IoMapping')).to.exist;
        expect(findExtension(task, 'zeebe:TaskHeaders')).to.exist;
      }));

    });

  });

});



// helpers //////////

function changeTemplate(element, newTemplate, oldTemplate) {
  return getBpmnJS().invoke(function(commandStack, elementRegistry) {
    if (isString(element)) {
      element = elementRegistry.get(element);
    }

    expect(element).to.exist;

    return commandStack.execute('propertiesPanel.zeebe.changeTemplate', {
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

    const businessObject = getBusinessObject(element);

    expect(businessObject.get('zeebe:modelerTemplate')).to.exist;
    expect(businessObject.get('zeebe:modelerTemplate')).to.equal(id);

    if (isUndefined(version)) {
      return;
    }

    expect(businessObject.get('zeebe:modelerTemplateVersion')).to.exist;
    expect(businessObject.get('zeebe:modelerTemplateVersion')).to.equal(version);
  });
}

function expectNoElementTemplate(element) {
  getBpmnJS().invoke(function(elementRegistry) {
    if (isString(element)) {
      element = elementRegistry.get(element);
    }

    expect(element).to.exist;

    const businessObject = getBusinessObject(element);

    expect(businessObject.get('zeebe:modelerTemplate')).not.to.exist;
    expect(businessObject.get('zeebe:modelerTemplateVersion')).not.to.exist;
  });
}

function createTemplate(properties, scope) {
  if (!isArray(properties)) {
    properties = [ properties ];
  }

  const template = {
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

function getInputParameter(element, name) {
  const ioMapping = findExtension(element, 'zeebe:IoMapping');

  return find(ioMapping.get('zeebe:inputParameters'), function(inputParameter) {
    return inputParameter.get('zeebe:target') === name;
  });
}

function getOutputParameter(element, source) {
  const ioMapping = findExtension(element, 'zeebe:IoMapping');

  return find(ioMapping.get('zeebe:outputParameters'), function(outputParameter) {
    return outputParameter.get('zeebe:source') === source;
  });
}

function getTaskHeader(element, key) {
  const taskHeaders = findExtension(element, 'zeebe:TaskHeaders');

  return find(taskHeaders.get('zeebe:values'), function(outputParameter) {
    return outputParameter.get('zeebe:key') === key;
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
