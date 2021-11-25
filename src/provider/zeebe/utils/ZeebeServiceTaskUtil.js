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

  // Due to delayed Zeebe 1.3 implementation, temporarily unbuild this
  // TODO: re-enable for Zeebe 1.4 release
  // Cf. https://github.com/camunda/camunda-modeler/issues/2524#issuecomment-979049379
  // A BusinessRuleTask is per default not a ServiceTask, only if it has a TaskDefinition
  // (ie. if the implementation is set to ==JobWorker)
  /* if (is(element, 'bpmn:BusinessRuleTask') && !getTaskDefinition(element)) {
    return false;
  }*/

  return true;
}

export function isMessageEndEvent(element) {
  return is(element, 'bpmn:EndEvent') && !!getMessageEventDefinition(element);
}

export function isMessageThrowEvent(element) {
  return is(element, 'bpmn:IntermediateThrowEvent') && !!getMessageEventDefinition(element);
}

// helper ////////////////

/* function getTaskDefinition(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:TaskDefinition')[0];
}*/
