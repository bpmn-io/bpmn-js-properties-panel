import {
  getServiceTaskLikeBusinessObject
} from '../utils/ImplementationTypeUtils';

import {
  createElement
} from '../../../utils/ElementUtil';

import {
  getExtensionElementsList
} from '../utils/ExtensionElementsUtil';

import FieldInjection from './FieldInjection';


export function FieldInjectionProps({ element, injector }) {

  const businessObject = getServiceTaskLikeBusinessObject(element);

  if (!businessObject) {
    return null;
  }

  const fieldInjections = getExtensionElementsList(businessObject, 'camunda:Field');

  const bpmnFactory = injector.get('bpmnFactory'),
        commandStack = injector.get('commandStack');

  const items = fieldInjections.map((field, index) => {
    const id = element.id + '-fieldInjection-' + index;

    return {
      id,
      label: getFieldLabel(field),
      entries: FieldInjection({
        idPrefix: id,
        element,
        field
      }),
      autoFocusEntry: id + '-name',
      remove: removeFactory({ commandStack, element, field })
    };
  });

  return {
    items,
    add: addFactory({ bpmnFactory, commandStack, element })
  };
}

function removeFactory({ commandStack, element, field }) {
  return function(event) {
    event.stopPropagation();

    const businessObject = getServiceTaskLikeBusinessObject(element),
          extensionElements = businessObject.get('extensionElements');

    commandStack.execute('properties-panel.update-businessobject-list', {
      element: element,
      currentObject: extensionElements,
      propertyName: 'values',
      referencePropertyName: 'extensionElements',
      objectsToRemove: [ field ]
    });
  };
}

function addFactory({ bpmnFactory, commandStack, element }) {
  return function(event) {

    event.stopPropagation();

    const commands = [];

    const businessObject = getServiceTaskLikeBusinessObject(element);

    let extensionElements = businessObject.get('extensionElements');

    // (1) ensure extension elements
    if (!extensionElements) {
      extensionElements = createElement(
        'bpmn:ExtensionElements',
        { values: [] },
        businessObject,
        bpmnFactory
      );

      commands.push({
        cmd: 'properties-panel.update-businessobject',
        context: {
          element: element,
          businessObject: businessObject,
          properties: { extensionElements }
        }
      });
    }

    // (2) create empty camunda:Field extensionElement
    const fieldInjection = createElement(
      'camunda:Field',
      {
        name: undefined,
        string: '', // string is the default type
        stringValue: undefined
      },
      extensionElements,
      bpmnFactory
    );

    commands.push({
      cmd: 'properties-panel.update-businessobject-list',
      context: {
        element: element,
        currentObject: extensionElements,
        propertyName: 'values',
        objectsToAdd: [ fieldInjection ]
      }
    });

    // (3) execute the commands
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
}

// helper ///////////////

function getFieldLabel(field) {
  return field.name || '<empty>';
}
