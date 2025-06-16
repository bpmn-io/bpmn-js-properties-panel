import { useCallback } from '@bpmn-io/properties-panel/preact/hooks';

import { FeelEntryWithVariableContext } from '../../../../entries/FeelEntryWithContext';

import { useService } from '../../../../hooks';

export function ListenerType(props) {
  const {
    idPrefix,
    element,
    listener
  } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = useCallback(value => {
    modeling.updateModdleProperties(element, listener, {
      type: value
    });
  }, [ modeling, element, listener ]);

  const getValue = useCallback(() => {
    return listener.get('type');
  }, [ listener ]);

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

export function Retries(props) {
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