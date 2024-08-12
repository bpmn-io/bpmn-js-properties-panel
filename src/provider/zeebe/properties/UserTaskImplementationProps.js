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
      JOB_WORKER_IMPLEMENTATION_OPTION = 'jobWorker',
      MULTIPLE_VALUES = '';


export function UserTaskImplementationProps(props) {
  const {
    element
  } = props;

  const elements = Array.isArray(element) ? element : [ element ];

  if (!elements.every(element => is(element, 'bpmn:UserTask'))) {
    return [];
  }

  return [
    {
      id: 'userTaskImplementation',
      component: UserTaskImplementation,
      isEdited: () => elements.some(isUserTaskImplementationEdited)
    }
  ];
}

function UserTaskImplementation(props) {
  const {
    element,
    id
  } = props;

  const elements = Array.isArray(element) ? element : [ element ];

  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');

  const sameValues = elements.every(element => {
    return getZeebeUserTask(element) === getZeebeUserTask(elements[0]);
  });

  const getValue = () => {
    if (!sameValues) {
      return MULTIPLE_VALUES;
    }

    if (getZeebeUserTask(elements[0])) {
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
    if (value === MULTIPLE_VALUES) {
      return;
    }

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

    if (!sameValues) {
      options.unshift({ value: MULTIPLE_VALUES, label: translate('Multiple values'), disabled: true, hidden: true });
    }

    return options;
  };

  return SelectEntry({
    element,
    id,
    label: translate('Type'),
    getValue,
    setValue,
    getOptions,
    placeholder: sameValues ? null : translate('Multiple values')
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
