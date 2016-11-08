'use strict';

var entryFactory = require('../../../../factory/EntryFactory'),
    elementHelper = require('../../../../helper/ElementHelper'),
    cmdHelper = require('../../../../helper/CmdHelper');

function createFormalExpression(parent, body, bpmnFactory) {
  body = body || undefined;
  return elementHelper.createElement('bpmn:FormalExpression', { body: body }, parent, bpmnFactory);
}

module.exports = function(group, element, bpmnFactory, conditionalEventDefinition) {

  var getValue = function(modelProperty) {
    return function(element) {
      var modelPropertyValue = conditionalEventDefinition.get('camunda:' + modelProperty);
      var value = {};

      value[modelProperty] = modelPropertyValue;
      return value;
    };
  };

  var setValue = function(modelProperty) {
    return function(element, values) {
      var props = {};

      props['camunda:' + modelProperty] = values[modelProperty] || undefined;

      return cmdHelper.updateBusinessObject(element, conditionalEventDefinition, props);
    };
  };

  group.entries.push(entryFactory.textField({
    id: 'condition',
    label: 'Condition',
    modelProperty: 'condition',
    get: function(element) {
      var condition = conditionalEventDefinition.get('condition'),
          body = condition && condition.get('body');

      return { condition: body || '' };
    },
    set: function(element, values) {
      var condition = conditionalEventDefinition.get('condition');

      // remove condition expression from the business object when text field is empty
      if (values.condition === '') {
        return cmdHelper.updateBusinessObject(element, conditionalEventDefinition, { condition: undefined });
      }

      // if no condition expression is set yet, create one
      if (!condition) {
        condition = createFormalExpression(conditionalEventDefinition, values.condition, bpmnFactory);

        return cmdHelper.updateBusinessObject(element, conditionalEventDefinition, { condition: condition });

      // if a condition expression and a text field value exists, update business object
      } else {
        return cmdHelper.updateBusinessObject(element, condition, {
          body: values.condition || undefined
        });
      }
    },
    validate: function(element, values) {
      if (values['condition'] === '') {
        return { condition: 'Must provide a value' };
      }
    }
  }));

  group.entries.push(entryFactory.textField({
    id : 'variableName',
    label : 'Variable Name',
    modelProperty : 'variableName',

    get: getValue('variableName'),
    set: setValue('variableName')
  }));

  group.entries.push(entryFactory.textField({
    id : 'variableEvent',
    label : 'Variable Event',
    description: 'Specify more than one variable change event as a comma separated list.',
    modelProperty : 'variableEvent',

    get: getValue('variableEvent'),
    set: setValue('variableEvent')
  }));

};
