'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  domQuery = require('min-dom/lib/query'),
  entryFactory = require('../../../factory/EntryFactory'),
  cmdHelper = require('../../../helper/CmdHelper'),
  eventDefinitionHelper = require('../../../helper/EventDefinitionHelper');

module.exports = function(group, element) {
  // MessageEventDefinition is ServiceTaskLike for IntermediateThrowEvent and EndEvent
  var messageEventDefinition = eventDefinitionHelper.getMessageEventDefinition(element);

  if(is(element, 'camunda:ServiceTaskLike') ||
    ( is(element, 'bpmn:IntermediateThrowEvent') || is(element, 'bpmn:EndEvent')
    && messageEventDefinition) ) {

    // business object is messageEventDefinition when one exists
    var bo = getBusinessObject(element);
    if (messageEventDefinition) {
      bo = messageEventDefinition;
    }

    group.entries.push(
      {
        'id': 'class',
        'description': 'References a Java class with the JavaDelegate-Interface',
        label: 'Delegate Method',
        'html': '<label for="camunda-delegate">Delegate Method</label>' +
                '<div class="field-wrapper">' +
                  '<input id="camunda-delegate" type="text" name="delegate" />' +
                  '<button data-action="clear" data-show="canClear">' +
                    '<span>X</span>' +
                  '</button>' +
                '</div>'+

                '<ul class="radios-group">' +
                  '<li>' +
                    '<input type="radio" ' +
                      'id="resolution-class" ' +
                      'name="delegateResolution" ' +
                      'value="class">' +
                    '<label for="resolution-class">Class</label>' +
                  '</li>' +
                  '<li>' +
                    '<input type="radio" ' +
                      'id="resolution-delegateExpression" ' +
                      'name="delegateResolution" ' +
                      'value="delegateExpression">' +
                    '<label for="resolution-delegateExpression">Delegate Expression</label>' +
                  '</li>' +
                  '<li>' +
                    '<input type="radio" ' +
                      'id="resolution-expression" ' +
                      'name="delegateResolution" ' +
                      'value="expression">' +
                    '<label for="resolution-expression">Expression</label>' +
                  '</li>' +
                '</ul>',

        'get': function (element, propertyName) {

          // read values from xml:
          var boExpression = bo.get('camunda:expression'),
              boDelegate = bo.get('camunda:delegateExpression'),
              boClass = bo.get('camunda:class');

          var delegateValue,
              delegateResolutionValue;

          if(!!boExpression) {
            delegateValue = boExpression;
            delegateResolutionValue = 'expression';
          }
          else if(!!boDelegate) {
            delegateValue = boDelegate;
            delegateResolutionValue = 'delegateExpression';
          }
          else if(!!boClass) {
            delegateValue = boClass;
            delegateResolutionValue = 'class';
          }

          return {
            delegate: delegateValue,
            delegateResolution: delegateResolutionValue
          };
        },
        'set': function (element, values, containerElement) {
          
          var delegateResolutionValue = values.delegateResolution;
          var delegateValue = values.delegate;

          var update = {
            "camunda:expression": undefined,
            "camunda:delegateExpression": undefined,
            "camunda:class": undefined,
            "camunda:resultVariable":undefined
          };

          if(!!delegateResolutionValue) {
            update['camunda:'+delegateResolutionValue] = delegateValue;
          }

          return update;
        },
        validate: function(element, values) {
          var delegateResolutionValue = values.delegateResolution;
          var delegateValue = values.delegate;

          var validationResult = {};

          if(!delegateValue && !!delegateResolutionValue) {
            validationResult.delegate = "Value must provide a value.";
          }

          if(!!delegateValue && !delegateResolutionValue) {
            validationResult.delegateResolution = "Must select a radio button";
          }

          return validationResult;
        },
        clear: function(element, inputNode) {
          // clear text input
          domQuery('input[name=delegate]', inputNode).value='';
          // clear radio button selection
          var checkedRadio = domQuery('input[name=delegateResolution]:checked', inputNode);
          if(!!checkedRadio) {
            checkedRadio.checked = false;
          }
          return true;
        },
        canClear: function(element, inputNode) {
          var input = domQuery('input[name=delegate]', inputNode);
          var radioButton = domQuery('input[name=delegateResolution]:checked', inputNode);
          return input.value !== '' || !!radioButton;
        },
        cssClasses: ['textfield']
      }
    );

    // Result Variable
    group.entries.push(entryFactory.textField({
        id: 'resultVariable',
        description: '',
        label: 'Result Variable',
        modelProperty: 'resultVariable',
        get: function(element) {
          var resultVariable = bo.get('camunda:resultVariable');

          var res = {};

          if(resultVariable) {
            res.resultVariable = resultVariable;
          }

          return res;
        },
        set: function(element, values, containerElement) {
          var resultVariableValue = values.resultVariable;

          var update = {
            "camunda:resultVariable": undefined
          }

          if (!!resultVariableValue) {
            update['camunda:resultVariable'] = resultVariableValue;
          }

          return cmdHelper.updateBusinessObject(element, bo, update);

        },
        disabled: function(element, node) {
          var delegateResolution = domQuery('input[name="delegateResolution"]:checked', node.parentElement);

          return delegateResolution === null || delegateResolution.value !== 'expression';
        }
    }));

  }
};
