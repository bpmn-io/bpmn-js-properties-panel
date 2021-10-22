import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import ExtensionProperty from './ExtensionProperty';

import {
  createElement
} from '../../../utils/ElementUtil';

import {
  getExtensionElementsList
} from '../utils/ExtensionElementsUtil';


export function ExtensionPropertiesProps({ element, injector }) {

  let businessObject = getRelevantBusinessObject(element);

  // do not offer for empty pools
  if (!businessObject) {
    return;
  }

  const properties = getPropertiesList(businessObject) || [];

  const bpmnFactory = injector.get('bpmnFactory'),
        commandStack = injector.get('commandStack');

  const items = properties.map((property, index) => {
    const id = element.id + '-extensionProperty-' + index;

    return {
      id,
      label: property.get('name') || '',
      entries: ExtensionProperty({
        idPrefix: id,
        element,
        property
      }),
      autoFocusEntry: id + '-name',
      remove: removeFactory({ commandStack, element, property })
    };
  });

  return {
    items,
    add: addFactory({ bpmnFactory, commandStack, element })
  };
}

function removeFactory({ commandStack, element, property }) {
  return function(event) {
    event.stopPropagation();

    const commands = [];

    const businessObject = getRelevantBusinessObject(element);
    const properties = getProperties(businessObject);

    if (!properties) {
      return;
    }

    commands.push({
      cmd: 'properties-panel.update-businessobject-list',
      context: {
        element: element,
        currentObject: properties,
        propertyName: 'values',
        objectsToRemove: [ property ]
      }
    });

    // remove camunda:Properties if there are no properties anymore
    if (properties.get('values').length === 1) {
      commands.push({
        cmd: 'properties-panel.update-businessobject-list',
        context: {
          element: element,
          currentObject: getBusinessObject(element).get('extensionElements'),
          propertyName: 'values',
          objectsToRemove: [ properties ]
        }
      });
    }

    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
}

function addFactory({ bpmnFactory, commandStack, element }) {
  return function(event) {

    event.stopPropagation();

    let commands = [];

    const businessObject = getRelevantBusinessObject(element);

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

    // (2) ensure camunda:Properties
    let properties = getProperties(businessObject);

    if (!properties) {
      const parent = extensionElements;

      properties = createElement('camunda:Properties', {
        values: []
      }, parent, bpmnFactory);

      commands.push({
        cmd: 'properties-panel.update-businessobject-list',
        context: {
          element: element,
          currentObject: extensionElements,
          propertyName: 'values',
          objectsToAdd: [ properties ]
        }
      });
    }

    // (3) create camunda:Property
    const property = createElement('camunda:Property', {}, properties, bpmnFactory);

    // (4) add property to list
    commands.push({
      cmd: 'properties-panel.update-businessobject-list',
      context: {
        element: element,
        currentObject: properties,
        propertyName: 'values',
        objectsToAdd: [ property ]
      }
    });

    // (5) commit all updates
    commandStack.execute('properties-panel.multi-command-executor', commands);

  };
}


// helper //////////////////

function getRelevantBusinessObject(element) {
  let businessObject = getBusinessObject(element);

  if (is(element, 'bpmn:Participant')) {
    return businessObject.get('processRef');
  }

  return businessObject;
}

function getProperties(businessObject) {
  return getExtensionElementsList(businessObject, 'camunda:Properties')[0];
}

function getPropertiesList(businessObject) {
  const properties = getProperties(businessObject);
  return properties && properties.get('values');
}