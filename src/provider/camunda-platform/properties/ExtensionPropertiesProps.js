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
} from '../../../utils/ExtensionElementsUtil';

import { without } from 'min-dash';


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

    const values = without(properties.get('values'), property);

    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: properties,
        properties: {
          values
        }
      }
    });

    // remove camunda:Properties if there are no properties anymore
    if (!values.length) {
      const businessObject = getBusinessObject(element),
            extensionElements = businessObject.get('extensionElements');

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: without(extensionElements.get('values'), properties)
          }
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
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: businessObject,
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
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [ ...extensionElements.get('values'), properties ]
          }
        }
      });
    }

    // (3) create camunda:Property
    const property = createElement('camunda:Property', {}, properties, bpmnFactory);

    // (4) add property to list
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: properties,
        properties: {
          values: [ ...properties.get('values'), property ]
        }
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