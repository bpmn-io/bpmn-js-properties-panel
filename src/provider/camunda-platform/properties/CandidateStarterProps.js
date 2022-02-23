import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import { TextFieldEntry, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';

import {
  useService
} from '../../../hooks';


export function CandidateStarterProps(props) {
  const {
    element
  } = props;

  const businessObject = getBusinessObject(element);

  if (!is(element, 'bpmn:Process') &&
      !(is(element, 'bpmn:Participant') && businessObject.get('processRef'))) {
    return [];
  }

  return [
    {
      id: 'candidateStarterGroups',
      component: CandidateStarterGroups,
      isEdited: isTextFieldEntryEdited
    },
    {
      id: 'candidateStarterUsers',
      component: CandidateStarterUsers,
      isEdited: isTextFieldEntryEdited
    }
  ];
}

function CandidateStarterGroups(props) {
  const { element } = props;

  const commandStack = useService('commandStack'),
        translate = useService('translate'),
        debounce = useService('debounceInput');

  const process = getProcess(element);

  const getValue = () => {
    return process.get('camunda:candidateStarterGroups') || '';
  };

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element: element,
      moddleElement: process,
      properties: {
        'camunda:candidateStarterGroups': value
      }
    });
  };

  return TextFieldEntry({
    element,
    id: 'candidateStarterGroups',
    label: translate('Candidate starter groups'),
    description: translate('Specify more than one group as a comma separated list.'),
    getValue,
    setValue,
    debounce
  });
}

function CandidateStarterUsers(props) {
  const { element } = props;

  const commandStack = useService('commandStack'),
        translate = useService('translate'),
        debounce = useService('debounceInput');

  const process = getProcess(element);

  const getValue = () => {
    return process.get('camunda:candidateStarterUsers') || '';
  };

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element: element,
      moddleElement: process,
      properties: {
        'camunda:candidateStarterUsers': value
      }
    });
  };

  return TextFieldEntry({
    element,
    id: 'candidateStarterUsers',
    label: translate('Candidate starter users'),
    description: translate('Specify more than one user as a comma separated list.'),
    getValue,
    setValue,
    debounce
  });
}


// helper //////////////////

/**
 * getProcess - get the businessObject of the process referred to by a bpmn:Process
 * or by a bpmn:Participant
 *
 * @param  {ModdleElement} element either a bpmn:Process or a bpmn:Participant
 * @return {BusinessObject}
 */
function getProcess(element) {
  return is(element, 'bpmn:Process') ?
    getBusinessObject(element) :
    getBusinessObject(element).get('processRef');
}
