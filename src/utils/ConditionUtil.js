import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  getConditionalEventDefinition
} from './EventDefinitionUtil';

/**
 * Get the moddle object of a `bpmn:Condition` for the given element.
 *
 * @param  {ModdleElement} element
 *
 * @return {ModdleElement|undefined}
 */
export function getCondition(element) {
  const businessObject = getBusinessObject(element);

  if (is(businessObject, 'bpmn:SequenceFlow')) {
    return businessObject.get('conditionExpression');
  }

  if (is(businessObject, 'bpmn:Event')) {
    const conditionalEventDefinition = getConditionalEventDefinition(businessObject);
    return conditionalEventDefinition?.get('condition');
  }
}

/**
 * Get the value of the `bpmn:Condition` body for the given element.
 *
 * @param  {ModdleElement} element
 *
 * @return {string|undefined}
 */
export function getConditionBody(element) {
  const condition = getCondition(element);
  return condition?.get('body');
}

/**
 * Set the value of the `bpmn:Condition` body
 * in the `bpmn:ConditionalEventDefinition` for the given element.
 *
 * @param  {ModdleElement} element
 * @param  {string} value
 * @param  {CommandStack} commandStack
 */
export function setConditionalEventConditionBody(element, value, commandStack) {

  const conditionalEventDefinition = getConditionalEventDefinition(element);

  if (!conditionalEventDefinition) {
    throw new Error('Element does not have bpmn:ConditionalEventDefinition');
  }

  const condition = conditionalEventDefinition.get('condition');

  commandStack.execute('element.updateModdleProperties', {
    element: conditionalEventDefinition,
    moddleElement: condition,
    properties: {
      body: value
    }
  });
}