import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  getOutputParameters
} from '../utils/InputOutputUtil';

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


export function OutputPropagationProps(props) {
  const {
    element
  } = props;

  if (!is(element, 'bpmn:CallActivity')) {
    return [];
  }

  return [
    {
      id: 'propagateAllChildVariables',
      component: PropagateAllChildVariables,
      isEdited: isToggleSwitchEntryEdited
    }
  ];
}

function PropagateAllChildVariables(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack'),
        bpmnFactory = useService('bpmnFactory'),
        translate = useService('translate');

  const propagateAllChildVariables = isPropagateAllChildVariables(element);

  const getValue = () => {
    return propagateAllChildVariables;
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

    // (3) Update propagateAllChildVariables attribute
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: calledElement,
        properties: {
          propagateAllChildVariables: value
        }
      }
    });

    // (4) Execute the commands
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  return ToggleSwitchEntry({
    id: 'propagateAllChildVariables',
    label: translate('Propagate all child process variables'),
    switcherLabel: propagateAllChildVariables ?
      translate('On') :
      translate('Off'),
    tooltip: <div>
      <p>{translate('If turned on, all variables from the child process instance will be propagated to the parent process instance.')}</p>
      <p>{translate('Otherwise, only variables defined via output mappings will be propagated.')}</p>
    </div>,
    getValue,
    setValue
  });
}


// helper //////////////////////////

/**
  * Determine default value for propagateAllChildVariables attribute
  * @param {Object} element representing a bpmn:CallActivity
  *
  * @returns {boolean}
  */
function determinePropAllChildVariablesDefault(element) {
  const outputParameters = getOutputParameters(element);

  if (outputParameters) {
    return (outputParameters.length > 0) ? false : true;
  }
}

/**
  * Check whether the propagateAllChildVariables attribute is set on an element.
  * Note that a default logic will be determine if it is not explicitly set.
  * @param {Object} element
  *
  * @returns {boolean}
  */
export function isPropagateAllChildVariables(element) {
  if (!is(element, 'bpmn:CallActivity')) {
    return undefined;
  }

  const bo = getBusinessObject(element),
        calledElement = getCalledElement(bo);

  return calledElement && has(calledElement, 'propagateAllChildVariables') ?
    calledElement.get('propagateAllChildVariables') :
    determinePropAllChildVariablesDefault(element);
}
