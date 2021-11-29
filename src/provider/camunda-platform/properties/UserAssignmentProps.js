import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import TextField, { isEdited as textFieldIsEdited } from '@bpmn-io/properties-panel/lib/components/entries/TextField';

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
      component: <Assignee element={ element } />,
      isEdited: textFieldIsEdited
    },
    {
      id: 'candidateUsers',
      component: <CandidateUsers element={ element } />,
      isEdited: textFieldIsEdited
    },
    {
      id: 'candidateGroups',
      component: <CandidateGroups element={ element } />,
      isEdited: textFieldIsEdited
    },
    {
      id: 'dueDate',
      component: <DueDate element={ element } />,
      isEdited: textFieldIsEdited
    },
    {
      id: 'followUpDate',
      component: <FollowUpDate element={ element } />,
      isEdited: textFieldIsEdited
    },
    {
      id: 'priority',
      component: <Priority element={ element } />,
      isEdited: textFieldIsEdited
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
    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: businessObject,
      properties: {
        'camunda:assignee': value
      }
    });
  };

  return TextField({
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
    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: businessObject,
      properties: {
        'camunda:candidateUsers': value
      }
    });
  };

  return TextField({
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
    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: businessObject,
      properties: {
        'camunda:candidateGroups': value
      }
    });
  };

  return TextField({
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
    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: businessObject,
      properties: {
        'camunda:dueDate': value
      }
    });
  };

  return TextField({
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
    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: businessObject,
      properties: {
        'camunda:followUpDate': value
      }
    });
  };

  return TextField({
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
    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: businessObject,
      properties: {
        'camunda:priority': value
      }
    });
  };

  return TextField({
    element,
    id: 'priority',
    label: translate('Priority'),
    getValue,
    setValue,
    debounce
  });
}
