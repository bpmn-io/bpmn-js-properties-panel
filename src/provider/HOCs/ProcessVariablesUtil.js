import { find, findIndex } from 'min-dash';
import { getExtensionElementsList } from '../../utils/ExtensionElementsUtil';

export function addVariableToList(variablesList, newVariable) {
  var foundIdx = findIndex(variablesList, function(variable) {
    return (
      variable.name === newVariable.name && variable.scope === newVariable.scope
    );
  });

  if (foundIdx >= 0) {
    variablesList[foundIdx].origin = combineArrays(
      variablesList[foundIdx].origin,
      newVariable.origin
    );
  } else {
    variablesList.push(newVariable);
  }
}

/**
 * Creates new process variable definition object
 * Identifies correct (highest) scope, in which variable is available
 *
 * @param {ModdleElement} flowElement
 * @param {String} name
 * @param {ModdleElement} defaultScope
 *
 * @returns {ProcessVariable}
 */
export function createProcessVariable(flowElement, name, defaultScope) {
  var scope = getScope(flowElement, defaultScope, name);

  return {
    name: name,
    origin: [ flowElement ],
    scope: scope
  };
}


// helpers ////////////////////

/**
 * Set parent container if it defines it's own scope for the variable, so
 * when it defines an input mapping for it. Otherwise returns the default global scope
 */
function getScope(element, globalScope, variableName) {
  var parents = getParents(element);

  if (hasOutputParameter(element)) {
    return element;
  }

  var scopedParent = find(parents, function(parent) {
    return (
      is(parent, 'bpmn:SubProcess') && hasInputParameter(parent, variableName)
    );
  });

  return scopedParent ? scopedParent : globalScope;
}

function is(element, type) {
  return (
    element &&
      typeof element.$instanceOf === 'function' &&
      element.$instanceOf(type)
  );
}

function hasInputParameter(element, name) {
  return find(getInputParameters(element), function(input) {
    return input.target === name;
  });
}

function hasOutputParameter(element) {
  return !!getOutputParameters(element).length;
}

function combineArrays(a, b) {
  return a.concat(b);
}

function getInputParameters(element) {
  getExtensionElementsList(element, 'zeebe:IoMapping')[0]?.get('inputParameters');
}

function getOutputParameters(element) {
  getExtensionElementsList(element, 'zeebe:IoMapping')[0]?.get('outputParameters');
}

/**
 * Get all parent elements for a given element.
 *
 * @param {ModdleElement|string} element
 *
 * @returns {Array<ModdleElement>}
 */
function getParents(element) {
  var parents = [];
  var current = element;

  while (current.$parent) {
    parents.push(current.$parent);
    current = current.$parent;
  }

  return parents;
}
