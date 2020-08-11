var getVariablesForScope = require('@bpmn-io/extract-process-variables').getVariablesForScope;

var forEach = require('min-dash').forEach,
    map = require('min-dash').map,
    sortBy = require('min-dash').sortBy;

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    is = require('bpmn-js/lib/util/ModelUtil').is,
    isAny = require('bpmn-js/lib/features/modeling/util/ModelingUtil').isAny;

var factory = require('../../../../factory/EntryFactory');


module.exports = function(element, translate) {

  var options = {
    id: 'process-variables-entry',
    description: translate('The variables shown are only those defined in the XML.'),
    labels: [ translate('Name'), translate('Created in'), translate('Scope') ],
    modelProperties: [ 'name', 'origin', 'scope' ],
    getElements: function(element) {

      if (!canHaveProcessVariables(element)) {
        return [];
      }

      var businessObject = getBusinessObject(element),
          rootElement = getRootElement(businessObject),
          scope = getScope(element);

      var variables = getVariablesForScope(scope, rootElement),
          sorted = sortByName(variables),
          withNames = populateElementNames(sorted);

      return withNames;
    },
    editable: function() {
      return false;
    }
  };

  return factory.table(options);
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