import { TextFieldEntry } from '@bpmn-io/properties-panel';

import {
  useService
} from '../../../hooks';


export default function FormFieldProperty(props) {

  const {
    element,
    idPrefix,
    property
  } = props;

  const entries = [
    {
      id: idPrefix + '-id',
      component: Id,
      idPrefix,
      property,
      element
    },
    {
      id: idPrefix + '-value',
      component: Value,
      idPrefix,
      property,
      element
    } ];

  return entries;
}

function Id(props) {
  const {
    idPrefix,
    element,
    property
  } = props;

  const commandStack = useService('commandStack'),
        translate = useService('translate'),
        debounce = useService('debounceInput');

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: property,
      properties: {
        id: value
      }
    });
  };

  const getValue = () => {
    return property.id;
  };

  return TextFieldEntry({
    element: property,
    id: idPrefix + '-id',
    label: translate('ID'),
    getValue,
    setValue,
    debounce
  });
}

function Value(props) {
  const {
    idPrefix,
    element,
    property
  } = props;

  const commandStack = useService('commandStack'),
        translate = useService('translate'),
        debounce = useService('debounceInput');

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: property,
      properties: {
        value
      }
    });
  };

  const getValue = () => {
    return property.value;
  };

  return TextFieldEntry({
    element: property,
    id: idPrefix + '-value',
    label: translate('Value'),
    getValue,
    setValue,
    debounce
  });
}
