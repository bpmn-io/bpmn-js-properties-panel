'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var isAny = require('bpmn-js/lib/features/modeling/util/ModelingUtil').isAny;

var getVariablesForScope = require('@bpmn-io/extract-process-variables').getVariablesForScope;

var filter = require('min-dash').filter,
    map = require('min-dash').map,
    sortBy = require('min-dash').sortBy;

var elementHelper = require('../../../../helper/ElementHelper'),
    cmdHelper = require('../../../../helper/CmdHelper'),
    utils = require('../../../../Utils');

var entryFactory = require('../../../../factory/EntryFactory'),
    scriptImplementation = require('./Script');

var domQuery = require('min-dom').query;

module.exports = function(parameter, bpmnFactory, options, translate) {

  var typeInfo = {
    'camunda:Map': {
      value: 'map',
      label: translate('Map')
    },
    'camunda:List': {
      value: 'list',
      label: translate('List')
    },
    'camunda:Script': {
      value: 'script',
      label: translate('Script')
    }
  };

  options = options || {};

  var idPrefix = options.idPrefix || '';

  var result = {},
      entries = [];

  result.entries = entries;

  // heading ////////////////////////////////////////////////////////
  var collapsible = entryFactory.collapsible({
    id: idPrefix + 'collapsible',
    title: parameter.name,
    description: getDescription(parameter),
    cssClasses: [ 'bpp-collapsible--with-mapping' ],
    open: false,
    onRemove: options.onRemove,
    onToggle: options.onToggle,
    get: function() {
      return {
        title: parameter.name,
        description: getDescription(parameter)
      };
    }
  });

  var isOpen = collapsible.isOpen;

  result.setOpen = function(value) {
    var entryNode = domQuery('[data-entry="' + collapsible.id + '"]');
    collapsible.setOpen(value, entryNode);
  };

  entries.push(collapsible);

  // parameter name ////////////////////////////////////////////////////////
  entries.push(entryFactory.validationAwareTextField({
    id: idPrefix + 'parameterName',
    label: is(parameter, 'camunda:InputParameter') ?
      translate('Local Variable Name') : translate('Process Variable Name'),
    modelProperty: 'name',

    getProperty: function(element, node) {
      return parameter.name;
    },

    setProperty: function(element, values, node) {
      return cmdHelper.updateBusinessObject(element, parameter, values);
    },

    validate: function(element, values, node) {
      var validation = {};
      var nameValue = values.name;

      if (nameValue) {
        if (utils.containsSpace(nameValue)) {
          validation.name = translate('Name must not contain spaces');
        }
      } else {
        validation.name = translate('Parameter must have a name');
      }

      return validation;
    },

    hidden: function(element, node) {
      return !isOpen();
    }
  }));


  // parameter type //////////////////////////////////////////////////////

  var selectOptions = [
    { value: 'text', name: translate('String or Expression') },
    { value: 'script', name: translate('Script') },
    { value: 'list', name: translate('List') },
    { value: 'map', name: translate('Map') }
  ];

  entries.push(entryFactory.selectBox({
    id : idPrefix + 'parameterType',
    label: translate('Variable Assignment Type'),
    selectOptions: selectOptions,
    modelProperty: 'parameterType',

    get: function(element, node) {
      var parameterType = 'text';

      var definition = parameter.get('definition');
      if (typeof definition !== 'undefined') {
        var type = definition.$type;
        parameterType = typeInfo[type].value;
      }

      return {
        parameterType: parameterType
      };
    },

    set: function(element, values, node) {
      var properties = {
        value: undefined,
        definition: undefined
      };

      var createParameterTypeElem = function(type) {
        return createElement(type, parameter, bpmnFactory);
      };

      var parameterType = values.parameterType;

      if (parameterType === 'script') {
        properties.definition = createParameterTypeElem('camunda:Script');
      }
      else if (parameterType === 'list') {
        properties.definition = createParameterTypeElem('camunda:List');
      }
      else if (parameterType === 'map') {
        properties.definition = createParameterTypeElem('camunda:Map');
      }

      return cmdHelper.updateBusinessObject(element, parameter, properties);
    },

    hidden: function(element, node) {
      return !isOpen();
    }

  }));


  // parameter value (type = text) ///////////////////////////////////////////////////////

  entries.push(entryFactory.autoSuggest({
    id : idPrefix + 'parameterType-text',
    label : translate('Variable Assignment Value'),
    description: translate('Start typing "${}" to create an expression.'),
    modelProperty: 'value',
    get: function(element, node) {
      return {
        value: parameter.value
      };
    },

    set: function(element, values, node) {
      values.value = values.value || undefined;
      return cmdHelper.updateBusinessObject(element, parameter, values);
    },

    show: function(element, node) {
      return isOpen() && !parameter.definition;
    },

    getItems: function(element) {
      var scope = getScope(element),
          rootElement = getRootElement(element);

      // (1) get all available variables for the current scope
      var variables = getVariablesForScope(scope, rootElement);

      // (2) ignore all variables which are (only) written in the current element
      variables = filter(variables, function(variable) {
        var origin = variable.origin,
            withOutCurrent = filter(origin, function(o) {
              return o.id !== element.id;
            });

        return !!withOutCurrent.length;
      });

      // (3) sort by name
      var sorted = sortByName(variables);

      // (4) retrieve names as suggestion items
      return map(sorted, function(variable) {
        return variable.name;
      });
    },

    canSuggest: function(word, editorNode, focusNode) {
      var globalIndex = findWordInContentEditable(word, editorNode, focusNode);

      if (isInsideExpression(editorNode.innerText, globalIndex)) {
        return true;
      }

      if (isInsideUnclosedExpression(editorNode.innerText, globalIndex)) {
        return true;
      }

      return false;
    }

  }));


  // parameter value (type = script) ///////////////////////////////////////////////////////
  var script = scriptImplementation('scriptFormat', 'value', true, translate, { idPrefix: idPrefix });
  entries.push({
    id: idPrefix + 'parameterType-script',
    html: '<div data-show="show">' +
            script.template +
          '</div>',
    get: function(element, node) {
      return isScript(parameter.definition) ? script.get(element, parameter.definition) : {};
    },

    set: function(element, values, node) {
      var update = script.set(element, values);
      return cmdHelper.updateBusinessObject(element, parameter.definition, update);
    },

    validate: function(element, values, node) {
      return isScript(parameter.definition) ? script.validate(element, parameter.definition) : {};
    },

    script: script,
    show: function(element, node) {
      return isOpen() && parameter.definition && isScript(parameter.definition);
    }
  });


  // parameter value (type = list) ///////////////////////////////////////////////////////

  entries.push(entryFactory.table({
    id: idPrefix + 'parameterType-list',
    modelProperties: [ 'value' ],
    labels: [ translate('Value') ],
    addLabel: translate('Add Value'),

    getElements: function(element, node) {

      if (isList(parameter.definition)) {
        return parameter.definition.items;
      }

      return [];
    },

    updateElement: function(element, values, node, idx) {
      var item = parameter.definition.items[idx];
      return cmdHelper.updateBusinessObject(element, item, values);
    },

    addElement: function(element, node) {
      var newValue = createElement('camunda:Value', parameter.definition, bpmnFactory, { value: undefined });
      return cmdHelper.addElementsTolist(element, parameter.definition, 'items', [ newValue ]);
    },

    removeElement: function(element, node, idx) {
      return cmdHelper.removeElementsFromList(element, parameter.definition, 'items', null, [ parameter.definition.items[idx] ]);
    },

    editable: function(element, node, prop, idx) {
      var item = parameter.definition.items[idx];
      return !isMap(item) && !isList(item) && !isScript(item);
    },

    setControlValue: function(element, node, input, prop, value, idx) {
      var item = parameter.definition.items[idx];

      if (!isMap(item) && !isList(item) && !isScript(item)) {
        input.value = value;
      } else {
        input.value = typeInfo[item.$type].label;
      }
    },

    show: function(element, node) {
      return isOpen() && parameter.definition && isList(parameter.definition);
    }

  }));


  // parameter value (type = map) ///////////////////////////////////////////////////////

  entries.push(entryFactory.table({
    id: idPrefix + 'parameterType-map',
    modelProperties: [ 'key', 'value' ],
    labels: [ translate('Key'), translate('Value') ],
    addLabel: translate('Add Entry'),

    getElements: function(element, node) {

      if (parameter && isMap(parameter.definition)) {
        return parameter.definition.entries;
      }

      return [];
    },

    updateElement: function(element, values, node, idx) {
      var entry = parameter.definition.entries[idx];

      if (isMap(entry.definition) || isList(entry.definition) || isScript(entry.definition)) {
        values = {
          key: values.key
        };
      }

      return cmdHelper.updateBusinessObject(element, entry, values);
    },

    addElement: function(element, node) {
      var newEntry = createElement('camunda:Entry', parameter.definition, bpmnFactory, { key: undefined, value: undefined });
      return cmdHelper.addElementsTolist(element, parameter.definition, 'entries', [ newEntry ]);
    },

    removeElement: function(element, node, idx) {
      return cmdHelper.removeElementsFromList(element, parameter.definition, 'entries', null, [ parameter.definition.entries[idx] ]);
    },

    editable: function(element, node, prop, idx) {
      var entry = parameter.definition.entries[idx];
      return prop === 'key' || (!isMap(entry.definition) && !isList(entry.definition) && !isScript(entry.definition));
    },

    setControlValue: function(element, node, input, prop, value, idx) {
      var entry = parameter.definition.entries[idx];

      if (prop === 'key' || (!isMap(entry.definition) && !isList(entry.definition) && !isScript(entry.definition))) {
        input.value = value;
      } else {
        input.value = typeInfo[entry.definition.$type].label;
      }
    },

    show: function(element, node) {
      return isOpen() && parameter.definition && isMap(parameter.definition);
    }

  }));

  return result;
};



