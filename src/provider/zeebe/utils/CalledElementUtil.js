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

export function getCalledElement(element) {
  const calledElements = getCalledElements(element);
  return calledElements[0];
}

function getCalledElements(element) {
  const bo = getBusinessObject(element);
  const extElements = getExtensionElementsList(bo, 'zeebe:CalledElement');
  return extElements;
}
