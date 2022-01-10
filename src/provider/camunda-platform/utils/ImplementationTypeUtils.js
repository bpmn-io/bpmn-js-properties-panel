import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  isAny
} from 'bpmn-js/lib/features/modeling/util/ModelingUtil';

import {
  getMessageEventDefinition
} from '../../bpmn/utils/EventDefinitionUtil';

import {
  getExtensionElementsList
} from '../../../utils/ExtensionElementsUtil';


/**
 * Check whether an element is camunda:ServiceTaskLike
 *
 * @param {djs.model.Base} element
 *
 * @return {boolean} a boolean value
 */
export function isServiceTaskLike(element) {
  return is(element, 'camunda:ServiceTaskLike');
}

/**
 * Returns 'true' if the given element is 'camunda:DmnCapable'
 *
 * @param {djs.model.Base} element
 *
 * @return {boolean} a boolean value
 */
export function isDmnCapable(element) {
  return is(element, 'camunda:DmnCapable');
}

/**
 * Returns 'true' if the given element is 'camunda:ExternalCapable'
 *
 * @param {djs.model.Base} element
 *
 * @return {boolean} a boolean value
 */
export function isExternalCapable(element) {
  return is(element, 'camunda:ExternalCapable');
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

/**
 * Returns the implementation type of the given element.
 *
 * Possible implementation types are:
 * - dmn
 * - connector
 * - external
 * - class
 * - expression
 * - delegateExpression
 * - script
 * - or undefined, when no matching implementation type is found
 *
 * @param  {djs.model.Base} element
 *
 * @return {String} the implementation type
 */
export function getImplementationType(element) {

  const businessObject = (
    getListenerBusinessObject(element) ||
    getServiceTaskLikeBusinessObject(element)
  );

  if (!businessObject) {
    return;
  }

  if (isDmnCapable(businessObject)) {
    const decisionRef = businessObject.get('camunda:decisionRef');
    if (typeof decisionRef !== 'undefined') {
      return 'dmn';
    }
  }

  if (isServiceTaskLike(businessObject)) {
    const connectors = getExtensionElementsList(businessObject, 'camunda:Connector');
    if (connectors.length) {
      return 'connector';
    }
  }

  if (isExternalCapable(businessObject)) {
    const type = businessObject.get('camunda:type');
    if (type === 'external') {
      return 'external';
    }
  }

  const cls = businessObject.get('camunda:class');
  if (typeof cls !== 'undefined') {
    return 'class';
  }

  const expression = businessObject.get('camunda:expression');
  if (typeof expression !== 'undefined') {
    return 'expression';
  }

  const delegateExpression = businessObject.get('camunda:delegateExpression');
  if (typeof delegateExpression !== 'undefined') {
    return 'delegateExpression';
  }

  const script = businessObject.get('script');
  if (typeof script !== 'undefined') {
    return 'script';
  }
}

function getListenerBusinessObject(businessObject) {
  if (isAny(businessObject, [ 'camunda:ExecutionListener','camunda:TaskListener' ])) {
    return businessObject;
  }
}
