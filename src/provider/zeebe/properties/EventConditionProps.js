import {
  TextFieldEntry,
  CheckboxGroup
} from '@bpmn-io/properties-panel';

import {
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

import { getConditionalEventDefinition } from '../../../utils/EventDefinitionUtil';

import { getExtensionElementsList } from '../../../utils/ExtensionElementsUtil';

import {
  getConditionBody,
  setConditionalEventConditionBody
} from '../../../utils/ConditionUtil';

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

  const entries = [
    {
      id: 'condition',
      component: Condition,
      isEdited: isFeelEntryEdited
    },
    {
      id: 'variableNames',
      component: VariableNames,
    },
  ];

  if (
    is(element.parent, 'bpmn:SubProcess') ||
    is(element, 'bpmn:IntermediateCatchEvent') ||
    is(element, 'bpmn:BoundaryEvent'))
  {
    entries.push({
      id: 'variableEvents',
      component: VariableEvents,
    });
  }

  return entries;
}

/**
 * Field for `bpmn:Condition` property.
 */
function Condition(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return getConditionBody(element);
  };

  const setValue = (value) => {
    setConditionalEventConditionBody(element, value, commandStack, bpmnFactory);
  };

  return BpmnFeelEntry({
    element,
    id: 'condition',
    label: translate('Condition expression'),
    feel: 'required',
    getValue,
    setValue,
    debounce
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

  return <TextFieldEntry
    element={ element }
    id="variableNames"
    label={ translate('Variable names') }
    getValue={ getValue }
    setValue={ setValue }
    debounce={ debounce }
  />;
}

/**
 * Field for `variableEvents` property of `zeebe:ConditionalFilter`.
 */
function VariableEvents(props) {
  const {
    element
  } = props;

  const VARIABLE_EVENTS = {
    CREATE: 'create',
    UPDATE: 'update'
  };

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () => {
    const conditionalFilter = getConditionalFilter(element);
    const events = conditionalFilter?.variableEvents;
    return stringListToArray(events);
  };

  const setValue = (values) => {
    const variableEvents = arrayToStringList(values);
    setConditionalFilter(element, { variableEvents }, bpmnFactory, commandStack);
  };

  return CheckboxGroup({
    element,
    id: 'variableEvents',
    options: [
      { label: translate('Create'), value: VARIABLE_EVENTS.CREATE },
      { label: translate('Update'), value: VARIABLE_EVENTS.UPDATE }
    ],
    getValue,
    setValue,
    label: translate('Variable events'),
  });
}

// helper //////////////////////////

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

function stringListToArray(string) {
  return string?.split(',').map(e => e.trim()).filter(e => e.length > 0) ?? [];
}

function arrayToStringList(array) {
  return array.length > 0 ? array.join(',') : undefined;
}