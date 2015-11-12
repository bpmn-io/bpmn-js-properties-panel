'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    is = require('bpmn-js/lib/util/ModelUtil').is,
    entryFactory = require('../../../factory/EntryFactory'),

    script = require('./implementation/Script')('scriptFormat', 'script', false);


module.exports = function(group, element, bpmnFactory) {
  var bo;

  if (is(element, 'bpmn:ScriptTask')) {
    bo = getBusinessObject(element);
  }

  if (!bo) {
    return;
  }

  group.entries.push({
    'id': 'script-implementation',
    'description': 'Implementation for a Script.',
    label: 'Script',
    'html': script.template,

    get: function (element) {
      return script.get(element, bo);
    },

    set: function(element, values, containerElement) {
      return script.set(element, values, containerElement);
    },

    validate: function(element, values) {
      return script.validate(element, values);
    },

    script : script,

    cssClasses: ['textfield']

  });

  group.entries.push(entryFactory.textField({
    id : 'scriptResultVariable',
    description : 'Result Variable of a Service Task Script',
    label : 'Result Variable',
    modelProperty : 'scriptResultVariable',

    get: function(element, propertyName) {
      var boResultVariable = bo.get('camunda:resultVariable');

      return { scriptResultVariable : boResultVariable };
    },

    set: function(element, values, containerElement) {
      var update = {};

      update['camunda:resultVariable'] = values.scriptResultVariable;

      return update;
    }

  }));

};
