import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import { isFeelEntryEdited } from '@bpmn-io/properties-panel';

import {
  getExtensionElementsList
} from '../../../utils/ExtensionElementsUtil';

import {
  createElement
} from '../../../utils/ElementUtil';

import {
  useService
} from '../../../hooks';

import { FeelEntryWithVariableContext } from '../../../entries/FeelEntryWithContext';


export function AssignmentDefinitionProps(props) {
  const {
    element
  } = props;

  if (!is(element, 'bpmn:UserTask')) {
    return [];
  }

  return [
    {
      id: 'assignmentDefinitionAssignee',
      component: Assignee,
      isEdited: isFeelEntryEdited
    },
    {
      id: 'assignmentDefinitionCandidateGroups',
      component: CandidateGroups,
      isEdited: isFeelEntryEdited
    },
    {
      id: 'assignmentDefinitionCandidateUsers',
      component: CandidateUsers,
      isEdited: isFeelEntryEdited
    }
  ];
}

function Assignee(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return (getAssignmentDefinition(element) || {}).assignee;
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

    // (2) ensure AssignmentDefinition
    let assignmentDefinition = getAssignmentDefinition(element);

    if (!assignmentDefinition) {
      assignmentDefinition = createElement(
        'zeebe:AssignmentDefinition',
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
            values: [ ...extensionElements.get('values'), assignmentDefinition ]
          }
        }
      });
    }

    // (3) update assignee definition type
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: assignmentDefinition,
        properties: { assignee: value }
      }
    });

    // (4) commit all updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  return FeelEntryWithVariableContext({
    element,
    id: 'assignmentDefinitionAssignee',
    label: translate('Assignee'),
    feel: 'optional',
    getValue,
    setValue,
    debounce
  });
}

function CandidateGroups(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return (getAssignmentDefinition(element) || {}).candidateGroups;
  };

  const setValue = (value) => {
    let commands = [];

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

    // (2) ensure assignmentDefinition
    let assignmentDefinition = getAssignmentDefinition(element);

    if (!assignmentDefinition) {
      assignmentDefinition = createElement(
        'zeebe:AssignmentDefinition',
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
            values: [ ...extensionElements.get('values'), assignmentDefinition ]
          }
        }
      });
    }

    // (3) update candidateGroups
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: assignmentDefinition,
        properties: { candidateGroups: value }
      }
    });

    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  return FeelEntryWithVariableContext({
    element,
    id: 'assignmentDefinitionCandidateGroups',
    label: translate('Candidate groups'),
    feel: 'optional',
    getValue,
    setValue,
    debounce
  });
}

function CandidateUsers(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return (getAssignmentDefinition(element) || {}).candidateUsers;
  };

  const setValue = (value) => {
    let commands = [];

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

    // (2) ensure assignmentDefinition
    let assignmentDefinition = getAssignmentDefinition(element);

    if (!assignmentDefinition) {
      assignmentDefinition = createElement(
        'zeebe:AssignmentDefinition',
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
            values: [ ...extensionElements.get('values'), assignmentDefinition ]
          }
        }
      });
    }

    // (3) update candidateUsers
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: assignmentDefinition,
        properties: { candidateUsers: value }
      }
    });

    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  return FeelEntryWithVariableContext({
    element,
    id: 'assignmentDefinitionCandidateUsers',
    label: translate('Candidate users'),
    feel: 'optional',
    getValue,
    setValue,
    debounce
  });
}


// helper ///////////////////////

function getAssignmentDefinition(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:AssignmentDefinition')[0];
}
