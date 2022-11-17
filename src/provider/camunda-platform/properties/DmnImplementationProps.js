import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import {
  TextFieldEntry,
  isTextFieldEntryEdited,
  SelectEntry,
  isSelectEntryEdited
} from '@bpmn-io/properties-panel';

import {
  useService
} from '../../../hooks';

import {
  getImplementationType
} from '../utils/ImplementationTypeUtils';

export function DmnImplementationProps(props) {
  const {
    element
  } = props;

  const entries = [];

  const implementationType = getImplementationType(element);
  const bindingType = getDecisionRefBinding(element);

  if (implementationType !== 'dmn') {
    return entries;
  }

  // (1) decisionRef
  entries.push({
    id: 'decisionRef',
    component: DecisionRef,
    isEdited: isTextFieldEntryEdited
  });


  // (2) binding
  entries.push({
    id: 'decisionRefBinding',
    component: Binding,
    isEdited: isSelectEntryEdited
  });

  // (3) version
  if (bindingType === 'version') {
    entries.push({
      id: 'decisionRefVersion',
      component: Version,
      isEdited: isTextFieldEntryEdited
    });
  }

  // (4) versionTag
  if (bindingType === 'versionTag') {
    entries.push({
      id: 'decisionRefVersionTag',
      component: VersionTag,
      isEdited: isTextFieldEntryEdited
    });
  }

  // (5) tenantId
  entries.push({
    id: 'decisionRefTenantId',
    component: TenantId,
    isEdited: isTextFieldEntryEdited
  });

  // (6) resultVariable
  entries.push({
    id: 'decisionRefResultVariable',
    component: ResultVariable,
    isEdited: isTextFieldEntryEdited
  });

  // (7) mapDecisionResult
  if (getResultVariable(element)) {
    entries.push({
      id: 'mapDecisionResult',
      component: MapDecisionResult,
      isEdited: isSelectEntryEdited
    });
  }

  return entries;
}

function DecisionRef(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const businessObject = getBusinessObject(element);

  const getValue = () => {
    return businessObject.get('camunda:decisionRef');
  };

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:decisionRef': value || ''
      }
    });
  };

  return TextFieldEntry({
    element,
    id: 'decisionRef',
    label: translate('Decision reference'),
    getValue,
    setValue,
    debounce
  });
}

function Binding(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');

  const getValue = () => {
    return getDecisionRefBinding(element);
  };

  const setValue = (value) => {
    const businessObject = getBusinessObject(element);

    // reset version properties on binding type change
    const updatedProperties = {
      'camunda:decisionRefVersion': undefined,
      'camunda:decisionRefVersionTag': undefined,
      'camunda:decisionRefBinding': value
    };

    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: updatedProperties
    });
  };

  // Note: default is "latest",
  // cf. https://docs.camunda.org/manual/latest/reference/bpmn20/custom-extensions/extension-attributes/#decisionrefbinding
  const getOptions = () => {

    const options = [
      { value: 'deployment', label: translate('deployment') },
      { value: 'latest', label: translate('latest') },
      { value: 'version', label: translate('version') },
      { value: 'versionTag', label: translate('versionTag') }
    ];

    return options;
  };

  return SelectEntry({
    element,
    id: 'decisionRefBinding',
    label: translate('Binding'),
    getValue,
    setValue,
    getOptions
  });
}

function Version(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const businessObject = getBusinessObject(element);

  const getValue = () => {
    return businessObject.get('camunda:decisionRefVersion');
  };

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:decisionRefVersion': value
      }
    });
  };

  return TextFieldEntry({
    element,
    id: 'decisionRefVersion',
    label: translate('Version'),
    getValue,
    setValue,
    debounce
  });
}

function VersionTag(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const businessObject = getBusinessObject(element);

  const getValue = () => {
    return businessObject.get('camunda:decisionRefVersionTag');
  };

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:decisionRefVersionTag': value
      }
    });
  };

  return TextFieldEntry({
    element,
    id: 'decisionRefVersionTag',
    label: translate('Version tag'),
    getValue,
    setValue,
    debounce
  });
}

function TenantId(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const businessObject = getBusinessObject(element);

  const getValue = () => {
    return businessObject.get('camunda:decisionRefTenantId');
  };

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:decisionRefTenantId': value
      }
    });
  };

  return TextFieldEntry({
    element,
    id: 'decisionRefTenantId',
    label: translate('Tenant ID'),
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
    return getResultVariable(businessObject);
  };

  // Note: camunda:mapDecisionResult got cleaned up in modeling behavior
  // cf. https://github.com/camunda/camunda-bpmn-js/blob/main/lib/camunda-platform/features/modeling/behavior/UpdateResultVariableBehavior.js
  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:resultVariable': value
      }
    });
  };

  return TextFieldEntry({
    element,
    id: 'decisionRefResultVariable',
    label: translate('Result variable'),
    getValue,
    setValue,
    debounce
  });
}

function MapDecisionResult(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');

  const businessObject = getBusinessObject(element);

  const getValue = () => {
    return businessObject.get('camunda:mapDecisionResult') || 'resultList';
  };

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'camunda:mapDecisionResult': value
      }
    });
  };

  // Note: default is "resultList",
  // cf. https://docs.camunda.org/manual/latest/reference/bpmn20/custom-extensions/extension-attributes/#mapdecisionresult
  const getOptions = () => {
    const options = [
      { value: 'collectEntries', label: translate('collectEntries (List<Object>)') },
      { value: 'resultList', label: translate('resultList (List<Map<String, Object>>)') },
      { value: 'singleEntry', label: translate('singleEntry (TypedValue)') },
      { value: 'singleResult', label: translate('singleResult (Map<String, Object>)') }
    ];

    return options;
  };

  return SelectEntry({
    element,
    id: 'mapDecisionResult',
    label: translate('Map decision result'),
    getValue,
    setValue,
    getOptions
  });
}


// helper ////////////////////

function getDecisionRefBinding(element) {
  const businessObject = getBusinessObject(element);
  return businessObject.get('camunda:decisionRefBinding') || 'latest';
}

function getResultVariable(element) {
  const businessObject = getBusinessObject(element);
  return businessObject.get('camunda:resultVariable');
}