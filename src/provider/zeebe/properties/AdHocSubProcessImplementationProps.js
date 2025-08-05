import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

import { SelectEntry } from '@bpmn-io/properties-panel';

import {
  addExtensionElements,
  getExtensionElementsList,
  removeExtensionElements
} from '../../../utils/ExtensionElementsUtil';

import {
  createElement
} from '../../../utils/ElementUtil';

import { useService } from '../../../hooks';

export const BPMN_IMPLEMENTATION_OPTION = 'bpmn',
      JOB_WORKER_IMPLEMENTATION_OPTION = 'jobWorker';


export function AdHocSubProcessImplementationProps(props) {
  const {
    element
  } = props;

  if (!is(element, 'bpmn:AdHocSubProcess')) {
    return [];
  }

  return [
    {
      id: 'adHocImplementation',
      component: AdHocImplementation,
      isEdited: () => isAdHocImplementationEdited(element)
    }
  ];
}

function AdHocImplementation(props) {
  const {
    element,
    id
  } = props;

  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');

  const getValue = () => {
    if (getTaskDefinition(element)) {
      return JOB_WORKER_IMPLEMENTATION_OPTION;
    }

    return BPMN_IMPLEMENTATION_OPTION;
  };

  /**
   * Change to and from job worker is done via task definition
   */
  const setValue = (value) => {
    if (value === JOB_WORKER_IMPLEMENTATION_OPTION) {
      createTaskDefinition(element, bpmnFactory, commandStack);
    } else if (value === BPMN_IMPLEMENTATION_OPTION) {
      removeTaskDefinition(element, commandStack);
    }
  };

  const getOptions = () => {

    const options = [
      { value: BPMN_IMPLEMENTATION_OPTION, label: translate('BPMN') },
      { value: JOB_WORKER_IMPLEMENTATION_OPTION, label: translate('Job worker') }
    ];

    return options;
  };

  return SelectEntry({
    element,
    id,
    label: translate('Implementation type'),
    getValue,
    setValue,
    getOptions
  });
}


// helper ///////////////////////
function createTaskDefinition(element, bpmnFactory, commandStack) {
  const businessObject = getBusinessObject(element);

  const taskDefinition = createElement(
    'zeebe:TaskDefinition',
    {},
    null,
    bpmnFactory
  );

  addExtensionElements(element, businessObject, taskDefinition, bpmnFactory, commandStack);
}

function removeTaskDefinition(element, commandStack) {
  const taskDefinition = getTaskDefinition(element);

  if (taskDefinition) {
    removeExtensionElements(element, getBusinessObject(element), taskDefinition, commandStack);
  }
}

function isAdHocImplementationEdited(element) {
  return !!getTaskDefinition(element);
}

function getTaskDefinition(element) {
  const businessObject = getBusinessObject(element);
  return getExtensionElementsList(businessObject, 'zeebe:TaskDefinition')[0];
}
