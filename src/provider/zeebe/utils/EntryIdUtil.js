import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import { isArray } from 'min-dash';

/**
 * Entry id schemes for moddle elements that are rendered as items of a
 * list group, keyed by moddle `$type`. `kind` is the fragment used in the
 * entry id (`${element.id}-${kind}-${index}-${field}`). `fields` lists the
 * moddle properties exposed as entries and is used for path resolution;
 * schemes that omit it are forward-only (their field suffixes are labels,
 * not moddle properties), so getListEntryId builds their id but
 * getZeebeEntryId does not resolve it.
 */
const LIST_ENTRY_SCHEMES = {
  'zeebe:Input': { kind: 'input', fields: [ 'source', 'target' ] },
  'zeebe:Output': { kind: 'output', fields: [ 'source', 'target' ] },
  'zeebe:Header': { kind: 'header', fields: [ 'key', 'value' ] },

  // rendered by the shared ExtensionPropertiesProps (also on the Camunda 7
  // path), so only resolved here — not built via getListEntryId
  'zeebe:Property': { kind: 'extensionProperty', fields: [ 'name', 'value' ] },

  // listener fields are label-named (not moddle properties), so they carry no
  // `fields`; getListEntryId builds their list-item prefix and resolveListenerEntry
  // resolves the label suffixes (type/eventType/retries) via LISTENER_SUFFIX
  'zeebe:ExecutionListener': { kind: 'executionListener' },
  'zeebe:TaskListener': { kind: 'taskListener' }
};

/**
 * Entry id schemes for moddle elements that are rendered as static
 * (non-list) entries, keyed by moddle `$type` and moddle property name.
 */
const SINGLETON_ENTRY_SCHEMES = {
  'zeebe:TaskDefinition': {
    type: 'taskDefinitionType',
    retries: 'taskDefinitionRetries'
  },
  'zeebe:CalledDecision': {
    decisionId: 'decisionId',
    bindingType: 'bindingType',
    versionTag: 'versionTag',
    resultVariable: 'resultVariable'
  },
  'zeebe:CalledElement': {
    processId: 'targetProcessId',
    businessId: 'businessId',
    bindingType: 'bindingType',
    versionTag: 'versionTag',
    propagateAllChildVariables: 'propagateAllChildVariables',
    propagateAllParentVariables: 'propagateAllParentVariables'
  },
  'zeebe:Script': {
    expression: 'scriptExpression',
    resultVariable: 'resultVariable'
  },
  'zeebe:LoopCharacteristics': {
    inputCollection: 'multiInstance-inputCollection',
    inputElement: 'multiInstance-inputElement',
    outputCollection: 'multiInstance-outputCollection',
    outputElement: 'multiInstance-outputElement'
  },
  'bpmn:MultiInstanceLoopCharacteristics': {
    completionCondition: 'multiInstance-completionCondition'
  },
  'zeebe:AssignmentDefinition': {
    assignee: 'assignmentDefinitionAssignee',
    candidateGroups: 'assignmentDefinitionCandidateGroups',
    candidateUsers: 'assignmentDefinitionCandidateUsers'
  },
  'zeebe:JobPriorityDefinition': {
    priority: 'jobPriorityDefinitionPriority'
  },
  'zeebe:PriorityDefinition': {
    priority: 'priorityDefinitionPriority'
  },
  'zeebe:TaskSchedule': {
    dueDate: 'taskScheduleDueDate',
    followUpDate: 'taskScheduleFollowUpDate'
  },
  'zeebe:VersionTag': {
    value: 'versionTag'
  },
  'zeebe:AdHoc': {
    activeElementsCollection: 'activeElementsCollection',
    outputCollection: 'adHocOutputCollection',
    outputElement: 'adHocOutputElement'
  },
  'zeebe:ConditionalFilter': {
    variableEvents: 'variableEvents'
  },
  'bpmn:ConditionalEventDefinition': {
    condition: 'condition'
  },
  'zeebe:Subscription': {
    correlationKey: 'messageSubscriptionCorrelationKey'
  },
  'zeebe:FormDefinition': {
    formId: 'formId',
    formKey: 'customFormKey',
    externalReference: 'externalReference',
    bindingType: 'bindingType',
    versionTag: 'versionTag'
  },
  'zeebe:UserTaskForm': {
    body: 'formConfiguration'
  },
  'bpmn:Error': {
    errorCode: 'errorCode',
    name: 'errorName'
  },
  'bpmn:Escalation': {
    escalationCode: 'escalationCode',
    name: 'escalationName'
  },
  'bpmn:Message': {
    name: 'messageName'
  },
  'bpmn:Signal': {
    name: 'signalName'
  },
  'bpmn:AdHocSubProcess': {
    completionCondition: 'completionCondition',
    cancelRemainingInstances: 'cancelRemainingInstances'
  },
  'bpmn:SequenceFlow': {
    conditionExpression: 'conditionExpression'
  },
  'bpmn:Process': {
    isExecutable: 'isExecutable'
  },

  // event definition reference attributes; the path resolves to the event
  // definition node itself (e.g. `[ 'eventDefinitions', 0, 'messageRef' ]`)
  'bpmn:MessageEventDefinition': {
    messageRef: 'messageRef'
  },
  'bpmn:SignalEventDefinition': {
    signalRef: 'signalRef'
  },
  'bpmn:ErrorEventDefinition': {
    errorRef: 'errorRef'
  },
  'bpmn:EscalationEventDefinition': {
    escalationRef: 'escalationRef'
  },
  'bpmn:LinkEventDefinition': {
    name: 'linkName'
  },
  'bpmn:CompensateEventDefinition': {
    waitForCompletion: 'waitForCompletion',
    activityRef: 'activityRef'
  }
};

