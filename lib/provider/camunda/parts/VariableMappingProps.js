'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
    isAny = require('bpmn-js/lib/features/modeling/util/ModelingUtil').isAny,
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var filter = require('lodash/filter');

var extensionElementsHelper = require('../../../helper/ExtensionElementsHelper'),
    cmdHelper = require('../../../helper/CmdHelper'),
    elementHelper = require('../../../helper/ElementHelper'),
    eventDefinitionHelper = require('../../../helper/EventDefinitionHelper');

var extensionElementsEntry = require('./implementation/ExtensionElements');

var entryFactory = require('../../../factory/EntryFactory');

/**
  * return depend on parameter 'type' camunda:in or camunda:out extension elements
  */
function getCamundaInOutMappings(element, type) {
  var bo = getBusinessObject(element);

  var signalEventDefinition = eventDefinitionHelper.getSignalEventDefinition(bo);

  return extensionElementsHelper.getExtensionElements(signalEventDefinition || bo, type) || [];
}

/**
  * return depend on parameter 'type' camunda:in or camunda:out extension elements
  * with source or sourceExpression attribute
  */
function getVariableMappings(element, type) {
  var camundaMappings = getCamundaInOutMappings(element, type);

  return filter(camundaMappings, function(mapping) {
    return !mapping.businessKey;
  });
}

function getInOutType(mapping) {
  var inOutType = 'source';

  if (mapping.variables === 'all') {
    inOutType = 'variables';
  }
  else if (typeof mapping.source !== 'undefined') {
    inOutType = 'source';
  }
  else if (typeof mapping.sourceExpression !== 'undefined') {
    inOutType = 'sourceExpression';
  }

  return inOutType;
}

var CAMUNDA_IN_EXTENSION_ELEMENT = 'camunda:In',
    CAMUNDA_OUT_EXTENSION_ELEMENT = 'camunda:Out';

var WHITESPACE_REGEX = /\s/;


