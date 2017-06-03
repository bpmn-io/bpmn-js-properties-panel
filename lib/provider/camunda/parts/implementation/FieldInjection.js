'use strict';

var extensionElementsHelper = require('../../../../helper/ExtensionElementsHelper'),
    elementHelper = require('../../../../helper/ElementHelper'),
    cmdHelper = require('../../../../helper/CmdHelper');

var utils = require('../../../../Utils');

var entryFactory = require('../../../../factory/EntryFactory');

var extensionElementsEntry = require('./ExtensionElements');

var ModelUtil         = require('bpmn-js/lib/util/ModelUtil'),
    getBusinessObject = ModelUtil.getBusinessObject;

var assign = require('lodash/object/assign');


var DEFAULT_PROPS = {
  'stringValue': undefined,
  'string': undefined,
  'expression': undefined
};

var CAMUNDA_FIELD_EXTENSION_ELEMENT = 'camunda:Field';

module.exports = function(element, bpmnFactory, translate, options) {

  options = options || {};

  var insideListener = !!options.insideListener,
      idPrefix        = options.idPrefix || '',
      getSelectedListener = options.getSelectedListener,
      businessObject = options.businessObject || getBusinessObject(element);

  var entries = [];

  var isSelected = function(element, node) {
    return getSelectedField(element, node);
  };

  function getSelectedField(element, node) {
    var selected = fieldEntry.getSelected(element, node.parentNode);

    if (selected.idx === -1) {
      return;
    }

    var fields = getCamundaFields(element, node);

    return fields[selected.idx];
  }

  function getCamundaFields(element, node) {
    if (!insideListener) {
      return (
        businessObject &&
        extensionElementsHelper.getExtensionElements(businessObject, CAMUNDA_FIELD_EXTENSION_ELEMENT)
      ) || [];
    }
    return getCamundaListenerFields(element, node);
  }

  function getCamundaListenerFields(element, node) {
    var selectedListener = getSelectedListener(element, node);
    return selectedListener && selectedListener.fields || [];
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
      var camundaFields = getCamundaFields(element, node);
      var field = camundaFields[idx];

      value = (field.name) ? field.name : '<empty>';

      var label = idx + ' : ' + value;

      option.text = label;
    };
  };

  var newElement = function() {
    return function(element, extensionElements, value, node) {

      var props = {
        name: '',
        string: ''
      };

      var newFieldElem;

      if (!insideListener) {

        newFieldElem = elementHelper.createElement(CAMUNDA_FIELD_EXTENSION_ELEMENT, props, extensionElements, bpmnFactory);
        return cmdHelper.addElementsTolist(element, extensionElements, 'values', [ newFieldElem ]);

      } else {

        var selectedListener = getSelectedListener(element, node);
        newFieldElem = elementHelper.createElement(CAMUNDA_FIELD_EXTENSION_ELEMENT, props, selectedListener, bpmnFactory);
        return cmdHelper.addElementsTolist(element, selectedListener, 'fields', [ newFieldElem ]);

      }

    };
  };

  var removeElement = function() {
    return function(element, extensionElements, value, idx, node) {
      var camundaFields= getCamundaFields(element, node);
      var field = camundaFields[idx];
      if (field) {
        if (!insideListener) {
          return extensionElementsHelper.removeEntry(businessObject, element, field);
        }
        var selectedListener = getSelectedListener(element, node);
        return cmdHelper.removeElementsFromList(element, selectedListener, 'fields', null, [ field ]);
      }
    };
  };


  var fieldEntry = extensionElementsEntry(element, bpmnFactory, {
    id : idPrefix + 'fields',
    label : translate('Fields'),
    modelProperty: 'fieldName',
    idGeneration: 'false',

    businessObject: businessObject,

    createExtensionElement: newElement(),
    removeExtensionElement: removeElement(),

    getExtensionElements: function(element, node) {
      return getCamundaFields(element, node);
    },

    setOptionLabelValue: setOptionLabelValue()

  });
  entries.push(fieldEntry);


  entries.push(entryFactory.validationAwareTextField({
    id: idPrefix + 'field-name',
    label: translate('Name'),
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
            validation.fieldName = translate('Name must not contain spaces');
          }
        } else {
          validation.fieldName = translate('Parameter must have a name');
        }
      }

      return validation;
    },

    hidden: function(element, node) {
      return !isSelected(element, node);
    }

  }));

  var fieldTypeOptions = [
    {
      name: translate('String'),
      value: 'string'
    },
    {
      name: translate('Expression'),
      value: 'expression'
    }
  ];

  entries.push(entryFactory.selectBox({
    id: idPrefix + 'field-type',
    label: translate('Type'),
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
      var props = assign({}, DEFAULT_PROPS);

      var fieldType = values.fieldType;

      if (fieldType === 'string') {
        props.string = '';
      }
      else if (fieldType === 'expression') {
        props.expression = '';
      }

      return cmdHelper.updateBusinessObject(element, getSelectedField(element, node), props);
    },

    hidden: function(element, node) {
      return !isSelected(element, node);
    }

  }));


  entries.push(entryFactory.textBox({
    id: idPrefix + 'field-value',
    label: translate('Value'),
    modelProperty: 'fieldValue',

    get: function(element, node) {
      var bo = getSelectedField(element, node);
      var fieldType = getFieldType(bo);

      var fieldValue;

      if (fieldType === 'string') {
        fieldValue = bo && (bo.string || bo.stringValue);
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

      var props = assign({}, DEFAULT_PROPS);

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
          validation.fieldValue = translate('Must provide a value');
        }
      }

      return validation;
    },

    show: function(element, node) {
      return isSelected(element, node);
    }

  }));

  return entries;

};
