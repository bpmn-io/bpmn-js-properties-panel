import TextField from '@bpmn-io/properties-panel/lib/components/entries/TextField';

import {
  useService
} from '../../../hooks';


export default function FormFieldValue(props) {

  const {
    idPrefix,
    element,
    value
  } = props;

  const entries = [
    {
      id: idPrefix + '-id',
      component: <Id idPrefix={ idPrefix } element={ element } value={ value } />
    },
    {
      id: idPrefix + '-name',
      component: <Name idPrefix={ idPrefix } element={ element } value={ value } />
    }];

  return entries;
}

function Id(props) {
  const {
    idPrefix,
    element,
    value
  } = props;

  const commandStack = useService('commandStack'),
        translate = useService('translate'),
        debounce = useService('debounceInput');

  const setValue = (val) => {
    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: value,
      properties: {
        id: val
      }
    });
  };

  const getValue = () => {
    return value.id;
  };

  return TextField({
    element: value,
    id: idPrefix + '-id',
    label: translate('ID'),
    getValue,
    setValue,
    debounce
  });
}

function Name(props) {
  const {
    idPrefix,
    element,
    value
  } = props;

  const commandStack = useService('commandStack'),
        translate = useService('translate'),
        debounce = useService('debounceInput');

  const setValue = (val) => {
    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: value,
      properties: {
        name: val
      }
    });
  };

  const getValue = () => {
    return value.name;
  };

  return TextField({
    element: value,
    id: idPrefix + '-name',
    label: translate('Name'),
    getValue,
    setValue,
    debounce
  });
}