/**
 * Entry ids for properties panel entries that are not backed by a single
 * moddle property (radio/select "type" choosers, and other irregular ids).
 * They cannot be resolved from a moddle path, so they are single-sourced as
 * constants shared between the rendering entry definitions and their
 * components, rather than resolved via getZeebeEntryId.
 */
export const SELECTOR_ENTRY_IDS = {
  formType: 'formType',
  timerEventDefinitionType: 'timerEventDefinitionType',
  timerEventDefinitionValue: 'timerEventDefinitionValue',
  adHocImplementation: 'adHocImplementation',
  businessRuleImplementation: 'businessRuleImplementation',
  scriptImplementation: 'scriptImplementation',
  userTaskImplementation: 'userTaskImplementation',
  activeElementsCollectionValue: 'activeElements-activeElementsCollection'
};

/**
 * Entry ids for a container (collection) rendered as a group, keyed by the
 * container's moddle `$type` and the collection property. A finding may point
 * at a collection rather than a single leaf (the best-effort anchor a rule
 * emits when no concrete offending value exists), which resolves outward to
 * the group that renders it.
 */
const GROUP_ENTRY_IDS = {
  'zeebe:IoMapping': {
    inputParameters: 'inputs',
    outputParameters: 'outputs'
  }
};

// moddle property -> entry id suffix for execution/task listeners; the
// listener list-item prefix is single-sourced via getListEntryId, the suffix
// mirrors the (label, not moddle-named) fields the listener component renders
const LISTENER_SUFFIX = {
  type: 'listenerType',
  eventType: 'eventType',
  retries: 'retries'
};

const TIMER_PROPERTIES = [ 'timeCycle', 'timeDate', 'timeDuration' ];

/**
 * Build the id prefix shared by the entries of a list item (e.g.
 * `${element.id}-input-${index}`). This is the single source for the id
 * scheme: it is used both to render the entries and to resolve them.
 *
 * @param {djs.model.Base|string} base the element (top-level lists) or a
 * parent id prefix (nested lists, e.g. execution listener headers)
 * @param {ModdleElement} node the moddle element rendered as the list item
 * @param {number} index the item's index within its collection
 *
 * @return {string|null}
 */
export function getListEntryId(base, node, index) {
  const scheme = LIST_ENTRY_SCHEMES[node.$type];

  if (!scheme) {
    return null;
  }

  const prefix = typeof base === 'string' ? base : base.id;

  return `${prefix}-${scheme.kind}-${index}`;
}

/**
 * Resolve the id of a static (non-list) entry that edits the given moddle
 * property. This is the single source for the id scheme: it is used both
 * to render the entry and to resolve it.
 *
 * @param {string} type the moddle `$type` of the edited element
 * @param {string} property the edited moddle property
 *
 * @return {string|null}
 */
export function getSingletonEntryId(type, property) {
  const scheme = SINGLETON_ENTRY_SCHEMES[type];

  return scheme && scheme[property] || null;
}

/**
 * Resolve the id of the properties panel entry that edits the given
 * moddle property path, relative to the element's business object.
 *
 * @param {djs.model.Base} element
 * @param {(string|number)[]} path
 *
 * @return {string|null}
 */
export function getZeebeEntryId(element, path) {
  if (!isArray(path) || !path.length) {
    return null;
  }

  const field = path[path.length - 1];

  if (typeof field !== 'string') {
    return null;
  }

  const businessObject = getBusinessObject(element);

  let resolved;

  try {
    resolved = resolveNode(businessObject, path);
  } catch (error) {
    return null;
  }

  if (!resolved) {
    return null;
  }

  const { node, index, trail } = resolved;

  return (
    resolveHeaderEntry(element, node, index, trail, field)
    || resolveListenerEntry(element, node, index, field)
    || resolveListEntry(element, node, index, field)
    || resolveGroupEntry(node, field)
    || resolveTimerEntry(node, field)
    || getSingletonEntryId(node.$type, field)
    || resolveReferenceNameEntry(businessObject, field)
    || null
  );
}


// resolver branches //////////////////

