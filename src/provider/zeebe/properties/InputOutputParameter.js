import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

import TextField from '@bpmn-io/properties-panel/lib/components/entries/TextField';

import {
  useService
} from '../../../hooks';


export default function InputOutputParameter(props) {

  const {
    idPrefix,
    element,
    parameter
  } = props;

  const entries = [{
    id: idPrefix + '-target',
    component: <TargetProperty idPrefix={ idPrefix } element={ element } parameter={ parameter } />
  },{
    id: idPrefix + '-source',
    component: <SourceProperty idPrefix={ idPrefix } element={ element } parameter={ parameter } />
  }];

  return entries;
}

function TargetProperty(props) {
  const {
    idPrefix,
    element,
    parameter
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    commandStack.execute('properties-panel.update-businessobject', {
      element,
      businessObject: parameter,
      properties: {
        target: value
      }
    });
  };

  const getValue = (parameter) => {
    return parameter.target;
  };

  return TextField({
    element: parameter,
    id: idPrefix + '-target',
    label: translate((is(parameter, 'zeebe:Input') ? 'Local variable name' : 'Process variable name')),
    getValue,
    setValue,
    debounce
  });
}

function SourceProperty(props) {
  const {
    idPrefix,
    element,
    parameter
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    commandStack.execute('properties-panel.update-businessobject', {
      element,
      businessObject: parameter,
      properties: {
        source: value
      }
    });
  };

  const getValue = (parameter) => {
    return parameter.source;
  };

  return TextField({
    element: parameter,
    id: idPrefix + '-source',
    label: translate('Variable assignment value'),
    getValue,
    setValue,
    debounce
  });
}