import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import { TextFieldEntry, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';

import {
  useService
} from '../../../hooks';


export function HistoryCleanupProps(props) {
  const {
    element
  } = props;

  const businessObject = getBusinessObject(element);

  if (!is(element, 'bpmn:Process') &&
      !(is(element, 'bpmn:Participant') && businessObject.get('processRef'))) {
    return [];
  }

  return [
    {
      id: 'historyTimeToLive',
      component: HistoryTimeToLive,
      isEdited: isTextFieldEntryEdited
    },
  ];
}

function HistoryTimeToLive(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const process = getProcess(element);

  const getValue = () => {
    return process.get('camunda:historyTimeToLive') || '';
  };

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: process,
      properties: {
        'camunda:historyTimeToLive': value
      }
    });
  };

  return TextFieldEntry({
    element,
    id: 'historyTimeToLive',
    label: translate('Time to live'),
    tooltip: <div>
      { translate('Number of days before this resource is being cleaned up. If specified, takes precedence over the engine configuration.') }{ ' '}
      <a href="https://docs.camunda.org/manual/latest/user-guide/process-engine/history/" target="_blank" rel="noopener">{ translate('Learn more.') }</a>
    </div>,
    getValue,
    setValue,
    debounce
  });
}


// helper //////////////////

function getProcess(element) {
  return is(element, 'bpmn:Process') ?
    getBusinessObject(element) :
    getBusinessObject(element).get('processRef');
}