// task headers and (nested) execution listener headers both render zeebe:Header
// items; disambiguate via the resolved path so the id matches what is rendered
function resolveHeaderEntry(element, node, index, trail, field) {
  if (node.$type !== 'zeebe:Header' || (field !== 'key' && field !== 'value')) {
    return null;
  }

  // a header nested inside an execution listener renders under the listener
  // list-item prefix (`...-executionListener-<i>-headers-...`)
  const listener = trail.find(entry => entry.node && entry.node.$type === 'zeebe:ExecutionListener');

  if (listener) {
    const listenerPrefix = getListEntryId(element, listener.node, listener.index);

    return `${getListEntryId(`${listenerPrefix}-headers`, node, index)}-${field}`;
  }

  return `${getListEntryId(element, node, index)}-${field}`;
}

// execution/task listener fields render under the listener list-item prefix
// with a label suffix that is not the moddle property name
function resolveListenerEntry(element, node, index, field) {
  if (node.$type !== 'zeebe:ExecutionListener' && node.$type !== 'zeebe:TaskListener') {
    return null;
  }

  const suffix = LISTENER_SUFFIX[field];

  if (!suffix || typeof index !== 'number') {
    return null;
  }

  return `${getListEntryId(element, node, index)}-${suffix}`;
}

// io mapping parameters and extension properties render as list items keyed by
// their moddle property (source/target, name/value)
function resolveListEntry(element, node, index, field) {
  if (node.$type === 'zeebe:Header') {
    return null;
  }

  const scheme = LIST_ENTRY_SCHEMES[node.$type];

  if (!scheme || !scheme.fields || typeof index !== 'number' || !scheme.fields.includes(field)) {
    return null;
  }

  return `${getListEntryId(element, node, index)}-${field}`;
}

function resolveGroupEntry(node, field) {
  const scheme = GROUP_ENTRY_IDS[node.$type];

  return scheme && scheme[field] || null;
}

// the timer type selector has no leaf location and is deferred; the value field
// is resolvable when the expression is present (value-not-allowed / -required)
function resolveTimerEntry(node, field) {
  if (node.$type !== 'bpmn:TimerEventDefinition' || !TIMER_PROPERTIES.includes(field)) {
    return null;
  }

  return node.get(field) ? SELECTOR_ENTRY_IDS.timerEventDefinitionValue : null;
}

// findings on a referenced root's name/code, or legacy flat paths that address
// the element itself, bottom out here — disambiguated by the element's event
// definition (or, for a receive task, its message)
function resolveReferenceNameEntry(businessObject, field) {
  if (field === 'errorCode' && hasEventDefinition(businessObject, 'bpmn:ErrorEventDefinition')) {
    return 'errorCode';
  }

  if (field === 'escalationCode' && hasEventDefinition(businessObject, 'bpmn:EscalationEventDefinition')) {
    return 'escalationCode';
  }

  if (field === 'correlationKey') {
    return 'messageSubscriptionCorrelationKey';
  }

  if (field === 'name') {
    if (hasEventDefinition(businessObject, 'bpmn:MessageEventDefinition')
      || is(businessObject, 'bpmn:ReceiveTask')) {
      return 'messageName';
    }

    if (hasEventDefinition(businessObject, 'bpmn:SignalEventDefinition')) {
      return 'signalName';
    }

    if (hasEventDefinition(businessObject, 'bpmn:ErrorEventDefinition')) {
      return 'errorName';
    }

    if (hasEventDefinition(businessObject, 'bpmn:EscalationEventDefinition')) {
      return 'escalationName';
    }
  }

  return null;
}


// helpers //////////////////

/**
 * Walk all but the last segment of the given path, starting from
 * <start>, resolving the moddle node that the last segment (the edited
 * property) belongs to.
 *
 * @param {ModdleElement} start
 * @param {(string|number)[]} path
 *
 * @return {{ node: ModdleElement, index: number|null, trail: Array<{ node: ModdleElement, index: number|null }> }|null}
 * the resolved node, the collection index used to reach it (if any), and the
 * trail of nodes visited along the way (for disambiguating nested locations)
 */
function resolveNode(start, path) {
  let node = start;

  const trail = [];

  for (let i = 0; i < path.length - 1 && node; i++) {
    const segment = path[i];

    if (typeof segment === 'number') {
      node = node[segment];

      trail.push({ node, index: segment });
    } else {
      node = node.get(segment);

      trail.push({ node, index: null });
    }
  }

  if (!node) {
    return null;
  }

  const last = trail[trail.length - 1];

  return { node, index: last ? last.index : null, trail };
}

/**
 * Whether the element carries an event definition of the given type.
 *
 * @return {boolean}
 */
function hasEventDefinition(businessObject, type) {
  const eventDefinitions = businessObject.get && businessObject.get('eventDefinitions');

  return isArray(eventDefinitions) && eventDefinitions.some(definition => is(definition, type));
}
