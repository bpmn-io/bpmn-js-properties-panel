import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  getCalledElement
} from '../utils/CalledElementUtil.js';

import {
  has
} from 'min-dash';

import {
  createElement
} from '../../../utils/ElementUtil';

import {
  useService
} from '../../../hooks';

import { ToggleSwitchEntry, isToggleSwitchEntryEdited } from '@bpmn-io/properties-panel';


export function InputPropagationProps(props) {
  const {
    element
  } = props;

  if (!is(element, 'bpmn:CallActivity')) {
    return [];
  }

  return [
    {
      id: 'propagateAllParentVariables',
      component: PropagateAllParentVariables,
      isEdited: isToggleSwitchEntryEdited
    }
  ];
}

function PropagateAllParentVariables(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack'),
        bpmnFactory = useService('bpmnFactory'),
        translate = useService('translate');

  const propagateAllParentVariables = isPropagateAllParentVariables(element);

  const getValue = () => {
    return propagateAllParentVariables;
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

    // (3) Update propagateAllParentVariables attribute
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: calledElement,
        properties: {
          propagateAllParentVariables: value
        }
      }
    });

    // (4) Execute the commands
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  return ToggleSwitchEntry({
    id: 'propagateAllParentVariables',
    label: translate('Propagate all parent process variables'),
    switcherLabel: propagateAllParentVariables ?
      translate('On') :
      translate('Off'),
    tooltip: <div>
      <p>{translate('If turned on, all variables from the parent process instance will be propagated to the child process instance.')}</p>
      <p>{translate('Otherwise, only variables defined via input mappings will be propagated.')}</p>
    </div>,
    getValue,
    setValue
  });
}


// helper //////////////////////////

/**
  * Check whether the propagateAllParentVariables attribute is set on an element.
  * @param {Object} element
  *
  * @returns {boolean}
  */
export function isPropagateAllParentVariables(element) {
  if (!is(element, 'bpmn:CallActivity')) {
    return undefined;
  }

  const bo = getBusinessObject(element),
        calledElement = getCalledElement(bo);

  return calledElement && has(calledElement, 'propagateAllParentVariables') ?
    calledElement.get('propagateAllParentVariables') :
    /* default value */ true;
}
