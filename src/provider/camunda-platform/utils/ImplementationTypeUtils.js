import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  getMessageEventDefinition
} from '../../bpmn/utils/EventDefinitionUtil';


/**
 * isServiceTaskLike - check whether an element is camunda:ServiceTaskLike
 *
 * @param {djs.model.Base} element
 * @return {boolean} a boolean value
 */
export function isServiceTaskLike(element) {
  return is(element, 'camunda:ServiceTaskLike');
}


/**
 * getServiceTaskLikeBusinessObject - Get a 'camunda:ServiceTaskLike' business object.
 *
 * If the given element is not a 'camunda:ServiceTaskLike', then 'false'
 * is returned.
 *
 * @param {djs.model.Base} element
 * @return {ModdleElement} the 'camunda:ServiceTaskLike' business object
 */
export function getServiceTaskLikeBusinessObject(element) {

  if (is(element, 'bpmn:IntermediateThrowEvent') || is(element, 'bpmn:EndEvent')) {

    // change business object to 'messageEventDefinition' when
    // the element is a message intermediate throw event or message end event
    // because the camunda extensions (e.g. camunda:class) are in the message
    // event definition tag and not in the intermediate throw event or end event tag
    const messageEventDefinition = getMessageEventDefinition(element);
    if (messageEventDefinition) {
      element = messageEventDefinition;
    }
  }

  return isServiceTaskLike(element) && getBusinessObject(element);
}
