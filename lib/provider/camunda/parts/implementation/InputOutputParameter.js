'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is;

var elementHelper = require('../../../../helper/ElementHelper'),
    inputOutputHelper = require('../../../../helper/InputOutputHelper'),
    cmdHelper = require('../../../../helper/CmdHelper'),
    utils = require('../../../../Utils');

var entryFactory = require('../../../../factory/EntryFactory'),
    scriptImplementation = require('./Script');


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

function ensureInputOutputSupported(element, insideConnector) {
  return inputOutputHelper.isInputOutputSupported(element, insideConnector);
}

module.exports = function(element, bpmnFactory, options, translate) {

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

  var insideConnector = !!options.insideConnector,
      idPrefix = options.idPrefix || '';

  var getSelected = options.getSelectedParameter;

  if (!ensureInputOutputSupported(element, insideConnector)) {
    return [];
  }

  var entries = [];

  var isSelected = function(element, node) {
    return getSelected(element, node);
  };


  // parameter name ////////////////////////////////////////////////////////

  entries.push(entryFactory.validationAwareTextField({
    id: idPrefix + 'parameterName',
    label: translate('Name'),
    modelProperty: 'name',

    getProperty: function(element, node) {
      return (getSelected(element, node) || {}).name;
    },

    setProperty: function(element, values, node) {
      var param = getSelected(element, node);
      return cmdHelper.updateBusinessObject(element, param, values);
    },

    validate: function(element, values, node) {
      var bo = getSelected(element, node);

      var validation = {};
      if (bo) {
        var nameValue = values.name;

        if (nameValue) {
          if (utils.containsSpace(nameValue)) {
            validation.name = translate('Name must not contain spaces');
          }
        } else {
          validation.name = translate('Parameter must have a name');
        }
      }

      return validation;
    },

    hidden: function(element, node) {
      return !isSelected(element, node);
    }
  }));


  // parameter type //////////////////////////////////////////////////////

  var selectOptions = [
    { value: 'text', name: translate('Text') },
    { value: 'script', name: translate('Script') },
    { value: 'list', name: translate('List') },
    { value: 'map', name: translate('Map') }
  ];

  entries.push(entryFactory.selectBox({
    id : idPrefix + 'parameterType',
    label: translate('Type'),
    selectOptions: selectOptions,
    modelProperty: 'parameterType',

    get: function(element, node) {
      var bo = getSelected(element, node);

      var parameterType = 'text';

      if (typeof bo !== 'undefined') {
        var definition = bo.get('definition');
        if (typeof definition !== 'undefined') {
          var type = definition.$type;
          parameterType = typeInfo[type].value;
        }
      }

      return {
        parameterType: parameterType
      };
    },

    set: function(element, values, node) {
      var bo = getSelected(element, node);

      var properties = {
        value: undefined,
        definition: undefined
      };

      var createParameterTypeElem = function(type) {
        return createElement(type, bo, bpmnFactory);
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

      return cmdHelper.updateBusinessObject(element, bo, properties);
    },

    show: function(element, node) {
      return isSelected(element, node);
    }

  }));


  // parameter value (type = text) ///////////////////////////////////////////////////////

  entries.push(entryFactory.textBox({
    id : idPrefix + 'parameterType-text',
    label : translate('Value'),
    modelProperty: 'value',
    get: function(element, node) {
      return {
        value: (getSelected(element, node) || {}).value
      };
    },

    set: function(element, values, node) {
      var param = getSelected(element, node);
      values.value = values.value || undefined;
      return cmdHelper.updateBusinessObject(element, param, values);
    },

    show: function(element, node) {
      var bo = getSelected(element, node);
      return bo && !bo.definition;
    }

  }));


  // parameter value (type = script) ///////////////////////////////////////////////////////
  var script = scriptImplementation('scriptFormat', 'value', true, translate);
  entries.push({
    id: idPrefix + 'parameterType-script',
    html: '<div data-show="isScript">' +
            script.template +
          '</div>',
    get: function(element, node) {
      var bo = getSelected(element, node);
      return bo && isScript(bo.definition) ? script.get(element, bo.definition) : {};
    },

    set: function(element, values, node) {
      var bo = getSelected(element, node);
      var update = script.set(element, values);
      return cmdHelper.updateBusinessObject(element, bo.definition, update);
    },

    validate: function(element, values, node) {
      var bo = getSelected(element, node);
      return bo && isScript(bo.definition) ? script.validate(element, bo.definition) : {};
    },

    isScript: function(element, node) {
      var bo = getSelected(element, node);
      return bo && isScript(bo.definition);
    },

    script: script

  });


  // parameter value (type = list) ///////////////////////////////////////////////////////

  entries.push(entryFactory.table({
    id: idPrefix + 'parameterType-list',
    modelProperties: [ 'value' ],
    labels: [ translate('Value') ],
    addLabel: translate('Add Value'),

    getElements: function(element, node) {
      var bo = getSelected(element, node);

      if (bo && isList(bo.definition)) {
        return bo.definition.items;
      }

      return [];
    },

    updateElement: function(element, values, node, idx) {
      var bo = getSelected(element, node);
      var item = bo.definition.items[idx];
      return cmdHelper.updateBusinessObject(element, item, values);
    },

    addElement: function(element, node) {
      var bo = getSelected(element, node);
      var newValue = createElement('camunda:Value', bo.definition, bpmnFactory, { value: undefined });
      return cmdHelper.addElementsTolist(element, bo.definition, 'items', [ newValue ]);
    },

    removeElement: function(element, node, idx) {
      var bo = getSelected(element, node);
      return cmdHelper.removeElementsFromList(element, bo.definition, 'items', null, [ bo.definition.items[idx] ]);
    },

    editable: function(element, node, prop, idx) {
      var bo = getSelected(element, node);
      var item = bo.definition.items[idx];
      return !isMap(item) && !isList(item) && !isScript(item);
    },

    setControlValue: function(element, node, input, prop, value, idx) {
      var bo = getSelected(element, node);
      var item = bo.definition.items[idx];

      if (!isMap(item) && !isList(item) && !isScript(item)) {
        input.value = value;
      } else {
        input.value = typeInfo[item.$type].label;
      }
    },

    show: function(element, node) {
      var bo = getSelected(element, node);
      return bo && bo.definition && isList(bo.definition);
    }

  }));


  // parameter value (type = map) ///////////////////////////////////////////////////////

  entries.push(entryFactory.table({
    id: idPrefix + 'parameterType-map',
    modelProperties: [ 'key', 'value' ],
    labels: [ translate('Key'), translate('Value') ],
    addLabel: translate('Add Entry'),

    getElements: function(element, node) {
      var bo = getSelected(element, node);

      if (bo && isMap(bo.definition)) {
        return bo.definition.entries;
      }

      return [];
    },

    updateElement: function(element, values, node, idx) {
      var bo = getSelected(element, node);
      var entry = bo.definition.entries[idx];

      if (isMap(entry.definition) || isList(entry.definition) || isScript(entry.definition)) {
        values = {
          key: values.key
        };
      }

      return cmdHelper.updateBusinessObject(element, entry, values);
    },

    addElement: function(element, node) {
      var bo = getSelected(element, node);
      var newEntry = createElement('camunda:Entry', bo.definition, bpmnFactory, { key: undefined, value: undefined });
      return cmdHelper.addElementsTolist(element, bo.definition, 'entries', [ newEntry ]);
    },

    removeElement: function(element, node, idx) {
      var bo = getSelected(element, node);
      return cmdHelper.removeElementsFromList(element, bo.definition, 'entries', null, [ bo.definition.entries[idx] ]);
    },

    editable: function(element, node, prop, idx) {
      var bo = getSelected(element, node);
      var entry = bo.definition.entries[idx];
      return prop === 'key' || (!isMap(entry.definition) && !isList(entry.definition) && !isScript(entry.definition));
    },

    setControlValue: function(element, node, input, prop, value, idx) {
      var bo = getSelected(element, node);
      var entry = bo.definition.entries[idx];

      if (prop === 'key' || (!isMap(entry.definition) && !isList(entry.definition) && !isScript(entry.definition))) {
        input.value = value;
      } else {
        input.value = typeInfo[entry.definition.$type].label;
      }
    },

    show: function(element, node) {
      var bo = getSelected(element, node);
      return bo && bo.definition && isMap(bo.definition);
    }

  }));

  return entries;

};
