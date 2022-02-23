import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import { TextFieldEntry, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';

import {
  useService
} from '../../../hooks';

/**
 * Cf. https://docs.camunda.org/manual/latest/reference/bpmn20/tasks/user-task/
 */
export function UserAssignmentProps(props) {
  const {
    element
  } = props;

  if (!is(element, 'camunda:Assignable')) {
    return [];
  }

  return [
    {
      id: 'assignee',
      component: Assignee,
      isEdited: isTextFieldEntryEdited
    },
    {
      id: 'candidateGroups',
      component: CandidateGroups,
      isEdited: isTextFieldEntryEdited
    },
    {
      id: 'candidateUsers',
      component: CandidateUsers,
      isEdited: isTextFieldEntryEdited
    },
    {
      id: 'dueDate',
      component: DueDate,
      isEdited: isTextFieldEntryEdited
    },
    {
      id: 'followUpDate',
      component: FollowUpDate,
      isEdited: isTextFieldEntryEdited
    },
    {
      id: 'priority',
      component: Priority,
      isEdited: isTextFieldEntryEdited
    }
  ];
}

function Assignee(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const businessObject = getBusinessObject(element);

  const getValue = () => {
    return businessObject.get('camunda:assignee');
  };

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:assignee': value
      }
    });
  };

  return TextFieldEntry({
    element,
    id: 'assignee',
    label: translate('Assignee'),
    getValue,
    setValue,
    debounce
  });
}

function CandidateUsers(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const businessObject = getBusinessObject(element);

  const getValue = () => {
    return businessObject.get('camunda:candidateUsers');
  };

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:candidateUsers': value
      }
    });
  };

  return TextFieldEntry({
    element,
    id: 'candidateUsers',
    label: translate('Candidate users'),
    getValue,
    setValue,
    debounce
  });
}

function CandidateGroups(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const businessObject = getBusinessObject(element);

  const getValue = () => {
    return businessObject.get('camunda:candidateGroups');
  };

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:candidateGroups': value
      }
    });
  };

  return TextFieldEntry({
    element,
    id: 'candidateGroups',
    label: translate('Candidate groups'),
    getValue,
    setValue,
    debounce
  });
}

function DueDate(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const businessObject = getBusinessObject(element);

  const getValue = () => {
    return businessObject.get('camunda:dueDate');
  };

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:dueDate': value
      }
    });
  };

  return TextFieldEntry({
    element,
    id: 'dueDate',
    label: translate('Due date'),
    description : translate('The due date as an EL expression (e.g. ${someDate}) or an ISO date (e.g. 2015-06-26T09:54:00).'),
    getValue,
    setValue,
    debounce
  });
}

function FollowUpDate(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const businessObject = getBusinessObject(element);

  const getValue = () => {
    return businessObject.get('camunda:followUpDate');
  };

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:followUpDate': value
      }
    });
  };

  return TextFieldEntry({
    element,
    id: 'followUpDate',
    label: translate('Follow up date'),
    description : translate('The follow up date as an EL expression (e.g. ${someDate}) or an ' +
      'ISO date (e.g. 2015-06-26T09:54:00).'),
    getValue,
    setValue,
    debounce
  });
}

function Priority(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const businessObject = getBusinessObject(element);

  const getValue = () => {
    return businessObject.get('camunda:priority');
  };

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:priority': value
      }
    });
  };

  return TextFieldEntry({
    element,
    id: 'priority',
    label: translate('Priority'),
    getValue,
    setValue,
    debounce
  });
}
