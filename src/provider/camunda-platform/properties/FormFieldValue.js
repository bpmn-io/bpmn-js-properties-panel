import { TextFieldEntry } from '@bpmn-io/properties-panel';

import {
  useService
} from '../../../hooks';


export default function FormFieldValue(props) {

  const {
    element,
    idPrefix,
    value
  } = props;

  const entries = [
    {
      id: idPrefix + '-id',
      component: Id,
      idPrefix,
      value,
      element
    },
    {
      id: idPrefix + '-name',
      component: Name,
      idPrefix,
      value,
      element
    } ];

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
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: value,
      properties: {
        id: val
      }
    });
  };

  const getValue = () => {
    return value.id;
  };

  return TextFieldEntry({
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
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: value,
      properties: {
        name: val
      }
    });
  };

  const getValue = () => {
    return value.name;
  };

  return TextFieldEntry({
    element: value,
    id: idPrefix + '-name',
    label: translate('Name'),
    getValue,
    setValue,
    debounce
  });
}
