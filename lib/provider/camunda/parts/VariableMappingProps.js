'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var forEach = require('lodash/collection/forEach');

var extensionElementsHelper = require('../../../helper/ExtensionElementsHelper'),
    cmdHelper = require('../../../helper/CmdHelper'),
    elementHelper = require('../../../helper/ElementHelper');

var extensionElementsEntry = require('./implementation/ExtensionElements');

var entryFactory = require('../../../factory/EntryFactory');


var inOutTypeOptions = [
  {
    name: 'Source',
    value: 'source'
  },
  {
    name: 'Source Expression',
    value: 'sourceExpression'
  },
  {
    name: 'All',
    value: 'variables'
  }
];

/**
  * return depend on parameter 'type' camunda:in or camunda:out extension elements
  */
function getCamundaInOutMappings(element, type) {
  var bo = getBusinessObject(element);
  return extensionElementsHelper.getExtensionElements(bo, type) || [];
}

/**
  * return depend on parameter 'type' camunda:in or camunda:out extension elements
  * with source or sourceExpression attribute
  */
function getVariableMappings(element, type) {
  var variablesMappings = [];

  var camundaMappings = getCamundaInOutMappings(element, type);
  forEach(camundaMappings, function(mapping) {
    if (!mapping.businessKey) {
      variablesMappings.push(mapping);
    }
  });

  return variablesMappings;
}

function getInOutType(mapping) {
  var inOutType = 'source';
  if (typeof mapping.source !== 'undefined') {
    inOutType = 'source';
  }
  else if (typeof mapping.sourceExpression !== 'undefined') {
    inOutType = 'sourceExpression';
  }
  else if (mapping.variables === 'all') {
    inOutType = 'variables';
  }

  return inOutType;
}

var CAMUNDA_IN_EXTENSION_ELEMENT = 'camunda:In',
    CAMUNDA_OUT_EXTENSION_ELEMENT = 'camunda:Out';


