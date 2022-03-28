import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import { TextFieldEntry, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';

import {
  getPath,
  pathConcat,
  pathEquals
} from '@philippfromme/moddle-helpers';

import {
  createElement
} from '../../../utils/ElementUtil';

import {
  getCalledElement,
  getProcessId
} from '../utils/CalledElementUtil.js';

import {
  useService,
  useShowCallback
} from '../../../hooks';


export function TargetProps(props) {
  const {
    element
  } = props;

  if (!is(element, 'bpmn:CallActivity')) {
    return [];
  }

  return [
    {
      id: 'targetProcessId',
      component: TargetProcessId,
      isEdited: isTextFieldEntryEdited
    }
  ];
}

function TargetProcessId(props) {
  const {
    element,
    id
  } = props;

  const commandStack = useService('commandStack'),
        bpmnFactory = useService('bpmnFactory'),
        translate = useService('translate'),
        debounce = useService('debounceInput');

  const getValue = () => {
    return getProcessId(element);
  };

  const setValue = (value) => {
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

    // (2) ensure zeebe:calledElement
    let calledElement = getCalledElement(businessObject);

    if (!calledElement) {
      calledElement = createElement(
        'zeebe:CalledElement',
        { },
        extensionElements,
        bpmnFactory);

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [ ...extensionElements.get('values'), calledElement ]
          }
        }
      });

    }

    // (3) Update processId attribute
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: calledElement,
        properties: {
          processId: value
        }
      }
    });

    // (4) Execute the commands
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  const businessObject = getBusinessObject(element),
        calledElement = getCalledElement(element);

  const path = pathConcat(getPath(calledElement, businessObject), 'processId');

  const show = useShowCallback(businessObject, (event) => {
    const { error = {} } = event;

    const {
      type,
      requiredExtensionElement
    } = error;

    return pathEquals(event.path, path)
      || (type === 'extensionElementRequired' && requiredExtensionElement === 'zeebe:CalledElement');
  });

  return TextFieldEntry({
    element,
    id,
    label: translate('Process ID'),
    feel: 'optional',
    getValue,
    setValue,
    debounce,
    show
  });
}
