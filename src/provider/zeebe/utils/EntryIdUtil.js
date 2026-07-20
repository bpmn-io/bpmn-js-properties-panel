import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

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

  // forward-only (no `fields`): their entry ids are built via getListEntryId
  // but their field suffixes are labels, not moddle properties, so they are
  // not path-resolved
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
    errorCode: 'errorCode'
  },
  'bpmn:Escalation': {
    escalationCode: 'escalationCode'
  },
  'bpmn:Message': {
    name: 'messageName'
  },
  'bpmn:Signal': {
    name: 'signalName'
  },
  'bpmn:AdHocSubProcess': {
    completionCondition: 'completionCondition'
  },
  'bpmn:SequenceFlow': {
    conditionExpression: 'conditionExpression'
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
  if (!Array.isArray(path) || !path.length) {
    return null;
  }

  const field = path[path.length - 1];

  if (typeof field !== 'string') {
    return null;
  }

  let resolved;

  try {
    resolved = resolveNode(getBusinessObject(element), path);
  } catch (error) {
    return null;
  }

  if (!resolved) {
    return null;
  }

  const { node, index } = resolved;

  const listScheme = LIST_ENTRY_SCHEMES[node.$type];

  if (listScheme) {
    if (!listScheme.fields || typeof index !== 'number' || !listScheme.fields.includes(field)) {
      return null;
    }

    return `${getListEntryId(element, node, index)}-${field}`;
  }

  return getSingletonEntryId(node.$type, field);
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
 * @return {{ node: ModdleElement, index: number|null }|null} the resolved
 * node, and the collection index used to reach it (if any)
 */
function resolveNode(start, path) {
  let node = start;
  let index = null;

  for (let i = 0; i < path.length - 1 && node; i++) {
    const segment = path[i];

    if (typeof segment === 'number') {
      node = node[segment];
      index = segment;
    } else {
      node = node.get(segment);
    }
  }

  return node ? { node, index } : null;
}
