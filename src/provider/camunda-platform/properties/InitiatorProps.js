import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import { TextFieldEntry, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';

import {
  useService
} from '../../../hooks';


export function InitiatorProps(props) {
  const {
    element
  } = props;

  if (!isInitiator(element)) {
    return [];
  }

  return [
    {
      id: 'initiator',
      component: Initiator,
      isEdited: isTextFieldEntryEdited
    },
  ];
}

function Initiator(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const businessObject = getBusinessObject(element);

  const getValue = () => {
    return businessObject.get('camunda:initiator');
  };

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:initiator': value
      }
    });
  };

  return TextFieldEntry({
    element,
    id: 'initiator',
    label: translate('Initiator'),
    getValue,
    setValue,
    debounce
  });
}


// helper ///////////////////

function isInitiator(element) {
  return is(element, 'camunda:Initiator') && !is(element.parent, 'bpmn:SubProcess');
}