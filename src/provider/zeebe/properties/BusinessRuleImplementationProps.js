import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

import { SelectEntry } from '@bpmn-io/properties-panel';

import {
  getExtensionElementsList, removeExtensionElements
} from '../../../utils/ExtensionElementsUtil';

import {
  createElement
} from '../../../utils/ElementUtil';

import {
  getTaskHeaders
} from '../utils/HeadersUtil';

import { useService } from '../../../hooks';

import { without } from 'min-dash';

export const DMN_IMPLEMENTATION_OPTION = 'dmn',
      JOB_WORKER_IMPLEMENTATION_OPTION = 'jobWorker',
      DEFAULT_IMPLEMENTATION_OPTION = '';


export function BusinessRuleImplementationProps(props) {
  const {
    element
  } = props;

  if (!is(element, 'bpmn:BusinessRuleTask')) {
    return [];
  }

  return [
    {
      id: 'businessRuleImplementation',
      component: BusinessRuleImplementation,
      isEdited: () => isBusinessRuleImplementationEdited(element)
    }
  ];
}

function BusinessRuleImplementation(props) {
  const {
    element,
    id
  } = props;

  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');

  const getValue = () => {
    if (getCalledDecision(element)) {
      return DMN_IMPLEMENTATION_OPTION;
    }

    if (getTaskDefinition(element)) {
      return JOB_WORKER_IMPLEMENTATION_OPTION;
    }

    return DEFAULT_IMPLEMENTATION_OPTION;
  };

  /**
   * Set value by either creating a zeebe:calledDecision or a zeebe:taskDefintion
   * extension element. Note that they must not exist both at the same time, however
   * this will be ensured by a bpmn-js behavior (and not by the propPanel).
   */
  const setValue = (value) => {
    let extensionElement, extensionElementType;

    if (value === DMN_IMPLEMENTATION_OPTION) {
      extensionElement = getCalledDecision(element);
      extensionElementType = 'zeebe:CalledDecision';
    } else if (value === JOB_WORKER_IMPLEMENTATION_OPTION) {
      extensionElement = getTaskDefinition(element);
      extensionElementType = 'zeebe:TaskDefinition';
    } else {
      resetElement(element, commandStack);
    }

    if (!extensionElement && extensionElementType) {
      extensionElement = createElement(
        extensionElementType,
        { },
        null,
        bpmnFactory
      );

      updateExtensionElements(element, extensionElement, bpmnFactory, commandStack);
    }
  };

  const getOptions = () => {

    const options = [
      { value: DEFAULT_IMPLEMENTATION_OPTION, label: translate('<none>') },
      { value: DMN_IMPLEMENTATION_OPTION, label: translate('DMN decision') },
      { value: JOB_WORKER_IMPLEMENTATION_OPTION, label: translate('Job worker') }
    ];

    return options;
  };

  return SelectEntry({
    element,
    id,
    label: translate('Implementation'),
    getValue,
    setValue,
    getOptions
  });
}


// helper ///////////////////////

function getTaskDefinition(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:TaskDefinition')[0];
}

function getCalledDecision(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:CalledDecision')[0];
}

function isBusinessRuleImplementationEdited(element) {
  return getTaskDefinition(element);
}

function resetElement(element, commandStack) {
  const businessObject = getBusinessObject(element);

  const toRemove = [
    getTaskDefinition(element),
    getTaskHeaders(element),
    getCalledDecision(element)
  ].filter(Boolean);

  removeExtensionElements(element, businessObject, toRemove, commandStack);
}

function updateExtensionElements(element, extensionElementToAdd, bpmnFactory, commandStack) {
  const businessObject = getBusinessObject(element);

  const commands = [];

  let extensionElements = businessObject.get('extensionElements');
  let extensionElementValues;

  // (1) create bpmn:ExtensionElements if it doesn't exist
  if (!extensionElements) {
    extensionElements = createElement(
      'bpmn:ExtensionElements',
      {
        values: []
      },
      businessObject,
      bpmnFactory
    );

    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: businessObject,
        properties: {
          extensionElements
        }
      }
    });
  }

  extensionElementToAdd.$parent = extensionElements;

  // (2) remove old exension element from extensionElements
  if (is(extensionElementToAdd, 'zeebe:TaskDefinition')) {
    extensionElementValues = without(extensionElements.get('values'), getCalledDecision(element));
  } else if (is(extensionElementToAdd, 'zeebe:CalledDecision')) {
    extensionElementValues = without(extensionElements.get('values'), getTaskDefinition(element));
  }

  // (3) add extension element to list
  commands.push({
    cmd: 'element.updateModdleProperties',
    context: {
      element,
      moddleElement: extensionElements,
      properties: {
        values: [ ...extensionElementValues, extensionElementToAdd ]
      }
    }
  });

  commandStack.execute('properties-panel.multi-command-executor', commands);
}