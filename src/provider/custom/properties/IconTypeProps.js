import { html } from 'htm/preact';
import {
  getBusinessObject,
  is,
  isAny
} from 'bpmn-js/lib/util/ModelUtil';

import { SelectEntry, isSelectEntryEdited } from '@bpmn-io/properties-panel';
import { useService } from '../../../hooks';

export function IconTypeProps(element) {
  if (!isAny(element, ['bpmn:Task'])) {
    return [];
  }
  return [
    {
      id: 'iconType',
      element,
      component: IconType,
      isEdited: isSelectEntryEdited
    }
  ];
}

function IconType(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const process = getProcess(element);

  const getValue = () => {
    return process.iconType || '';
  };

  const setValue = value => {
    return modeling.updateModdleProperties(element, process, {
        iconType: value
    });
  };

  const getOptions = () => {
    return [
      {
        label: '',
        value: ''
      },
      {
        label: 'Icon 1',
        value: 'TASK_ICON'
      }
    ];
  };

  return html`<${SelectEntry}
    id=${id}
    element=${element}
    label=${translate('Icon Type')}
    getValue=${getValue}
    setValue=${setValue}
    getOptions=${getOptions}
    debounce=${debounce}
  />`;
}

// helper /////////////////////
function getProcess(element) {
  return isAny(element, ['bpmn:Process', 'bpmn:Task']) ?
    getBusinessObject(element) :
    getBusinessObject(element).get('processRef');
}