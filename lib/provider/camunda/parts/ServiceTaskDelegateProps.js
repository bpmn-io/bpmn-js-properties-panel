'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  domQuery = require('min-dom/lib/query'),
  eventDefinitionHelper = require('../../../helper/EventDefinitionHelper'),
  forEach = require('lodash/collection/forEach'),
  domAttr = require('min-dom/lib/attr');

var delegateImplTypes = [
  'class',
  'expression',
  'delegateExpression'
];

function selectedOption(selectBox) {
  if(selectBox.selectedIndex >= 0) {
    return selectBox.options[selectBox.selectedIndex].value;
  }
}

function selectedType(inputNode) {
  var typeSelect = domQuery('select[name=implType]', inputNode);
  return selectedOption(typeSelect);
}

module.exports = function(group, element) {
  // MessageEventDefinition is ServiceTaskLike for IntermediateThrowEvent and EndEvent
  var messageEventDefinition = eventDefinitionHelper.getMessageEventDefinition(element);

  if(is(element, 'camunda:ServiceTaskLike') ||
    ( is(element, 'bpmn:IntermediateThrowEvent') || is(element, 'bpmn:EndEvent') && messageEventDefinition) ) {

    // business object is messageEventDefinition when one exists
    var bo = getBusinessObject(element);
    if (messageEventDefinition) {
      bo = messageEventDefinition;
    }

    group.entries.push(
      {
        'id': 'implementation',
        'description': 'Configure the implementation of the task.',
        label: 'Implementation',
        'html': '<label for="cam-impl-type">Implementation Type</label>' +
                '<div class="field-wrapper">' +
                  '<select id="cam-impl-type" name="implType">' +
                    '<option value="class">Java Class</option>' +
                    '<option value="expression">Expression</option>' +
                    '<option value="delegateExpression">Delegate Expression</option>' +
                    '<option value="dmn">DMN</option>' +
                    '<option value=""></option>' +
                  '</select>' +
                '</div>' +

                '</br>' +

                // delegate: (java class, expression, delegate expression)
                '<div class="field-wrapper" data-show="isDelegate">' +
                  '<label for="cam-impl-delegate">TODO label</label>' +
                  '</br>' +
                  '<input id="cam-impl-delegate" type="text" name="delegate" />' +
                  '<button data-action="delegateClear" data-show="delegateCanClear">' +
                    '<span>X</span>' +
                  '</button>' +
                '</div>' +

                '</br>' +

                // delegate: result variable
                '<div class="field-wrapper" data-show="isExpression">' +
                  '<label for="cam-result-variable">Result Variable</label>' +
                  '</br>' +
                  '<input id="cam-result-variable" type="text" name="resultVariable" />' +
                  '<button data-action="resVarClear" data-show="resVarCanClear">' +
                    '<span>X</span>' +
                  '</button>' +
                '</div>',

        get: function (element, propertyName) {

          // read values from xml:
          var boExpression = bo.get('camunda:expression'),
              boDelegate = bo.get('camunda:delegateExpression'),
              boClass = bo.get('camunda:class');

          var values = {},
            implType = '',
            options = domQuery.all('select#cam-impl-type > option', propertyName);

          if(!!boExpression) {
            implType = 'expression';
            this.delegateGet(implType, boExpression, values);
          }
          else if(!!boDelegate) {
            implType = 'delegateExpression';
            this.delegateGet(implType, boDelegate, values);
          }
          else if(!!boClass) {
            implType = 'class';
            this.delegateGet(implType, boClass, values);
          }

          // set select box value
          forEach(options, function(option) {
            if(option.value === implType) {
              domAttr(option, 'selected', 'selected');
            } else {
              domAttr(option, 'selected', null);
            }
          });

          values.implType = implType;

          return values;

        },
        set: function (element, values, containerElement) {
          
          var implType = values.implType,
            update = {};

          this.delegateSetEmpty(update);

          if(!!implType) {
            if(delegateImplTypes.indexOf(implType) >= 0) {
              this.delegateSet(values, update);
            }
          }

          return update;
        },
        validate: function(element, values) {
          var implType = values.implType,
            validationResult = {};

          if(!!implType) {

            if(delegateImplTypes.indexOf(implType) >= 0) {
              this.delegateValidate(values, validationResult);
            }

          }

          return validationResult;
        },

        // Delegate ///////////////////////////////////////

        delegateGet: function(implType, implValue, values) {
          values.delegate = implValue;

          var resultVariable = bo.get('camunda:resultVariable');
          if(resultVariable && implType === 'expression') {
            values.resultVariable = resultVariable;
          }
        },

        delegateSetEmpty: function(update) {
          update['camunda:class'] = undefined;
          update['camunda:expression'] = undefined;
          update['camunda:delegateExpression'] = undefined;
          update['camunda:resultVariable'] = undefined;
        },

        delegateSet: function(values, update) {
          update['camunda:'+ values.implType] = values.delegate;

          var resultVariableValue = values.resultVariable;
          if (!!resultVariableValue && values.implType === 'expression') {
            update['camunda:resultVariable'] = resultVariableValue;
          }
        },

        delegateValidate: function(values, validationResult) {
          if(!values.delegate) {
            validationResult.delegate = "Must provide a value";
          }
        },

        delegateClear: function(element, inputNode) {
          // clear text input
          domQuery('input[name=delegate]', inputNode).value='';
          // clear select box selection
          var options = domQuery('select[name=implType]', inputNode.parentElement);
          for (var i = 0; i < options.length; i++) {
            if (options[i].value === '') {
              options.selectedIndex = i;
              break;
            }
          }

          return true;
        },

        delegateCanClear: function(element, inputNode) {
          var input = domQuery('input[name=delegate]', inputNode);

          return input.value !== '';
        },

        isDelegate: function(element, inputNode) {
          var type = selectedType(inputNode);
          return  delegateImplTypes.indexOf(type) >= 0;
        },

        isExpression: function(element, inputNode) {
          var type = selectedType(inputNode);
          return type === 'expression';
        },

        resVarClear: function(element, inputNode) {
          // clear text input
          domQuery('input[name=resultVariable]', inputNode).value='';

          return true;
        },

        resVarCanClear: function(element, inputNode) {
          var input = domQuery('input[name=resultVariable]', inputNode);

          return input.value !== '';
        },

        cssClasses: ['textfield']
      }
    );
  }
};
