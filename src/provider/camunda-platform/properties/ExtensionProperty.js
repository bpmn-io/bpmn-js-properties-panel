import { TextFieldEntry } from '@bpmn-io/properties-panel';

import {
  useService
} from '../../../hooks';


export default function ExtensionProperty(props) {

  const {
    idPrefix,
    element,
    property
  } = props;

  const entries = [ {
    id: idPrefix + '-name',
    component: <NameProperty idPrefix={ idPrefix } element={ element } property={ property } />
  },{
    id: idPrefix + '-value',
    component: <ValueProperty idPrefix={ idPrefix } element={ element } property={ property } />
  } ];

  return entries;
}

function NameProperty(props) {
  const {
    idPrefix,
    element,
    property
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: property,
      properties: {
        name: value
      }
    });
  };

  const getValue = () => {
    return property.name;
  };

  return TextFieldEntry({
    element: property,
    id: idPrefix + '-name',
    label: translate('Name'),
    getValue,
    setValue,
    debounce
  });
}

function ValueProperty(props) {
  const {
    idPrefix,
    element,
    property
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

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