'use strict';

var TestHelper = require('../../../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var coreModule = require('bpmn-js/lib/core'),
    modelingModule = require('bpmn-js/lib/features/modeling'),
    propertiesPanelCommandsModule = require('../../../../../../lib/cmd'),
    elementTemplatesModule = require('../../../../../../lib/provider/camunda/element-templates'),
    camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda');

var Helper = require('../../../../../../lib/provider/camunda/element-templates/Helper');

var findExtension = Helper.findExtension,
    findExtensions = Helper.findExtensions;


describe('element-templates - cmd', function() {

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  describe('should apply element template', function() {

    describe('setting bpmn:conditionExpression', function() {

      var diagramXML = require('./sequenceFlow-clean.bpmn');

      var newTemplate = require('./vip-path');

      beforeEach(bootstrapModeler(diagramXML, {
        container: container,
        modules: [
          coreModule,
          modelingModule,
          propertiesPanelCommandsModule,
          elementTemplatesModule
        ],
        moddleExtensions: {
          camunda: camundaModdlePackage
        }
      }));


      it('execute', inject(function(elementRegistry) {

        // given
        var sequenceFlowConnection = elementRegistry.get('SequenceFlow_1'),
            sequenceFlow = sequenceFlowConnection.businessObject;

        // when
        applyTemplate(sequenceFlowConnection, newTemplate);

        var conditionExpression = sequenceFlow.conditionExpression,
            elementTemplate = sequenceFlow.modelerTemplate;

        // then
        expect(conditionExpression).to.exist;
        expect(conditionExpression.$type).to.eql('bpmn:FormalExpression');
        expect(conditionExpression.body).to.eql('${ customer.vip }');
        expect(elementTemplate).to.exist;
        expect(elementTemplate).to.equal('e.com.merce.FastPath');
      }));


      it('undo', inject(function(elementRegistry, commandStack) {

        // given
        var sequenceFlowConnection = elementRegistry.get('SequenceFlow_1'),
            sequenceFlow = sequenceFlowConnection.businessObject;

        applyTemplate(sequenceFlowConnection, newTemplate);


        // when
        commandStack.undo();

        var condition = sequenceFlow.conditionExpression,
            elementTemplate = sequenceFlow.modelerTemplate;

        // then
        expect(condition).not.to.exist;
        expect(elementTemplate).not.to.exist;
      }));

    });


    describe('setting camunda:async', function() {

      var diagramXML = require('./task-clean.bpmn');

      var newTemplate = require('./better-async-task');

      beforeEach(bootstrapModeler(diagramXML, {
        container: container,
        modules: [
          coreModule,
          modelingModule,
          propertiesPanelCommandsModule,
          elementTemplatesModule
        ],
        moddleExtensions: {
          camunda: camundaModdlePackage
        }
      }));


      it('execute', inject(function(elementRegistry) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            task = taskShape.businessObject;

        // when
        applyTemplate(taskShape, newTemplate);

        var asyncBefore = task.get('camunda:asyncBefore'),
            elementTemplate = task.modelerTemplate;

        // then
        expect(asyncBefore).to.be.true;
        expect(elementTemplate).to.exist;
        expect(elementTemplate).to.equal('my.awesome.Task');
      }));


      it('undo', inject(function(elementRegistry, commandStack) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            task = taskShape.businessObject;

        applyTemplate(taskShape, newTemplate);


        // when
        commandStack.undo();

        var asyncBefore = task.get('camunda:asyncBefore'),
            elementTemplate = task.modelerTemplate;

        // then
        expect(asyncBefore).to.be.false;
        expect(elementTemplate).not.to.exist;
      }));

    });


    describe('setting camunda:inputOutput', function() {

      var diagramXML = require('./task-clean.bpmn');

      var newTemplate = require('./mail-task');

      beforeEach(bootstrapModeler(diagramXML, {
        container: container,
        modules: [
          coreModule,
          modelingModule,
          propertiesPanelCommandsModule,
          elementTemplatesModule
        ],
        moddleExtensions: {
          camunda: camundaModdlePackage
        }
      }));


      it('execute', inject(function(elementRegistry) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            task = taskShape.businessObject;

        // when
        applyTemplate(taskShape, newTemplate);

        var inputOutput = findExtension(taskShape, 'camunda:InputOutput'),
            elementTemplate = task.modelerTemplate;

        // then
        expect(inputOutput).to.exist;

        expect(inputOutput.inputParameters).to.jsonEqual([
          {
            $type: 'camunda:InputParameter',
            name: 'recipient'
          },
          {
            $type: 'camunda:InputParameter',
            name: 'messageBody',
            definition: {
              $type: 'camunda:Script',
              scriptFormat: 'freemarker',
              value: 'Hello ${firstName}!'
            }
          },
          {
            $type: 'camunda:InputParameter',
            name: 'hiddenField',
            value: 'SECRET'
          }
        ]);

        expect(inputOutput.outputParameters).to.jsonEqual([
          {
            $type: 'camunda:OutputParameter',
            name: 'mailResult',
            definition: {
              $type: 'camunda:Script',
              scriptFormat: 'freemarker',
              value: '${mailResult}'
            }
          }
        ]);

        expect(elementTemplate).to.exist;
        expect(elementTemplate).to.equal('my.mail.Task');
      }));


      it('undo', inject(function(elementRegistry, commandStack) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            task = taskShape.businessObject;

        applyTemplate(taskShape, newTemplate);

        // when
        commandStack.undo();

        var inputOutput = findExtension(taskShape, 'camunda:InputOutput'),
            elementTemplate = task.modelerTemplate;

        // then
        expect(inputOutput).not.to.exist;
        expect(elementTemplate).not.to.exist;
      }));

    });


    describe('setting camunda:in / camunda:out', function() {

      var diagramXML = require('./call-activity.bpmn');

      var newTemplate = require('./call-activity-mapped');

      beforeEach(bootstrapModeler(diagramXML, {
        container: container,
        modules: [
          coreModule,
          modelingModule,
          propertiesPanelCommandsModule,
          elementTemplatesModule
        ],
        moddleExtensions: {
          camunda: camundaModdlePackage
        }
      }));


      it('execute', inject(function(elementRegistry) {

        // given
        var callActitvityShape = elementRegistry.get('CallActivity_1'),
            callActivity = callActitvityShape.businessObject;

        // when
        applyTemplate(callActitvityShape, newTemplate);

        var inOuts = findExtensions(callActitvityShape, [ 'camunda:In', 'camunda:Out' ]),
            elementTemplate = callActivity.modelerTemplate;

        // then
        expect(inOuts).to.exist;

        expect(inOuts).to.jsonEqual([
          { $type: 'camunda:In', target: 'var_called_source', source: 'var_local' },
          { $type: 'camunda:Out', target: 'var_called', source: 'var_local_source' },
          { $type: 'camunda:In', target: 'var_called_expr', sourceExpression: '${expr_local}' },
          { $type: 'camunda:Out', target: 'var_local_expr', sourceExpression: '${expr_called}' },
          { $type: 'camunda:In', variables: 'all' },
          { $type: 'camunda:Out', variables: 'all' },
          { $type: 'camunda:In', variables: 'all', local: true },
          { $type: 'camunda:Out', variables: 'all', local: true },
          { $type: 'camunda:In', businessKey: '${execution.processBusinessKey}' }
        ]);

        expect(elementTemplate).to.exist;
        expect(elementTemplate).to.equal('my.Caller');
      }));


      it('undo', inject(function(elementRegistry, commandStack) {

        // given
        var callActitvityShape = elementRegistry.get('CallActivity_1'),
            callActivity = callActitvityShape.businessObject;

        applyTemplate(callActitvityShape, newTemplate);

        // when
        commandStack.undo();

        var inOuts = findExtensions(callActitvityShape, [ 'camunda:In', 'camunda:Out' ]),
            elementTemplate = callActivity.modelerTemplate;

        // then
        expect(inOuts).to.have.length(2);
        expect(elementTemplate).not.to.exist;
      }));

    });


    describe('setting camunda:properties', function() {

      var diagramXML = require('./task-clean.bpmn');

      var newTemplate = require('./ws-properties');

      beforeEach(bootstrapModeler(diagramXML, {
        container: container,
        modules: [
          coreModule,
          modelingModule,
          propertiesPanelCommandsModule,
          elementTemplatesModule
        ],
        moddleExtensions: {
          camunda: camundaModdlePackage
        }
      }));


      it('execute', inject(function(elementRegistry) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            task = taskShape.businessObject;

        // when
        applyTemplate(taskShape, newTemplate);

        var properties = findExtension(taskShape, 'camunda:Properties'),
            elementTemplate = task.modelerTemplate;

        // then
        expect(properties).to.exist;

        expect(properties.values).to.jsonEqual([
          {
            $type: 'camunda:Property',
            name: 'webServiceUrl',
            value: ''
          }
        ]);

        expect(elementTemplate).to.exist;
        expect(elementTemplate).to.equal('com.mycompany.WsCaller');
      }));


      it('undo', inject(function(elementRegistry, commandStack) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            task = taskShape.businessObject;

        applyTemplate(taskShape, newTemplate);

        // when
        commandStack.undo();

        var properties = findExtension(taskShape, 'camunda:Properties'),
            elementTemplate = task.modelerTemplate;

        // then
        expect(properties).not.to.exist;
        expect(elementTemplate).not.to.exist;
      }));

    });


    describe('with scope connector', function() {

      var diagramXML = require('./task-clean.bpmn');

      var newTemplate = require('./connector-task');

      beforeEach(bootstrapModeler(diagramXML, {
        container: container,
        modules: [
          coreModule,
          modelingModule,
          propertiesPanelCommandsModule,
          elementTemplatesModule
        ],
        moddleExtensions: {
          camunda: camundaModdlePackage
        }
      }));


      it('execute', inject(function(elementRegistry) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            task = taskShape.businessObject;

        // when
        applyTemplate(taskShape, newTemplate);

        var connector = findExtension(taskShape, 'camunda:Connector');
        var inputOutput = connector.get('inputOutput');
        var elementTemplate = task.modelerTemplate;

        // then
        expect(connector).to.exist;

        expect(connector.get('connectorId')).to.equal('My Connector HTTP - GET');

        expect(inputOutput).to.exist;

        expect(inputOutput.inputParameters).to.jsonEqual([
          {
            $type: 'camunda:InputParameter',
            name: 'method',
            value: 'GET'
          },
          {
            $type: 'camunda:InputParameter',
            name: 'url',
            value: 'https://bpmn.io'
          }
        ]);

        expect(inputOutput.outputParameters).to.jsonEqual([
          {
            $type: 'camunda:OutputParameter',
            name: 'wsResponse',
            definition: {
              $type: 'camunda:Script',
              scriptFormat: 'freemarker',
              value: '${S(response)}'
            }
          }
        ]);

        expect(elementTemplate).to.exist;
        expect(elementTemplate).to.equal('my.connector.http.get.Task');
      }));


      it('undo', inject(function(elementRegistry, commandStack) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            task = taskShape.businessObject;

        applyTemplate(taskShape, newTemplate);

        // when
        commandStack.undo();

        var connector = findExtension(taskShape, 'camunda:Connector');
        var elementTemplate = task.modelerTemplate;

        // then
        expect(connector).not.to.exist;
        expect(elementTemplate).not.to.exist;
      }));

    });


    describe('override behavior', function() {

      describe('camunda:executionListener', function() {

        var diagramXML = require('./task-execution-listener.bpmn');

        var newTemplate = require('./ws-properties');

        beforeEach(bootstrapModeler(diagramXML, {
          container: container,
          modules: [
            coreModule,
            modelingModule,
            propertiesPanelCommandsModule,
            elementTemplatesModule
          ],
          moddleExtensions: {
            camunda: camundaModdlePackage
          }
        }));


        it('should keep old if unspecified', inject(function(elementRegistry) {

          // given
          var taskShape = elementRegistry.get('Task_1'),
              task = taskShape.businessObject;

          // when
          applyTemplate(taskShape, newTemplate);

          var executionListeners = findExtensions(taskShape, [ 'camunda:ExecutionListener' ]),
              elementTemplate = task.modelerTemplate;

          // then
          expect(executionListeners).to.jsonEqual([
            {
              $type: 'camunda:ExecutionListener',
              class: 'foo.Bar',
              event: 'start'
            }
          ]);

          expect(elementTemplate).to.exist;
          expect(elementTemplate).to.equal('com.mycompany.WsCaller');
        }));

      });

    });

  });


  describe('should unset element template', function() {

    describe('with bpmn:conditionExpression', function() {

      var diagramXML = require('./sequenceFlow-clean.bpmn');

      var currentTemplate = require('./vip-path');

      beforeEach(bootstrapModeler(diagramXML, {
        container: container,
        modules: [
          coreModule,
          modelingModule,
          propertiesPanelCommandsModule,
          elementTemplatesModule
        ],
        moddleExtensions: {
          camunda: camundaModdlePackage
        }
      }));

      beforeEach(inject(function(elementRegistry) {
        var sequenceFlowConnection = elementRegistry.get('SequenceFlow_1');

        applyTemplate(sequenceFlowConnection, currentTemplate);
      }));


      it('execute', inject(function(elementRegistry) {

        // given
        var sequenceFlowConnection = elementRegistry.get('SequenceFlow_1'),
            sequenceFlow = sequenceFlowConnection.businessObject;

        // when
        applyTemplate(sequenceFlowConnection, null);

        var conditionExpression = sequenceFlow.conditionExpression,
            elementTemplate = sequenceFlow.modelerTemplate;

        // then
        expect(sequenceFlow.get('camunda:modelerTemplate')).not.to.exist;

        // removing a sequence flow template does
        // not change the applied values
        expect(conditionExpression).to.exist;
        expect(conditionExpression.$type).to.eql('bpmn:FormalExpression');
        expect(conditionExpression.body).to.eql('${ customer.vip }');
        expect(elementTemplate).not.to.exist;
      }));


      it('undo', inject(function(elementRegistry, commandStack) {

        // given
        var sequenceFlowConnection = elementRegistry.get('SequenceFlow_1'),
            sequenceFlow = sequenceFlowConnection.businessObject;

        applyTemplate(sequenceFlowConnection, null);


        // when
        commandStack.undo();

        var conditionExpression = sequenceFlow.conditionExpression,
            elementTemplate = sequenceFlow.modelerTemplate;

        // then
        expect(sequenceFlow.get('camunda:modelerTemplate')).to.eql(currentTemplate.id);

        expect(conditionExpression).to.exist;
        expect(conditionExpression.$type).to.eql('bpmn:FormalExpression');
        expect(conditionExpression.body).to.eql('${ customer.vip }');

        expect(elementTemplate).to.exist;
        expect(elementTemplate).to.equal('e.com.merce.FastPath');
      }));

    });


    describe('with camunda:async', function() {

      var diagramXML = require('./task-clean.bpmn');

      var currentTemplate = require('./better-async-task');

      beforeEach(bootstrapModeler(diagramXML, {
        container: container,
        modules: [
          coreModule,
          modelingModule,
          propertiesPanelCommandsModule,
          elementTemplatesModule
        ],
        moddleExtensions: {
          camunda: camundaModdlePackage
        }
      }));


      beforeEach(inject(function(elementRegistry) {
        var taskShape = elementRegistry.get('Task_1');

        applyTemplate(taskShape, currentTemplate);
      }));


      it('execute', inject(function(elementRegistry) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            task = taskShape.businessObject;

        // when
        applyTemplate(taskShape, null);

        // then
        expect(task.get('camunda:modelerTemplate')).not.to.exist;

        // removing a task template does
        // not change the applied values
        expect(task.get('camunda:asyncBefore')).to.be.true;
      }));


      it('undo', inject(function(elementRegistry, commandStack) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            task = taskShape.businessObject;

        applyTemplate(taskShape, null);

        // when
        commandStack.undo();

        // then
        expect(task.get('camunda:modelerTemplate')).to.eql(currentTemplate.id);

        expect(task.get('camunda:asyncBefore')).to.be.true;
      }));

    });


    describe('with camunda:inputOutput', function() {

      var diagramXML = require('./task-clean.bpmn');

      var currentTemplate = require('./mail-task');

      beforeEach(bootstrapModeler(diagramXML, {
        container: container,
        modules: [
          coreModule,
          modelingModule,
          propertiesPanelCommandsModule,
          elementTemplatesModule
        ],
        moddleExtensions: {
          camunda: camundaModdlePackage
        }
      }));

      beforeEach(inject(function(elementRegistry) {
        var taskShape = elementRegistry.get('Task_1');

        applyTemplate(taskShape, currentTemplate);
      }));


      it('execute', inject(function(elementRegistry) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            task = taskShape.businessObject;

        // when
        applyTemplate(taskShape, null);

        var inputOutput = findExtension(taskShape, 'camunda:InputOutput');

        // then
        expect(task.get('camunda:modelerTemplate')).not.to.exist;

        // removing a task template does
        // not change the applied values
        expect(inputOutput).to.exist;

        expect(inputOutput.inputParameters).to.jsonEqual([
          {
            $type: 'camunda:InputParameter',
            name: 'recipient'
          },
          {
            $type: 'camunda:InputParameter',
            name: 'messageBody',
            definition: {
              $type: 'camunda:Script',
              scriptFormat: 'freemarker',
              value: 'Hello ${firstName}!'
            }
          },
          {
            $type: 'camunda:InputParameter',
            name: 'hiddenField',
            value: 'SECRET'
          }
        ]);

        expect(inputOutput.outputParameters).to.jsonEqual([
          {
            $type: 'camunda:OutputParameter',
            name: 'mailResult',
            definition: {
              $type: 'camunda:Script',
              scriptFormat: 'freemarker',
              value: '${mailResult}'
            }
          }
        ]);
      }));


      it('undo', inject(function(elementRegistry, commandStack) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            task = taskShape.businessObject;

        applyTemplate(taskShape, null);


        // when
        commandStack.undo();

        var inputOutput = findExtension(taskShape, 'camunda:InputOutput');

        // then
        expect(task.get('camunda:modelerTemplate')).to.eql(currentTemplate.id);

        expect(inputOutput).to.exist;
      }));

    });


    describe('with camunda:field', function() {

      var diagramXML = require('./task-clean.bpmn');

      var currentTemplate = require('./field-injections');

      beforeEach(bootstrapModeler(diagramXML, {
        container: container,
        modules: [
          coreModule,
          modelingModule,
          propertiesPanelCommandsModule,
          elementTemplatesModule
        ],
        moddleExtensions: {
          camunda: camundaModdlePackage
        }
      }));

      beforeEach(inject(function(elementRegistry) {
        var taskShape = elementRegistry.get('Task_1');

        applyTemplate(taskShape, currentTemplate);
      }));


      it('execute', inject(function(elementRegistry) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            task = taskShape.businessObject;

        // when
        applyTemplate(taskShape, null);

        var fieldInjections = findExtensions(taskShape, [ 'camunda:Field' ]);

        // then
        expect(task.get('camunda:modelerTemplate')).not.to.exist;

        // removing a task template does
        // not change the applied values
        expect(fieldInjections).to.exist;
        expect(fieldInjections).to.jsonEqual([
          {
            $type: 'camunda:Field',
            string: 'My String Field Injection',
            name: 'sender'
          },
          {
            $type: 'camunda:Field',
            string: 'My String Field Injection 2',
            name: 'sender2'
          },
          {
            $type: 'camunda:Field',
            expression: '${PerfectExpression}',
            name: 'sender3'
          }
        ]);
      }));


      it('undo', inject(function(elementRegistry, commandStack) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            task = taskShape.businessObject;

        applyTemplate(taskShape, null);


        // when
        commandStack.undo();

        var fieldInjections = findExtensions(taskShape, [ 'camunda:Field' ]);

        // then
        expect(task.get('camunda:modelerTemplate')).to.eql(currentTemplate.id);

        expect(fieldInjections).to.exist;
      }));

    });


    describe('setting camunda:field with existing fields', function() {

      var diagramXML = require('./task-field-injections.bpmn');

      var fieldInjectionsTemplate = require('./field-injections');

      beforeEach(bootstrapModeler(diagramXML, {
        container: container,
        modules: [
          coreModule,
          modelingModule,
          propertiesPanelCommandsModule,
          elementTemplatesModule
        ],
        moddleExtensions: {
          camunda: camundaModdlePackage
        }
      }));


      it('execute', inject(function(elementRegistry) {

        // given
        var taskShape = elementRegistry.get('Task_1');

        // when
        applyTemplate(taskShape, fieldInjectionsTemplate);

        var fieldInjections = findExtensions(taskShape, [ 'camunda:Field' ]);

        // then
        expect(fieldInjections).to.exist;

        expect(fieldInjections).to.jsonEqual([
          {
            $type: 'camunda:Field',
            string: 'My String Field Injection',
            name: 'sender'
          },
          {
            $type: 'camunda:Field',
            string: 'My String Field Injection 2',
            name: 'sender2'
          },
          {
            $type: 'camunda:Field',
            expression: '${PerfectExpression}',
            name: 'sender3'
          }
        ]);
      }));


      it('undo', inject(function(elementRegistry, commandStack) {

        // given
        var taskShape = elementRegistry.get('Task_1');

        applyTemplate(taskShape, fieldInjectionsTemplate);


        // when
        commandStack.undo();

        var fieldInjections = findExtensions(taskShape, [ 'camunda:Field' ]);

        // then
        expect(fieldInjections).to.exist;

        console.log(fieldInjections);
        expect(fieldInjections).to.jsonEqual([
          {
            $type: 'camunda:Field',
            name: 'existingField',
            string: 'myString'
          },
          {
            $type: 'camunda:Field',
            name: 'existingFieldExpression',
            expression: '${myStringExpression}'
          }
        ]);
      }));

    });


    describe('with scope connector', function() {

      var diagramXML = require('./task-clean.bpmn');

      var currentTemplate = require('./connector-task');

      beforeEach(bootstrapModeler(diagramXML, {
        container: container,
        modules: [
          coreModule,
          modelingModule,
          propertiesPanelCommandsModule,
          elementTemplatesModule
        ],
        moddleExtensions: {
          camunda: camundaModdlePackage
        }
      }));

      beforeEach(inject(function(elementRegistry) {
        var taskShape = elementRegistry.get('Task_1');

        applyTemplate(taskShape, currentTemplate);
      }));


      it('execute', inject(function(elementRegistry) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            task = taskShape.businessObject;

        // when
        applyTemplate(taskShape, null);

        var connector = findExtension(taskShape, 'camunda:Connector');
        var inputOutput = connector.get('inputOutput');

        // then
        expect(task.get('camunda:modelerTemplate')).not.to.exist;

        // removing a task template does
        // not change the applied values
        expect(connector).to.exist;

        expect(inputOutput.inputParameters).to.jsonEqual([
          {
            $type: 'camunda:InputParameter',
            name: 'method',
            value: 'GET'
          },
          {
            $type: 'camunda:InputParameter',
            name: 'url',
            value: 'https://bpmn.io'
          }
        ]);

        expect(inputOutput.outputParameters).to.jsonEqual([
          {
            $type: 'camunda:OutputParameter',
            name: 'wsResponse',
            definition: {
              $type: 'camunda:Script',
              scriptFormat: 'freemarker',
              value: '${S(response)}'
            }
          }
        ]);
      }));


      it('undo', inject(function(elementRegistry, commandStack) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            task = taskShape.businessObject;

        applyTemplate(taskShape, null);


        // when
        commandStack.undo();

        var connector = findExtension(taskShape, 'camunda:Connector');
        var inputOutput = connector.get('inputOutput');

        // then
        expect(task.get('camunda:modelerTemplate')).to.eql(currentTemplate.id);

        expect(connector).to.exist;
        expect(inputOutput).to.exist;
      }));

    });

  });


  describe('should change element template', function() {

    describe('setting camunda:class', function() {

      var diagramXML = require('./serviceTask-camunda-class.bpmn');

      var newTemplate = require('./serviceTask-delegateExpression');

      beforeEach(bootstrapModeler(diagramXML, {
        container: container,
        modules: [
          coreModule,
          modelingModule,
          propertiesPanelCommandsModule,
          elementTemplatesModule
        ],
        moddleExtensions: {
          camunda: camundaModdlePackage
        }
      }));


      it('execute', inject(function(elementRegistry) {

        // given
        var taskShape = elementRegistry.get('ServiceTask_1'),
            task = taskShape.businessObject;

        // assume
        expect(task.get('camunda:class')).to.eql('FOO');

        // when
        applyTemplate(taskShape, newTemplate);

        var camundaCls = task.get('camunda:class');
        var camundaDelegateExpr = task.get('camunda:delegateExpression');

        // then
        expect(camundaCls).not.to.exist;
        expect(camundaDelegateExpr).to.eql('com.my.custom.Foo');
      }));


      it('undo', inject(function(elementRegistry, commandStack) {

        // given
        var taskShape = elementRegistry.get('ServiceTask_1'),
            task = taskShape.businessObject;

        applyTemplate(taskShape, newTemplate);


        // when
        commandStack.undo();

        var camundaCls = task.get('camunda:class');
        var camundaDelegateExpr = task.get('camunda:delegateExpression');

        // then
        expect(camundaCls).to.eql('FOO');
        expect(camundaDelegateExpr).not.to.exist;
      }));

    });


    describe('setting hidden camunda:expression', function() {

      var diagramXML = require('./task-clean.bpmn');

      var newTemplate = require('./ws-properties');

      beforeEach(bootstrapModeler(diagramXML, {
        container: container,
        modules: [
          coreModule,
          modelingModule,
          propertiesPanelCommandsModule,
          elementTemplatesModule
        ],
        moddleExtensions: {
          camunda: camundaModdlePackage
        }
      }));


      it('execute', inject(function(elementRegistry) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            task = taskShape.businessObject;

        // when
        applyTemplate(taskShape, newTemplate);

        var camundaExpression = task.get('camunda:expression');

        // then
        expect(camundaExpression).to.eql('${ wsCaller.exec() }');
      }));


      it('undo', inject(function(elementRegistry, commandStack) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            task = taskShape.businessObject;

        applyTemplate(taskShape, newTemplate);

        // when
        commandStack.undo();

        var camundaExpression = task.get('camunda:expression');

        // then
        expect(camundaExpression).not.to.exist;
      }));

    });


    describe('setting camunda:inputOutput', function() {

      var diagramXML = require('./task-custom-mappings.bpmn');

      var newTemplate = require('./mail-task');

      beforeEach(bootstrapModeler(diagramXML, {
        container: container,
        modules: [
          coreModule,
          modelingModule,
          propertiesPanelCommandsModule,
          elementTemplatesModule
        ],
        moddleExtensions: {
          camunda: camundaModdlePackage
        }
      }));


      it('execute', inject(function(elementRegistry) {

        // given
        var taskShape = elementRegistry.get('Task_1');
        var oldMappings = findExtension(taskShape, 'camunda:InputOutput');

        // assume
        expect(oldMappings).to.exist;

        // when
        applyTemplate(taskShape, newTemplate);

        var inputOutput = findExtension(taskShape, 'camunda:InputOutput');

        // then
        expect(inputOutput).to.exist;
        expect(inputOutput).not.to.eql(oldMappings);
      }));


      it('undo', inject(function(elementRegistry, commandStack) {

        // given
        var taskShape = elementRegistry.get('Task_1');
        var oldMappings = findExtension(taskShape, 'camunda:InputOutput');

        applyTemplate(taskShape, newTemplate);


        // when
        commandStack.undo();

        var currentMappings = findExtension(taskShape, 'camunda:InputOutput');

        // then
        expect(currentMappings).to.eql(oldMappings);
      }));

    });


    describe('setting camunda:properties', function() {

      var diagramXML = require('./task-custom-properties.bpmn');

      var newTemplate = require('./ws-properties');

      beforeEach(bootstrapModeler(diagramXML, {
        container: container,
        modules: [
          coreModule,
          modelingModule,
          propertiesPanelCommandsModule,
          elementTemplatesModule
        ],
        moddleExtensions: {
          camunda: camundaModdlePackage
        }
      }));


      it('execute', inject(function(elementRegistry) {

        // given
        var taskShape = elementRegistry.get('Task_1');

        // when
        applyTemplate(taskShape, newTemplate);

        var properties = findExtension(taskShape, 'camunda:Properties');

        // then
        expect(properties).to.exist;

        expect(properties.values).to.jsonEqual([
          {
            $type: 'camunda:Property',
            name: 'webServiceUrl',
            value: ''
          }
        ]);
      }));


      it('undo', inject(function(elementRegistry, commandStack) {

        // given
        var taskShape = elementRegistry.get('Task_1');

        applyTemplate(taskShape, newTemplate);


        // when
        commandStack.undo();

        var properties = findExtension(taskShape, 'camunda:Properties');

        // then
        expect(properties).to.exist;


        expect(properties.values).to.jsonEqual([
          {
            $type: 'camunda:Property',
            name: 'foo',
            value: 'FOO'
          },
          {
            $type: 'camunda:Property',
            name: 'bar',
            value: 'BAR'
          }
        ]);
      }));

    });

    describe('setting scope connector', function() {

      var diagramXML = require('./task-custom-connector.bpmn');

      var newTemplate = require('./connector-task');

      beforeEach(bootstrapModeler(diagramXML, {
        container: container,
        modules: [
          coreModule,
          modelingModule,
          propertiesPanelCommandsModule,
          elementTemplatesModule
        ],
        moddleExtensions: {
          camunda: camundaModdlePackage
        }
      }));


      it('execute', inject(function(elementRegistry) {

        // given
        var taskShape = elementRegistry.get('Task_1');
        var oldConnector = findExtension(taskShape, 'camunda:Connector');
        var oldMappings = oldConnector.get('inputOutput');

        // assume
        expect(oldConnector).to.exist;
        expect(oldMappings).to.exist;

        expect(oldConnector.get('connectorId')).to.equal('My Connector HTTP - POST');

        // when
        applyTemplate(taskShape, newTemplate);

        var connector = findExtension(taskShape, 'camunda:Connector');
        var inputOutput = connector.get('inputOutput');

        // then
        expect(connector).to.exist;
        expect(inputOutput).to.exist;
        expect(inputOutput).not.to.eql(oldMappings);

        expect(connector.get('connectorId')).to.equal('My Connector HTTP - GET');
      }));


      it('undo', inject(function(elementRegistry, commandStack) {

        // given
        var taskShape = elementRegistry.get('Task_1');
        var oldConnector = findExtension(taskShape, 'camunda:Connector');
        var oldMappings = oldConnector.get('inputOutput');

        // assume
        expect(oldConnector.get('connectorId')).to.equal('My Connector HTTP - POST');

        applyTemplate(taskShape, newTemplate);

        // when
        commandStack.undo();


        var connector = findExtension(taskShape, 'camunda:Connector');
        var currentMappings = connector.get('inputOutput');

        // then
        expect(connector.get('connectorId')).to.equal('My Connector HTTP - POST');
        expect(currentMappings).to.eql(oldMappings);
      }));

    });


  });
});



////// test helpers /////////////////////////////////////

function applyTemplate(element, newTemplate, oldTemplate) {

  return TestHelper.getBpmnJS().invoke(function(elementRegistry, commandStack) {

    return commandStack.execute('propertiesPanel.camunda.changeTemplate', {
      element: element,
      newTemplate: newTemplate,
      oldTemplate: oldTemplate
    });

  });
}
