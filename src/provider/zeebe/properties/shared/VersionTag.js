import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import { TextFieldEntry } from '@bpmn-io/properties-panel';

import { createElement } from '../../../../utils/ElementUtil';

import { useService } from '../../../../hooks';

import { getExtensionElementsList } from '../../../../utils/ExtensionElementsUtil';

export default function VersionTag(props) {
  const {
    element,
    type
  } = props;

  const bpmnFactory = useService('bpmnFactory'),
        commandStack = useService('commandStack'),
        debounce = useService('debounceInput'),
        translate = useService('translate');

  const getValue = () => getVersionTag(element, type);

  const setValue = value => {
    const commands = [];

    const businessObject = getBusinessObject(element);

    // (1) ensure extension elements
    let extensionElements = businessObject.get('extensionElements');

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

    // (2) ensure extension element
    let extensionElement = getExtensionElementsList(businessObject, type)[ 0 ];

    if (!extensionElement) {
      extensionElement = createElement(
        type,
        {},
        extensionElements,
        bpmnFactory
      );

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [ ...extensionElements.get('values'), extensionElement ]
          }
        }
      });

    }

    // (3) Update versionTag attribute
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: extensionElement,
        properties: {
          versionTag: value
        }
      }
    });

    // (4) Execute the commands
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  return TextFieldEntry({
    element,
    id: 'versionTag',
    label: translate('Version tag'),
    getValue,
    setValue,
    debounce
  });
}

export function getVersionTag(element, type) {
  const businessObject = getBusinessObject(element);

  const extensionElement = getExtensionElementsList(businessObject, type)[ 0 ];

  if (!extensionElement) {
    return '';
  }

  return extensionElement.get('versionTag') || '';
}