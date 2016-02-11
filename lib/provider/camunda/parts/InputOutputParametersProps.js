'use strict';

var ModelUtil = require('bpmn-js/lib/util/ModelUtil'),
    is = ModelUtil.is,
    getBusinessObject = ModelUtil.getBusinessObject;

var elementHelper = require('../../../helper/ElementHelper'),
    extensionElementsHelper = require('../../../helper/ExtensionElementsHelper'),
    cmdHelper = require('../../../helper/CmdHelper'),
    utils = require('../../../Utils');

var extensionElementsEntry = require('./implementation/ExtensionElements'),
    entryFactory = require('../../../factory/EntryFactory'),
    script = require('./implementation/Script')('scriptFormat', 'value', true);

function createElement(type, properties, parent, factory) {
  return elementHelper.createElement(type, properties, parent, factory);
}

function getElements(bo, type, prop) {
  var elems = extensionElementsHelper.getExtensionElements(bo, type) || [];
  return !prop ? elems : (elems[0] || {})[prop] || [];
}

function getInputOutput(element) {
  var bo = getBusinessObject(element);
  return (getElements(bo, 'camunda:InputOutput') || [])[0];
}

function getInputParameters(element) {
  return getParameters(element, 'inputParameters');
}

function getOutputParameters(element) {
  return getParameters(element, 'outputParameters');
}

function getParameters(element, prop) {
  var bo = getBusinessObject(element);
  return getElements(bo, 'camunda:InputOutput', prop);
}

function getItemAtIdx(items, idx) {
  return (items || [])[idx];
}

function createInputOutput(parent, properties, bpmnFactory) {
  return createElement('camunda:InputOutput', properties, parent, bpmnFactory);
}

function createParameter(type, parent, properties, bpmnFactory) {
  return createElement(type, properties, parent, bpmnFactory);
}

function isInputParameter(elem) {
  return is(elem, 'camunda:InputParameter');
}

