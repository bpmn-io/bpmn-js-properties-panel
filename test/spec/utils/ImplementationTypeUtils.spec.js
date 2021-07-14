import {
  getServiceTaskLikeBusinessObject
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
      const serviceTask = moddle.create('bpmn:Task');

      // when
      const businessObject = getServiceTaskLikeBusinessObject(serviceTask);

      // then
      expect(businessObject).to.be.false;
    });

  });

});