// helper /////////////////////

function createElement(type, parent, factory, properties) {
  return elementHelper.createElement(type, properties, parent, factory);
}

function isScript(elem) {
  return is(elem, 'camunda:Script');
}

function isList(elem) {
  return is(elem, 'camunda:List');
}

function isMap(elem) {
  return is(elem, 'camunda:Map');
}

function sortByName(variables) {
  return sortBy(variables, function(variable) {
    return variable.name;
  });
}

function getScope(element) {
  var businessObject = getBusinessObject(element);

  if (isAny(businessObject, [ 'bpmn:Process', 'bpmn:SubProcess' ])) {
    return businessObject.id;
  }

  // look for processes or sub process in parents
  var parent = businessObject;

  while (parent.$parent && !isAny(parent, [ 'bpmn:Process', 'bpmn:SubProcess' ])) {
    parent = parent.$parent;
  }

  return parent.id;
}

function getRootElement(element) {
  var businessObject = getBusinessObject(element),
      parent = businessObject;

  while (parent.$parent && !is(parent, 'bpmn:Process')) {
    parent = parent.$parent;
  }

  return parent;
}

function isInsideExpression(value, index) {
  var openIndex = value.indexOf('${'),
      closeIndex = value.indexOf('}');

  return (
    openIndex > -1 && openIndex <= index &&
    closeIndex > -1 && index < closeIndex
  );
}

function isInsideUnclosedExpression(value, index) {
  var closeIndex = value.lastIndexOf('}', index),
      openIndex = value.indexOf('${', closeIndex + 1);

  return (
    openIndex > -1 && openIndex <= index
  );
}

function findWordInContentEditable(word, editorNode, focusNode) {

  // retrieve value before focusNode (row)
  var children = editorNode.childNodes,
      textBefore = '';

  for (var i = 0; i <= children.length - 1; i++) {
    var child = children[i];

    if (child.contains(focusNode)) {
      break;
    }

    textBefore += (child.innerText || child.wholeText) + '\n';
  }

  return textBefore.length + (word.index || 0);
}

function getDescription(parameter) {
  var definition = parameter.get('definition');

  if (!definition) {
    return parameter.value;
  }

  if (isScript(definition)) {
    return definition.value;
  } else if (isList(definition)) {
    return 'List';
  } else if (isMap(definition)) {
    return 'Map';
  }
}
