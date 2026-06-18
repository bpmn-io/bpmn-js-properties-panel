import {
  getBusinessObject,
  is,
  isAny
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

import {
  getTaskDefinition
} from '../utils/ZeebeServiceTaskUtil';

import { BpmnFeelEntry } from '../../../entries/BpmnFeelEntry';

const OPTIONAL_JOB_WORKER_ELEMENTS = [
  'bpmn:BusinessRuleTask',
  'bpmn:ScriptTask'
];


export function JobPriorityDefinitionProps(props) {
  const {
    element
  } = props;

  if (!hasJobPriority(element)) {
    return [];
  }

  return [
    {
      id: 'jobPriorityDefinitionPriority',
      component: Priority,
      isEdited: isFeelEntryEdited
    }
  ];
}

function Priority(props) {
  const {
    element,
    id
  } = props;

  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return (getJobPriorityDefinition(element) || {}).priority;
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

    // (2) ensure JobPriorityDefinition
    let jobPriorityDefinition = getJobPriorityDefinition(element);
    const isNullValue = value === null || value === '' || value === undefined;

    if (jobPriorityDefinition && isNullValue) {

      // (2a) remove job priority definition if it exists and priority is set to null
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: extensionElements.get('values').filter(v => v !== jobPriorityDefinition)
          }
        }
      });

    } else if (jobPriorityDefinition && !isNullValue) {

      // (2b) update job priority definition if it already exists
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: jobPriorityDefinition,
          properties: { priority: value }
        }
      });

    } else if (!jobPriorityDefinition && !isNullValue) {

      // (2c) create job priority definition if it does not exist
      jobPriorityDefinition = createElement(
        'zeebe:JobPriorityDefinition',
        { priority: value },
        extensionElements,
        bpmnFactory
      );

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [ ...extensionElements.get('values'), jobPriorityDefinition ]
          }
        }
      });
    }

    // (3) commit all updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  const tooltip = (
    <div>
      <p>{ translate('Define the priority used when activating the job for this task. Accepts a static integer or a FEEL expression. Higher priority jobs are activated first.') }</p>
      <a href="https://docs.camunda.io/docs/components/concepts/job-workers/#job-prioritization" target="_blank" rel="noopener noreferrer">{ translate('Learn more about job prioritization') }</a>
    </div>
  );

  return BpmnFeelEntry({
    element,
    id,
    label: translate('Priority'),
    feel: 'optional',
    getValue,
    setValue,
    debounce,
    tooltip
  });
}


// helper ///////////////////////

/**
 * Job priority may be defined on a process, on service and send tasks (always
 * job workers), and on business rule and script tasks only when they are
 * implemented as a job worker (i.e. they carry a `zeebe:TaskDefinition`).
 *
 * This mirrors the `allowedIn` definition of `zeebe:JobPriorityDefinition` in
 * the zeebe moddle.
 */
function hasJobPriority(element) {
  if (is(element, 'bpmn:Process') || isAny(element, [ 'bpmn:ServiceTask', 'bpmn:SendTask' ])) {
    return true;
  }

  return isAny(element, OPTIONAL_JOB_WORKER_ELEMENTS) && !!getTaskDefinition(element);
}

export function getJobPriorityDefinition(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:JobPriorityDefinition')[0];
}
