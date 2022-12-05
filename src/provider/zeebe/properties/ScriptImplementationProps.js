import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import {
  is,
  isAny
} from 'bpmn-js/lib/util/ModelUtil';

import { SelectEntry } from '@bpmn-io/properties-panel';

import {
  getExtensionElementsList, removeExtensionElements
} from '../../../utils/ExtensionElementsUtil';

import {
  createElement
} from '../../../utils/ElementUtil';

import { useService } from '../../../hooks';

import { without } from 'min-dash';

export const SCRIPT_IMPLEMENTATION_OPTION = 'script',
      JOB_WORKER_IMPLEMENTATION_OPTION = 'jobWorker',
      DEFAULT_IMPLEMENTATION_OPTION = '';


export function ScriptImplementationProps(props) {
  const {
    element
  } = props;

  if (!is(element, 'bpmn:ScriptTask')) {
    return [];
  }

  return [
    {
      id: 'scriptImplementation',
      component: ScriptImplementation,
      isEdited: () => isScriptImplementationEdited(element)
    }
  ];
}

function ScriptImplementation(props) {
  const {
    element,
    id
  } = props;

  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');

  const getValue = () => {
    if (getScript(element)) {
      return SCRIPT_IMPLEMENTATION_OPTION;
    }

    if (getTaskDefinition(element)) {
      return JOB_WORKER_IMPLEMENTATION_OPTION;
    }

    return DEFAULT_IMPLEMENTATION_OPTION;
  };

  /**
   * Set value by either creating a zeebe:script or a zeebe:taskDefintion
   * extension element. Note that they must not exist both at the same time, however
   * this will be ensured by a bpmn-js behavior (and not by the propPanel).
   */
  const setValue = (value) => {
    let extensionElement, extensionElementType;

    if (value === SCRIPT_IMPLEMENTATION_OPTION) {
      extensionElement = getScript(element);
      extensionElementType = 'zeebe:Script';
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
      { value: SCRIPT_IMPLEMENTATION_OPTION, label: translate('FEEL expression') },
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

function getScript(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:Script')[0];
}

function getTaskHeaders(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:TaskHeaders');
}

function isScriptImplementationEdited(element) {
  return getTaskDefinition(element) || getScript(element);
}

function resetElement(element, commandStack) {
  const businessObject = getBusinessObject(element);
  const taskDefinition = getTaskDefinition(element);
  const taskHeaders = getTaskHeaders(element);
  const script = getScript(element);

  if (taskDefinition) {
    const removed = [ taskDefinition, taskHeaders ].filter(Boolean);

    removeExtensionElements(element, businessObject, removed, commandStack);

    return;
  }

  if (script) {
    removeExtensionElements(element, businessObject, script, commandStack);
  }
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
    extensionElementValues = without(extensionElements.get('values'), getScript(element));
  } else if (is(extensionElementToAdd, 'zeebe:Script')) {
    const matcher = extension => isAny(extension, [ 'zeebe:TaskDefinition', 'zeebe:TaskHeaders' ]);

    extensionElementValues = without(extensionElements.get('values'), matcher);
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