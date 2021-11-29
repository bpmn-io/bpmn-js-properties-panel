import {
  getServiceTaskLikeBusinessObject,
  getImplementationType
} from '../../../src/provider/camunda-platform/utils/ImplementationTypeUtils';

import BpmnModdle from 'bpmn-moddle';

import CamundaBpmnModdle from 'camunda-bpmn-moddle/resources/camunda';


describe('<ImplementationTypeUtils', function() {

  const moddle = new BpmnModdle({
    camunda: CamundaBpmnModdle
  });


  describe('getServiceTaskLikeBusinessObject', function() {

    it('should return businessObject for serviceTask', function() {

      // given
      const serviceTask = moddle.create('bpmn:ServiceTask');

      // when
      const businessObject = getServiceTaskLikeBusinessObject(serviceTask);

      // then
      expect(businessObject.$instanceOf('bpmn:ServiceTask')).to.be.true;
    });


    it('should return businessObject for messageEventDefinition', function() {

      // given
      const messageEvent = moddle.create('bpmn:IntermediateThrowEvent'),
            messageEventDefinition = moddle.create('bpmn:MessageEventDefinition');

      messageEvent.set('eventDefinitions', [ messageEventDefinition ]);

      // when
      const businessObject = getServiceTaskLikeBusinessObject(messageEvent);

      // then
      expect(businessObject.$instanceOf('bpmn:MessageEventDefinition')).to.be.true;
    });


    it('should return false for non-<camunda:ServiceTaskLike>', function() {

      // given
      const noneTask = moddle.create('bpmn:Task');

      // when
      const businessObject = getServiceTaskLikeBusinessObject(noneTask);

      // then
      expect(businessObject).to.be.false;
    });

  });


  describe('getImplementationType', function() {

    it('should return dmn', function() {

      // given
      const businessRuleTask = moddle.create('bpmn:BusinessRuleTask', { 'camunda:decisionRef': 'DMN_1' });

      // when
      const type = getImplementationType(businessRuleTask);

      // then
      expect(type).to.eql('dmn');
    });


    it('should return connector', function() {

      // given
      const extensionElements = moddle.create('bpmn:ExtensionElements', {
        values: [ moddle.create('camunda:Connector') ]
      });
      const serviceTask = moddle.create('bpmn:ServiceTask', { extensionElements });

      // when
      const type = getImplementationType(serviceTask);

      // then
      expect(type).to.eql('connector');
    });


    it('should return class', function() {

      // given
      const serviceTask = moddle.create('bpmn:ServiceTask', { 'camunda:class': 'com.test' });

      // when
      const type = getImplementationType(serviceTask);

      // then
      expect(type).to.eql('class');
    });


    it('should return delegate expression', function() {

      // given
      const serviceTask = moddle.create('bpmn:ServiceTask', { 'camunda:delegateExpression': '${42}' });

      // when
      const type = getImplementationType(serviceTask);

      // then
      expect(type).to.eql('delegateExpression');
    });


    it('should return expression', function() {

      // given
      const serviceTask = moddle.create('bpmn:ServiceTask', { 'camunda:expression': '${42}' });

      // when
      const type = getImplementationType(serviceTask);

      // then
      expect(type).to.eql('expression');
    });


    describe('on execution listener', function() {

      function createListener(attributes) {
        return moddle.create('camunda:ExecutionListener', attributes);
      }


      it('should return class', function() {

        // given
        const serviceTask = createListener({ 'camunda:class': 'com.test' });

        // when
        const type = getImplementationType(serviceTask);

        // then
        expect(type).to.eql('class');
      });


      it('should return script', function() {

        // given
        const listener = createListener({ script: 'return 42' });

        // when
        const type = getImplementationType(listener);

        // then
        expect(type).to.eql('script');
      });


      it('should return delegate expression', function() {

        // given
        const serviceTask = createListener({ 'camunda:delegateExpression': '${42}' });

        // when
        const type = getImplementationType(serviceTask);

        // then
        expect(type).to.eql('delegateExpression');
      });


      it('should return expression', function() {

        // given
        const serviceTask = createListener({ 'camunda:expression': '${42}' });

        // when
        const type = getImplementationType(serviceTask);

        // then
        expect(type).to.eql('expression');
      });
    });


    describe('on task listener', function() {

      function createListener(attributes) {
        return moddle.create('camunda:TaskListener', attributes);
      }


      it('should return class', function() {

        // given
        const serviceTask = createListener({ 'camunda:class': 'com.test' });

        // when
        const type = getImplementationType(serviceTask);

        // then
        expect(type).to.eql('class');
      });


      it('should return script', function() {

        // given
        const listener = createListener({ script: 'return 42' });

        // when
        const type = getImplementationType(listener);

        // then
        expect(type).to.eql('script');
      });


      it('should return delegate expression', function() {

        // given
        const serviceTask = createListener({ 'camunda:delegateExpression': '${42}' });

        // when
        const type = getImplementationType(serviceTask);

        // then
        expect(type).to.eql('delegateExpression');
      });


      it('should return expression', function() {

        // given
        const serviceTask = createListener({ 'camunda:expression': '${42}' });

        // when
        const type = getImplementationType(serviceTask);

        // then
        expect(type).to.eql('expression');
      });
    });

  });

});
