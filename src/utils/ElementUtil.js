import Ids from 'ids';

import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

/**
 * Create a new element and (optionally) set its parent.
 *
 * @param {string} type
 * @param {Object} properties
 * @param {import('bpmn-js/lib/model/Types').ModdleElement} parent
 * @param {import('bpmn-js/lib/features/modeling/BpmnFactory').default} bpmnFactory
 *
 * @returns {import('bpmn-js/lib/model/Types').ModdleElement}
 */
export function createElement(type, properties, parent, bpmnFactory) {
  const element = bpmnFactory.create(type, properties);

  if (parent) {
    element.$parent = parent;
  }

  return element;
}

/**
 * generate a semantic id with given prefix
 */
export function nextId(prefix) {
  const ids = new Ids([ 32,32,1 ]);

  return ids.nextPrefixed(prefix);
}

export function getRoot(businessObject) {
  let parent = businessObject;

  while (parent.$parent) {
    parent = parent.$parent;
  }

  return parent;
}

export function filterElementsByType(objectList, type) {
  const list = objectList || [];

  return list.filter(element => is(element, type));
}

export function findRootElementsByType(businessObject, referencedType) {
  const root = getRoot(businessObject);

  return filterElementsByType(root.get('rootElements'), referencedType);
}

export function findRootElementById(businessObject, type, id) {
  const elements = findRootElementsByType(businessObject, type);

  return elements.find(element => element.id === id);
}
