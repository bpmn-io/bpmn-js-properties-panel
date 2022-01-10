import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import { TextFieldEntry, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';

import {
  getExtensionElementsList
} from '../../../utils/ExtensionElementsUtil';

import {
  createElement
} from '../../../utils/ElementUtil';

import {
  useService
} from '../../../hooks';


export function CalledDecisionProps(props) {
  const {
    element
  } = props;

  if (!is(element, 'bpmn:BusinessRuleTask')) {
    return [];
  }

  // Don't show if we have a taskDefinition, because then implementation is done
  // via taskDefinition and not via calledDecision
  if (getTaskDefinition(element)) {
    return [];
  }

  return [
    {
      id: 'decisionId',
      component: <DecisionID element={ element } />,
      isEdited: isTextFieldEntryEdited
    },
    {
      id: 'resultVariable',
      component: <ResultVariable element={ element } />,
      isEdited: isTextFieldEntryEdited
    }
  ];
}

function DecisionID(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return (getCalledDecision(element) || {}).decisionId;
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

    // (2) ensure calledDecision
    let calledDecision = getCalledDecision(element);

    if (!calledDecision) {
      calledDecision = createElement(
        'zeebe:CalledDecision',
        { },
        extensionElements,
        bpmnFactory
      );

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [ ...extensionElements.get('values'), calledDecision ]
          }
        }
      });
    }

    // (3) update caledDecision.decisionId
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: calledDecision,
        properties: { decisionId: value }
      }
    });

    // (4) commit all updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  return TextFieldEntry({
    element,
    id: 'decisionId',
    label: translate('ID'),
    getValue,
    setValue,
    debounce
  });
}

function ResultVariable(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return (getCalledDecision(element) || {}).resultVariable;
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

    // (2) ensure calledDecision
    let calledDecision = getCalledDecision(element);

    if (!calledDecision) {
      calledDecision = createElement(
        'zeebe:CalledDecision',
        { },
        extensionElements,
        bpmnFactory
      );

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [ ...extensionElements.get('values'), calledDecision ]
          }
        }
      });
    }

    // (3) update caledDecision.decisionId
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: calledDecision,
        properties: { resultVariable: value }
      }
    });

    // (4) commit all updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  return TextFieldEntry({
    element,
    id: 'resultVariable',
    label: translate('Result variable'),
    getValue,
    setValue,
    debounce
  });
}


// helper ///////////////////////

function getCalledDecision(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:CalledDecision')[0];
}

function getTaskDefinition(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:TaskDefinition')[0];
}
