import { SelectEntry } from '@bpmn-io/properties-panel';

import {
  useService
} from '../../../hooks';

import { FeelEntryWithVariableContext } from '../../../entries/FeelEntryWithContext';


export default function ExecutionListener(props) {

  const {
    idPrefix,
    listener
  } = props;

  const entries = [
    {
      id: idPrefix + '-eventType',
      component: EventType,
      idPrefix,
      listener
    },
    {
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
    }
  ];

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
    return [
      { value: 'start', label: translate('Start') },
      { value: 'end', label: translate('End') }
    ];
  };

  const setValue = (value) => {
    modeling.updateModdleProperties(element, listener, {
      eventType: value
    });
  };

  const getValue = () => {
    return listener.get('eventType');
  };

  return SelectEntry({
    element,
    id: idPrefix + '-eventType',
    label: translate('Event type'),
    getValue,
    setValue,
    getOptions
  });
}

function ListenerType(props) {
  const {
    idPrefix,
    element,
    listener
  } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    modeling.updateModdleProperties(element, listener, {
      type: value
    });
  };

  const getValue = () => {
    return listener.get('type');
  };

  return FeelEntryWithVariableContext({
    element,
    id: idPrefix + '-listenerType',
    label: translate('Listener type'),
    getValue,
    setValue,
    debounce,
    feel: 'optional'
  });
}

function Retries(props) {
  const {
    idPrefix,
    element,
    listener
  } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    modeling.updateModdleProperties(element, listener, {
      retries: value
    });
  };

  const getValue = () => {
    return listener.get('retries');
  };

  return FeelEntryWithVariableContext({
    element,
    id: idPrefix + '-retries',
    label: translate('Retries'),
    getValue,
    setValue,
    debounce,
    feel: 'optional'
  });
}