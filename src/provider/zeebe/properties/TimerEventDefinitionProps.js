import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  isAny
} from 'bpmn-js/lib/features/modeling/util/ModelingUtil';

import {
  useService
} from '../../../hooks';

import {
  getTimerEventDefinition
} from '../../bpmn/utils/EventDefinitionUtil';

import SelectEntry, { isEdited as selectIsEdited } from '@bpmn-io/properties-panel/src/components/entries/Select';
import TextField, { isEdited as textFieldIsEdited } from '@bpmn-io/properties-panel/src/components/entries/TextField';


export function TimerEventDefinitionProps(props) {
  const {
    element
  } = props;

  // (1) Only support for StartEvent, IntermediateCatchEvent, or BoundaryEvent
  if (!isAny(element,
    [ 'bpmn:StartEvent',
      'bpmn:IntermediateCatchEvent',
      'bpmn:BoundaryEvent' ])) {
    return [];
  }

  // (2) Only provide if timerEventDefinition is set
  const businessObject = getBusinessObject(element),
        timerEventDefinition = getTimerEventDefinition(businessObject),
        timerEventDefinitionType = getTimerDefinitionType(timerEventDefinition);

  if (!timerEventDefinition) {
    return [];
  }

  // (3) Return duration-specific TexField only if only duration is supported
  const onlySupportDuration = !isTimerDefinitionTypeSupported('timeCycle', element) &&
   !isTimerDefinitionTypeSupported('timeDate', element);

  // (4) Only provide duration-specific textField if only duration is supported,
  // otherwise push type-select and generic textField is type was selected
  const entries = [];

  if (onlySupportDuration) {
    entries.push({
      id: 'timerEventDefinitionDurationValue',
      component: <TimerEventDefinitionDurationValue element={ element } />,
      isEdited: textFieldIsEdited
    });
  } else {
    entries.push({
      id: 'timerEventDefinitionType',
      component: <TimerEventDefinitionType element={ element } />,
      isEdited: selectIsEdited
    });

    if (timerEventDefinitionType) {
      entries.push({
        id: 'timerEventDefinitionValue',
        component: <TimerEventDefinitionValue element={ element } />,
        isEdited: textFieldIsEdited
      });
    }
  }

  return entries;
}


/**
 * TimerEventDefinitionType - Generic select entry allowing to select a specific
 * timerEventDefintionType. To be used together with timerEventDefinitionValue.
 *
 * @param  {type} props
 * @return {SelectEntry}
 */
function TimerEventDefinitionType(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack'),
        bpmnFactory = useService('bpmnFactory'),
        translate = useService('translate');

  const businessObject = getBusinessObject(element),
        timerEventDefinition = getTimerEventDefinition(businessObject),
        timerEventDefinitionType = getTimerDefinitionType(timerEventDefinition);

  const getValue = () => {
    return timerEventDefinitionType || '';
  };

  const setValue = (value) => {

    // (1) Check if value is different to current type
    if (value === timerEventDefinitionType) {
      return;
    }

    // (2) Create empty formalExpression element
    const formalExpression = bpmnFactory.create('bpmn:FormalExpression', { body: undefined });
    formalExpression.$parent = timerEventDefinition;

    // (3) Set the value for selected timerEventDefinitionType
    const newProps = {
      timeDuration: undefined,
      timeDate: undefined,
      timeCycle: undefined
    };
    newProps[value] = formalExpression;

    // (4) Execute businessObject update
    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: timerEventDefinition,
      properties: newProps
    });
  };

  const getOptions = (element) => {

    const options = [ { value: '', label: translate('<none>') } ];

    if (isTimerDefinitionTypeSupported('timeDate', element)) {
      options.push({
        value: 'timeDate',
        label: translate('Time Date')
      });
    }

    if (isTimerDefinitionTypeSupported('timeDuration', element)) {
      options.push({
        value: 'timeDuration',
        label: translate('Time Duration')
      });
    }

    if (isTimerDefinitionTypeSupported('timeCycle', element)) {
      options.push({
        value: 'timeCycle',
        label: translate('Time Cycle')
      });
    }

    return options;
  };

  return SelectEntry({
    element,
    id: 'timerEventDefinitionType',
    label: translate('Type'),
    getValue,
    setValue,
    getOptions
  });
}

/**
 * TimerEventDefinitionValue - Generic textField entry allowing to specify the
 * timerEventDefintionValue based on the set timerEventDefintionType. To be used
 * together with timerEventDefinitionType.
 *
 * @param  {type} props
 * @return {TextField}
 */
function TimerEventDefinitionValue(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack'),
        translate = useService('translate'),
        debounce = useService('debounceInput');

  const businessObject = getBusinessObject(element),
        timerEventDefinition = getTimerEventDefinition(businessObject),
        timerEventDefinitionType = getTimerDefinitionType(timerEventDefinition),
        timerEventFormalExpression = timerEventDefinition.get(timerEventDefinitionType);

  const getValue = () => {
    return timerEventFormalExpression && timerEventFormalExpression.get('body');
  };

  const setValue = (value) => {
    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: timerEventFormalExpression,
      properties: {
        body: value
      }
    });
  };

  return TextField({
    element,
    id: 'timerEventDefinitionValue',
    label: translate('Value'),
    getValue,
    setValue,
    debounce,
    description: getTimerEventDefinitionValueDescription(timerEventDefinitionType, translate),
    disabled: !timerEventFormalExpression
  });
}

/**
 * TimerEventDefinitionDurationValue - textField entry allowing to specify the
 * duration value. This is to be used stand-alone, without the TimerEventDefinitionType
 *
 * @param  {type} props
 * @return {TextField}
 */
