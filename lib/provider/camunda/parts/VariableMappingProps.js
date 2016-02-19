'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var forEach = require('lodash/collection/forEach'),
    filter = require('lodash/collection/filter');

var extensionElementsHelper = require('../../../helper/ExtensionElementsHelper'),
    cmdHelper = require('../../../helper/CmdHelper'),
    elementHelper = require('../../../helper/ElementHelper');

var extensionElementsEntry = require('./implementation/ExtensionElements');

var entryFactory = require('../../../factory/EntryFactory');


/**
  * return depend on parameter 'type' camunda:in or camunda:out extension elements
  */
function getCamundaInOutMappings(element, type) {
  var bo = getBusinessObject(element);
  return extensionElementsHelper.getExtensionElements(bo, type) || [];
}

/**
  * return depend on parameter 'type' camunda:in or camunda:out extension elements
  * with attribute 'variables=all'
  */
function getAllVariablesMapping(element, type) {
  var camundaMappings = getCamundaInOutMappings(element, type);
  var allVariables = filter(camundaMappings, function(mapping) {
    return (mapping.variables && mapping.variables === 'all');
  });

  return allVariables;
}

/**
  * return depend on parameter 'type' camunda:in or camunda:out extension elements
  * with source or sourceExpression attribute
  */
function getSourceMappings(element, type) {
  var sourceMappings = [];

  var camundaMappings = getCamundaInOutMappings(element, type);
  forEach(camundaMappings, function(mapping) {
    if (!mapping.businessKey && !mapping.variables) {
      sourceMappings.push(mapping);
    }
  });

  return sourceMappings;
}

