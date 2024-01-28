import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  isAny
} from 'bpmn-js/lib/features/modeling/util/ModelingUtil';

import { getEventDefinition } from '../../bpmn/utils/EventDefinitionUtil';

import {
  createElement
} from '../../../utils/ElementUtil';

import {
  useService
} from '../../../hooks';

import {
  TextFieldEntry,
  isTextFieldEntryEdited,
  SelectEntry,
  isSelectEntryEdited,
  TextAreaEntry,
  isTextAreaEntryEdited
} from '@bpmn-io/properties-panel';

/**
 * Defines condition properties for conditional sequence flow.
 * Cf. https://docs.camunda.org/manual/latest/reference/bpmn20/gateways/sequence-flow/
 */
export function ConditionProps(props) {
  const { element } = props;

  if (
    !(is(element, 'bpmn:SequenceFlow') && isConditionalSource(element.source)) &&
    !getConditionalEventDefinition(element)
  ) {
    return [];
  }

  const entries = [];

  if (getConditionalEventDefinition(element)) {
    entries.push(
      ...VariableEventProps({ element })
    );
  }

  entries.push({
    id: 'conditionType',
    component: ConditionType,
    isEdited: isSelectEntryEdited
  });

  const conditionType = getConditionType(element);

  if (conditionType === 'script') {
    entries.push(
      ...ConditionScriptProps({ element })
    );
  } else if (conditionType === 'expression') {
    entries.push({
      id: 'conditionExpression',
      component: ConditionExpression,
      isEdited: isTextFieldEntryEdited
    });
  }

  return entries;
}


function ConditionType(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');

  const getValue = () => {
    return getConditionType(element);
  };

  const setValue = (value) => {

    // (1) Remove formalExpression if <none> is selected
    if (value === '') {
      updateCondition(element, commandStack, undefined);
    } else {

      // (2) Create and set formalExpression element containing the conditionExpression
      const attributes = {
        body: '',
        language: value === 'script' ? '' : undefined,
      };
      const formalExpressionElement = createFormalExpression(element, attributes, bpmnFactory);

      updateCondition(element, commandStack, formalExpressionElement);
    }
  };

  const getOptions = () => ([
    { value: '', label: translate('<none>') },
    { value: 'script', label: translate('Script') },
    { value: 'expression', label: translate('Expression') }
  ]);

  return <SelectEntry
    element={ element }
    id="conditionType"
    label={ translate('Type') }
    getValue={ getValue }
    setValue={ setValue }
    getOptions={ getOptions }
  />;
}


function ConditionExpression(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack'),
        bpmnFactory = useService('bpmnFactory'),
        translate = useService('translate'),
        debounce = useService('debounceInput');

  const getValue = () => {
    return getConditionExpression(element).get('body');
  };

  const setValue = (value) => {
    const conditionExpression = createFormalExpression(
      element,
      {
        body: value
      },
      bpmnFactory
    );

    updateCondition(element, commandStack, conditionExpression);
  };

  return <TextFieldEntry
    element={ element }
    id="conditionExpression"
    label={ translate('Condition Expression') }
    getValue={ getValue }
    setValue={ setValue }
    debounce={ debounce }
  />;
}

function ConditionScriptProps(props) {
  const { element } = props;

  const entries = [];
  const scriptType = getScriptType(element);

  // (1) language
  entries.push({
    id: 'conditionScriptLanguage',
    component: Language,
    isEdited: isTextFieldEntryEdited
  });

  // (2) type
  entries.push({
    id: 'conditionScriptType',
    component: ScriptType,
    isEdited: isSelectEntryEdited
  });

  // (3) script
  if (scriptType === 'script') {
    entries.push({
      id: 'conditionScriptValue',
      component: Script,
      isEdited: isTextAreaEntryEdited
    });
  } else if (scriptType === 'resource') {

    // (4) resource
    entries.push({
      id: 'conditionScriptResource',
      component: Resource,
      isEdited: isTextFieldEntryEdited
    });
  }

  return entries;
}

function Language(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return getConditionExpression(element).get('language');
  };

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element: element,
      moddleElement: getConditionExpression(element),
      properties: {
        language: value || ''
      }
    });
  };

  return <TextFieldEntry
    element={ element }
    id="conditionScriptLanguage"
    label={ translate('Format') }
    getValue={ getValue }
    setValue={ setValue }
    debounce={ debounce }
  />;
}

function ScriptType(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');

  const getValue = () => {
    return getScriptType(element);
  };

  const setValue = (value) => {

    // reset script properties on type change
    const updatedProperties = {
      'body': value === 'script' ? '' : undefined,
      'camunda:resource': value === 'resource' ? '' : undefined
    };

    commandStack.execute('element.updateModdleProperties', {
      element: element,
      moddleElement: getConditionExpression(element),
      properties: updatedProperties
    });
  };

  const getOptions = () => {

    const options = [
      { value: 'resource', label: translate('External resource') },
      { value: 'script', label: translate('Inline script') }
    ];

    return options;
  };

  return SelectEntry({
    element,
    id: 'conditionScriptType',
    label: translate('Script type'),
    getValue,
    setValue,
    getOptions
  });
}

