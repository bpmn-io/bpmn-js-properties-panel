import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import {
  TextFieldEntry, isTextFieldEntryEdited,
  isFeelEntryEdited
} from '@bpmn-io/properties-panel';

import {
  getExtensionElementsList
} from '../../../utils/ExtensionElementsUtil';

import {
  createElement
} from '../../../utils/ElementUtil';

import { useService } from '../../../hooks';

import { FeelEntryWithVariableContext } from '../../../entries/FeelEntryWithContext';


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
      component: InputCollection,
      isEdited: isFeelEntryEdited
    },
    {
      id: 'multiInstance-inputElement',
      component: InputElement,
      isEdited: isTextFieldEntryEdited
    },
    {
      id: 'multiInstance-outputCollection',
      component: OutputCollection,
      isEdited: isTextFieldEntryEdited
    },
    {
      id: 'multiInstance-outputElement',
      component: OutputElement,
      isEdited: isFeelEntryEdited
    },
    {
      id: 'multiInstance-completionCondition',
      component: CompletionCondition,
      isEdited: isFeelEntryEdited
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

  return FeelEntryWithVariableContext({
    element,
    id: 'multiInstance-inputCollection',
    label: translate('Input collection'),
    feel: 'required',
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

  return TextFieldEntry({
    element,
    id: 'multiInstance-inputElement',
    label: translate('Input element'),
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

  return TextFieldEntry({
    element,
    id: 'multiInstance-outputCollection',
    label: translate('Output collection'),
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

  return FeelEntryWithVariableContext({
    element,
    id: 'multiInstance-outputElement',
    label: translate('Output element'),
    feel: 'required',
    getValue,
    setValue,
    debounce
  });
}

function CompletionCondition(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    const completionCondition = getCompletionCondition(element);
    return completionCondition && completionCondition.get('body');
  };

  const setValue = (value) => {
    if (value && value !== '') {
      const loopCharacteristics = getLoopCharacteristics(element);
      const completionCondition = createElement(
        'bpmn:FormalExpression',
        { body: value },
        loopCharacteristics,
        bpmnFactory
      );
      setCompletionCondition(element, commandStack, completionCondition);
    } else {
      setCompletionCondition(element, commandStack, undefined);
    }
  };

  return FeelEntryWithVariableContext({
    element,
    id: 'multiInstance-completionCondition',
    label: translate('Completion condition'),
    feel: 'required',
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

function getCompletionCondition(element) {
  return getLoopCharacteristics(element).get('completionCondition');
}

function setCompletionCondition(element, commandStack, completionCondition = undefined) {
  commandStack.execute('element.updateModdleProperties', {
    element,
    moddleElement: getLoopCharacteristics(element),
    properties: {
      completionCondition
    }
  });
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
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: loopCharacteristics,
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
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: extensionElements,
        properties: {
          values: [ ...extensionElements.get('values'), zeebeLoopCharacteristics ]
        }
      }
    });
  }

  // (3) update defined property
  commands.push({
    cmd: 'element.updateModdleProperties',
    context: {
      element,
      moddleElement: zeebeLoopCharacteristics,
      properties: { [ propertyName ]: value }
    }
  });

  // (4) commit all updates
  commandStack.execute('properties-panel.multi-command-executor', commands);
}
