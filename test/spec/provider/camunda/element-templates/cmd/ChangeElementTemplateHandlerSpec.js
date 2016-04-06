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

var findExtension = Helper.findExtension;


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

        var conditionExpression = sequenceFlow.conditionExpression;

        // then
        expect(conditionExpression).to.exist;
        expect(conditionExpression.$type).to.eql('bpmn:FormalExpression');
        expect(conditionExpression.body).to.eql('${ customer.vip }');
      }));


      it('undo', inject(function(elementRegistry, commandStack) {

        // given
        var sequenceFlowConnection = elementRegistry.get('SequenceFlow_1'),
            sequenceFlow = sequenceFlowConnection.businessObject;

        applyTemplate(sequenceFlowConnection, newTemplate);


        // when
        commandStack.undo();

        var condition = sequenceFlow.conditionExpression;

        // then
        expect(condition).not.to.exist;
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

        var asyncBefore = task.get('camunda:asyncBefore');

        // then
        expect(asyncBefore).to.be.true;
      }));


      it('undo', inject(function(elementRegistry, commandStack) {

        // given
        var taskShape = elementRegistry.get('Task_1'),
            task = taskShape.businessObject;

        applyTemplate(taskShape, newTemplate);


        // when
        commandStack.undo();

        var asyncBefore = task.get('camunda:asyncBefore');

        // then
        expect(asyncBefore).to.be.false;
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
        var taskShape = elementRegistry.get('Task_1');

        // when
        applyTemplate(taskShape, newTemplate);

        var inputOutput = findExtension(taskShape, 'camunda:InputOutput');

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
        var taskShape = elementRegistry.get('Task_1');

        applyTemplate(taskShape, newTemplate);


        // when
        commandStack.undo();

        var inputOutput = findExtension(taskShape, 'camunda:InputOutput');

        // then
        expect(inputOutput).not.to.exist;
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
        expect(properties).not.to.exist;
      }));

    });


    // describe('setting camunda:connector');

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

        var conditionExpression = sequenceFlow.conditionExpression;

        // then
        expect(sequenceFlow.get('camunda:modelerTemplate')).not.to.exist;

        // removing a sequence flow template does
        // not change the applied values
        expect(conditionExpression).to.exist;
        expect(conditionExpression.$type).to.eql('bpmn:FormalExpression');
        expect(conditionExpression.body).to.eql('${ customer.vip }');
      }));


      it('undo', inject(function(elementRegistry, commandStack) {

        // given
        var sequenceFlowConnection = elementRegistry.get('SequenceFlow_1'),
            sequenceFlow = sequenceFlowConnection.businessObject;

        applyTemplate(sequenceFlowConnection, null);


        // when
        commandStack.undo();

        var conditionExpression = sequenceFlow.conditionExpression;

        // then
        expect(sequenceFlow.get('camunda:modelerTemplate')).to.eql(currentTemplate.id);

        expect(conditionExpression).to.exist;
        expect(conditionExpression.$type).to.eql('bpmn:FormalExpression');
        expect(conditionExpression.body).to.eql('${ customer.vip }');
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