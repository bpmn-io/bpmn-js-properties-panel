'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  domQuery = require('min-dom/lib/query'),
  eventDefinitionHelper = require('../../../helper/EventDefinitionHelper'),
  cmdHelper = require('../../../helper/CmdHelper'),
  elementHelper = require('../../../helper/ElementHelper'),
  forEach = require('lodash/collection/forEach'),
  domAttr = require('min-dom/lib/attr');

module.exports = function(group, element, bpmnFactory) {
  var bo;

  if (is(element, 'bpmn:SequenceFlow')) {
    bo = getBusinessObject(element);
  }

  if (!bo) {
    return;
  }

  group.entries.push({
    'id': 'condition',
    'description': 'Configure the implementation of the task.',
    label: 'Condition',
    'html': '<label for="cam-condition-type">Condition Type</label>' +
            '<div class="field-wrapper">' +
              '<select id="cam-condition-type" name="conditionType">' +
                '<option value="expression">Expression</option>' +
                '<option value=""></option>' +
              '</select>' +
            '</div>' +

            '</br>' +

            // expression
            '<div class="field-wrapper">' +
              '<label for="cam-condition">Expression</label>' +
              '</br>' +
              '<input id="cam-condition" type="text" name="condition" />' +
              '<button data-action="clear" data-show="canClear">' +
                '<span>X</span>' +
              '</button>' +
            '</div>',

    get: function (element, propertyName) {

      // read values from xml:
      var conditionExpression = bo.conditionExpression;

      var values = {},
        conditionType = '',
        options = domQuery.all('select#cam-condition-type > option', propertyName);

      if(!!conditionExpression) {
        conditionType = 'expression';
        values.condition = conditionExpression.get('body');
      }

      // set select box value
      forEach(options, function(option) {
        if(option.value === conditionType) {
          domAttr(option, 'selected', 'selected');
        }
        else {
          domAttr(option, 'selected', null);
        }
      });

      values.conditionType = conditionType;

      return values;

    },

    set: function (element, values, containerElement) {
      var conditionType = values.conditionType;
      var condition = values.condition;

      var update = {
        "conditionExpression": undefined
      };

      if (!!condition && !!conditionType) {
        update.conditionExpression = elementHelper.createElement
          (
            'bpmn:FormalExpression',
            { body: condition },
            bo,
            bpmnFactory
          );
      }

      return cmdHelper.updateBusinessObject(element, bo, update);
    },

    validate: function(element, values) {
      var validationResult = {};

      if(!values.condition && values.conditionType === 'expression') {
        validationResult.condition = "Must provide a value";
      }

      return validationResult;
    },

    clear: function(element, inputNode) {
      // clear text input
      domQuery('input[name=condition]', inputNode).value='';

      return true;
    },

    canClear: function(element, inputNode) {
      var input = domQuery('input[name=condition]', inputNode);

      return input.value !== '';
    },

    cssClasses: ['textfield']
  });
};
