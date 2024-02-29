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

export const ZEEBE_USER_TASK_IMPLEMENTATION_OPTION = 'zeebeUserTask',
      JOB_WORKER_IMPLEMENTATION_OPTION = 'jobWorker';


export function UserTaskImplementationProps(props) {
  const {
    element
  } = props;

  if (!is(element, 'bpmn:UserTask')) {
    return [];
  }

  return [
    {
      id: 'userTaskImplementation',
      component: UserTaskImplementation,
      isEdited: () => isUserTaskImplementationEdited(element)
    }
  ];
}

function UserTaskImplementation(props) {
  const {
    element,
    id
  } = props;

  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');

  const getValue = () => {
    if (getZeebeUserTask(element)) {
      return ZEEBE_USER_TASK_IMPLEMENTATION_OPTION;
    }

    return JOB_WORKER_IMPLEMENTATION_OPTION;
  };

  /**
   * Set value by either creating or removing zeebe:userTask extension element.
   * Note that they must not exist both at the same time, however this
   * will be ensured by a camunda-bpmn-js behavior (and not by the propPanel).
   */
  const setValue = (value) => {
    if (value === ZEEBE_USER_TASK_IMPLEMENTATION_OPTION) {
      createZeebeUserTask(element, bpmnFactory, commandStack);
    } else if (value === JOB_WORKER_IMPLEMENTATION_OPTION) {
      removeZeebeUserTask(element, commandStack);
    }
  };

  const getOptions = () => {

    const options = [
      { value: ZEEBE_USER_TASK_IMPLEMENTATION_OPTION, label: translate('Zeebe user task') },
      { value: JOB_WORKER_IMPLEMENTATION_OPTION, label: translate('Job worker') }
    ];

    return options;
  };

  return SelectEntry({
    element,
    id,
    label: translate('Type'),
    getValue,
    setValue,
    getOptions
  });
}


// helper ///////////////////////
function createZeebeUserTask(element, bpmnFactory, commandStack) {
  const businessObject = getBusinessObject(element);

  const zeebeUserTask = createElement(
    'zeebe:UserTask',
    {},
    businessObject,
    bpmnFactory
  );

  addExtensionElements(element, businessObject, zeebeUserTask, bpmnFactory, commandStack);
}

function removeZeebeUserTask(element, commandStack) {
  const zeebeUserTask = getZeebeUserTask(element);

  removeExtensionElements(element, getBusinessObject(element), zeebeUserTask, commandStack);
}

function isUserTaskImplementationEdited(element) {
  return getZeebeUserTask(element);
}

function getZeebeUserTask(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:UserTask')[0];
}
