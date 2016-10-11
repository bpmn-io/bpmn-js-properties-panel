'use strict';

var entryFactory = require('../../../../factory/EntryFactory'),
    elementHelper = require('../../../../helper/ElementHelper'),
    cmdHelper = require('../../../../helper/CmdHelper');

function createFormalExpression(parent, body, bpmnFactory) {
  body = body || undefined;
  return elementHelper.createElement('bpmn:FormalExpression', { body: body }, parent, bpmnFactory);
}

module.exports = function(group, element, bpmnFactory, conditionalEventDefinition) {

  group.entries.push(entryFactory.textBox({
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
};
