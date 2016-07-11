'use strict';

var ImplementationTypeHelper = require('../../../helper/ImplementationTypeHelper'),
    extensionElementsHelper = require('../../../helper/ExtensionElementsHelper'),
    elementHelper = require('../../../helper/ElementHelper'),
    cmdHelper = require('../../../helper/CmdHelper');

var utils = require('../../../Utils');

var entryFactory = require('../../../factory/EntryFactory');

var extensionElementsEntry = require('./implementation/ExtensionElements');

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;


function getServiceTaskLikeBusinessObject(element) {
  return ImplementationTypeHelper.getServiceTaskLikeBusinessObject(element);
}

function getCamundaFields(element) {
  var bo = getBusinessObject(element);
  return bo && extensionElementsHelper.getExtensionElements(bo, CAMUNDA_FIELD_EXTENSION_ELEMENT) || [];
}

var fieldTypeOptions = [
  {
    name: 'String',
    value: 'string'
  },
  {
    name: 'Expression',
    value: 'expression'
  }
];

var CAMUNDA_FIELD_EXTENSION_ELEMENT = 'camunda:Field';


module.exports = function(group, element, bpmnFactory) {

  if (!getServiceTaskLikeBusinessObject(element)) {
    return;
  }

  var isSelected = function(element, node) {
    return getSelectedField(element, node);
  };

  function getSelectedField(element, node) {
    var selected = fieldEntry.getSelected(element, node.parentNode);

    if (selected.idx === -1) {
      return;
    }

    var formFields = getCamundaFields(element);

    return formFields[selected.idx];
  }

  function getFieldType(bo) {
    var fieldType = 'string';

    var expressionValue = bo && bo.expression;
    var stringValue = bo && (bo.string || bo.stringValue);

    if (typeof stringValue !== 'undefined') {
      fieldType = 'string';
    } else if (typeof expressionValue !== 'undefined') {
      fieldType = 'expression';
    }

    return fieldType;
  }

  var setOptionLabelValue = function() {
    return function(element, node, option, property, value, idx) {
      var camundaFields = getCamundaFields(element);
      var field = camundaFields[idx];

      value = (field.name) ? field.name : '<empty>';

      var label = idx + ' : ' + value;

      option.text = label;
    };
  };

  var newElement = function() {
    return function(element, extensionElements, value) {
      var props = {
        name: '',
        string: ''
      };

      var newFieldElem = elementHelper.createElement(CAMUNDA_FIELD_EXTENSION_ELEMENT, props, extensionElements, bpmnFactory);

      return cmdHelper.addElementsTolist(element, extensionElements, 'values', [ newFieldElem ]);
    };
  };

  var removeElement = function() {
    return function(element, extensionElements, value, idx) {
      var camundaFields= getCamundaFields(element);
      var field = camundaFields[idx];
      if (field) {
        return extensionElementsHelper.removeEntry(getBusinessObject(element), element, field);
      }
    };
  };


  var fieldEntry = extensionElementsEntry(element, bpmnFactory, {
    id : 'fields',
    label : 'Fields',
    modelProperty: 'fieldName',
    idGeneration: 'false',

    createExtensionElement: newElement(),
    removeExtensionElement: removeElement(),

    getExtensionElements: function(element) {
      return getCamundaFields(element);
    },

    setOptionLabelValue: setOptionLabelValue()

  });
  group.entries.push(fieldEntry);


  group.entries.push(entryFactory.validationAwareTextField({
    id: 'field-name',
    label: 'Name',
    modelProperty: 'fieldName',

    getProperty: function(element, node) {
      return (getSelectedField(element, node) || {}).name;
    },

    setProperty: function(element, values, node) {
      var selectedField = getSelectedField(element, node);
      return cmdHelper.updateBusinessObject(element, selectedField, { name : values.fieldName });
    },

    validate: function(element, values, node) {
      var bo = getSelectedField(element, node);

      var validation = {};
      if (bo) {
        var nameValue = values.fieldName;

        if (nameValue) {
          if (utils.containsSpace(nameValue)) {
            validation.fieldName = 'Name must not contain spaces';
          }
        }
        else {
          validation.fieldName = 'Parameter must have a name';
        }
      }

      return validation;
    },

    disabled: function(element, node) {
      return !isSelected(element, node);
    }

  }));


  group.entries.push(entryFactory.selectBox({
    id: 'field-type',
    label: 'Type',
    selectOptions: fieldTypeOptions,
    modelProperty: 'fieldType',

    get: function(element, node) {
      var bo = getSelectedField(element, node);

      var fieldType = getFieldType(bo);

      return {
        fieldType: fieldType
      };
    },

    set: function(element, values, node) {
      var props = {
        'stringValue': undefined,
        'string': undefined,
        'expression': undefined
      };

      var fieldType = values.fieldType;

      if (fieldType === 'string') {
        props.string = '';
      }
      else if (fieldType === 'expression') {
        props.expression = '';
      }

      return cmdHelper.updateBusinessObject(element, getSelectedField(element, node), props);
    },

    disabled: function(element, node) {
      return !isSelected(element, node);
    }

  }));


  group.entries.push(entryFactory.textArea({
    id: 'field-value',
    label: 'Value',
    modelProperty: 'fieldValue',

    get: function(element, node) {
      var bo = getSelectedField(element, node);
      var fieldType = getFieldType(bo);

      var fieldValue;

      if (fieldType === 'string') {
        fieldValue = bo && bo.string;
      }
      else if (fieldType === 'expression') {
        fieldValue = bo && bo.expression;
      }

      return {
        fieldValue: fieldValue
      };
    },

    set: function(element, values, node) {
      var bo = getSelectedField(element, node);
      var fieldType = getFieldType(bo);

      var props = {};
      var fieldValue = values.fieldValue || undefined;

      if (fieldType === 'string') {
        props.string = fieldValue;
      }
      else if (fieldType === 'expression') {
        props.expression = fieldValue;
      }

      return cmdHelper.updateBusinessObject(element, bo, props);

    },

    validate: function(element, values, node) {
      var bo = getSelectedField(element, node);

      var validation = {};
      if (bo) {
        if (!values.fieldValue) {
          validation.fieldValue = 'Must provide a value';
        }
      }

      return validation;
    },

    show: function(element, node) {
      return isSelected(element, node);
    }

  }));

};