function getSourceType(mapping) {
  var sourceType = 'source';
  if (typeof mapping.source !== 'undefined') {
    sourceType = 'source';
  } else

  if (typeof mapping.sourceExpression !== 'undefined') {
    sourceType = 'sourceExpression';
  }

  return sourceType;
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

    var parameter = getSourceMappings(element, CAMUNDA_IN_EXTENSION_ELEMENT)[selection.idx];
    if (!parameter && outEntry) {
      selection = outEntry.getSelected(element, parentNode);
      parameter = getSourceMappings(element, CAMUNDA_OUT_EXTENSION_ELEMENT)[selection.idx];
    }
    return parameter;
  };  

  var setOptionLabelValue = function(type) {
    return function(element, node, option, property, value, idx) {
      var label;

      var variableMappings = getSourceMappings(element, type);
      var mappingValue = variableMappings[idx];
      if (mappingValue.source) {
        label = idx + ' : ' +  mappingValue.source;
      } else if (mappingValue.sourceExpression) {
        label = idx + ' : ' + mappingValue.sourceExpression;
      } else {
        label = idx + ' : <empty>';
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
      var sourceMappings= getSourceMappings(element, type);
      var mapping = sourceMappings[idx];

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

  function setAllVariables(element, bpmnFactory, type) {
    var bo = getBusinessObject(element);
    var commands = [];

    var extensionElements = bo.extensionElements;
    if (!extensionElements) {
      extensionElements = elementHelper.createElement('bpmn:ExtensionElements', { values: [] }, bo, bpmnFactory);
      commands.push(cmdHelper.updateProperties(element, { extensionElements: extensionElements }));
    }

    var allVariablesMapping = elementHelper.createElement(
      type,
      { variables: 'all' },
      extensionElements,
      bpmnFactory
    );

    commands.push(cmdHelper.addAndRemoveElementsFromList(
      element,
      extensionElements,
      'values',
      'extensionElements',
      [ allVariablesMapping ],
      []
    ));

    return commands;
  }

  function deleteAllVariables(element, type) {
    var allVariablesMapping = getAllVariablesMapping(element, type);

    var commands = [];
    forEach(allVariablesMapping, function(mapping) {
      commands.push(extensionElementsHelper.removeEntry(getBusinessObject(element), element, mapping));
    });
    return commands;
  }  


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
      return getSourceMappings(element, CAMUNDA_IN_EXTENSION_ELEMENT);
    },

    onSelectionChange: function(element, node, event, scope) {
      outEntry && outEntry.deselect(element, node.parentNode);
    },

    setOptionLabelValue: setOptionLabelValue(CAMUNDA_IN_EXTENSION_ELEMENT)
  });
  group.entries.push(inEntry);

  // in mapping for variables='all'

  group.entries.push(entryFactory.checkbox({
    id: 'in-mapping-variables',
    label: 'All Variables',
    modelProperty: 'variables',
    get: function(element, node) {
      var allVariablesMapping = getAllVariablesMapping(element, CAMUNDA_IN_EXTENSION_ELEMENT);
      return {
        variables: (allVariablesMapping && allVariablesMapping.length > 0)
      };
    },
    set: function(element, values, node) {
      if (values.variables) {
        return setAllVariables(element, bpmnFactory, CAMUNDA_IN_EXTENSION_ELEMENT);
      } else {
        return deleteAllVariables(element, CAMUNDA_IN_EXTENSION_ELEMENT);
      }
    }
  }));


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
      return getSourceMappings(element, CAMUNDA_OUT_EXTENSION_ELEMENT);
    },

    onSelectionChange: function(element, node, event, scope) {
      inEntry.deselect(element, node.parentNode);
    },

    setOptionLabelValue: setOptionLabelValue(CAMUNDA_OUT_EXTENSION_ELEMENT)
  });
  group.entries.push(outEntry);

  // out mapping for variables='all'

  group.entries.push(entryFactory.checkbox({
    id: 'out-mapping-variables',
    label: 'All Variables',
    modelProperty: 'variables',
    get: function(element, node) {
      var allVariablesMapping = getAllVariablesMapping(element, CAMUNDA_OUT_EXTENSION_ELEMENT);
      return {
        variables: (allVariablesMapping && allVariablesMapping.length > 0)
      };
    },
    set: function(element, values, node) {
      if (values.variables) {
        return setAllVariables(element, bpmnFactory, CAMUNDA_OUT_EXTENSION_ELEMENT);
      } else {
        return deleteAllVariables(element, CAMUNDA_OUT_EXTENSION_ELEMENT);
      }
    }
  }));


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
    id: 'source-type',
    label: 'Source Type',
    selectOptions: [ { name: 'Source', value: 'source' }, { name: 'SourceExpression', value: 'sourceExpression' } ],
    modelProperty: 'sourceType',
    get: function(element, node) {
      var mapping = getSelected(element, node) || {};
      return {
        sourceType: getSourceType(mapping)
      };
    },
    set: function(element, values, node) {
      var sourceType = values.sourceType;

      var props = {
        'source' : undefined,
        'sourceExpression' : undefined
      };

      if (sourceType === 'source') {
        props.source = '';
      }
      else if (sourceType === 'sourceExpression') {
        props.sourceExpression = '';
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
    dataValueLabel: 'sourceTypeLabel',
    modelProperty: 'source',
    get: function(element, node) {
      var mapping = getSelected(element, node) || {};

      var label = '';
      var sourceType = getSourceType(mapping);
      if (sourceType === 'source') {
        label = 'Source';
      }
      else if (sourceType === 'sourceExpression') {
        label = 'Source Expression';
      }

      return {
        source: mapping[sourceType],
        sourceTypeLabel: label
      };
    },
    set: function(element, values, node) {
      values.source = values.source || undefined;

      var mapping = getSelected(element, node);
      var sourceType = getSourceType(mapping).toString();

      var props = {};
      props[sourceType] = values.source || '';

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
          validation.source = 'Mapping must have a ' + values.sourceTypeLabel.toLowerCase().trim() || 'value';
        }
      }

      return validation;
    },
    disabled: function(element, node) {
      return !isSelected(element, node);
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
      return !isSelected(element, node);
    }
  }));

};
