import {
  isFeelEntryEdited
} from '@bpmn-io/properties-panel';

import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { useService } from '../../../hooks';
import { FeelTextAreaEntry } from '../../../entries/FeelEntryWithContext';
import { createElement } from '../../../utils/ElementUtil';
import { getExtensionElementsList } from '../../../utils/ExtensionElementsUtil';

const INPUT_SCHEMA_PROPERTY_NAME = 'camunda:adHocActivityInputSchema';

/**
 * @typedef { import('@bpmn-io/properties-panel').EntryDefinition } Entry
 */

/**
 * @returns {Array<Entry>} entries
 */
export function AdHocActivityInputSchemaProps(props) {
  const {
    element
  } = props;

  // only add the input schema documentation field if the element is a root activity inside an ad-hoc subprocess
  if (!is(element.parent, 'bpmn:AdHocSubProcess') || element.incoming.length > 0) {
    return [];
  }

  return [
    {
      id: 'adHocActivityInputSchema',
      component: AdHocActivityInputSchemaProperty,
      isEdited: isFeelEntryEdited
    }
  ];
}

/**
 * Allows to edit the activity input schema JSON of an activity within an ad-hoc subprocess. Stores the data
 * in a zeebe:Property named `camunda:adHocActivityInputSchema`.
 */
const AdHocActivityInputSchemaProperty = (props) => {
  const {
    element
  } = props;

  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    const property = getZeebeProperty(element, INPUT_SCHEMA_PROPERTY_NAME);
    if (property) {
      return property.get('value');
    }
  };

  const setValue = (value) => {
    const commands = [];

    const businessObject = getBusinessObject(element);

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

    // (2) ensure zeebe:properties
    let zeebeProperties = getZeebeProperties(businessObject);

    if (!zeebeProperties) {
      const parent = extensionElements;

      zeebeProperties = createElement('zeebe:Properties', {
        properties: []
      }, parent, bpmnFactory);

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [ ...extensionElements.get('values'), zeebeProperties ]
          }
        }
      });
    }

    // (3) update or create zeebe property
    const existingProperty = getZeebeProperty(element, INPUT_SCHEMA_PROPERTY_NAME);
    if (existingProperty) {
      if (value) {

        // Update existing zeebe property
        commands.push({
          cmd: 'element.updateModdleProperties',
          context: {
            element,
            moddleElement: existingProperty,
            properties: {
              value
            }
          }
        });
      } else {

        // Remove empty zeebe property
        commands.push({
          cmd: 'element.updateModdleProperties',
          context: {
            element,
            moddleElement: zeebeProperties,
            properties: {
              properties: zeebeProperties.get('properties').filter(p => p.get('name') !== INPUT_SCHEMA_PROPERTY_NAME)
            }
          }
        });
      }
    } else {

      // Create new zeebe property
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: zeebeProperties,
          properties: {
            properties: [
              ...zeebeProperties.get('properties'),
              createElement('zeebe:Property', {
                name: INPUT_SCHEMA_PROPERTY_NAME,
                value
              }, zeebeProperties, bpmnFactory),
            ]
          }
        }
      });
    }

    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  return FeelTextAreaEntry({
    element,
    id: 'adHocActivityInputSchema',
    label: translate('Input Schema'),
    description: translate('JSON schema describing the input data of this activity.'),
    feel: 'optional',
    getValue,
    setValue,
    debounce
  });
};


// --------

// helper ///////////////////////

function getZeebeProperties(element) {
  const businessObject = getBusinessObject(element);
  return getExtensionElementsList(businessObject, 'zeebe:Properties')[0];
}

function getZeebeProperty(element, propertyName) {
  const properties = getZeebeProperties(element);
  if (!properties) {
    return;
  }

  return properties.get('properties').find(p => p.get('name') === propertyName);
}