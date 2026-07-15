import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import {
  getExtensionElementsList
} from '../../../utils/ExtensionElementsUtil';


export function getPropagateAllChildVariables(element) {
  const calledElement = getCalledElement(element);

  return calledElement ? calledElement.get('propagateAllChildVariables') : undefined;
}

export function getPropagateAllParentVariables(element) {
  const calledElement = getCalledElement(element);

  return calledElement ? calledElement.get('propagateAllParentVariables') : undefined;
}

export function getProcessId(element) {
  const calledElement = getCalledElement(element);

  return calledElement ? calledElement.get('processId') : '';
}

export function getBindingType(element) {
  const calledElement = getCalledElement(element);

  return calledElement ? calledElement.get('bindingType') : '';
}

/**
 * Get the configured Business ID of the child process instance.
 *
 * @param {Object} element
 *
 * @returns {string|undefined} the Business ID override, or `undefined` when
 * the Business ID is inherited from the parent
 */
export function getBusinessId(element) {
  const calledElement = getCalledElement(element);

  return calledElement ? calledElement.get('businessId') : undefined;
}

/**
 * Check whether the Call Activity overrides the child's Business ID instead of
 * inheriting it from the parent process instance.
 *
 * @param {Object} element
 *
 * @returns {boolean}
 */
export function hasBusinessId(element) {
  return getBusinessId(element) !== undefined;
}

export function getCalledElement(element) {
  const calledElements = getCalledElements(element);
  return calledElements[0];
}

function getCalledElements(element) {
  const bo = getBusinessObject(element);
  const extElements = getExtensionElementsList(bo, 'zeebe:CalledElement');
  return extElements;
}
