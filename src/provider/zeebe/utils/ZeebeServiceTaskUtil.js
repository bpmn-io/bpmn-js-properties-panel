import {
  is,
  isAny
} from 'bpmn-js/lib/util/ModelUtil';

import {
  getMessageEventDefinition
} from '../../bpmn/utils/EventDefinitionUtil';

import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import {
  getExtensionElementsList
} from '../../../utils/ExtensionElementsUtil';

const OPTIONAL_JOB_WORKER_ELEMENTS = [
  'bpmn:AdHocSubProcess',
  'bpmn:BusinessRuleTask',
  'bpmn:ScriptTask'
];

export function isZeebeServiceTask(element) {
  if (!is(element, 'zeebe:ZeebeServiceTask')) return false;

  if (is(element, 'bpmn:EndEvent') || is(element, 'bpmn:IntermediateThrowEvent')) {
    return !!getMessageEventDefinition(element);
  }

  // Elements which may optionally be implemented as job workers
  if (isAny(element, OPTIONAL_JOB_WORKER_ELEMENTS) && !getTaskDefinition(element)) {
    return false;
  }

  return true;
}

export function isMessageEndEvent(element) {
  return is(element, 'bpmn:EndEvent') && !!getMessageEventDefinition(element);
}

export function isMessageThrowEvent(element) {
  return is(element, 'bpmn:IntermediateThrowEvent') && !!getMessageEventDefinition(element);
}

// helper ////////////////

function getTaskDefinition(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:TaskDefinition')[0];
}
