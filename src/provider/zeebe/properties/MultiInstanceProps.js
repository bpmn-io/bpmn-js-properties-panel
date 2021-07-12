import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import TextField, { isEdited as defaultIsEdited } from '@bpmn-io/properties-panel/lib/components/entries/TextField';

import {
  getExtensionElementsList
} from '../utils/ExtensionElementsUtil';

import {
  createElement
} from '../utils/ElementUtil';

import {
  useService
} from '../../../hooks';


export function MultiInstanceProps(props) {
  const {
    element
  } = props;

  if (!supportsMultiInstances(element)) {
    return [];
  }

  return [
    {
      id: 'multiInstance-inputCollection',
      component: <InputCollection element={ element } />,
      isEdited: defaultIsEdited
    },
    {
      id: 'multiInstance-inputElement',
      component: <InputElement element={ element } />,
      isEdited: defaultIsEdited
    },
    {
      id: 'multiInstance-outputCollection',
      component: <OutputCollection element={ element } />,
      isEdited: defaultIsEdited
    },
    {
      id: 'multiInstance-outputElement',
      component: <OutputElement element={ element } />,
      isEdited: defaultIsEdited
    }
  ];
}

function InputCollection(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return getProperty(element, 'inputCollection');
  };

  const setValue = (value) => {
    return setProperty(element, 'inputCollection', value, commandStack, bpmnFactory);
  };

  return TextField({
    element,
    id: 'multiInstance-inputCollection',
    label: translate('Input Collection'),
    getValue,
    setValue,
    debounce
  });
}

function InputElement(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return getProperty(element, 'inputElement');
  };

  const setValue = (value) => {
    return setProperty(element, 'inputElement', value, commandStack, bpmnFactory);
  };

  return TextField({
    element,
    id: 'multiInstance-inputElement',
    label: translate('Input Element'),
    getValue,
    setValue,
    debounce
  });
}

function OutputCollection(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return getProperty(element, 'outputCollection');
  };

  const setValue = (value) => {
    return setProperty(element, 'outputCollection', value, commandStack, bpmnFactory);
  };

  return TextField({
    element,
    id: 'multiInstance-outputCollection',
    label: translate('Output Collection'),
    getValue,
    setValue,
    debounce
  });
}

function OutputElement(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return getProperty(element, 'outputElement');
  };

  const setValue = (value) => {
    return setProperty(element, 'outputElement', value, commandStack, bpmnFactory);
  };

  return TextField({
    element,
    id: 'multiInstance-outputElement',
    label: translate('Output Element'),
    getValue,
    setValue,
    debounce
  });
}


// helper ///////////////////////

function getLoopCharacteristics(element) {
  const businessObject = getBusinessObject(element);
  return businessObject.get('loopCharacteristics');
}

function getZeebeLoopCharacteristics(loopCharacteristics) {
  const extensionElements = getExtensionElementsList(loopCharacteristics, 'zeebe:LoopCharacteristics');

  return extensionElements && extensionElements[0];
}

function supportsMultiInstances(element) {
  return !!getLoopCharacteristics(element);
}

function getProperty(element, propertyName) {
  const loopCharacteristics = getLoopCharacteristics(element),
        zeebeLoopCharacteristics = getZeebeLoopCharacteristics(loopCharacteristics);

  return zeebeLoopCharacteristics && zeebeLoopCharacteristics.get(propertyName);
}

function setProperty(element, propertyName, value, commandStack, bpmnFactory) {
  const loopCharacteristics = getLoopCharacteristics(element);

  const commands = [];

  // (1) ensure extension elements
  let extensionElements = loopCharacteristics.get('extensionElements');
  if (!extensionElements) {
    extensionElements = createElement(
      'bpmn:ExtensionElements',
      { values: [] },
      loopCharacteristics,
      bpmnFactory
    );

    commands.push({
      cmd: 'properties-panel.update-businessobject',
      context: {
        element: element,
        businessObject: loopCharacteristics,
        properties: { extensionElements }
      }
    });
  }

  // (2) ensure zeebe loop characteristics
  let zeebeLoopCharacteristics = getZeebeLoopCharacteristics(loopCharacteristics);
  if (!zeebeLoopCharacteristics) {
    zeebeLoopCharacteristics = createElement(
      'zeebe:LoopCharacteristics',
      { },
      extensionElements,
      bpmnFactory
    );

    commands.push({
      cmd: 'properties-panel.update-businessobject-list',
      context: {
        element: element,
        currentObject: extensionElements,
        propertyName: 'values',
        objectsToAdd: [ zeebeLoopCharacteristics ]
      }
    });
  }

  // (3) update defined property
  commands.push({
    cmd: 'properties-panel.update-businessobject',
    context: {
      element: element,
      businessObject: zeebeLoopCharacteristics,
      properties: { [ propertyName ]: value }
    }
  });

  // (4) commit all updates
  commandStack.execute('properties-panel.multi-command-executor', commands);
}