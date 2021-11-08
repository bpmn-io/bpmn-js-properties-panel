import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

import Select from '@bpmn-io/properties-panel/lib/components/entries/Select';

import {
  getExtensionElementsList
} from '../utils/ExtensionElementsUtil';

import {
  createElement
} from '../../../utils/ElementUtil';

import {
  useService
} from '../../../hooks';

export const DMN_IMPLEMENTATION_OPTION = 'dmn',
      JOB_WORKER_IMPLEMENTATION_OPTION = 'jobWorker',
      DEFAULT_IMPLEMENTATION_OPTION = DMN_IMPLEMENTATION_OPTION;


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
      component: <BusinessRuleImplementation element={ element } />,
      isEdited: () => isBusinessRuleImplementationEdited(element)
    }
  ];
}

function BusinessRuleImplementation(props) {
  const {
    element
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
    const commands = [];

    const businessObject = getBusinessObject(element);

    let extensionElements = businessObject.get('extensionElements');

    // (1) ensure extension elements
    if (!extensionElements) {
      extensionElements = createElement(
        'bpmn:ExtensionElements',
        { values: [] },
        businessObject,
        bpmnFactory
      );

      commands.push({
        cmd: 'properties-panel.update-businessobject',
        context: {
          element: element,
          businessObject: businessObject,
          properties: { extensionElements }
        }
      });
    }

    // (2) ensure task definition or called decision
    let extensionElement, extensionElementType;

    if (value === DMN_IMPLEMENTATION_OPTION) {
      extensionElement = getCalledDecision(element);
      extensionElementType = 'zeebe:CalledDecision';
    } else if (value === JOB_WORKER_IMPLEMENTATION_OPTION) {
      extensionElement = getTaskDefinition(element);
      extensionElementType = 'zeebe:TaskDefinition';
    } else {
      return;
    }

    if (!extensionElement) {
      extensionElement = createElement(
        extensionElementType,
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
          objectsToAdd: [ extensionElement ]
        }
      });
    }

    // (3) commit all updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  const getOptions = () => {

    const options = [
      { value: DMN_IMPLEMENTATION_OPTION, label: translate('DMN decision') },
      { value: JOB_WORKER_IMPLEMENTATION_OPTION, label: translate('Job worker') }
    ];

    return options;
  };

  return Select({
    element,
    id: 'businessRuleImplementation',
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
