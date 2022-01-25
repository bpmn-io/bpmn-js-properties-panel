import { is } from 'bpmn-js/lib/util/ModelUtil';

import { createElement } from './ElementUtil';

import { isArray } from 'min-dash';

/**
 * Get extension elements of business object. Optionally filter by type.
 *
 * @param  {ModdleElement} businessObject
 * @param  {String} [type=undefined]
 * @returns {Array<ModdleElement>}
 */
export function getExtensionElementsList(businessObject, type = undefined) {
  const extensionElements = businessObject.get('extensionElements');

  if (!extensionElements) {
    return [];
  }

  const values = extensionElements.get('values');

  if (!values || !values.length) {
    return [];
  }

  if (type) {
    return values.filter(value => is(value, type));
  }

  return values;
}

/**
 * Add one or more extension elements. Create bpmn:ExtensionElements if it doesn't exist.
 *
 * @param {ModdleElement} element
 * @param {ModdleElement} businessObject
 * @param {ModdleElement|Array<ModdleElement>} extensionElementsToAdd
 * @param {CommandStack} commandStack
 */
export function addExtensionElements(element, businessObject, extensionElementToAdd, bpmnFactory, commandStack) {
  const commands = [];

  let extensionElements = businessObject.get('extensionElements');

  // (1) create bpmn:ExtensionElements if it doesn't exist
  if (!extensionElements) {
    extensionElements = createElement(
      'bpmn:ExtensionElements',
      {
        values: []
      },
      businessObject,
      bpmnFactory
    );

    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: businessObject,
        properties: {
          extensionElements
        }
      }
    });
  }

  extensionElementToAdd.$parent = extensionElements;

  // (2) add extension element to list
  commands.push({
    cmd: 'element.updateModdleProperties',
    context: {
      element,
      moddleElement: extensionElements,
      properties: {
        values: [ ...extensionElements.get('values'), extensionElementToAdd ]
      }
    }
  });

  commandStack.execute('properties-panel.multi-command-executor', commands);
}

/**
 * Remove one or more extension elements. Remove bpmn:ExtensionElements afterwards if it's empty.
 *
 * @param {ModdleElement} element
 * @param {ModdleElement} businessObject
 * @param {ModdleElement|Array<ModdleElement>} extensionElementsToRemove
 * @param {CommandStack} commandStack
 */
export function removeExtensionElements(element, businessObject, extensionElementsToRemove, commandStack) {
  if (!isArray(extensionElementsToRemove)) {
    extensionElementsToRemove = [ extensionElementsToRemove ];
  }

  const extensionElements = businessObject.get('extensionElements'),
        values = extensionElements.get('values').filter(value => !extensionElementsToRemove.includes(value));

  commandStack.execute('element.updateModdleProperties', {
    element,
    moddleElement: extensionElements,
    properties: {
      values
    }
  });
}
