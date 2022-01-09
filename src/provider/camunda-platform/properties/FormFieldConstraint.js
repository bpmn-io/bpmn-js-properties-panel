import { TextFieldEntry } from '@bpmn-io/properties-panel';

import {
  useService
} from '../../../hooks';


export default function FormFieldConstraint(props) {

  const {
    idPrefix,
    element,
    constraint
  } = props;

  const entries = [
    {
      id: idPrefix + '-name',
      component: <Name idPrefix={ idPrefix } element={ element } constraint={ constraint } />
    },
    {
      id: idPrefix + '-config',
      component: <Config idPrefix={ idPrefix } element={ element } constraint={ constraint } />
    } ];

  return entries;
}

function Name(props) {
  const {
    idPrefix,
    element,
    constraint
  } = props;

  const commandStack = useService('commandStack'),
        translate = useService('translate'),
        debounce = useService('debounceInput');

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: constraint,
      properties: {
        name: value
      }
    });
  };

  const getValue = () => {
    return constraint.name;
  };

  return TextFieldEntry({
    element: constraint,
    id: idPrefix + '-name',
    label: translate('Name'),
    getValue,
    setValue,
    debounce
  });
}

function Config(props) {
  const {
    idPrefix,
    element,
    constraint
  } = props;

  const commandStack = useService('commandStack'),
        translate = useService('translate'),
        debounce = useService('debounceInput');

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: constraint,
      properties: {
        config: value
      }
    });
  };

  const getValue = () => {
    return constraint.config;
  };

  return TextFieldEntry({
    element: constraint,
    id: idPrefix + '-config',
    label: translate('Config'),
    getValue,
    setValue,
    debounce
  });
}
