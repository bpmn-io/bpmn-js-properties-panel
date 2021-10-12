import {
  is,
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import TextField, { isEdited as textFieldIsEdited } from '@bpmn-io/properties-panel/lib/components/entries/TextField';

import {
  useService
} from '../../../hooks';

import {
  ScriptProps
} from './ScriptProps';


export function ScriptTaskProps(props) {
  const {
    element
  } = props;

  if (!is(element, 'bpmn:ScriptTask')) {
    return [];
  }

  const entries = [
    ...ScriptProps({ element })
  ];

  entries.push({
    id: 'scriptResultVariable',
    component: <ResultVariable element={ element } />,
    isEdited: textFieldIsEdited
  });

  return entries;
}

function ResultVariable(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const businessObject = getBusinessObject(element);

  const getValue = () => {
    return businessObject.get('camunda:resultVariable');
  };


  const setValue = (value) => {
    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: businessObject,
      properties: {
        'camunda:resultVariable': value
      }
    });
  };

  return TextField({
    element,
    id: 'scriptResultVariable',
    label: translate('Result variable'),
    getValue,
    setValue,
    debounce
  });
}