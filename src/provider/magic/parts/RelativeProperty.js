import { TextFieldEntry } from '@bpmn-io/properties-panel'
import {
  useService
} from '../../../hooks';


export default function RelativeProperty(props) {

  const {
    idPrefix,
    property
  } = props;

  const entries = [ {
    id: idPrefix + '-NextProcess',
    component: NextProcess,
    idPrefix,
    property
  },{
    id: idPrefix + '-PrevProcess',
    component: PrevProcess,
    idPrefix,
    property
  } ];

  return entries;
}

function NextProcess(props) {
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
    id: idPrefix + '-NextProcess',
    label: translate('Next Process ID'),
    getValue,
    setValue,
    debounce
  });
}

function PrevProcess(props) {
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
    id: idPrefix + '-PrevProcess',
    label: translate('Previous Process ID'),
    getValue,
    setValue,
    debounce
  });
}