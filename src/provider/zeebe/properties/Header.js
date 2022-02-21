import { TextFieldEntry } from '@bpmn-io/properties-panel';

import {
  useService
} from '../../../hooks';


export default function Header(props) {

  const {
    idPrefix,
    header
  } = props;

  const entries = [ {
    id: idPrefix + '-key',
    component: KeyProperty,
    header,
    idPrefix
  },{
    id: idPrefix + '-value',
    component: ValueProperty,
    header,
    idPrefix
  } ];

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
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: header,
      properties: {
        key: value
      }
    });
  };

  const getValue = (header) => {
    return header.key;
  };

  return TextFieldEntry({
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
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: header,
      properties: {
        value
      }
    });
  };

  const getValue = (header) => {
    return header.value;
  };

  return TextFieldEntry({
    element: header,
    id: idPrefix + '-value',
    label: translate('Value'),
    getValue,
    setValue,
    debounce
  });
}