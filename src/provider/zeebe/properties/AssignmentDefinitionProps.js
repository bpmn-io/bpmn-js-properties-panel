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
      component: <Assignee element={ element } />,
      isEdited: isTextFieldEntryEdited
    },
    {
      id: 'assignmentDefinitionCandidateGroups',
      component: <CandidateGroups element={ element } />,
      isEdited: isTextFieldEntryEdited
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

  return TextFieldEntry({
    element,
    id: 'assignmentDefinitionAssignee',
    label: translate('Assignee'),
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

  return TextFieldEntry({
    element,
    id: 'assignmentDefinitionCandidateGroups',
    label: translate('Candidate groups'),
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
