import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import { SelectEntry } from '@bpmn-io/properties-panel';

import { createElement } from '../../../../utils/ElementUtil';

import { useService } from '../../../../hooks';

import { getExtensionElementsList } from '../../../../utils/ExtensionElementsUtil';

{ /* Required to break up imports, see https://github.com/babel/babel/issues/15156 */ }

export default function Binding(props) {
  const {
    element,
    type
  } = props;

  const bpmnFactory = useService('bpmnFactory'),
        commandStack = useService('commandStack'),
        translate = useService('translate');

  const getValue = () => getBindingType(element, type);

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

    // (3) Update bindingType attribute
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: extensionElement,
        properties: {
          bindingType: value
        }
      }
    });

    // (4) Execute the commands
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  const getOptions = () => ([
    { value: 'latest', label: translate('latest') },
    { value: 'deployment', label: translate('deployment') },
    { value: 'versionTag', label: translate('version tag') }
  ]);

  return <SelectEntry
    element={ element }
    id="bindingType"
    label={ translate('Binding') }
    getValue={ getValue }
    setValue={ setValue }
    getOptions={ getOptions }
  />;
}

export function getBindingType(element, type) {
  const businessObject = getBusinessObject(element);

  const extensionElement = getExtensionElementsList(businessObject, type)[ 0 ];

  if (!extensionElement) {
    return 'latest';
  }

  return extensionElement.get('bindingType');
}