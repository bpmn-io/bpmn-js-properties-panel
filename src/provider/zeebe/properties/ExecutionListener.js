import { SelectEntry } from '@bpmn-io/properties-panel';

import {
  getBusinessObject,
  is,
  isAny
} from 'bpmn-js/lib/util/ModelUtil';

import {
  useService
} from '../../../hooks';

import {
  getErrorEventDefinition
} from '../../../utils/EventDefinitionUtil';

import { ListenerType, Retries } from './shared/Listener';

import ExecutionListenerHeaders from './ExecutionListenerHeaderProps';


export const EVENT_TO_LABEL = {
  'beforeAll': 'Before all',
  'start': 'Start',
  'end': 'End'
};

// Specific event label for Multi instance elements: `beforeAll` runs once before MI init; `start` / `end` run per iteration.
export const MI_EVENT_TO_LABEL = {
  'beforeAll': 'Before all',
  'start': 'Before each',
  'end': 'After each'
};

export function getEventLabel(element, eventType) {
  const labels = isMultiInstance(element) ? MI_EVENT_TO_LABEL : EVENT_TO_LABEL;
  return labels[eventType];
}

export function ExecutionListenerEntries(props) {

  const {
    element,
    idPrefix,
    listener
  } = props;

  const eventTypes = getEventTypes(element);

  const entries = eventTypes.length > 1 ? [
    {
      id: idPrefix + '-eventType',
      component: EventType,
      idPrefix,
      listener
    }
  ] : [];

  entries.push({
    id: idPrefix + '-listenerType',
    component: ListenerType,
    idPrefix,
    listener
  },
  {
    id: idPrefix + '-retries',
    component: Retries,
    idPrefix,
    listener
  },
  {
    id: idPrefix + '-headers',
    component: ExecutionListenerHeaders,
    listener
  });

  return entries;
}

function EventType(props) {
  const {
    idPrefix,
    element,
    listener
  } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');

  const getOptions = () => {
    const eventTypes = getEventTypes(element);
    const currentSelection = listener.get('eventType');

    // always include the selected eventType in the list to ensure it's displayed.
    // for example, if the current selection is 'beforeAll' and the element doesn't support it (non-MI), include it anyway.
    const options = eventTypes.includes(currentSelection) ? eventTypes : [ ...eventTypes, currentSelection ];

    return options.map(eventType => ({
      value: eventType,
      label: translate(getEventLabel(element, eventType)),
      disabled: !eventTypes.includes(eventType) // Disable not allowed elements
    }));
  };

  const setValue = (value) => {
    modeling.updateModdleProperties(element, listener, {
      eventType: value
    });
  };

  const getValue = () => {
    return listener.get('eventType');
  };

  const validate = (value) => {
    if (!getEventTypes(element).includes(value)) {
      return translate('Please select a valid event type.');
    }
  };

  return SelectEntry({
    element,
    id: idPrefix + '-eventType',
    label: translate('Event type'),
    getValue,
    setValue,
    getOptions,
    validate
  });
}

export function getEventTypes(element) {
  if (isAny(element, [ 'bpmn:BoundaryEvent', 'bpmn:StartEvent' ])) {
    return [ 'end' ];
  }

  if (is(element, 'bpmn:EndEvent') && getErrorEventDefinition(element)) {
    return [ 'start' ];
  }

  if (is(element, 'bpmn:Gateway')) {
    return [ 'start' ];
  }

  if (isMultiInstance(element)) {
    return [ 'beforeAll', 'start', 'end' ];
  }

  return [ 'start', 'end' ];
}

function isMultiInstance(element) {
  const loopCharacteristics = getBusinessObject(element).get('loopCharacteristics');
  return !!loopCharacteristics && is(loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics');
}
