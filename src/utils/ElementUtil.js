import Ids from 'ids';

import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

/**
 * Create a new element and set its parent.
 *
 * @param {string} elementType of the new element
 * @param {object} properties of the new element in key-value pairs
 * @param {any} parent of the new element
 * @param {any} factory which creates the new element
 *
 * @returns {any} element which is created
 */
export function createElement(elementType, properties, parent, factory) {
  const element = factory.create(elementType, properties);
  element.$parent = parent;

  return element;
}

/**
 * generate a semantic id with given prefix
 */
export function nextId(prefix) {
  const ids = new Ids([32,32,1]);

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
