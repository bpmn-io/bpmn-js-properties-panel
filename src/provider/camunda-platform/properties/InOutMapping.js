import { CheckboxEntry, SelectEntry, TextFieldEntry } from '@bpmn-io/properties-panel';

import {
  useService
} from '../../../hooks';

const DEFAULT_PROPS = {
  'source': undefined,
  'sourceExpression': undefined
};


export default function InOutMapping(props) {
  const {
    idPrefix,
    mapping
  } = props;

  const type = getInOutType(mapping);
  const entries = [];

  // (1) Type
  entries.push({
    id: idPrefix + '-type',
    component: Type,
    idPrefix,
    mapping
  });

  // (2) Source
  if (type === 'source') {
    entries.push({
      id: idPrefix + '-source',
      component: Source,
      idPrefix,
      mapping
    });
  }

  // (3) Source expression
  if (type === 'sourceExpression') {
    entries.push({
      id: idPrefix + '-sourceExpression',
      component: SourceExpression,
      idPrefix,
      mapping
    });
  }

  // (4) Target
  entries.push({
    id: idPrefix + '-target',
    component: Target,
    idPrefix,
    mapping
  });

  // (5) Local
  entries.push({
    id: idPrefix + '-local',
    component: Local,
    idPrefix,
    mapping
  });

  return entries;
}

function Type(props) {
  const {
    idPrefix,
    element,
    mapping
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');

  const getValue = (mapping) => {
    return getInOutType(mapping);
  };

  const setValue = (value) => {
    const properties = {
      ...DEFAULT_PROPS,
      [ value ]: ''
    };

    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: mapping,
      properties
    });
  };

  const getOptions = () => {

    const options = [
      {
        label: translate('Source'),
        value: 'source'
      },
      {
        label: translate('Source expression'),
        value: 'sourceExpression'
      }
    ];

    return options;
  };

  return SelectEntry({
    element: mapping,
    id: idPrefix + '-type',
    label: translate('Type'),
    getValue,
    setValue,
    getOptions
  });
}

function Source(props) {
  const {
    idPrefix,
    element,
    mapping
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: mapping,
      properties: {
        source: value
      }
    });
  };

  const getValue = (mapping) => {
    return mapping.get('camunda:source');
  };

  return TextFieldEntry({
    element: mapping,
    id: idPrefix + '-source',
    label: translate('Source'),
    getValue,
    setValue,
    debounce
  });
}

function SourceExpression(props) {
  const {
    idPrefix,
    element,
    mapping
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: mapping,
      properties: {
        sourceExpression: value
      }
    });
  };

  const getValue = (mapping) => {
    return mapping.get('camunda:sourceExpression');
  };

  return TextFieldEntry({
    element: mapping,
    id: idPrefix + '-sourceExpression',
    label: translate('Source expression'),
    getValue,
    setValue,
    debounce
  });
}

function Target(props) {
  const {
    idPrefix,
    element,
    mapping
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: mapping,
      properties: {
        target: value
      }
    });
  };

  const getValue = (mapping) => {
    return mapping.get('camunda:target');
  };

  return TextFieldEntry({
    element: mapping,
    id: idPrefix + '-target',
    label: translate('Target'),
    getValue,
    setValue,
    debounce
  });
}

function Local(props) {
  const {
    idPrefix,
    element,
    mapping
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');

  const getValue = () => {
    return mapping.get('camunda:local');
  };

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: mapping,
      properties: {
        local: value
      }
    });
  };

  return CheckboxEntry({
    element,
    id: idPrefix + '-local',
    label: translate('Local'),
    getValue,
    setValue
  });
}


// helper ///////////////////

function getInOutType(mapping) {
  let inOutType = '';

  if (typeof mapping.source !== 'undefined') {
    inOutType = 'source';
  }
  else if (typeof mapping.sourceExpression !== 'undefined') {
    inOutType = 'sourceExpression';
  }

  return inOutType;
}
