import { TextFieldEntry } from '@bpmn-io/properties-panel';

import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  createElement
} from '../../../utils/ElementUtil';

import {
  useService
} from '../../../hooks';

import { isFeelEntryEdited } from '@bpmn-io/properties-panel';

import { BpmnFeelEntry } from '../../../entries/BpmnFeelEntry';

import { getConditionalEventDefinition } from '../../bpmn/utils/EventDefinitionUtil';

import { getExtensionElementsList } from '../../../utils/ExtensionElementsUtil';

/**
 * Properties of a Conditional Start Event:
 *
 * - `bpmn:Condition`
 * - `zeebe:ConditionalFilter#variableNames`
 * - `zeebe:ConditionalFilter#variableEvents`
 */
export function EventConditionProps(props) {
  const {
    element
  } = props;

  if (!getConditionalEventDefinition(element)) {
    return [];
  }

  return [
    {
      id: 'conditionExpression',
      component: ConditionExpression,
      isEdited: isFeelEntryEdited
    },
    {
      id: 'variableNames',
      component: VariableNames,
    },
    {
      id: 'variableEvents',
      component: VariableEvents,
    }
  ];
}

/**
 * Field for `bpmn:Condition` property.
 */
function ConditionExpression(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return getConditionExpression(element);
  };

  const setValue = (value) => {
    setConditionExpression(element, value, bpmnFactory, commandStack);
  };

  const validate = (value) => {
    if (!value || value.trim() === '') {
      return translate('Must provide a condition expression');
    }
  };

  return BpmnFeelEntry({
    element,
    id: 'conditionExpression',
    label: translate('Condition expression'),
    feel: 'required',
    getValue,
    setValue,
    debounce,
    validate
  });
}

/**
 * Field for `variableNames` property of `zeebe:ConditionalFilter`.
 */
function VariableNames(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () => {
    const conditionalFilter = getConditionalFilter(element);
    return conditionalFilter?.variableNames;
  };

  const setValue = (value) => {
    setConditionalFilter(element, { variableNames: value }, bpmnFactory, commandStack);
  };

  const validate = (value) => {
    if (value && !isCommaSeparatedList(value)) {
      return translate('Must be a comma separated list');
    }
  };

  // TODO(@jarekdanielak): Use multi-select component when available.
  return <TextFieldEntry
    element={ element }
    id="variableNames"
    label={ translate('Variable names') }
    getValue={ getValue }
    setValue={ setValue }
    debounce={ debounce }
    validate={ validate }
  />;
}

/**
 * Field for `variableEvents` property of `zeebe:ConditionalFilter`.
 */
function VariableEvents(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () => {
    const conditionalFilter = getConditionalFilter(element);
    return conditionalFilter?.variableEvents;
  };

  const setValue = (value) => {
    setConditionalFilter(element, { variableEvents: value }, bpmnFactory, commandStack);
  };

  const validate = (value) => {
    if (value && !isCommaSeparatedList(value)) {
      return translate('Must be a comma separated list');
    }
  };

  return <TextFieldEntry
    element={ element }
    id="variableEvents"
    label={ translate('Variable events') }
    getValue={ getValue }
    setValue={ setValue }
    debounce={ debounce }
    validate={ validate }
  />;
}


// helper //////////////////////////

/**
 * Get the body value of a `bpmn:Condition` for a given element
 *
 * @param  {ModdleElement} element
 *
 * @return {string|undefined}
 */
function getConditionExpression(element) {
  const businessObject = getBusinessObject(element);

  if (is(businessObject, 'bpmn:SequenceFlow')) {
    return businessObject.get('conditionExpression')?.get('body');
  }

  const conditionalEventDefinition = getConditionalEventDefinition(businessObject);
  return conditionalEventDefinition?.get('condition')?.get('body');
}

function setConditionExpression(element, value, bpmnFactory, commandStack) {
  const commands = [];

  const businessObject = getBusinessObject(element);

  // (2) Create and set formalExpression element containing the conditionExpression,
  // unless the provided value is empty
  const formalExpressionElement = (value && value != '') ?
    createElement(
      'bpmn:FormalExpression',
      {
        body: value
      },
      businessObject,
      bpmnFactory
    )
    : undefined;

  commands.push({
    cmd: 'element.updateProperties',
    context: {
      element: element,
      properties: {
        conditionExpression: formalExpressionElement
      }
    }
  });

  // (3) Execute the commands
  commandStack.execute('properties-panel.multi-command-executor', commands);
}

/**
 * Get `zeebe:ConditionalFilter` extension element.
 *
 * @param {ModdleElement} element
 */
export function getConditionalFilter(element) {
  const conditionalEventDefinition = getConditionalEventDefinition(element);
  return getExtensionElementsList(conditionalEventDefinition, 'zeebe:ConditionalFilter')?.[0];
}

/**
 * Set properties of `zeebe:ConditionalFilter` extension element.
 * Create it if it does not exist.
 *
 * @param {ModdleElement} element
 * @param {Object} properties
 * @param {*} bpmnFactory
 * @param {*} commandStack
 */
function setConditionalFilter(element, properties, bpmnFactory, commandStack) {

  const conditionalEventDefinition = getConditionalEventDefinition(element);

  let conditionalFilter = getConditionalFilter(element);

  const commands = [];

  // (1) create zeebe:ConditionalFilter if it doesn't exist
  if (!conditionalFilter) {
    conditionalFilter = createElement(
      'zeebe:ConditionalFilter',
      {},
      conditionalEventDefinition,
      bpmnFactory
    );

    const extensionElements = conditionalEventDefinition.get('extensionElements');
    let extensionElementsValues = extensionElements ? extensionElements.get('values') : [];

    extensionElementsValues = [
      ...extensionElementsValues,
      conditionalFilter
    ];

    const updatedExtensionElements = createElement(
      'bpmn:ExtensionElements',
      {
        values: extensionElementsValues
      },
      conditionalEventDefinition,
      bpmnFactory
    );

    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: conditionalEventDefinition,
        properties: {
          extensionElements: updatedExtensionElements
        }
      }
    });
  }

  // (2) update zeebe:ConditionalFilter properties
  commands.push({
    cmd: 'element.updateModdleProperties',
    context: {
      element,
      moddleElement: conditionalFilter,
      properties
    }
  });

  // (3) execute the commands
  commandStack.execute('properties-panel.multi-command-executor', commands);
}

/**
 * Check if a string is a comma separated list,
 * i.e. `"foo, bar, baz"` or `"foo"`.
 * @param {string} string
 * @returns {boolean}
 */
function isCommaSeparatedList(string) {
  if (typeof string !== 'string') {
    return false;
  }

  const items = string.split(',');

  return items.length > 0 && items.every(item => item.trim().length > 0);
}