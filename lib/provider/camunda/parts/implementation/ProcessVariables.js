var getVariablesForScope = require('@bpmn-io/extract-process-variables').getVariablesForScope;

var groupBy = require('min-dash').groupBy,
    flatten = require('min-dash').flatten,
    forEach = require('min-dash').forEach,
    keys = require('min-dash').keys,
    map = require('min-dash').map,
    sortBy = require('min-dash').sortBy;

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    is = require('bpmn-js/lib/util/ModelUtil').is,
    isAny = require('bpmn-js/lib/features/modeling/util/ModelingUtil').isAny;

var escapeHTML = require('../../../../Utils').escapeHTML;

var factory = require('../../../../factory/EntryFactory');

var entryFieldDescription = require('../../../../factory/EntryFieldDescription');


module.exports = function(element, translate) {

  var entries = [];

  function createVariablesList(variables, scope) {
    var scopePrefix = scope ? scope + '-' : '';

    return flatten(map(variables, function(variable, idx) {

      var name = variable.name,
          origin = variable.origin,
          variableEntries = [];

      // title ///////////////////

      var collapsible = factory.collapsible({
        id: scopePrefix + 'variable- ' + idx + '-collapsible',
        title: escapeHTML(name),
        description: origin.toString(),
        open: false,
        get: function() {
          return {
            title: escapeHTML(name),
            description: origin.toString()
          };
        }
      });

      var isOpen = collapsible.isOpen;

      variableEntries.push(collapsible);

      // created in //////////////////

      var createdInHtml = '<div data-show="show">' +
        '<b>' + escapeHTML(translate('Created in')) + '</b>' +
        createdInList(origin) +
      '</div>';

      variableEntries.push({
        id: scopePrefix + 'variable- ' + idx + '-created-in',
        html: createdInHtml,
        cssClasses: [
          'bpp-process-variables',
          'bpp-process-variables__created-in'
        ],
        show: function() {
          return isOpen();
        }
      });

      return variableEntries;
    }));
  }


  if (!canHaveProcessVariables(element)) {
    return entries;
  }

  var businessObject = getBusinessObject(element),
      rootElement = getRootElement(businessObject),
      scope = getScope(element);

  var variables = getVariablesForScope(scope, rootElement),
      sorted = sortByName(variables),
      withNames = populateElementNames(sorted),
      byScope = groupByScope(withNames);

  // (1) tab description entry
  var description = entryFieldDescription(translate, translate('Available process variables, identified in the diagram.'));

  entries.push({
    id: 'process-variables-description',
    html: description,
    cssClasses: [
      'bpp-process-variables',
      'bpp-process-variables__description'
    ]
  });

  // (2) empty list placeholder
  if (!withNames.length) {
    var placeholder = entryFieldDescription(translate, translate('No variables found.'));

    entries.push({
      id: 'process-variables-placeholder',
      html: placeholder
    });

    return entries;
  }

  if (keys(byScope).length > 1) {

    // (3a) multiple scopes variables lists

    // assumption: variables extractor fetches parent variables first
    forEach(reverse(keys(byScope)), function(scope) {
      var variables = byScope[scope];

      entries.push({
        id: scope + '-scope-title',
        html: '<div>' + escapeHTML(translate('Scope: ')) + scope + '</div>',
        cssClasses: [
          'bpp-process-variables',
          'bpp-process-variables__scope-title',
          'bpp-collapsible-break'
        ]
      });

      entries = entries.concat(createVariablesList(variables, scope));
    });
  } else {

    // (3b) single scope variables list
    entries = entries.concat(createVariablesList(withNames));
  }


  return entries;
};


// helpers //////////

function getRootElement(element) {
  var businessObject = getBusinessObject(element);

  if (is(businessObject, 'bpmn:Participant')) {
    return businessObject.processRef;
  }

  if (is(businessObject, 'bpmn:Process')) {
    return businessObject;
  }

  var parent = businessObject;

  while (parent.$parent && !is(parent, 'bpmn:Process')) {
    parent = parent.$parent;
  }

  return parent;
}

function getScope(element) {
  if (is(element, 'bpmn:Participant')) {
    return getBusinessObject(element).processRef.id;
  }

  return element.id;
}

function sortByName(variables) {
  return sortBy(variables, function(variable) {
    return variable.name;
  });
}

function populateElementNames(variables) {
  forEach(variables, function(variable) {
    var names = map(variable.origin, function(element) {
      return element.name || element.id;
    });

    variable.origin = names;
    variable.scope = variable.scope.name || variable.scope.id;
  });

  return variables;
}

function canHaveProcessVariables(element) {
  var businessObject = getBusinessObject(element);

  return (
    isAny(element, ['bpmn:Process', 'bpmn:SubProcess']) ||
      (is(element, 'bpmn:Participant') && businessObject.get('processRef'))
  );
}

function groupByScope(variables) {
  return groupBy(variables, 'scope');
}

function createdInList(origin) {
  var html = '';

  forEach(origin, function(o) {
    html += '<p class="bpp-process-variables__created-in-item">' + o + '</p>';
  });
  return html;
}

function reverse(array) {
  return map(array, function(a, i) {
    return array[array.length - 1 - i];
  });
}