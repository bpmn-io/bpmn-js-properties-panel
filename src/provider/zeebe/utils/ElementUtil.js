import Ids from 'ids';

/**
 * Creates a new element and set the parent to it
 *
 * @param {String} elementType of the new element
 * @param {Object} properties of the new element in key-value pairs
 * @param {moddle.object} parent of the new element
 * @param {BpmnFactory} factory which creates the new element
 *
 * @returns {djs.model.Base} element which is created
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