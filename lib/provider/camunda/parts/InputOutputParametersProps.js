'use strict';

var ModelUtil = require('bpmn-js/lib/util/ModelUtil'),
    is = ModelUtil.is,
    getBusinessObject = ModelUtil.getBusinessObject;

var find = require('lodash/collection/find');

var elementHelper = require('../../../helper/ElementHelper'),
    extensionElementsHelper = require('../../../helper/ExtensionElementsHelper'),
    cmdHelper = require('../../../helper/CmdHelper'),
    utils = require('../../../Utils');

var extensionElementsEntry = require('./implementation/ExtensionElements'),
    entryFactory = require('../../../factory/EntryFactory'),
    script = require('./implementation/Script')('scriptFormat', 'value', true);


function getElements(bo, type, prop) {
  var elems = extensionElementsHelper.getExtensionElements(bo, type) || [];
  return !prop ? elems : (elems[0] || {})[prop] || [];
}

function createElement(type, properties, parent, factory) {
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

module.exports = function(group, element, bpmnFactory) {

  var createInputOutput = function(parent, properties) {
    return createElement('camunda:InputOutput', properties, parent, bpmnFactory);
  };

  var createParameter = function(type, parent, properties) {
    return createElement(type, properties, parent, bpmnFactory);
  };

  var getInputParameters = function(bo) {
    return getElements(bo, 'camunda:InputOutput', 'inputParameters');
  };

  var getOutputParameters = function(bo) {
    return getElements(bo, 'camunda:InputOutput', 'outputParameters');
  };

  var isSelected = function(element, node) {
    return getSelection(element, node);
  };

  var getSelection = function(element, node) {
    var parentNode = node.parentNode;
    var selection = inputEntry.getSelection(element, parentNode);

    var bo = getBusinessObject(element);

    var matcher = function(selection) {
      return function(elem) {
        return elem.name === selection.value;
      };
    };

    if (selection.value) {
      return find(getInputParameters(bo), matcher(selection));
    }
    else {
      selection = outputEntry.getSelection(element, parentNode);
      return find(getOutputParameters(bo), matcher(selection));
    }

  };

  var newElement = function(type, prop) {

    return function(element, extensionElements, value) {
      var bo = getBusinessObject(element);

      var result = {};

      var inputOutput = (getElements(bo, 'camunda:InputOutput') || [])[0];
      if (!inputOutput) {
        inputOutput = createInputOutput(extensionElements, { inputParameters: [] });
        extensionElements.values.push(inputOutput);
        result.cmd =cmdHelper.addAndRemoveElementsFromList(
          element,
          extensionElements,
          'values',
          'extensionElements',
          [ inputOutput ],
          []
        );
      }

      var newElem = result.newElement = createParameter(type, inputOutput, { name: value });

      if (result.cmd) {
        inputOutput.get(prop).push(newElem);
      }
      else {
        result.cmd = cmdHelper.addAndRemoveElementsFromList(element, inputOutput, prop, null, [ newElem ], []);
      }

      return result;
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

    getExtensionElements: function(bo) {
      return getInputParameters(bo);
    },

    selectionChanged: function(element, node, event, scope) {
      outputEntry.deselect(element, node.parentNode);
    }
  });
  group.entries.push(inputEntry);


  // output parameters ///////////////////////////////////////////////////////

  var outputEntry = extensionElementsEntry(element, bpmnFactory, {
    id: 'outputs',
    label: 'Output Parameters',
    modelProperty: 'name',
    prefix: 'Output',
    resizable: true,

    createExtensionElement: newElement('camunda:OutputParameter', 'outputParameters'),

    getExtensionElements: function(bo) {
      return getOutputParameters(bo);
    },

    selectionChanged: function(element, node, event, scope) {
      inputEntry.deselect(element, node.parentNode);
    }
  });
  group.entries.push(outputEntry);


  // parameter name ////////////////////////////////////////////////////////

  group.entries.push(entryFactory.textField({
    id : 'parameter-name',
    label : 'Name',
    modelProperty: 'name',
    get: function(element, node) {
      var name = this.__lastInvalidName;

      delete this.__lastInvalidName;

      return {
        name: typeof name !== 'undefined' ? name : (getSelection(element, node) || {}).name
      };
    },

    set: function(element, values, node) {
      var validationErrors = this.validate(element, values, node),
          name = values.name;

      // make sure we do not update the name
      if (validationErrors.name) {
        this.__lastInvalidName = name;
        return {};
      } else {
        var param = getSelection(element, node);
        return cmdHelper.updateBusinessObject(element, param, values);
      }

    },

    validate: function(element, values, node) {
      var bo = getSelection(element, node);

      var validation = {};
      if (bo) {
        var nameValue = values.name || this.__lastInvalidName;

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
    html: '<div class="pp-row" data-show="isDisabled">' +
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
      var bo = getSelection(element, node);

      var parameterType = 'text';

      if (typeof bo !== 'undefined') {
        var definition = bo.get('definition') || {};
        if (isScript(definition)) {
          parameterType = 'script';
        }
        else if (isList(definition)) {
          parameterType = 'list';
        }
        else if (isMap(definition)) {
          parameterType = 'map';
        }
      }

      return {
        parameterType: parameterType
      };
    },

    set: function(element, values, node) {
      var bo = getSelection(element, node);

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

    isDisabled: function(element, node) {
      return isSelected(element, node);
    }
  });


  // parameter value (type = text) ///////////////////////////////////////////////////////

  group.entries.push(entryFactory.textArea({
    id : 'parameter-value',
    label : 'Value',
    modelProperty: 'value',
    get: function(element, node) {
      return {
        value: (getSelection(element, node) || {}).value
      };
    },

    set: function(element, values, node) {
      var param = getSelection(element, node);
      values.value = values.value || undefined;
      return cmdHelper.updateBusinessObject(element, param, values);
    },

    show: function(element, node) {
      var bo = getSelection(element, node);
      return bo && !bo.definition;
    }
  }));


  // parameter value (type = script) ///////////////////////////////////////////////////////

  group.entries.push({

    id: 'parameter-script',
    html: '<div data-show="isScript">' +
            script.template +
          '</div>',
    get: function(element, node) {
      var bo = getSelection(element, node);
      return bo && bo.definition ? script.get(element, bo.definition) : {};
    },

    set: function(element, values, node) {
      var bo = getSelection(element, node);
      var update = script.set(element, values);
      return cmdHelper.updateBusinessObject(element, bo.definition, update);
    },

    validate: function(element, values, node) {
      var bo = getSelection(element, node);
      return bo && bo.definition && isScript(bo.definition) ? script.validate(element, bo.definition) : {};
    },

    isScript: function(element, node) {
      var bo = getSelection(element, node);
      return bo && isScript(bo.definition);
    },

    script: script

  });


  // parameter value (type = list) ///////////////////////////////////////////////////////

  group.entries.push({

    id: 'parameter-list',
    html: '<div data-show="isList">' +
            'Lists are not implemented yet!' +
          '</div>',
    get: function(element, node) {
      // var bo = inputEntry.selection(element, node.parentNode);
      // return bo && bo.definition ? script.get(element, bo.definition) : {};
      return {};
    },

    set: function(element, values, node) {
      // var bo = inputEntry.selection(element, node.parentNode);
      // return cmdHelper.updateBusinessObject(element, bo.definition, update);
      return {};
    },

    // validate: function(element, values, node) {
    //   var bo = inputEntry.selection(element, node.parentNode);
    //   return bo && bo.definition && isScript(bo.definition) ? script.validate(element, bo.definition) : {};
    // },

    isList: function(element, node) {
      var bo = getSelection(element, node);
      return bo && isList(bo.definition);
    }

  });


  // parameter value (type = map) ///////////////////////////////////////////////////////

  group.entries.push({

    id: 'parameter-map',
    html: '<div data-show="isMap">' +
            'Maps are not implemented yet!' +
          '</div>',
    get: function(element, node) {
      // var bo = inputEntry.selection(element, node.parentNode);
      // return bo && bo.definition ? script.get(element, bo.definition) : {};
      return {};
    },

    set: function(element, values, node) {
      // var bo = inputEntry.selection(element, node.parentNode);
      // return cmdHelper.updateBusinessObject(element, bo.definition, update);
      return {};
    },

    // validate: function(element, values, node) {
    //   var bo = inputEntry.selection(element, node.parentNode);
    //   return bo && bo.definition && isScript(bo.definition) ? script.validate(element, bo.definition) : {};
    // },

    isMap: function(element, node) {
      var bo = getSelection(element, node);
      return bo && isMap(bo.definition);
    }

  });

};
