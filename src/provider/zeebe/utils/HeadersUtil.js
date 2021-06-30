import {
  isAny
} from 'bpmn-js/lib/features/modeling/util/ModelingUtil';

import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import {
  getExtensionElementsList
} from './ExtensionElementsUtil';

export function areHeadersSupported(element) {
  return isAny(element, [
    'zeebe:ZeebeServiceTask',
    'bpmn:UserTask'
  ]);
}

/**
 * Get first zeebe:TaskHeaders element for a specific element.
 *
 * @param  {ModdleElement} element
 *
 * @return {ModdleElement} a zeebe:TaskHeader element
 */
export function getTaskHeaders(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:TaskHeaders')[0];
}

/**
 * Retrieve all zeebe:Header elements for a specific element.
 *
 * @param  {ModdleElement} element
 *
 * @return {Array<ModdleElement>} a list of zeebe:Header elements
 */
export function getHeaders(element) {
  const taskHeaders = getTaskHeaders(element);

  return taskHeaders ? taskHeaders.get('values') : [];
}
