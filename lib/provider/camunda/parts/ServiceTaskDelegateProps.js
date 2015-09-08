'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  domQuery = require('min-dom/lib/query');

module.exports = function(group, element) {
  if(is(element, 'camunda:ServiceTaskLike')) {
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
          var bo = getBusinessObject(element),
            boExpression = bo.get('camunda:expression'),
            boDelegate = bo.get('camunda:delegateExpression'),
            boClass = bo.get('camunda:class');    

          var delegateValue = undefined,
            delegateResolutionValue = undefined;

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
            "camunda:class": undefined
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
  }
};
