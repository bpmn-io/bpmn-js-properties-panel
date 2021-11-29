import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import {
  sortBy
} from 'min-dash';

import Select, { isEdited as selectIsEdited } from '@bpmn-io/properties-panel/lib/components/entries/Select';

import {
  useService
} from '../../../hooks';

import {
  createElement
} from '../../../utils/ElementUtil';

import {
  getExtensionElementsList
} from '../utils/ExtensionElementsUtil';

import {
  getImplementationType,
  isDmnCapable,
  isExternalCapable,
  isServiceTaskLike
} from '../utils/ImplementationTypeUtils';

const DELEGATE_PROPS = {
  'camunda:class': undefined,
  'camunda:expression': undefined,
  'camunda:delegateExpression': undefined,
  'camunda:resultVariable': undefined
};

const DMN_CAPABLE_PROPS = {
  'camunda:decisionRef': undefined,
  'camunda:decisionRefBinding': 'latest',
  'camunda:decisionRefVersion': undefined,
  'camunda:mapDecisionResult': 'resultList',
  'camunda:decisionRefTenantId': undefined
};

const EXTERNAL_CAPABLE_PROPS = {
  'camunda:type': undefined,
  'camunda:topic': undefined
};


export function ImplementationTypeProps(props) {
  const {
    element
  } = props;

  return [
    {
      id: 'implementationType',
      component: <ImplementationType element={ element } />,
      isEdited: selectIsEdited
    },
  ];
}


function ImplementationType(props) {
  const { element } = props;

  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');
  const translate = useService('translate');

  const getValue = () => {
    return getImplementationType(element) || '';
  };

  const setValue = (value) => {

    const oldType = getImplementationType(element);
    const businessObject = getBusinessObject(element);
    const commands = [];

    let updatedProperties = DELEGATE_PROPS;
    let extensionElements = businessObject.get('extensionElements');

    // (1) class, expression, delegateExpression
    if (isDelegateType(value)) {

      updatedProperties = {
        ...updatedProperties,
        [value]: isDelegateType(oldType) ? businessObject.get(`camunda:${oldType}`) : ''
      };

    }

    // (2) dmn
    if (isDmnCapable(element)) {
      updatedProperties = {
        ...updatedProperties,
        ...DMN_CAPABLE_PROPS
      };

      if (value === 'dmn') {
        updatedProperties = {
          ...updatedProperties,
          'camunda:decisionRef': ''
        };
      }
    }

    // (3) external
    // Note: error event definition elements got cleaned up in modeling behavior
    // cf. https://github.com/camunda/camunda-bpmn-js/blob/main/lib/camunda-platform/features/modeling/behavior/DeleteErrorEventDefinitionBehavior.js
    if (isExternalCapable(element)) {
      updatedProperties = {
        ...updatedProperties,
        ...EXTERNAL_CAPABLE_PROPS
      };

      if (value === 'external') {
        updatedProperties = {
          ...updatedProperties,
          'camunda:type': 'external',
          'camunda:topic': ''
        };
      }
    }

    // (4) connector
    if (isServiceTaskLike(element)) {

      // (4.1) remove all connectors on type change
      const connectors = getConnectors(businessObject);
      if (connectors.length) {
        commands.push(RemoveFromListCmd(element, extensionElements, 'values', 'extensionElements', connectors));
      }

      // (4.2) create connector
      if (value === 'connector') {

        // ensure extension elements
        if (!extensionElements) {
          extensionElements = createElement(
            'bpmn:ExtensionElements',
            { values: [] },
            businessObject,
            bpmnFactory
          );

          commands.push(UpdateBusinessObjectCmd(element, businessObject, { extensionElements }));
        }

        const connector = createElement(
          'camunda:Connector',
          {},
          extensionElements,
          bpmnFactory
        );

        commands.push(AddToListCmd(element, extensionElements, 'values', 'extensionElements', [ connector ]));
      }

    }

    // (5) collect all property updates
    commands.push(UpdateBusinessObjectCmd(element, businessObject, updatedProperties));

    // (6) commit all updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  const getOptions = () => {

    const options = [
      { value: '', label: translate('<none>') },
      { value: 'class', label: translate('Java class') },
      { value: 'expression', label: translate('Expression') },
      { value: 'delegateExpression', label: translate('Delegate expression') }
    ];

    if (isDmnCapable(element)) {
      options.push({ value: 'dmn', label: translate('DMN') });
    }

    if (isExternalCapable(element)) {
      options.push({ value: 'external', label: translate('External') });
    }

    if (isServiceTaskLike(element)) {
      options.push({ value: 'connector', label: translate('Connector') });
    }

    return sortByName(options);
  };

  return Select({
    element,
    id: 'implementationType',
    label: translate('Type'),
    getValue,
    setValue,
    getOptions
  });
}


// helper ///////////////////////

function isDelegateType(type) {
  return [ 'class', 'expression', 'delegateExpression' ].includes(type);
}

function getConnectors(businessObject) {
  return getExtensionElementsList(businessObject, 'camunda:Connector');
}

function UpdateBusinessObjectCmd(element, businessObject, newProperties) {
  return {
    cmd: 'properties-panel.update-businessobject',
    context: {
      element: element,
      businessObject: businessObject,
      properties: newProperties
    }
  };
}

function AddToListCmd(element, businessObject, listPropertyName, referencePropertyName, objectsToAdd) {
  return {
    cmd: 'properties-panel.update-businessobject-list',
    context: {
      element: element,
      currentObject: businessObject,
      propertyName: listPropertyName,
      referencePropertyName: referencePropertyName,
      objectsToAdd: objectsToAdd
    }
  };
}

function RemoveFromListCmd(element, businessObject, listPropertyName, referencePropertyName, objectsToRemove) {
  return {
    cmd: 'properties-panel.update-businessobject-list',
    context: {
      element: element,
      currentObject: businessObject,
      propertyName: listPropertyName,
      referencePropertyName: referencePropertyName,
      objectsToRemove: objectsToRemove
    }
  };
}

function sortByName(options) {
  return sortBy(options, o => o.label.toLowerCase());
}
