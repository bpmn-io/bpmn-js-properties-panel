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

import ToggleSwitch, { isEdited as defaultIsEdited } from '@bpmn-io/properties-panel/lib/components/entries/ToggleSwitch';


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
      component: <PropagateAllChildVariables element={ element } />,
      isEdited: defaultIsEdited
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
        cmd: 'properties-panel.update-businessobject',
        context: {
          element: element,
          businessObject: businessObject,
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
        cmd: 'properties-panel.update-businessobject-list',
        context: {
          element: element,
          currentObject: extensionElements,
          propertyName: 'values',
          objectsToAdd: [ calledElement ]
        }
      });

    }

    // (3) Update propagateAllChildVariables attribute
    commands.push({
      cmd: 'properties-panel.update-businessobject',
      context: {
        element: element,
        businessObject: calledElement,
        properties: {
          propagateAllChildVariables: value
        }
      }
    });

    // (4) Execute the commands
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  return ToggleSwitch({
    id: 'propagateAllChildVariables',
    label: translate('Propagate all child process variables'),
    switcherLabel: propagateAllChildVariables ?
      translate('On') :
      translate('Off'),
    description: propagateAllChildVariables ?
      translate('All variables from the child process instance will be propagated to the parent process instance') :
      translate('Only variables defined via output mappings will be propagated from the child to the parent process instance'),
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
