import { TextFieldEntry, SelectEntry } from '@bpmn-io/properties-panel';

import {
  useService
} from '../../../hooks';

const DEFAULT_PROPS = {
  'stringValue': undefined,
  'string': undefined,
  'expression': undefined
};


export default function FieldInjection(props) {

  const {
    element,
    idPrefix,
    field
  } = props;

  const entries = [ {
    id: idPrefix + '-name',
    component: NameProperty,
    field,
    idPrefix,
    element
  },{
    id: idPrefix + '-type',
    component: TypeProperty,
    field,
    idPrefix,
    element
  },{
    id: idPrefix + '-value',
    component: ValueProperty,
    field,
    idPrefix,
    element
  } ];

  return entries;
}

function NameProperty(props) {
  const {
    idPrefix,
    element,
    field
  } = props;

  const commandStack = useService('commandStack'),
        translate = useService('translate'),
        debounce = useService('debounceInput');

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: field,
      properties: {
        name: value
      }
    });
  };

  const getValue = (field) => {
    return field.name;
  };

  return TextFieldEntry({
    element: field,
    id: idPrefix + '-name',
    label: translate('Name'),
    getValue,
    setValue,
    debounce
  });
}

function TypeProperty(props) {
  const {
    idPrefix,
    element,
    field
  } = props;

  const commandStack = useService('commandStack'),
        translate = useService('translate');

  const getValue = (field) => {
    return determineType(field);
  };

  const setValue = (value) => {
    const properties = Object.assign({}, DEFAULT_PROPS);

    properties[ value ] = '';

    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: field,
      properties
    });
  };

  const getOptions = (element) => {

    const options = [
      { value: 'string', label: translate('String') },
      { value: 'expression', label: translate('Expression') }
    ];

    return options;
  };

  return SelectEntry({
    element: field,
    id: idPrefix + '-type',
    label: translate('Type'),
    getValue,
    setValue,
    getOptions
  });
}

function ValueProperty(props) {
  const {
    idPrefix,
    element,
    field
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {

    // (1) determine which type we have set
    const type = determineType(field);

    // (2) set property accordingly
    const properties = Object.assign({}, DEFAULT_PROPS);

    properties[ type ] = value || '';

    // (3) execute the update command
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: field,
      properties
    });
  };

  const getValue = (field) => {
    return field.string || field.stringValue || field.expression;
  };

  return TextFieldEntry({
    element: field,
    id: idPrefix + '-value',
    label: translate('Value'),
    getValue,
    setValue,
    debounce
  });
}


// helper ///////////////////


/**
 * determineType - get the type of a fieldInjection based on the attributes
 * set on it
 *
 * @param  {ModdleElement} field
 * @return {('string'|'expression')}
 */
function determineType(field) {

  // string is the default type
  return ('string' in field && 'string') ||
          ('expression' in field && 'expression') ||
          ('stringValue' in field && 'string') ||
          'string';
}
