import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  useService
} from '../../../hooks';

import {
  isTimerSupported,
  getTimerEventDefinition,
  getTimerDefinitionType
} from '../../../utils/EventDefinitionUtil';

import {
  isFeelEntryEdited,
  SelectEntry, isSelectEntryEdited,
} from '@bpmn-io/properties-panel';

import { FeelEntryWithVariableContext } from '../../../entries/FeelEntryWithContext';


/**
 * @typedef { import('@bpmn-io/properties-panel').EntryDefinition } Entry
 */

/**
 * @returns {Array<Entry>} entries
 */
export function TimerProps(props) {
  const {
    element,
    injector
  } = props;

  const translate = injector.get('translate');

  const businessObject = getBusinessObject(element),
        timerEventDefinition = getTimerEventDefinition(businessObject),
        timerEventDefinitionType = getTimerDefinitionType(timerEventDefinition);

  // (1) Only show for supported elements
  if (!isTimerSupported(element)) {
    return [];
  }

  const timerOptions = getTimerOptions(element, translate);
  const singleOption = timerOptions.length === 1;

  const entries = [];

  if (!singleOption) {
    entries.push({
      id: 'timerEventDefinitionType',
      component: TimerEventDefinitionType,
      isEdited: isSelectEntryEdited,
      options: timerOptions
    });
  }

  if (timerEventDefinitionType || singleOption) {
    entries.push({
      id: 'timerEventDefinitionValue',
      component: TimerEventDefinitionValue,
      isEdited: isFeelEntryEdited,
      label: singleOption ? timerOptions[0].label : undefined,
      timerEventDefinitionType: timerEventDefinitionType || timerOptions[0].value
    });
  }

  return entries;
}

function getTimerOptions(element, translate) {

  const options = [];

  if (isTimerDefinitionTypeSupported('timeDate', element)) {
    options.push({
      value: 'timeDate',
      label: translate('Date')
    });
  }

  if (isTimerDefinitionTypeSupported('timeDuration', element)) {
    options.push({
      value: 'timeDuration',
      label: translate('Duration')
    });
  }

  if (isTimerDefinitionTypeSupported('timeCycle', element)) {
    options.push({
      value: 'timeCycle',
      label: translate('Cycle')
    });
  }

  return options;
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
    element,
    options
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
    const formalExpression = createTimerFormalExpression(bpmnFactory, timerEventDefinition);

    // (3) Set the value for selected timerEventDefinitionType
    const newProps = {
      timeDuration: undefined,
      timeDate: undefined,
      timeCycle: undefined
    };

    if (value !== '') {
      newProps[value] = formalExpression;
    }

    // (4) Execute businessObject update
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: timerEventDefinition,
      properties: newProps
    });
  };

  const getOptions = (element) => {
    return [
      { value: '', label: translate('<none>') },
      ...options
    ];
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
 * @param {object} props
 * @param {ModdleElement} props.element
 * @param {'timeCycle'|'timeDate'|'timeDuration'} props.timerEventDefinitionType?
 * @param {string} props.label?
 * @return {TextFieldEntry}
 */
function TimerEventDefinitionValue(props) {
  const {
    element,
    label,
    timerEventDefinitionType
  } = props;

  const commandStack = useService('commandStack'),
        translate = useService('translate'),
        debounce = useService('debounceInput'),
        bpmnFactory = useService('bpmnFactory');

  const businessObject = getBusinessObject(element),
        timerEventDefinition = getTimerEventDefinition(businessObject),
        timerEventFormalExpression = timerEventDefinition.get(timerEventDefinitionType);

  // TODO(@barmac): remove with next major release
  // support `timerEventDefinitionDurationValue` for backwards compatibility
  const legacyId = getLegacyId(element);

  const getValue = () => {
    return timerEventFormalExpression && timerEventFormalExpression.get('body');
  };

  const setValue = (value) => {
    if (!timerEventFormalExpression) {
      const expression = createTimerFormalExpression(bpmnFactory, timerEventDefinition);
      expression.set('body', value);

      commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: timerEventDefinition,
        properties: {
          [ timerEventDefinitionType ]: expression
        }
      });

      return;
    }

    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: timerEventFormalExpression,
      properties: {
        body: value
      }
    });
  };

  return FeelEntryWithVariableContext({
    element,
    id: legacyId || 'timerEventDefinitionValue',
    label: label || translate('Value'),
    feel: 'optional',
    getValue,
    setValue,
    debounce,
    description: getTimerEventDefinitionValueDescription(timerEventDefinitionType, translate)
  });
}