function Script(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return getConditionExpression(element).get('body');
  };

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element: element,
      moddleElement: getConditionExpression(element),
      properties: {
        'body': value || ''
      }
    });
  };

  return <TextAreaEntry
    element={ element }
    id="conditionScriptValue"
    label={ translate('Script') }
    getValue={ getValue }
    setValue={ setValue }
    debounce={ debounce }
    monospace
  />;
}

function Resource(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return getConditionExpression(element).get('camunda:resource');
  };

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element: element,
      moddleElement: getConditionExpression(element),
      properties: {
        'camunda:resource': value || ''
      }
    });
  };

  return <TextFieldEntry
    element
    id="conditionScriptResource"
    label={ translate('Resource') }
    getValue={ getValue }
    setValue={ setValue }
    debounce={ debounce }
  />;
}

function VariableEventProps(props) {
  const {
    element
  } = props;

  const entries = [];

  entries.push({
    id: 'conditionVariableName',
    component: VariableName,
    isEdited: isTextFieldEntryEdited
  });

  if (!is(element, 'bpmn:StartEvent') || isInEventSubProcess(element)) {
    entries.push({
      id: 'conditionVariableEvents',
      component: VariableEvents,
      isEdited: isTextFieldEntryEdited
    });
  }

  return entries;
}


function VariableName(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return getConditionalEventDefinition(element).get('variableName');
  };

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element: element,
      moddleElement: getConditionalEventDefinition(element),
      properties: {
        variableName: value || ''
      }
    });
  };

  return <TextFieldEntry
    element={ element }
    id="conditionVariableName"
    label={ translate('Variable name') }
    getValue={ getValue }
    setValue={ setValue }
    debounce={ debounce }
  />;
}


function VariableEvents(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return getConditionalEventDefinition(element).get('variableEvents');
  };

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element: element,
      moddleElement: getConditionalEventDefinition(element),
      properties: {
        variableEvents: value || ''
      }
    });
  };

  const tooltip = (
    <div>
      <p>{ translate('Specify more than one variable change event as a comma separated list. Variable change events are:') }</p>
      <ul>
        <li><code>create</code></li>
        <li><code>update</code></li>
        <li><code>delete</code></li>
      </ul>
      <a href="https://docs.camunda.org/manual/latest/reference/bpmn20/custom-extensions/extension-attributes/#variableevents" target="_blank" rel="noopener">{ translate('Documentation: Variable events') }</a>
    </div>
  );

  return <TextFieldEntry
    element={ element }
    id="conditionVariableEvents"
    label={ translate('Variable events') }
    getValue={ getValue }
    setValue={ setValue }
    debounce={ debounce }
    tooltip={ tooltip }
  />;
}


// helper ////////////////////

const CONDITIONAL_SOURCES = [
  'bpmn:Activity',
  'bpmn:ExclusiveGateway',
  'bpmn:InclusiveGateway',
  'bpmn:ComplexGateway'
];

function isConditionalSource(element) {
  return isAny(element, CONDITIONAL_SOURCES);
}

function getConditionalEventDefinition(element) {
  if (!is(element, 'bpmn:Event')) {
    return false;
  }

  return getEventDefinition(element, 'bpmn:ConditionalEventDefinition');
}

function getConditionType(element) {
  const conditionExpression = getConditionExpression(element);

  if (!conditionExpression) {
    return '';
  } else {
    return conditionExpression.get('language') === undefined ? 'expression' : 'script';
  }
}

/**
 * getConditionExpression - get the body value of a condition expression for a given element
 *
 * @param  {ModdleElement} element
 *
 * @return {string|undefined}
 */
function getConditionExpression(element) {
  const businessObject = getBusinessObject(element);

  if (is(businessObject, 'bpmn:SequenceFlow')) {
    return businessObject.get('conditionExpression');
  } else if (getConditionalEventDefinition(businessObject)) {
    return getConditionalEventDefinition(businessObject).get('condition');
  }
}

function getScriptType(element) {
  const conditionExpression = getConditionExpression(element);

  const resource = conditionExpression.get('camunda:resource');
  if (typeof resource !== 'undefined') {
    return 'resource';
  } else {
    return 'script';
  }
}

function updateCondition(element, commandStack, condition = undefined) {
  if (is(element, 'bpmn:SequenceFlow')) {
    commandStack.execute('element.updateProperties', {
      element,
      properties: {
        conditionExpression: condition
      }
    });
  } else {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: getConditionalEventDefinition(element),
      properties: {
        condition
      }
    });
  }
}

function createFormalExpression(parent, attributes, bpmnFactory) {
  return createElement(
    'bpmn:FormalExpression',
    attributes,
    is(parent, 'bpmn:SequenceFlow') ? getBusinessObject(parent) : getConditionalEventDefinition(parent),
    bpmnFactory
  );
}

function isInEventSubProcess(element) {
  const bo = getBusinessObject(element),
        parent = bo.$parent;

  return is(parent, 'bpmn:SubProcess') && parent.triggeredByEvent;
}