function isOutputParameter(elem) {
  return is(elem, 'camunda:OutputParameter');
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

function ensureInputOutputSupported(element) {
  var bo = getBusinessObject(element);
  return is(bo, 'bpmn:FlowNode') &&
         !is(bo, 'bpmn:StartEvent') &&
         !is(bo, 'bpmn:BoundaryEvent') &&
         !(is(bo, 'bpmn:SubProcess') && bo.get('triggeredByEvent'));
}

function ensureOutparameterSupported(element) {
  var bo = getBusinessObject(element);
  return !is(bo, 'bpmn:EndEvent') && !bo.loopCharacteristics;
}

var typeInfo = {
  'camunda:Map': {
    value: 'map',
    label: 'Map'
  },
  'camunda:List': {
    value: 'list',
    label: 'List'
  },
  'camunda:Script': {
    value: 'script',
    label: 'Script'
  }
};

module.exports = function(group, element, bpmnFactory) {

  if (!ensureInputOutputSupported(element)) {
    return;
  }

  var isSelected = function(element, node) {
    return getSelected(element, node);
  };

  var getSelected = function(element, node) {
    var parentNode = node.parentNode;
    var selection = inputEntry.getSelected(element, parentNode);

    var parameter = getItemAtIdx(getInputParameters(element), selection.idx);
    if (!parameter && outputEntry) {
      selection = outputEntry.getSelected(element, parentNode);
      parameter = getItemAtIdx(getOutputParameters(element), selection.idx);
    }
    return parameter;
  };

  var newElement = function(type, prop) {

    return function(element, extensionElements, value) {
      var commands = [];

      var inputOutput = getInputOutput(element);
      if (!inputOutput) {
        inputOutput = createInputOutput(extensionElements, { inputParameters: [] }, bpmnFactory);
        commands.push(cmdHelper.addAndRemoveElementsFromList(
          element,
          extensionElements,
          'values',
          'extensionElements',
          [ inputOutput ],
          []
        ));
      }

      var newElem = createParameter(type, inputOutput, { name: value }, bpmnFactory);
      commands.push(cmdHelper.addElementsTolist(element, inputOutput, prop, [ newElem ]));

      return commands;
    };
  };

  var removeElement = function(getter, prop, otherProp) {
    return function(element, extensionElements, value, idx) {
      var inputOutput = getInputOutput(element);
      var parameter = getItemAtIdx(getter(element), idx);

      var commands = [];
      commands.push(cmdHelper.removeElementsFromList(element, inputOutput, prop, null, [ parameter ]));

      var firstLength = inputOutput.get(prop).length-1;
      var secondLength = (inputOutput.get(otherProp) || []).length;

      if (!firstLength && !secondLength) {
        commands.push(extensionElementsHelper.removeEntry(getBusinessObject(element), element, inputOutput));
      }

      return commands;
    };
  };

  var setLabelValue = function(getter) {
    return function(element, node, option, property, value, idx) {
      var parameter = getItemAtIdx(getter(element), idx);

      var suffix = 'Text';

      var definition = parameter.get('definition');
      if (typeof definition !== 'undefined') {
        var type = definition.$type;
        suffix = typeInfo[type].label;
      }

      option.text = (value || '') + ' : ' + suffix;
    };
  };

  // input parameters ///////////////////////////////////////////////////////////////

  var inputEntry = extensionElementsEntry(element, bpmnFactory, {
    id: 'inputs',
    label: 'Input Parameters',
    modelProperty: 'name',
    prefix: 'Input',
    resizable: true,

    createExtensionElement: newElement('camunda:InputParameter', 'inputParameters'),
    removeExtensionElement: removeElement(getInputParameters, 'inputParameters', 'outputParameters'),

    getExtensionElements: function(element) {
      return getInputParameters(element);
    },

    onSelectionChange: function(element, node, event, scope) {
      outputEntry && outputEntry.deselect(element, node.parentNode);
    },

    setLabelValue: setLabelValue(getInputParameters)

  });
  group.entries.push(inputEntry);


  // output parameters ///////////////////////////////////////////////////////

  if (ensureOutparameterSupported(element)) {
    var outputEntry = extensionElementsEntry(element, bpmnFactory, {
      id: 'outputs',
      label: 'Output Parameters',
      modelProperty: 'name',
      prefix: 'Output',
      resizable: true,

      createExtensionElement: newElement('camunda:OutputParameter', 'outputParameters'),
      removeExtensionElement: removeElement(getOutputParameters, 'outputParameters', 'inputParameters'),

      getExtensionElements: function(element) {
        return getOutputParameters(element);
      },

      onSelectionChange: function(element, node, event, scope) {
        inputEntry.deselect(element, node.parentNode);
      },

      setLabelValue: setLabelValue(getOutputParameters)

    });
    group.entries.push(outputEntry);
  }


  // parameter label ////////////////////////////////////////////////////////

  group.entries.push(entryFactory.label({
    id: 'parameter-type-label',
    get: function (element, node) {
      var param = getSelected(element, node);

      var value = '';
      if (isInputParameter(param)) {
        value = 'Input Parameter';
      }
      else if (isOutputParameter(param)) {
        value = 'Output Parameter';
      }

      return {
        label: value
      };
    },

    showLabel: function(element, node) {
      return isSelected(element, node);
    }
  }));


  // parameter name ////////////////////////////////////////////////////////

  group.entries.push(entryFactory.validationAwareTextField({
    id: 'parameter-name',
    label: 'Name',
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
          if(utils.containsSpace(nameValue)) {
            validation.name = 'Name must not contain spaces';
          }
        }
        else {
          validation.name = 'Parameter must have a name';
        }
      }

      return validation;
    },

    disabled: function(element, node) {
      return !isSelected(element, node);
    }
  }));


  // parameter type //////////////////////////////////////////////////////

  group.entries.push({
    id: 'parameter-type',
    html: '<div class="pp-row" data-show="show">' +
            '<label for="camunda-parameter-type">Type</label>' +
            '<div class="pp-field-wrapper">' +
              '<select id="camunda-parameter-type" name="parameterType" data-value>' +
                '<option value="text">Text</option>' +
                '<option value="script">Script</option>' +
                '<option value="list">List</option>' +
                '<option value="map">Map</option>' +
              '</select>' +
            '</div>' +
          '</div>',

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
        return createElement(type, null, bo, bpmnFactory);
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

  });


  // parameter value (type = text) ///////////////////////////////////////////////////////

  group.entries.push(entryFactory.textArea({
    id : 'parameter-type-text',
    label : 'Value',
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

  group.entries.push({

    id: 'parameter-type-script',
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

  group.entries.push(entryFactory.table({

    id: 'parameter-type-list',
    modelProperties: [ 'value' ],
    labels: [ 'Value' ],

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
      var newValue = createElement('camunda:Value', { value: undefined }, bo.definition, bpmnFactory);
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
      }
      else {
        input.value = typeInfo[item.$type].label;
      }
    },

    show: function(element, node) {
      var bo = getSelected(element, node);
      return bo && bo.definition && isList(bo.definition);
    }

  }));


  // parameter value (type = map) ///////////////////////////////////////////////////////

  group.entries.push(entryFactory.table({

    id: 'parameter-type-map',
    modelProperties: [ 'key', 'value' ],
    labels: [ 'Key', 'Value' ],
    addLabel: 'Add Entry',

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
      var newEntry = createElement('camunda:Entry', { key: undefined, value: undefined }, bo.definition, bpmnFactory);
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
      }
      else {
        input.value = typeInfo[entry.definition.$type].label;
      }
    },

    show: function(element, node) {
      var bo = getSelected(element, node);
      return bo && bo.definition && isMap(bo.definition);
    }

  }));

};