// helper //////////////////////////

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

    if (is(element, 'bpmn:BoundaryEvent')) {
      return true;
    }
    return false;

  case 'timeCycle':
    if (is(element, 'bpmn:StartEvent') && !isInterruptingStartEvent(businessObject)) {
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

    if (is(element, 'bpmn:BoundaryEvent')) {
      return true;
    }
    return false;

  default:
    return undefined;
  }
}

function createTimerFormalExpression(bpmnFactory, eventDefinition) {
  const formalExpression = bpmnFactory.create('bpmn:FormalExpression', { body: undefined });
  formalExpression.$parent = eventDefinition;

  return formalExpression;
}

function getTimerEventDefinitionValueDescription(timerDefinitionType, translate) {
  switch (timerDefinitionType) {
  case 'timeDate':
    return (<div>
      <p>{ translate('A specific point in time defined as ISO 8601 combined date and time representation.') }</p>
      <ul>
        <li><code>2019-10-01T12:00:00Z</code> - { translate('UTC time') }</li>
        <li><code>2019-10-02T08:09:40+02:00</code> - { translate('UTC plus 2 hours zone offset') }</li>
      </ul>
      <a href="https://docs.camunda.io/docs/reference/bpmn-processes/timer-events/timer-events#time-date" target="_blank" rel="noopener" title={ translate('Timer documentation') }>{ translate('How to configure a timer') }</a>
    </div>);

  case 'timeCycle':
    return (<div>
      <p>{ translate('A cycle defined as ISO 8601 repeating intervals format, or a cron expression.') }</p>
      <ul>
        <li><code>R5/PT10S</code> - { translate('every 10 seconds, up to 5 times') }</li>
        <li><code>R/P1D</code> - { translate('every day, infinitely') }</li>
        <li><code>0 0 9-17 * * MON-FRI</code> - { translate('every hour on the hour from 9-5 p.m. UTC Monday-Friday') }</li>
      </ul>
      <a href="https://docs.camunda.io/docs/reference/bpmn-processes/timer-events/timer-events#time-cycle" target="_blank" rel="noopener" title={ translate('Timer documentation') }>{ translate('How to configure a timer') }</a>
    </div>);

  case 'timeDuration':
    return (<div>
      <p>{ translate('A time duration defined as ISO 8601 durations format.') }</p>
      <ul>
        <li><code>PT15S</code> - { translate('15 seconds') }</li>
        <li><code>PT1H30M</code> - { translate('1 hour and 30 minutes') }</li>
        <li><code>P14D</code> - { translate('14 days') }</li>
      </ul>
      <a href="https://docs.camunda.io/docs/reference/bpmn-processes/timer-events/timer-events#time-duration" target="_blank" rel="noopener" title={ translate('Timer documentation') }>{ translate('How to configure a timer') }</a>
    </div>);
  }
}

function isInterruptingStartEvent(bo) {
  return isInEventSubProcess(bo) && bo.get('isInterrupting') !== false;
}

function isInEventSubProcess(bo) {
  const parent = bo.$parent;

  return is(parent, 'bpmn:SubProcess') && parent.triggeredByEvent;
}

function getLegacyId(event) {
  if (is(event, 'bpmn:IntermediateCatchEvent') || isInterruptingBoundaryEvent(event)) {
    return 'timerEventDefinitionDurationValue';
  }
}

function isInterruptingBoundaryEvent(event) {
  const bo = getBusinessObject(event);

  return is(bo, 'bpmn:BoundaryEvent') && bo.get('cancelActivity') !== false;
}