module.exports = function(group, element, bpmnFactory, translate) {

  var inOutTypeOptions = [
    {
      name: translate('Source'),
      value: 'source'
    },
    {
      name: translate('Source Expression'),
      value: 'sourceExpression'
    },
    {
      name: translate('All'),
      value: 'variables'
    }
  ];

  var signalEventDefinition = eventDefinitionHelper.getSignalEventDefinition(element);

  if (!is(element, 'camunda:CallActivity') && !signalEventDefinition) {
    return;
  }

  if (signalEventDefinition && !(isAny(element, [
    'bpmn:IntermediateThrowEvent',
    'bpmn:EndEvent'
  ]))) {
    return;
  }

  var isSelected = function(element, node) {
    return !!getSelected(element, node);
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
      var variableMappings = getVariableMappings(element, type);
      var mappingValue = variableMappings[idx];
      var label = (mappingValue.target || '<undefined>') + ' := ';
      var mappingType = getInOutType(mappingValue);

      if (mappingType === 'variables') {
        label = 'all';
      }
      else if (mappingType === 'source') {
        label = label + (mappingValue.source || '<empty>');
      }
      else if (mappingType === 'sourceExpression') {
        label = label + (mappingValue.sourceExpression || '<empty>');
      } else {
        label = label + '<empty>';
      }

      option.text = label;
    };
  };

  var newElement = function(type) {
    return function(element, extensionElements, value) {
      var newElem = elementHelper.createElement(type, { source: '' }, extensionElements, bpmnFactory);

      return cmdHelper.addElementsTolist(element, extensionElements, 'values', [ newElem ]);
    };
  };

  var removeElement = function(type) {
    return function(element, extensionElements, value, idx) {
      var variablesMappings= getVariableMappings(element, type);
      var mapping = variablesMappings[idx];

      if (mapping) {
        return extensionElementsHelper
          .removeEntry(signalEventDefinition || getBusinessObject(element), element, mapping);
      }
    };
  };

  // in mapping for source and sourceExpression ///////////////////////////////////////////////////////////////

  var inEntry = extensionElementsEntry(element, bpmnFactory, {
    id: 'variableMapping-in',
    label: translate('In Mapping'),
    modelProperty: 'source',
    prefix: 'In',
    idGeneration: false,
    resizable: true,
    businessObject: signalEventDefinition || getBusinessObject(element),

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

  if (!signalEventDefinition) {
    var outEntry = extensionElementsEntry(element, bpmnFactory, {
      id: 'variableMapping-out',
      label: translate('Out Mapping'),
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
  }

  // label for selected mapping ///////////////////////////////////////////////////////

  group.entries.push(entryFactory.label({
    id: 'variableMapping-typeLabel',
    get: function(element, node) {
      var mapping = getSelected(element, node);

      var value = '';
      if (is(mapping, CAMUNDA_IN_EXTENSION_ELEMENT)) {
        value = translate('In Mapping');
      }
      else if (is(mapping, CAMUNDA_OUT_EXTENSION_ELEMENT)) {
        value = translate('Out Mapping');
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
    id: 'variableMapping-inOutType',
    label: translate('Type'),
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
        props.target = undefined;
      }

      var mapping = getSelected(element, node);
      return cmdHelper.updateBusinessObject(element, mapping, props);
    },
    hidden: function(element, node) {
      return !isSelected(element, node);
    }

  }));


  group.entries.push(entryFactory.textField({
    id: 'variableMapping-source',
    dataValueLabel: 'sourceLabel',
    modelProperty: 'source',
    get: function(element, node) {
      var mapping = getSelected(element, node) || {};

      var label = '';
      var inOutType = getInOutType(mapping);
      if (inOutType === 'source') {
        label = translate('Source');
      }
      else if (inOutType === 'sourceExpression') {
        label = translate('Source Expression');
      }

      return {
        source: mapping[inOutType],
        sourceLabel: label
      };
    },
    set: function(element, values, node) {
      values.source = values.source || undefined;

      var mapping = getSelected(element, node);
      var inOutType = getInOutType(mapping);

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
          validation.source =
          validation.source = values.sourceLabel ?
            translate('Mapping must have a {value}', { value: values.sourceLabel.toLowerCase() }) :
            translate('Mapping must have a value');
        }

        var inOutType = getInOutType(mapping);

        if (WHITESPACE_REGEX.test(values.source) && inOutType !== 'sourceExpression') {
          validation.source = translate('{label} must not contain whitespace', { label: values.sourceLabel });
        }
      }

      return validation;
    },
    hidden: function(element, node) {
      var selectedMapping = getSelected(element, node);
      return !selectedMapping || (selectedMapping && selectedMapping.variables);
    }
  }));


  group.entries.push(entryFactory.textField({
    id: 'variableMapping-target',
    label: translate('Target'),
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
        var mappingType = getInOutType(mapping);

        if (!values.target && mappingType !== 'variables') {
          validation.target = translate('Mapping must have a target');
        }

        if (values.target
          && WHITESPACE_REGEX.test(values.target)
          && mappingType !== 'variables') {
          validation.target = translate('Target must not contain whitespace');
        }
      }

      return validation;
    },
    hidden: function(element, node) {
      var selectedMapping = getSelected(element, node);
      return !selectedMapping || (selectedMapping && selectedMapping.variables);
    }
  }));


  group.entries.push(entryFactory.checkbox({
    id: 'variableMapping-local',
    label: translate('Local'),
    modelProperty: 'local',
    get: function(element, node) {
      return {
        local: (getSelected(element, node) || {}).local
      };
    },
    set: function(element, values, node) {
      values.local = values.local || false;
      var mapping = getSelected(element, node);
      return cmdHelper.updateBusinessObject(element, mapping, values);
    },
    hidden: function(element, node) {
      return !isSelected(element, node);
    }
  }));

};
