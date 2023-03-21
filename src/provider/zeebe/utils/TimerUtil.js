import {
  getBusinessObject,
  is,
  isAny
} from 'bpmn-js/lib/util/ModelUtil';


export function getTimerEventDefinition(element) {
  const businessObject = getBusinessObject(element);

  return businessObject.get('eventDefinitions').find(eventDefinition => {
    return is(eventDefinition, 'bpmn:TimerEventDefinition');
  });
}

/**
 * Check whether a given timer expression type is supported for a given element.
 *
 * @param {string} type
 * @param {Element|ModdleElement} element
 *
 * @return {boolean}
 */
export function isTimerExpressionTypeSupported(type, element) {
  const businessObject = getBusinessObject(element);

  switch (type) {
  case 'timeDate':
    return isAny(element, [
      'bpmn:BoundaryEvent',
      'bpmn:IntermediateCatchEvent',
      'bpmn:StartEvent'
    ]);

  case 'timeCycle':
    if (is(element, 'bpmn:StartEvent') && (!hasParentEventSubProcess(businessObject)) || !isInterrupting(businessObject)) {
      return true;
    }

    if (is(element, 'bpmn:BoundaryEvent') && !isInterrupting(businessObject)) {
      return true;
    }

    return false;

  case 'timeDuration':
    if (isAny(element, [
      'bpmn:BoundaryEvent',
      'bpmn:IntermediateCatchEvent'
    ])) {
      return true;
    }

    if (is(element, 'bpmn:StartEvent') && hasParentEventSubProcess(businessObject)) {
      return true;
    }

    return false;

  default:
    return false;
  }
}

function isInterrupting(businessObject) {
  if (is(businessObject, 'bpmn:BoundaryEvent')) {
    return businessObject.get('cancelActivity') !== false;
  }

  return businessObject.get('isInterrupting') !== false;
}

function hasParentEventSubProcess(businessObject) {
  const parent = businessObject.$parent;

  return parent && is(parent, 'bpmn:SubProcess') && parent.get('triggeredByEvent');
}