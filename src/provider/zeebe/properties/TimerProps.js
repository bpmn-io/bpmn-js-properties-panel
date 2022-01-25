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
} from '../../bpmn/utils/EventDefinitionUtil';

import {
  SelectEntry,
  TextFieldEntry,
  isSelectEntryEdited,
  isTextFieldEntryEdited
} from '@bpmn-io/properties-panel';


/**
 * @typedef { import('@bpmn-io/properties-panel').EntryDefinition } Entry
 */

/**
 * @returns {Array<Entry>} entries
 */
export function TimerProps(props) {
  const {
    element
  } = props;

  const businessObject = getBusinessObject(element),
        timerEventDefinition = getTimerEventDefinition(businessObject),
        timerEventDefinitionType = getTimerDefinitionType(timerEventDefinition);

  // (1) Only show for supported elements
  if (!isTimerSupported(element)) {
    return [];
  }

  // (2) Return duration-specific TexField only if only duration is supported
  const onlySupportDuration = !isTimerDefinitionTypeSupported('timeCycle', element) &&
   !isTimerDefinitionTypeSupported('timeDate', element);

  // (3) Only provide duration-specific textField if only duration is supported,
  // otherwise push type-select and generic textField is type was selected
  const entries = [];

  if (onlySupportDuration) {
    entries.push({
      id: 'timerEventDefinitionDurationValue',
      component: <TimerEventDefinitionDurationValue element={ element } />,
      isEdited: isTextFieldEntryEdited
    });
  } else {
    entries.push({
      id: 'timerEventDefinitionType',
      component: <TimerEventDefinitionType element={ element } />,
      isEdited: isSelectEntryEdited
    });

    if (timerEventDefinitionType) {
      entries.push({
        id: 'timerEventDefinitionValue',
        component: <TimerEventDefinitionValue element={ element } />,
        isEdited: isTextFieldEntryEdited
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
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: timerEventDefinition,
      properties: newProps
    });
  };

  const getOptions = (element) => {

    const options = [ { value: '', label: translate('<none>') } ];

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
 * @return {TextFieldEntry}
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
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: timerEventFormalExpression,
      properties: {
        body: value
      }
    });
  };

  return TextFieldEntry({
    element,
    id: 'timerEventDefinitionValue',
    label: translate('Value'),
    getValue,
    setValue,
    debounce,
    description: getTimerEventDefinitionValueDescription(timerEventDefinitionType, translate)
  });
}

/**
 * TimerEventDefinitionDurationValue - textField entry allowing to specify the
 * duration value. This is to be used stand-alone, without the TimerEventDefinitionType
 *
 * @param  {type} props
 * @return {TextFieldEntry}
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
      const properties = {
        timeDuration: timerEventFormalExpression,
        timeDate: undefined,
        timeCycle: undefined
      };

      // (1.2) push command
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: timerEventDefinition,
          properties
        }
      });

    }

    // (2) update value
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: timerEventFormalExpression,
        properties: {
          body: value
        }
      }
    });

    // (3) commit all commands
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  return TextFieldEntry({
    element,
    id: 'timerEventDefinitionDurationValue',
    label: translate('Timer duration'),
    getValue,
    setValue,
    debounce,
    description: getTimerEventDefinitionValueDescription('timeDuration', translate)
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
      </ul>
      <a href="https://docs.camunda.io/docs/reference/bpmn-processes/timer-events/timer-events#time-date" target="_blank" rel="noopener" title={ translate('Timer documentation') }>{ translate('How to configure a timer') }</a>
    </div>);

  case 'timeCycle':
    return (<div>
      <p>{ translate('A cycle defined as ISO 8601 repeating intervals format.') }</p>
      <ul>
        <li><code>R5/PT10S</code> - { translate('every 10 seconds, up to 5 times') }</li>
        <li><code>R/P1D</code> - { translate('every day, infinitely') }</li>
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
