import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import TextField, { isEdited as textFieldIsEdited } from '@bpmn-io/properties-panel/lib/components/entries/TextField';

import { DmnImplementationProps } from './DmnImplementationProps';
import { ImplementationTypeProps } from './ImplementationTypeProps';

import {
  useService
} from '../../../hooks';

import {
  getExtensionElementsList
} from '../utils/ExtensionElementsUtil';

import {
  getImplementationType,
  getServiceTaskLikeBusinessObject
} from '../utils/ImplementationTypeUtils';


export function ImplementationProps(props) {
  const {
    element
  } = props;

  if (!is(element, 'camunda:ServiceTaskLike')) {
    return [];
  }

  const implementationType = getImplementationType(element);

  // (1) display implementation type select
  const entries = [
    ...ImplementationTypeProps({ element })
  ];

  // (2) display implementation properties based on type
  if (implementationType === 'class') {
    entries.push({
      id: 'javaClass',
      component: <JavaClass element={ element } />,
      isEdited: textFieldIsEdited
    });
  } else if (implementationType === 'expression') {
    entries.push(
      {
        id: 'expression',
        component: <Expression element={ element } />,
        isEdited: textFieldIsEdited
      },
      {
        id: 'expressionResultVariable',
        component: <ResultVariable element={ element } />,
        isEdited: textFieldIsEdited
      }
    );
  } else if (implementationType === 'delegateExpression') {
    entries.push(
      {
        id: 'delegateExpression',
        component: <DelegateExpression element={ element } />,
        isEdited: textFieldIsEdited
      }
    );
  } else if (implementationType === 'dmn') {
    entries.push(...DmnImplementationProps({ element }));
  } else if (implementationType === 'external') {
    entries.push(
      {
        id: 'externalTopic',
        component: <Topic element={ element } />,
        isEdited: textFieldIsEdited
      }
    );
  } else if (implementationType === 'connector') {
    entries.push(
      {
        id: 'connectorId',
        component: <ConnectorId element={ element } />,
        isEdited: textFieldIsEdited
      }
    );
  }

  return entries;
}

export function JavaClass(props) {
  const {
    element,
    businessObject = getBusinessObject(element),
    id = 'javaClass'
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return businessObject.get('camunda:class');
  };

  const setValue = (value) => {
    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: businessObject,
      properties: {
        'camunda:class': value
      }
    });
  };

  return TextField({
    element,
    id,
    label: translate('Java class'),
    getValue,
    setValue,
    debounce
  });
}

export function Expression(props) {
  const {
    element,
    businessObject = getBusinessObject(element),
    id = 'expression'
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return businessObject.get('camunda:expression');
  };

  const setValue = (value) => {
    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: businessObject,
      properties: {
        'camunda:expression': value
      }
    });
  };

  return TextField({
    element,
    id,
    label: translate('Expression'),
    getValue,
    setValue,
    debounce
  });
}

function ResultVariable(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const businessObject = getBusinessObject(element);

  const getValue = () => {
    return businessObject.get('camunda:resultVariable');
  };

  const setValue = (value) => {
    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: businessObject,
      properties: {
        'camunda:resultVariable': value
      }
    });
  };

  return TextField({
    element,
    id: 'expressionResultVariable',
    label: translate('Result Variable'),
    getValue,
    setValue,
    debounce
  });
}

export function DelegateExpression(props) {
  const {
    element,
    businessObject = getBusinessObject(element),
    id = 'delegateExpression'
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return businessObject.get('camunda:delegateExpression');
  };

  const setValue = (value) => {
    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: businessObject,
      properties: {
        'camunda:delegateExpression': value
      }
    });
  };

  return TextField({
    element,
    id,
    label: translate('Delegate expression'),
    getValue,
    setValue,
    debounce
  });
}

function Topic(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const businessObject = getBusinessObject(element);

  const getValue = () => {
    return businessObject.get('camunda:topic');
  };

  const setValue = (value) => {
    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: businessObject,
      properties: {
        'camunda:topic': value
      }
    });
  };

  return TextField({
    element,
    id: 'externalTopic',
    label: translate('Topic'),
    getValue,
    setValue,
    debounce
  });
}

function ConnectorId(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const connector = getConnector(element);

  const getValue = () => {
    return connector.get('camunda:connectorId');
  };

  const setValue = (value) => {
    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: connector,
      properties: {
        'camunda:connectorId': value
      }
    });
  };

  return TextField({
    element,
    id: 'connectorId',
    label: translate('Connector ID'),
    getValue,
    setValue,
    debounce
  });
}


// helper //////////////////

function getConnectors(businessObject) {
  return getExtensionElementsList(businessObject, 'camunda:Connector');
}

function getConnector(element) {
  const businessObject = getServiceTaskLikeBusinessObject(element);
  const connectors = getConnectors(businessObject);

  return connectors[0];
}