module.exports = function(group, element, bpmnFactory) {
  var bo = getBusinessObject(element);

  if (!is(bo, 'camunda:CallActivity')) {
    return;
  }

  var isSelected = function(element, node) {
    return getSelected(element, node);
  };

  var getSelected = function(element, node) {
    var parentNode = node.parentNode;
    var selection = inEntry.getSelected(element, parentNode);

    var parameter = getVariableMappings(element, CAMUNDA_IN_EXTENSION_ELEMENT)[selection.idx];
    if (!parameter && outEntry) {
      selection = outEntry.getSelected(element, parentNode);
      parameter = getVariableMappings(element, CAMUNDA_OUT_EXTENSION_ELEMENT)[selection.idx];
    }
    return parameter;
  };  

  var setOptionLabelValue = function(type) {
    return function(element, node, option, property, value, idx) {
      var label = idx + ' : ';

      var variableMappings = getVariableMappings(element, type);
      var mappingValue = variableMappings[idx];
      if (mappingValue.source) {
        label = label + mappingValue.source;
      }
      else if (mappingValue.sourceExpression) {
        label = label + mappingValue.sourceExpression;
      }
      else if (mappingValue.variables) {
        label = label + 'all';
      }
      else {
        label = label + '<empty>';
      }

      option.text = label;
    };
  };

  var newElement = function(type) {
    return function(element, extensionElements, value) {
      var commands = [];

      var newElem = elementHelper.createElement(type, { source : value || ''}, extensionElements, bpmnFactory);
      commands.push(cmdHelper.addElementsTolist(element, extensionElements, 'values', [ newElem ]));

      return commands;
    };
  };

  var removeElement = function(type) {
    return function(element, extensionElements, value, idx) {
      var variablesMappings= getVariableMappings(element, type);
      var mapping = variablesMappings[idx];

      var commands = [];
      if (mapping) {
        commands.push(cmdHelper.removeElementsFromList(
          element,
          extensionElements,
          'values',
          'extensionElements',
          [ mapping ]
        ));
      }

      return commands;
    };
  };

  // in mapping for source and sourceExpression ///////////////////////////////////////////////////////////////

  var inEntry = extensionElementsEntry(element, bpmnFactory, {
    id: 'in-mapping',
    label: 'In Mapping',
    modelProperty: 'source',
    prefix: 'In',
    idGeneration: false,
    resizable: true,

    createExtensionElement: newElement(CAMUNDA_IN_EXTENSION_ELEMENT),
    removeExtensionElement: removeElement(CAMUNDA_IN_EXTENSION_ELEMENT),

    getExtensionElements: function(element) {
      return getVariableMappings(element, CAMUNDA_IN_EXTENSION_ELEMENT);
    },

    onSelectionChange: function(element, node, event, scope) {
      outEntry && outEntry.deselect(element, node.parentNode);
    },

    setOptionLabelValue: setOptionLabelValue(CAMUNDA_IN_EXTENSION_ELEMENT)
  });
  group.entries.push(inEntry);

  // out mapping for source and sourceExpression ///////////////////////////////////////////////////////

  var outEntry = extensionElementsEntry(element, bpmnFactory, {
    id: 'out-mapping',
    label: 'Out Mapping',
    modelProperty: 'source',
    prefix: 'Out',
    idGeneration: false,
    resizable: true,

    createExtensionElement: newElement(CAMUNDA_OUT_EXTENSION_ELEMENT),
    removeExtensionElement: removeElement(CAMUNDA_OUT_EXTENSION_ELEMENT),

    getExtensionElements: function(element) {
      return getVariableMappings(element, CAMUNDA_OUT_EXTENSION_ELEMENT);
    },

    onSelectionChange: function(element, node, event, scope) {
      inEntry.deselect(element, node.parentNode);
    },

    setOptionLabelValue: setOptionLabelValue(CAMUNDA_OUT_EXTENSION_ELEMENT)
  });
  group.entries.push(outEntry);

  // label for selected mapping ///////////////////////////////////////////////////////

  group.entries.push(entryFactory.label({
    id: 'mapping-type-label',
    get: function (element, node) {
      var mapping = getSelected(element, node);

      var value = '';
      if (is(mapping, CAMUNDA_IN_EXTENSION_ELEMENT)) {
        value = 'In Mapping';
      }
      else if (is(mapping, CAMUNDA_OUT_EXTENSION_ELEMENT)) {
        value = 'Out Mapping';
      }

      return {
        label: value
      };
    },

    showLabel: function(element, node) {
      return isSelected(element, node);
    }
  }));


  group.entries.push(entryFactory.selectBox({
    id: 'in-out-type',
    label: 'Type',
    selectOptions: inOutTypeOptions,
    modelProperty: 'inOutType',
    get: function(element, node) {
      var mapping = getSelected(element, node) || {};
      return {
        inOutType: getInOutType(mapping)
      };
    },
    set: function(element, values, node) {
      var inOutType = values.inOutType;

      var props = {
        'source' : undefined,
        'sourceExpression' : undefined,
        'variables' : undefined
      };

      if (inOutType === 'source') {
        props.source = '';
      }
      else if (inOutType === 'sourceExpression') {
        props.sourceExpression = '';
      }
      else if (inOutType === 'variables') {
        props.variables = 'all';
      }

      var mapping = getSelected(element, node);
      return cmdHelper.updateBusinessObject(element, mapping, props);
    },
    disabled: function(element, node) {
      return !isSelected(element, node);
    }
    
  }));


  group.entries.push(entryFactory.textField({
    id: 'source',
    dataValueLabel: 'sourceLabel',
    modelProperty: 'source',
    get: function(element, node) {
      var mapping = getSelected(element, node) || {};

      var label = '';
      var inOutType = getInOutType(mapping);
      if (inOutType === 'source') {
        label = 'Source';
      }
      else if (inOutType === 'sourceExpression') {
        label = 'Source Expression';
      }

      return {
        source: mapping[inOutType],
        sourceLabel: label
      };
    },
    set: function(element, values, node) {
      values.source = values.source || undefined;

      var mapping = getSelected(element, node);
      var inOutType = getInOutType(mapping).toString();

      var props = {};
      props[inOutType] = values.source || '';

      return cmdHelper.updateBusinessObject(element, mapping, props);
    },
    // one of both (source or sourceExpression) must have a value to make
    // the configuration easier and more understandable
    // it is not engine conform
    validate: function(element, values, node) {
      var mapping = getSelected(element, node);

      var validation = {};
      if (mapping) {
        if (!values.source) {
          validation.source = 'Mapping must have a ' + values.sourceLabel.toLowerCase().trim() || 'value';
        }
      }

      return validation;
    },
    disabled: function(element, node) {
      var selectedMapping = isSelected(element, node);
      return !selectedMapping || (selectedMapping && selectedMapping.variables);
    }
  }));


  group.entries.push(entryFactory.textField({
    id: 'target',
    label: 'Target',
    modelProperty: 'target',
    get: function(element, node) {
      return {
        target: (getSelected(element, node) || {}).target
      };
    },
    set: function(element, values, node) {
      values.target = values.target || undefined;
      var mapping = getSelected(element, node);
      return cmdHelper.updateBusinessObject(element, mapping, values);
    },
    validate: function(element, values, node) {
      var mapping = getSelected(element, node);

      var validation = {};
      if (mapping) {
        if (!values.target && (mapping.source || mapping.sourceExpression)) {
          validation.target = 'Mapping must have a target';
        }
      }

      return validation;
    },
    disabled: function(element, node) {
      var selectedMapping = isSelected(element, node);
      return !selectedMapping || (selectedMapping && selectedMapping.variables);
    }
  }));

};
