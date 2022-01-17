import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import {
  getExtensionElementsList
} from './ExtensionElementsUtil';

const SPACE_REGEX = /\s/;

// for QName validation as per http://www.w3.org/TR/REC-xml/#NT-NameChar
const QNAME_REGEX = /^([a-z][\w-.]*:)?[a-z_][\w-.]*$/i;

// for ID validation as per BPMN Schema (QName - Namespace)
const ID_REGEX = /^[a-z_][\w-.]*$/i;

export function getPropagateAllChildVariables(element) {
  const calledElement = getCalledElement(element);

  return calledElement ? calledElement.get('propagateAllChildVariables') : undefined;
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

export function isIdValid(idValue, translate) {
  if (!idValue) {
    return;
  }

  return validateId(idValue, translate);
}

export function validateId(idValue, translate) {

  if (containsSpace(idValue)) {
    return translate('ID must not contain spaces.');
  }

  if (!ID_REGEX.test(idValue)) {

    if (QNAME_REGEX.test(idValue)) {
      return translate('ID must not contain prefix.');
    }

    return translate('ID must be a valid QName.');
  }
}

export function containsSpace(value) {
  return SPACE_REGEX.test(value);
}