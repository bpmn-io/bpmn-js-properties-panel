import {
  bootstrapCamundaCloudModeler,
  inject
} from 'test/TestHelper';

import { isTimerExpressionTypeSupported } from '../../../src/provider/zeebe/utils/TimerUtil';

import diagramXML from './TimerUtil.bpmn';


describe('camunda-cloud/util - TimerUtil', function() {

  beforeEach(bootstrapCamundaCloudModeler(diagramXML));


  expectTimerExpressionTypesSupported('timer start event', 'TimerStartEvent_1', {
    timeCycle: true,
    timeDate: true,
    timeDuration: false
  });


  expectTimerExpressionTypesSupported('timer intermediate catch event', 'TimerIntermediateCatchEvent_1', {
    timeCycle: false,
    timeDate: true,
    timeDuration: true
  });


  expectTimerExpressionTypesSupported('non-interrupting timer boundary event', 'NonInterruptingTimerBoundaryEvent_1', {
    timeCycle: true,
    timeDate: true,
    timeDuration: true
  });


  expectTimerExpressionTypesSupported('timer boundary event', 'TimerBoundaryEvent_1', {
    timeCycle: false,
    timeDate: true,
    timeDuration: true
  });


  expectTimerExpressionTypesSupported('non-interrupting timer start event (event sub-process)', 'NonInterruptingTimerStartEvent_1', {
    timeCycle: true,
    timeDate: true,
    timeDuration: true
  });


  expectTimerExpressionTypesSupported('timer start event (event sub-process)', 'TimerStartEvent_2', {
    timeCycle: false,
    timeDate: true,
    timeDuration: true
  });

});



// helpers //////////

function expectTimerExpressionTypesSupported(elementType, elementId, expressionTypes) {
  it(`should support expression types for ${ elementType }`, inject(function(elementRegistry) {
    const element = elementRegistry.get(elementId);

    for (const expressionType in expressionTypes) {
      expect(isTimerExpressionTypeSupported(expressionType, element)).to.equal(expressionTypes[ expressionType ]);
    }
  }));
}