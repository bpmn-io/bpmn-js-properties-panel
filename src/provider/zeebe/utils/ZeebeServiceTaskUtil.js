import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  getMessageEventDefinition
} from '../../bpmn/utils/EventDefinitionUtil';


export function isZeebeServiceTask(element) {
  if (!is(element, 'zeebe:ZeebeServiceTask')) return false;

  if (is(element, 'bpmn:EndEvent') || is(element, 'bpmn:IntermediateThrowEvent')) {
    return !!getMessageEventDefinition(element);
  }

  return true;
}

export function isMessageEndEvent(element) {
  return is(element, 'bpmn:EndEvent') && !!getMessageEventDefinition(element);
}

export function isMessageThrowEvent(element) {
  return is(element, 'bpmn:IntermediateThrowEvent') && !!getMessageEventDefinition(element);
}