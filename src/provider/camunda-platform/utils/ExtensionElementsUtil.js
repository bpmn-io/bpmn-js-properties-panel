import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import { createElement } from '../../../utils/ElementUtil';

import { isString } from 'min-dash';

/**
 * getExtensionElementsList - get the extensionElements of a given type for a given
 * businessObject as list. Will return an empty list if no extensionElements (of
 * given type) are present
 *
 * @param  {ModdleElement} businessObject
 * @param  {string} [type=undefined]
 * @return {Array<ModdleElement>}
 */
export function getExtensionElementsList(businessObject, type = undefined) {
  const elements = ((businessObject.get('extensionElements') &&
                  businessObject.get('extensionElements').get('values')) || []);

  return (elements.length && type) ?
    elements.filter((value) => is(value, type)) :
    elements;
}

export function addExtensionElement(element, businessObject, extensionElement, bpmnFactory, commandStack) {
  const commands = [],
        bo = businessObject || getBusinessObject(element);

  let extensionElements = bo.get('extensionElements');

  // (1) ensure extension elements
  if (!extensionElements) {
    extensionElements = createElement(
      'bpmn:ExtensionElements',
      { values: [] },
      bo,
      bpmnFactory
    );

    commands.push({
      cmd: 'properties-panel.update-businessobject',
      context: {
        element: element,
        businessObject: bo,
        properties: { extensionElements }
      }
    });
  }

  // (2) create extension element if only type was passed
  if (isString(extensionElement)) {
    extensionElement = createElement(extensionElement, {}, extensionElements, bpmnFactory);
  }

  // (3) add extension element to list
  commands.push({
    cmd: 'properties-panel.update-businessobject-list',
    context: {
      element: element,
      currentObject: extensionElements,
      propertyName: 'values',
      objectsToAdd: [ extensionElement ]
    }
  });

  commandStack.execute('properties-panel.multi-command-executor', commands);
}

/**
 * Remove extension and extension elements if empty after change.
 *
 * @param {ModdleElement} element - updated element
 * @param {ModdleElement|null} businessObject - optional business object with extension elements
 * @param {ModdleElement} removedExtension
 * @param {Modeling} modeling
 */
export function removeExtensionElement(element, businessObject, removedExtension, modeling) {
  const bo = businessObject || getBusinessObject(element);

  const extensionElements = bo.get('extensionElements');

  const newValues = extensionElements.get('values')
    .filter(extension => extension !== removedExtension);

  // Remove extension elements if empty after extension removal
  if (!newValues.length) {
    modeling.updateModdleProperties(element, bo, { extensionElements: undefined });
  } else {
    modeling.updateModdleProperties(element, extensionElements, { values: newValues });
  }
}
