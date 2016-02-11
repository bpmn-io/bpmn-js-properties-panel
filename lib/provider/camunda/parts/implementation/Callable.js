'use strict';

var cmdHelper = require('../../../../helper/CmdHelper'),
    entryFactory = require('../../../../factory/EntryFactory');

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;


var attributeInfo = {
  bpmn: {
    element: 'calledElement',
    binding: 'camunda:calledElementBinding',
    version: 'camunda:calledElementVersion'
  },

  cmmn: {
    element: 'camunda:caseRef',
    binding: 'camunda:caseBinding',
    version: 'camunda:caseVersion'
  }
};

var bindingOptions = [
  {
    name: 'latest',
    value: 'latest'
  },
  {
    name: 'deployment',
    value: 'deployment'
  },
  {
    name: 'version',
    value: 'version'
  }
];

module.exports = function (element, bpmnFactory, options) {

  var getCallActivityType = options.getCallActivityType;

  var entries = [];

  function getAttribute(element, prop) {
    var type = getCallActivityType(element);
    return (attributeInfo[type] || {})[prop];
  }

  function getCallActivityBindingValue(element) {
    var type = getCallActivityType(element);
    var bo = getBusinessObject(element);
    var attr = (attributeInfo[type] || {}).binding;
    return bo.get(attr);
  }

  entries.push(entryFactory.textField({
    id : 'callable-element-ref',
    dataValueLabel: 'callableElementLabel',
    modelProperty: 'callableElementRef',

    get: function(element, node) {
      var callableElementRef;

      var attr = getAttribute(element, 'element');
      if (attr) {
        var bo = getBusinessObject(element);
        callableElementRef = bo.get(attr);
      }

      var label = '';
      var type = getCallActivityType(element);
      if (type === 'bpmn') {
        label = 'Called Element';
      }
      else if (type === 'cmmn') {
        label = 'Case Ref';
      }

      return {
        callableElementRef: callableElementRef,
        callableElementLabel: label
      };
    },

    set: function(element, values, node) {
      var newCallableElementRef = values.callableElementRef;
      var attr = getAttribute(element, 'element');

      var props = {};
      props[attr] = newCallableElementRef || '';

      return cmdHelper.updateProperties(element, props);
    },

    validate: function(element, values, node) {
      var elementRef = values.callableElementRef;
      return getCallActivityType(element) && !elementRef ? { callableElementRef: 'Value must provide a value.' } : {};
    },

    disabled: function(element, node) {
      return !getCallActivityType(element);
    }

  }));


  entries.push(entryFactory.selectBox({
    id : 'callable-binding',
    label: 'Binding',
    selectOptions: bindingOptions,
    modelProperty: 'callableBinding',

    get: function(element, node) {
      var callableBinding;

      var attr = getAttribute(element, 'binding');
      if (attr) {
        var bo = getBusinessObject(element);
        callableBinding = bo.get(attr) || 'latest';
      }

      return {
        callableBinding: callableBinding,
      };
    },

    set: function(element, values, node) {
      var binding = values.callableBinding;
      var attr = getAttribute(element, 'binding'),
          attrVer = getAttribute(element, 'version');

      var props = {};
      props[attr] = binding;
      // set version value always on undefined to delete the existing value
      props[attrVer] = undefined;

      return cmdHelper.updateProperties(element, props);
    },

    disabled: function(element, node) {
      return !getCallActivityType(element);
    }

  }));


  entries.push(entryFactory.textField({
    id : 'callable-version',
    label: 'Version',
    modelProperty: 'callableVersion',

    get: function(element, node) {
      var callableVersion;

      var attr = getAttribute(element, 'version');
      if (attr) {
        var bo = getBusinessObject(element);
        callableVersion = bo.get(attr);
      }

      return {
        callableVersion: callableVersion,
      };
    },

    set: function(element, values, node) {
      var version = values.callableVersion;
      var attr = getAttribute(element, 'version');

      var props = {};
      props[attr] = version || undefined;

      return cmdHelper.updateProperties(element, props);
    },

    validate: function(element, values, node) {
      var version = values.callableVersion;

      return getCallActivityType(element) && (getCallActivityBindingValue(element) === 'version') && !version ?
             { callableVersion: 'Value must provide a value.' } : {};
    },

    disabled: function(element, node) {
      return !getCallActivityType(element) || getCallActivityBindingValue(element) !== 'version';
    }

  }));

  
  return entries;
};
