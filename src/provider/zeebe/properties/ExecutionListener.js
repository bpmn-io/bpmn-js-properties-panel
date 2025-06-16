import { SelectEntry } from '@bpmn-io/properties-panel';

import {
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
import { useCallback } from '@bpmn-io/properties-panel/preact/hooks';


export const EVENT_TO_LABEL = {
  'start': 'Start',
  'end': 'End'
};

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
      listener,
      eventTypes
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
  });

  return entries;
}

function EventType(props) {
  const {
    idPrefix,
    element,
    listener,
    eventTypes
  } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');

  const getOptions = () => {
    return eventTypes.map(eventType => ({
      value: eventType,
      label: translate(EVENT_TO_LABEL[eventType])
    }));
  };

  const setValue = useCallback((value) => {
    modeling.updateModdleProperties(element, listener, {
      eventType: value
    });
  }, [ modeling, element, listener ]);

  const getValue = useCallback(() => {
    return listener.get('eventType');
  }, [ listener ]);

  return SelectEntry({
    element,
    id: idPrefix + '-eventType',
    label: translate('Event type'),
    getValue,
    setValue,
    getOptions
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

  return [ 'start', 'end' ];
}
