import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  isFeelEntryEdited
} from '@bpmn-io/properties-panel';

import { useService } from '../../../hooks';


import {
  getError
} from '../../bpmn/utils/EventDefinitionUtil';

import { FeelEntryWithVariableContext } from '../../../entries/FeelEntryWithContext';


export function ErrorProps(props) {
  const {
    element
  } = props;

  const error = getError(element);

  const entries = [];

  if (error && is(element, 'bpmn:ThrowEvent')) {
    entries.push(
      {
        id: 'errorCode',
        component: ErrorCode,
        isEdited: isFeelEntryEdited
      }
    );
  }

  return entries;
}


function ErrorCode(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const error = getError(element);

  const getValue = () => {
    return error.get('errorCode');
  };

  const setValue = (value) => {
    return commandStack.execute(
      'element.updateModdleProperties',
      {
        element,
        moddleElement: error,
        properties: {
          errorCode: value
        }
      }
    );
  };

  return FeelEntryWithVariableContext({
    element,
    id: 'errorCode',
    label: translate('Code'),
    feel: 'optional',
    getValue,
    setValue,
    debounce
  });
}
