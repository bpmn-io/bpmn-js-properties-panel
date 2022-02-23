import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  SelectEntry,
  isSelectEntryEdited,
  TextFieldEntry,
  isTextFieldEntryEdited,
  TextAreaEntry,
  isTextAreaEntryEdited
} from '@bpmn-io/properties-panel';

import {
  ScriptProps
} from './ScriptProps';

import {
  useService
} from '../../../hooks';

import {
  getInputOutputType
} from '../utils/InputOutputUtil';

import {
  createElement
} from '../../../utils/ElementUtil';

import {
  ListProps
} from './ListProps';

import {
  MapProps
} from './MapProps';

const DEFAULT_PROPS = {
  value: undefined,
  definition: undefined
};


export default function InputOutputParameter(props) {
  const {
    idPrefix,
    element,
    parameter
  } = props;

  const inputOutputType = getInputOutputType(parameter);

  let entries = [
    {
      id: idPrefix + '-name',
      component: Name,
      isEdited: isTextFieldEntryEdited,
      idPrefix,
      parameter
    },
    {
      id: idPrefix + '-type',
      component: Type,
      isEdited: isSelectEntryEdited,
      idPrefix,
      parameter
    }
  ];

  // (1) String or expression
  if (inputOutputType === 'stringOrExpression') {

    entries.push({
      id: idPrefix + '-stringOrExpression',
      component: StringOrExpression,
      isEdited: isTextAreaEntryEdited,
      idPrefix,
      parameter
    });

  // (2) Script
  } else if (inputOutputType === 'script') {
    const script = parameter.get('definition');

    entries = [
      ...entries,
      ...ScriptProps({ element, prefix: idPrefix + '-', script })
    ];

  // (3) List
  } else if (inputOutputType === 'list') {
    entries.push({
      id: `${idPrefix}-list`,
      component: ListProps,
      idPrefix,
      parameter
    });

  // (4) Map
  } else if (inputOutputType === 'map') {
    entries.push({
      id: `${idPrefix}-map`,
      component: MapProps,
      idPrefix,
      parameter
    });
  }

  return entries;
}

function Name(props) {
  const {
    idPrefix,
    element,
    parameter
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: parameter,
      properties: {
        name: value
      }
    });
  };

  const getValue = (parameter) => {
    return parameter.get('name');
  };

  return TextFieldEntry({
    element: parameter,
    id: idPrefix + '-name',
    label: translate(isInput(parameter) ? 'Local variable name' : 'Process variable name'),
    getValue,
    setValue,
    debounce
  });
}

function Type(props) {
  const {
    idPrefix,
    element,
    parameter
  } = props;

  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');
  const translate = useService('translate');

  const createDefinitionElement = (type) => {
    return createElement(type, {}, parameter, bpmnFactory);
  };

  const getValue = (mapping) => {
    return getInputOutputType(mapping);
  };

  const setValue = (value) => {
    let properties = {
      ...DEFAULT_PROPS
    };

    if (value === 'script') {
      properties.definition = createDefinitionElement('camunda:Script');
    }
    else if (value === 'list') {
      properties.definition = createDefinitionElement('camunda:List');
    }
    else if (value === 'map') {
      properties.definition = createDefinitionElement('camunda:Map');
    }

    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: parameter,
      properties
    });
  };

  const getOptions = () => {
    const options = [
      { label: translate('List'), value: 'list' },
      { label: translate('Map'), value: 'map' },
      { label: translate('Script'), value: 'script' },
      { label: translate('String or expression'), value: 'stringOrExpression' },
    ];

    return options;
  };

  return SelectEntry({
    element: parameter,
    id: idPrefix + '-type',
    label: translate('Assignment type'),
    getValue,
    setValue,
    getOptions
  });
}

function StringOrExpression(props) {
  const {
    idPrefix,
    element,
    parameter
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: parameter,
      properties: {
        value
      }
    });
  };

  const getValue = (parameter) => {
    return parameter.get('value');
  };

  return TextAreaEntry({
    element: parameter,
    id: idPrefix + '-stringOrExpression',
    label: translate('Value'),
    description: translate('Start typing "${}" to create an expression.'),
    getValue,
    setValue,
    rows: 1,
    debounce
  });
}


// helper /////////////////////

function isInput(parameter) {
  return is(parameter, 'camunda:InputParameter');
}