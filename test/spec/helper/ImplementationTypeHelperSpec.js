'use strict';

var BpmnModdle = require('bpmn-moddle');
var CamundaBpmnModdle = require('camunda-bpmn-moddle/resources/camunda');

var ImplementationTypeHelper = require('../../../lib/helper/ImplementationTypeHelper');

describe('implementation type', function() {

  var moddle = new BpmnModdle({
    camunda: CamundaBpmnModdle
  });


  describe('service task like', function() {

    var serviceTask;

    beforeEach(function() {
      serviceTask = moddle.create('bpmn:ServiceTask');
    });


    it('should return no implementation type', function() {

      // when
      var type = ImplementationTypeHelper.getImplementationType(serviceTask);

      // then
      expect(type).to.be.undefined;
    });


    it('should return class as implementation type', function() {

      // given
      serviceTask.set('camunda:class', 'foo');

      // when
      var type = ImplementationTypeHelper.getImplementationType(serviceTask);

      // then
      expect(type).to.equal('class');
    });


    it('should return delegate as implementation type', function() {

      // given
      serviceTask.set('camunda:delegateExpression', 'foo');

      // when
      var type = ImplementationTypeHelper.getImplementationType(serviceTask);

      // then
      expect(type).to.equal('delegateExpression');
    });


    it('should return expression as implementation type', function() {

      // given
      serviceTask.set('camunda:expression', 'foo');

      // when
      var type = ImplementationTypeHelper.getImplementationType(serviceTask);

      // then
      expect(type).to.equal('expression');
    });


    it('should return external as implementation type', function() {

      // given
      serviceTask.set('camunda:type', 'external');

      // when
      var type = ImplementationTypeHelper.getImplementationType(serviceTask);

      // then
      expect(type).to.equal('external');
    });


    it('should return connector as implementation type', function() {

      // given
      var extensionElements = moddle.create('bpmn:ExtensionElements');
      var connector = moddle.create('camunda:Connector');
      extensionElements.set('values', [ connector ]);
      serviceTask.set('extensionElements', extensionElements);

      // when
      var type = ImplementationTypeHelper.getImplementationType(serviceTask);

      // then
      expect(type).to.equal('connector');
    });


    describe('with multiple implementation types', function() {


      it('should return connector as implementation type', function() {

        // given
        var extensionElements = moddle.create('bpmn:ExtensionElements');
        var connector = moddle.create('camunda:Connector');
        extensionElements.set('values', [ connector ]);
        serviceTask.set('extensionElements', extensionElements);
        serviceTask.set('camunda:type', 'external');
        serviceTask.set('camunda:class', 'foo');
        serviceTask.set('camunda:delegateExpression', 'foo');
        serviceTask.set('camunda:expression', 'foo');

        // when
        var type = ImplementationTypeHelper.getImplementationType(serviceTask);

        // then
        expect(type).to.equals('connector');
      });


      it('should return external as implementation type', function() {

        // given
        serviceTask.set('camunda:type', 'external');
        serviceTask.set('camunda:class', 'foo');
        serviceTask.set('camunda:delegateExpression', 'foo');
        serviceTask.set('camunda:expression', 'foo');

        // when
        var type = ImplementationTypeHelper.getImplementationType(serviceTask);

        // then
        expect(type).to.equals('external');
      });


      it('should return class as implementation type', function() {

        // given
        serviceTask.set('camunda:class', 'foo');
        serviceTask.set('camunda:delegateExpression', 'foo');
        serviceTask.set('camunda:expression', 'foo');

        // when
        var type = ImplementationTypeHelper.getImplementationType(serviceTask);

        // then
        expect(type).to.equals('class');
      });


      it('should return delegateExpression as implementation type', function() {

        // given
        serviceTask.set('camunda:delegateExpression', 'foo');
        serviceTask.set('camunda:expression', 'foo');

        // when
        var type = ImplementationTypeHelper.getImplementationType(serviceTask);

        // then
        expect(type).to.equal('expression');
      });


    });

  });


  describe('business rule task', function() {

    var businessRuleTask;

    beforeEach(function() {
      businessRuleTask = moddle.create('bpmn:BusinessRuleTask');
    });

    it('should return no implementation type', function() {

      // when
      var type = ImplementationTypeHelper.getImplementationType(businessRuleTask);

      // then
      expect(type).to.be.undefined;
    });


    it('should return class as implementation type', function() {

      // given
      businessRuleTask.set('camunda:class', 'foo');

      // when
      var type = ImplementationTypeHelper.getImplementationType(businessRuleTask);

      // then
      expect(type).to.equal('class');
    });


    it('should return delegate as implementation type', function() {

      // given
      businessRuleTask.set('camunda:delegateExpression', 'foo');

      // when
      var type = ImplementationTypeHelper.getImplementationType(businessRuleTask);

      // then
      expect(type).to.equal('delegateExpression');
    });


    it('should return expression as implementation type', function() {

      // given
      businessRuleTask.set('camunda:expression', 'foo');

      // when
      var type = ImplementationTypeHelper.getImplementationType(businessRuleTask);

      // then
      expect(type).to.equal('expression');
    });


    it('should return connector as implementation type', function() {

      // given
      var extensionElements = moddle.create('bpmn:ExtensionElements');
      var connector = moddle.create('camunda:Connector');
      extensionElements.set('values', [ connector ]);
      businessRuleTask.set('extensionElements', extensionElements);

      // when
      var type = ImplementationTypeHelper.getImplementationType(businessRuleTask);

      // then
      expect(type).to.equal('connector');
    });


    it('should return dmn as implementation type', function() {

      // given
      businessRuleTask.set('camunda:decisionRef', 'foo');

      // when
      var type = ImplementationTypeHelper.getImplementationType(businessRuleTask);

      // then
      expect(type).to.equal('dmn');
    });


    describe('with multiple implementation types', function() {


      it('should return dmn as implementation type', function() {

        // given
        businessRuleTask.set('camunda:decisionRef', 'foo');
        var extensionElements = moddle.create('bpmn:ExtensionElements');
        var connector = moddle.create('camunda:Connector');
        extensionElements.set('values', [ connector ]);
        businessRuleTask.set('extensionElements', extensionElements);
        businessRuleTask.set('camunda:class', 'foo');
        businessRuleTask.set('camunda:delegateExpression', 'foo');
        businessRuleTask.set('camunda:expression', 'foo');

        // when
        var type = ImplementationTypeHelper.getImplementationType(businessRuleTask);

        // then
        expect(type).to.equals('dmn');
      });


      it('should return connector as implementation type', function() {

        // given
        var extensionElements = moddle.create('bpmn:ExtensionElements');
        var connector = moddle.create('camunda:Connector');
        extensionElements.set('values', [ connector ]);
        businessRuleTask.set('extensionElements', extensionElements);
        businessRuleTask.set('camunda:class', 'foo');
        businessRuleTask.set('camunda:delegateExpression', 'foo');
        businessRuleTask.set('camunda:expression', 'foo');

        // when
        var type = ImplementationTypeHelper.getImplementationType(businessRuleTask);

        // then
        expect(type).to.equals('connector');
      });


      it('should return class as implementation type', function() {

        // given
        businessRuleTask.set('camunda:class', 'foo');
        businessRuleTask.set('camunda:delegateExpression', 'foo');
        businessRuleTask.set('camunda:expression', 'foo');

        // when
        var type = ImplementationTypeHelper.getImplementationType(businessRuleTask);

        // then
        expect(type).to.equals('class');
      });


      it('should return expression as implementation type', function() {

        // given
        businessRuleTask.set('camunda:delegateExpression', 'foo');
        businessRuleTask.set('camunda:expression', 'foo');

        // when
        var type = ImplementationTypeHelper.getImplementationType(businessRuleTask);

        // then
        expect(type).to.equal('expression');
      });


    });

  });


  describe('execution listener', function() {

    var listener;

    beforeEach(function() {
      listener = moddle.create('camunda:ExecutionListener');
    });

    it('should return no implementation type', function() {

      // when
      var type = ImplementationTypeHelper.getImplementationType(listener);

      // then
      expect(type).to.be.undefined;
    });


    it('should return class as implementation type', function() {

      // given
      listener.set('camunda:class', 'foo');

      // when
      var type = ImplementationTypeHelper.getImplementationType(listener);

      // then
      expect(type).to.equal('class');
    });


    it('should return delegate as implementation type', function() {

      // given
      listener.set('camunda:delegateExpression', 'foo');

      // when
      var type = ImplementationTypeHelper.getImplementationType(listener);

      // then
      expect(type).to.equal('delegateExpression');
    });


    it('should return expression as implementation type', function() {

      // given
      listener.set('camunda:expression', 'foo');

      // when
      var type = ImplementationTypeHelper.getImplementationType(listener);

      // then
      expect(type).to.equal('expression');
    });


    it('should return script as implementation type', function() {

      // given
      var script = moddle.create('camunda:Script');
      listener.set('camunda:script', script);

      // when
      var type = ImplementationTypeHelper.getImplementationType(listener);

      // then
      expect(type).to.equal('script');
    });


    describe('with multiple implementation types', function() {


      it('should return class as implementation type', function() {

        // given
        listener.set('camunda:class', 'foo');
        listener.set('camunda:delegateExpression', 'foo');
        listener.set('camunda:expression', 'foo');
        var script = moddle.create('camunda:Script');
        listener.set('camunda:script', script);

        // when
        var type = ImplementationTypeHelper.getImplementationType(listener);

        // then
        expect(type).to.equals('class');
      });


      it('should return expression as implementation type', function() {

        // given
        listener.set('camunda:delegateExpression', 'foo');
        listener.set('camunda:expression', 'foo');
        var script = moddle.create('camunda:Script');
        listener.set('camunda:script', script);

        // when
        var type = ImplementationTypeHelper.getImplementationType(listener);

        // then
        expect(type).to.equal('expression');
      });


      it('should return delegateExpression as implementation type', function() {

        // given
        listener.set('camunda:delegateExpression', 'foo');
        var script = moddle.create('camunda:Script');
        listener.set('camunda:script', script);

        // when
        var type = ImplementationTypeHelper.getImplementationType(listener);

        // then
        expect(type).to.equal('delegateExpression');
      });

    });

  });


  describe('message event definition', function() {

    var messageEvent, messageEventDefinition;

    beforeEach(function() {
      messageEvent = moddle.create('bpmn:IntermediateThrowEvent');
      messageEventDefinition = moddle.create('bpmn:MessageEventDefinition');
      messageEvent.set('eventDefinitions', [ messageEventDefinition ]);
    });


    it('should return message event definition', function() {

      // when
      var bo = ImplementationTypeHelper.getServiceTaskLikeBusinessObject(messageEvent);

      // then
      expect(bo.$instanceOf('bpmn:MessageEventDefinition')).to.be.true;

    });


    it('should return no implementation type', function() {

      // when
      var type = ImplementationTypeHelper.getImplementationType(messageEvent);

      // then
      expect(type).to.be.undefined;
    });


    it('should return class as implementation type', function() {

      // given
      messageEventDefinition.set('camunda:class', 'foo');

      // when
      var type = ImplementationTypeHelper.getImplementationType(messageEvent);

      // then
      expect(type).to.equal('class');
    });


    it('should return delegate as implementation type', function() {

      // given
      messageEventDefinition.set('camunda:delegateExpression', 'foo');

      // when
      var type = ImplementationTypeHelper.getImplementationType(messageEvent);

      // then
      expect(type).to.equal('delegateExpression');
    });


    it('should return expression as implementation type', function() {

      // given
      messageEventDefinition.set('camunda:expression', 'foo');

      // when
      var type = ImplementationTypeHelper.getImplementationType(messageEvent);

      // then
      expect(type).to.equal('expression');
    });


    it('should return connector as implementation type', function() {

      // given
      var extensionElements = moddle.create('bpmn:ExtensionElements');
      var connector = moddle.create('camunda:Connector');
      extensionElements.set('values', [ connector ]);
      messageEventDefinition.set('extensionElements', extensionElements);

      // when
      var type = ImplementationTypeHelper.getImplementationType(messageEvent);

      // then
      expect(type).to.equal('connector');
    });


    describe('with multiple implementation types', function() {


      it('should return connector as implementation type', function() {

        // given
        var extensionElements = moddle.create('bpmn:ExtensionElements');
        var connector = moddle.create('camunda:Connector');
        extensionElements.set('values', [ connector ]);
        messageEventDefinition.set('extensionElements', extensionElements);
        messageEventDefinition.set('camunda:class', 'foo');
        messageEventDefinition.set('camunda:delegateExpression', 'foo');
        messageEventDefinition.set('camunda:expression', 'foo');

        // when
        var type = ImplementationTypeHelper.getImplementationType(messageEvent);

        // then
        expect(type).to.equals('connector');
      });


      it('should return class as implementation type', function() {

        // given
        messageEventDefinition.set('camunda:class', 'foo');
        messageEventDefinition.set('camunda:delegateExpression', 'foo');
        messageEventDefinition.set('camunda:expression', 'foo');

        // when
        var type = ImplementationTypeHelper.getImplementationType(messageEvent);

        // then
        expect(type).to.equals('class');
      });


      it('should return expression as implementation type', function() {

        // given
        messageEventDefinition.set('camunda:delegateExpression', 'foo');
        messageEventDefinition.set('camunda:expression', 'foo');

        // when
        var type = ImplementationTypeHelper.getImplementationType(messageEvent);

        // then
        expect(type).to.equal('expression');
      });


    });

  });

});