function TimerEventDefinitionDurationValue(props) {
  const {
    element
  } = props;

  const bpmnFactory = useService('bpmnFactory'),
        commandStack = useService('commandStack'),
        translate = useService('translate'),
        debounce = useService('debounceInput');

  const businessObject = getBusinessObject(element),
        timerEventDefinition = getTimerEventDefinition(businessObject);

  let timerEventFormalExpression = timerEventDefinition.get('timeDuration');

  const getValue = () => {
    return timerEventFormalExpression && timerEventFormalExpression.get('body');
  };

  const setValue = (value) => {
    const commands = [];

    // (1) re-use formalExpression
    if (!timerEventFormalExpression) {
      timerEventFormalExpression = bpmnFactory.create('bpmn:FormalExpression', { body: undefined });
      timerEventFormalExpression.$parent = timerEventDefinition;

      // (1.1) update the formalExpression
      const newProps = {
        timeDuration: timerEventFormalExpression,
        timeDate: undefined,
        timeCycle: undefined
      };

      // (1.2) push command
      commands.push({
        cmd: 'properties-panel.update-businessobject',
        context: {
          element: element,
          businessObject: timerEventDefinition,
          properties: newProps
        }
      });

    }

    // (2) update value
    commands.push({
      cmd: 'properties-panel.update-businessobject',
      context: {
        element: element,
        businessObject: timerEventFormalExpression,
        properties: {
          body: value
        }
      }
    });

    // (3) commit all commands
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  return TextField({
    element,
    id: 'timerEventDefinitionDurationValue',
    label: translate('Timer Duration'),
    getValue,
    setValue,
    debounce,
    description: getTimerEventDefinitionValueDescription('timeDuration', translate)
  });
}


// helper //////////////////////////

/**
 * Get the timer definition type for a given timer event definition.
 *
 * @param {ModdleElement<bpmn:TimerEventDefinition>} timer
 *
 * @return {string|undefined} the timer definition type
 */
function getTimerDefinitionType(timer) {

  if (!timer) {
    return;
  }

  const timeDate = timer.get('timeDate');
  if (typeof timeDate !== 'undefined') {
    return 'timeDate';
  }

  const timeCycle = timer.get('timeCycle');
  if (typeof timeCycle !== 'undefined') {
    return 'timeCycle';
  }

  const timeDuration = timer.get('timeDuration');
  if (typeof timeDuration !== 'undefined') {
    return 'timeDuration';
  }
}


/**
 * isTimerDefinitionTypeSupported - Checks whether a given timerDefinitionType
 * is supported for a given element
 *
 * @param  {string} timerDefinitionType
 * @param  {ModdleElement} element
 *
 * @return {boolean}
 */
function isTimerDefinitionTypeSupported(timerDefinitionType, element) {
  const businessObject = getBusinessObject(element);

  switch (timerDefinitionType) {
  case 'timeDate':
    if (is(element, 'bpmn:StartEvent')) {
      return true;
    }
    return false;

  case 'timeCycle':
    if (is(element, 'bpmn:StartEvent')) {
      return true;
    }

    if (is(element, 'bpmn:BoundaryEvent') && !businessObject.cancelActivity) {
      return true;
    }
    return false;

  case 'timeDuration':
    if (is(element, 'bpmn:IntermediateCatchEvent')) {
      return true;
    }

    if (is(element, 'bpmn:BoundaryEvent') && !businessObject.cancelActivity) {
      return true;
    }
    return false;

  default:
    return undefined;
  }
}

function getTimerEventDefinitionValueDescription(timerDefinitionType, translate) {
  switch (timerDefinitionType) {
  case 'timeDate':
    return (<div>
      <p>{ translate('A specific point in time defined as ISO 8601 combined date and time representation.') }</p>
      <ul>
        <li><code>2019-10-01T12:00:00Z</code> - { translate('UTC time') }</li>
        <li><code>2019-10-02T08:09:40+02:00</code> - { translate('UTC plus 2 hours zone offset') }</li>
        <li><code>2019-10-02T08:09:40+02:00[Europe/Berlin]</code> - { translate('UTC plus 2 hours zone offset at Berlin') }</li>
      </ul>
      <a href="https://docs.camunda.io/docs/reference/bpmn-processes/timer-events/timer-events/#time-date" target="_blank" rel="noopener">{ translate('Documentation: Timer events') }</a>
    </div>);

  case 'timeCycle':
    return (<div>
      <p>{ translate('A cycle defined as ISO 8601 repeating intervals format.') }</p>
      <ul>
        <li><code>R5/PT10S</code> - { translate('every 10 seconds, up to 5 times') }</li>
        <li><code>R/P1D</code> - { translate('every day, infinitely') }</li>
      </ul>
      <a href="https://docs.camunda.io/docs/reference/bpmn-processes/timer-events/timer-events/#time-cycle" target="_blank" rel="noopener">{ translate('Documentation: Timer events') }</a>
    </div>);

  case 'timeDuration':
    return (<div>
      <p>{ translate('A Time Duration defined as ISO 8601 durations format.') }</p>
      <ul>
        <li><code>PT15S</code> - { translate('15 seconds') }</li>
        <li><code>PT1H30M</code> - { translate('1 hour and 30 minutes') }</li>
        <li><code>P14D</code> - { translate('14 days') }</li>
      </ul>
      <a href="https://docs.camunda.io/docs/reference/bpmn-processes/timer-events/timer-events/#time-duration" target="_blank" rel="noopener">{ translate('Documentation: Timer events') }</a>
    </div>);

  default:
    return;
  }
}
