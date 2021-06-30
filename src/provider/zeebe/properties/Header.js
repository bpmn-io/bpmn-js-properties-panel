import TextField from '@bpmn-io/properties-panel/src/components/entries/TextField';

import {
  useService
} from '../../../hooks';


export default function Header(props) {

  const {
    idPrefix,
    element,
    header
  } = props;

  const entries = [{
    id: idPrefix + '-key',
    component: <KeyProperty idPrefix={ idPrefix } element={ element } header={ header } />
  },{
    id: idPrefix + '-value',
    component: <ValueProperty idPrefix={ idPrefix } element={ element } header={ header } />
  }];

  return entries;
}

function KeyProperty(props) {
  const {
    idPrefix,
    element,
    header
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    commandStack.execute('properties-panel.update-businessobject', {
      element,
      businessObject: header,
      properties: {
        key: value
      }
    });
  };

  const getValue = (header) => {
    return header.key;
  };

  return TextField({
    element: header,
    id: idPrefix + '-key',
    label: translate('Key'),
    getValue,
    setValue,
    debounce
  });
}

function ValueProperty(props) {
  const {
    idPrefix,
    element,
    header
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    commandStack.execute('properties-panel.update-businessobject', {
      element,
      businessObject: header,
      properties: {
        value: value
      }
    });
  };

  const getValue = (header) => {
    return header.value;
  };

  return TextField({
    element: header,
    id: idPrefix + '-value',
    label: translate('Value'),
    getValue,
    setValue,
    debounce
  });
}